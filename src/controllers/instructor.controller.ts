import { Booking } from '../models/booking.model.js';
import { IInstructor, Instructor } from '../models/instructor.model.js';
import httpStatus from 'http-status';
import instructorService from '../services/instructor.service.js';
import { ApiError } from '../utils/ApiError.js';

const instructorController = {
  createInstructor: async (req: any, res: any) => {
    const { firstName, lastName, email, password, phoneNumber, availability } = req.body as IInstructor;

    try {
      // Check if the instructor already exists
      const existingInstructor = await Instructor.findOne({ email });
      if (existingInstructor) {
        return res.status(400).json({ success: false, message: 'Instructor already exists with this email' });
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
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  updateAvailability: async (req: any, res: any) => {
    const { instructorId, availability } = req.body; // Availability should be an array of { start, end }

    try {
      const instructor = await Instructor.findById(instructorId);

      if (!instructor) {
        return res.status(404).json({ success: false, message: 'Instructor not found' });
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
      return res.status(500).json({ success: false, message: 'Server error' });
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
      res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
  },
};

export default instructorController;
