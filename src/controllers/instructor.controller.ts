import { Booking } from '../models/booking.model.js';
import { IInstructor, Instructor } from '../models/instructor.model.js';
import httpStatus from 'http-status';
import instructorService from '../services/instructor.service.js';
import { ApiError } from '../utils/ApiError.js';

const instructorController = {
  createInstructor: async (req: any, res: any) => {
    const { firstName, lastName, email, password, phoneNumber, availability } = req.body as IInstructor;

    try {
      if (!email || !password) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email and password are required');
      }

      // Check if the instructor already exists
      const existingInstructor = await Instructor.findOne({ email });
      if (existingInstructor) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Instructor already exists with this email');
      }

      // Create the instructor
      const newInstructor = new Instructor({
        firstName,
        lastName,
        password,
        email,
        phoneNumber,
        availability,
      });

      await newInstructor.save();

      return res.status(201).json({
        success: true,
        message: 'Instructor created successfully',
        instructor: newInstructor,
      });
    } catch (err) {
      console.error(err);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
  },
  updateAvailability: async (req: any, res: any) => {
    const { instructorId, availability } = req.body; // Availability should be an array of { start, end }

    try {
      if (!instructorId || !availability) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Instructor ID and availability are required');
      }

      const instructor = await Instructor.findById(instructorId);

      if (!instructor) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Instructor not found');
      }

      instructor.availability = availability;

      await instructor.save();

      return res.status(200).json({
        success: true,
        message: 'Availability updated successfully',
        availability: instructor.availability,
      });
    } catch (err) {
      console.error(err);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
  },
  getInstructorsByPostalCode: async (req: any, res: any): Promise<void> => {
    try {
      const { postalCode } = req.body;
      if (!postalCode) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Postal code is required');
      }

      const instructors = await instructorService.getInstructorsByPostalCode(postalCode);
      if (!instructors || instructors.length === 0) {
        throw new ApiError(httpStatus.NOT_FOUND, 'No instructors found for the given postal code');
      }

      res.status(httpStatus.OK).send({ instructors });
    } catch (error: any) {
      console.error(error);
      res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
  },
};

export default instructorController;
