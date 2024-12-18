import { Booking } from '../models/booking.model.js';

import { IInstructor, Instructor } from '../models/instructor.model.js';

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
    const { instructorId, availability } = req.body; // Availability should be an array of { date, isAvailable }

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
};

export default instructorController;
