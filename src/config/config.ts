import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const Config = {
  env: envVars.NODE_ENV,
  adminEmail: envVars.ADMIN_EMAIL,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    host: envVars.SMTP_HOST,
    service: 'gmail',
    auth: {
      user: envVars.SMTP_USERNAME,
      pass: envVars.SMTP_PASSWORD,
    },

    // from: envVars.EMAIL_FROM,
    secure: false,
    tls: { rejectUnauthorized: false },
  },
  otpPupilEmailText: (otp: string) => `<html>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 5px;">
    <h2 style="text-align: center; color: #333333; font-size: 24px; margin-bottom: 20px;">You've Been Approved!</h2>
    <p style="color: #555555; font-size: 16px; line-height: 1.6;">
      Dear Pupil,<br><br>
      You have been approved by the admin for pupil registration. Kindly use the OTP below to log in:
    </p>
    <div style="text-align: center; margin: 20px 0;">
      <span style="display: inline-block; font-size: 20px; font-weight: bold; color: #ffffff; background-color: #007bff; padding: 10px 20px; border-radius: 5px;">OTP: ${otp}</span>
    </div>
    <p style="color: #555555; font-size: 16px; line-height: 1.6;">
      If you have any questions, feel free to contact our support team.
    </p>
    <p style="margin-top: 20px; font-size: 14px; color: #888888; text-align: center;">
      &copy; 2024 Your Company Name. All rights reserved.
    </p>
  </div>
</body>
</html>`,
};
export default Config;
