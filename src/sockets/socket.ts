import { Server } from 'socket.io';
import { Message } from '../models/message.model';
import tokenServices from '../services/token.service';
import { tokenTypes } from '../config/tokens';
import { Pupil } from '../models/pupil.model';
import { Instructor } from '../models/instructor.model';
import { IToken } from '../models/token.model';

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
    // Add your token validation logic here and attach the user to socket.data
    const decodedToken: Promise<IToken> = await tokenServices.verifyToken(token, tokenTypes.ACCESS); // Implement `authenticateToken`
    let user: any;
    if ((await decodedToken).userType === 'pupil') {
      user = await Pupil.findById((await decodedToken).user);
    } else {
      user = await Instructor.findById((await decodedToken).user);
    }
    if (user) {
      socket.data.user = user;
      next();
    } else {
      next(new Error('Authentication error'));
    }
  });

  // Socket connection
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.user}`);

    // Join chat room
    socket.on('join_room', async ({ pupilId, instructorId }) => {
      const roomId = `${pupilId}_${instructorId}`;
      socket.join(roomId);
      // Fetch previous messages from the database
      const messages = await Message.find({
        chatRoomId: { $in: [`${pupilId}_${instructorId}`, `${instructorId}_${pupilId}`] },
      }).sort({ timestamp: 1 }); // Sort by oldest messages first

      // Send previous messages to the user
      socket.emit('previous_messages', messages);
      console.log(`${socket.data.user.id} joined room: ${roomId}`);
    });

    // Handle sending messages
    socket.on('send_message', async ({ roomId, content }) => {
      const senderId = socket.data.user.id;
      const [pupilId, instructorId] = roomId.split('_');

      // Save message to the database
      const message = await Message.create({
        senderId,
        receiverId: senderId === pupilId ? instructorId : pupilId,
        content,
        chatRoomId: roomId,
      });

      // Emit message to the room
      io.to(roomId).emit('receive_message', message);
    });

    // Disconnect event
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user.id}`);
    });
  });

  console.log('Socket.IO initialized');
};
