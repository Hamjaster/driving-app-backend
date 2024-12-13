export type TokenType = {
  ACCESS: string;
  RESET_PASSWORD: string;
  VERIFY_EMAIL: string;
  REFRESH: string;
  VERIFY_PUPIL: string;
  OTP: string;
};

export type UserType = {
  PUPIL: string;
  ADMIN: string;
  INSTRUCTOR: string;
};

export const tokenTypes: TokenType = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'resetPassword',
  VERIFY_EMAIL: 'verifyEmail',
  VERIFY_PUPIL: 'verifyPupil',
  OTP: 'otp',
};

export const userTypes: UserType = {
  PUPIL: 'pupil',
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
};
