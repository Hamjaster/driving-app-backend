import passport from 'passport';
import httpStatus from 'http-status';
import { ApiError } from '../utils/ApiError.js';

const verifyCallback =
  (req: any, resolve: any, reject: any, onlyFor: string[]) => async (err: any, user: any, info: any) => {
    if (err || info || !user) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    req.user = user; // Attach user object to request for downstream use
    console.log(req.user, 'USER REQUEST IN AUTH');
    // If specific roles are provided, check if the user's role matches
    if (onlyFor.length > 0 && !onlyFor.includes(user.userType)) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden: You do not have access to this resource'));
    }

    resolve();
  };

export const auth =
  (...onlyFor: string[]) =>
  async (req: any, res: any, next: any) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, onlyFor))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };
