import { Server } from 'socket.io';
import { Message } from '../models/message.model.js';
import { Room } from '../models/room.model.js'; // Import the Room model
import tokenServices from '../services/token.service.js';
import { tokenTypes } from '../config/tokens.js';
import { Pupil } from '../models/pupil.model.js';
import { Instructor } from '../models/instructor.model.js';
import { IToken } from '../models/token.model.js';

export const initSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // Update this to match your frontend's origin
      methods: ['GET', 'POST'],
    },
  });

  // Middleware to authenticate users
  io.use(async (socket, next) => {
    const token = socket.handshake.headers.token;
    console.log(token, 'token came');
    const decodedToken: Promise<IToken> = await tokenServices.verifyToken(token, tokenTypes.ACCESS);
    let user: any;
    if ((await decodedToken).userType === 'pupil') {
      user = await Pupil.findById((await decodedToken).user);
    } else {
      user = await Instructor.findById((await decodedToken).user);
    }
    if (user) {
      socket.data.user = { ...user._doc, userType: (await decodedToken).userType };
      next();
    } else {
      next(new Error('Authentication error'));
    }
  });

  // Socket connection
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.user.id}`);

    // Join a chat room
    socket.on('join_room', async ({ pupilId, instructorId }) => {
      const roomId = `${pupilId}_${instructorId}`;
      socket.join(roomId);

      // Ensure the room exists or create a new one
      let room = await Room.findOne({ pupil: pupilId, instructor: instructorId });
      if (!room) {
        room = await Room.create({ pupil: pupilId, instructor: instructorId });
      }

      // Fetch previous messages from the database
      const messages = await Message.find({ chatRoomId: roomId }).sort({ timestamp: 1 });

      // Send previous messages to the user
      socket.emit('previous_messages', messages);
      console.log(`${socket.data.user.id} joined room: ${roomId}`);
    });

    socket.on('send_message', async ({ roomId, content }) => {
      console.log(socket.data.user, 'socket.data.user');
      const senderId = socket.data.user._id;
      const [pupil, instructor] = roomId.split('_');

      // Save the message to the database
      const message = await Message.create({
        senderId,
        receiverId: senderId === pupil ? instructor : pupil,
        content,
        chatRoomId: roomId,
      });

      // Update the room with the last message and timestamp
      await Room.findOneAndUpdate(
        { pupil, instructor },
        { lastMessage: content, lastMessageTimestamp: new Date() },
        { upsert: true }
      );
      console.log('emmitingg to', roomId, ' with ', message);
      // Emit the message to the room
      io.to(roomId).emit('receive_message', message);
    });

    // New Event: Get Chat Rooms
    socket.on('get_rooms', async () => {
      const userId = socket.data.user._id;
      const userType = socket.data.user.userType;
      console.log(userId, 'userId');
      let chatRooms;

      if (userType === 'pupil') {
        // Fetch all rooms where the pupil is a participant
        chatRooms = await Room.find({ pupil: userId }).populate('instructor', 'firstName lastName email profilePicture');
      } else if (userType === 'instructor') {
        // Fetch all rooms where the instructor is a participant
        chatRooms = await Room.find({ instructor: userId }).populate('pupil', 'firstName lastName email profilePicture');
      }
      console.log(chatRooms, 'chatRooms emitting');
      // Emit the chat rooms to the user
      socket.emit('chat_rooms', chatRooms);
    });

    // Disconnect event
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user.id}`);
    });
  });

  console.log('Socket.IO initialized');
};
