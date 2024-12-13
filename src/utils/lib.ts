import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export const generateOTPUtil = (length: number = 6): string => {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
};
