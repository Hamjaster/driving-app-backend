import app from '../app.js';
import { tokenTypes } from '../config/tokens.js';
import tokenServices from './token.service.js';

const adminServices = {
  approvePupil: async (token: string) => {
    const tokenFound = await tokenServices.verifyToken(token, tokenTypes.VERIFY_PUPIL);
    if (!tokenFound) {
      throw new Error('Unverified Token');
    }
    return tokenFound.user;
  },
};

export default adminServices;
