import app from '../app';
import { tokenTypes } from '../config/tokens';
import tokenServices from './token.service';

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
