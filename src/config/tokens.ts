export type TokenType = {
  ACCESS: string;
  RESET_PASSWORD: string;
  VERIFY_EMAIL: string;
  REFRESH: string;
  VERIFY_PUPIL: string;
  OTP: string;
  BOOKING_APPROVAL: string;
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
  BOOKING_APPROVAL: 'approveBooking',
};

export const userTypes: UserType = {
  PUPIL: 'pupil',
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
};
