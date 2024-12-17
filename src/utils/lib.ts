import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export const generateOTPUtil = (length: number = 6): string => {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
};

export function convertToDateObject(mmYY) {
  const [month, year] = mmYY.split('/').map(Number);

  if (!month || !year || month < 1 || month > 12) {
    throw new Error('Invalid MM/YY format');
  }

  // Handle 2-digit year by assuming the century starts from 2000
  const fullYear = year < 100 ? 2000 + year : year;

  // Create a Date object with the first day of the month
  return new Date(fullYear, month - 1, 1);
}

export async function uploadImageCloudinary(file: File) {
  console.log(file, 'FILE');
  const arrayBuffer = await file.arrayBuffer();
  console.log(arrayBuffer, 'arrayBuffer');
  const buffer = Buffer.from(arrayBuffer); //  <-- convert to Buffer

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ resource_type: 'image' }, onDone).end(buffer);

    function onDone(error, result) {
      if (error) {
        return reject({ success: false, error });
      }
      return resolve({ success: true, result });
    }
  });
}
