import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import config from './config.js';
import { tokenTypes } from './tokens.js';
import { Pupil } from '../models/pupil.model.js';

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }

    let user;
    switch (payload.userType) {
      case 'pupil':
        user = await Pupil.findById(payload.sub);
        break;
      case 'instructor':
        user = null;
        // user = await Instructor.findById(payload.sub);
        break;
      case 'admin':
        user = null;
        // user = await Admin.findById(payload.sub);
        break;
      default:
        throw new Error('Invalid user type');
    }

    if (!user) {
      return done(null, false);
    }

    // Add the user type to the `req.user` object for downstream use
    done(null, { ...user.toObject(), userType: payload.userType });
  } catch (error) {
    done(error, false);
  }
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
