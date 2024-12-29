import { Instructor } from '../models/instructor.model.js';

const instructorService = {
  // ...existing code...
  async getInstructorsByPostalCode(postalCode: number) {
    return Instructor.find({ postalCode });
  },
  // ...existing code...
};

export default instructorService;
