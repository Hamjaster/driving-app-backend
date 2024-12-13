import nodemailer from 'nodemailer';
import config from '../config/config.js';
import logger from '../config/logger.js';
import { env } from 'process';
console.log(config.email, 'object for transport creations');
const transport = nodemailer.createTransport(config.email);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  const msg = { from: 'hamzasepal@gmail.com', to, subject, text, html };
  await transport.sendMail(msg);
};

export const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  // replace this url with the link tothe reset password page of your front-end app
  const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link : ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

export const sendPupilApprovalEmail = async (pupilName: string, to: string, token: string) => {
  const subject = 'Pupil Registration Approval';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://link-to-applicaion/verify-email?token=${token}`;
  const text = `Dear admin,
  ${pupilName} wants to register as a pupil to your application.
To approve it, click on this link: ${verificationEmailUrl}.`;
  await sendEmail(to, subject, text);
};
