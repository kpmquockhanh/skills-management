import pkg from 'mongoose';
import jwt from 'jsonwebtoken';
import { User } from '../../models/index.js';
import { errorHelper } from '../../utils/index.js';
import { jwtSecretKey } from '../../config/index.js';

const { Types } = pkg;

const { verify } = jwt;

export const processToken = async (req, res, next) => {
  let token = req.header('Authorization');
  if (!token) return next();

  if (token.includes('Bearer')) token = req.header('Authorization').replace('Bearer ', '');

  try {
    req.user = verify(token, jwtSecretKey);
    if (!Types.ObjectId.isValid(req.user._id)) return res.status(400).json(errorHelper('00007', req));

    const exists = await User.exists({ _id: req.user._id, isVerified: true, isActivated: true })
      .catch((err) => res.status(500).json(errorHelper('00008', req, err.message)));

    if (!exists) return res.status(400).json(errorHelper('00009', req));

    next();
  } catch (err) {
    return next();
  }
  return null;
};

const checkAuth = async (req, res, next) => {
  let token = req.header('Authorization');
  if (!token) return res.status(401).json(errorHelper('00006', req, 'invalid auth'));

  if (token.includes('Bearer')) token = req.header('Authorization').replace('Bearer ', '');

  try {
    req.user = verify(token, jwtSecretKey);
    if (!Types.ObjectId.isValid(req.user._id)) return res.status(400).json(errorHelper('00007', req));

    const exists = await User.exists({ _id: req.user._id, isVerified: true, isActivated: true })
      .catch((err) => res.status(500).json(errorHelper('00008', req, err.message)));

    if (!exists) return res.status(400).json(errorHelper('00009', req));

    // const tokenExists = await Token.exists({ userId: req.user._id, status: true })
    //   .catch((err) => res.status(500).json(errorHelper('00010', req, err.message)));
    //
    // if (!tokenExists) return res.status(401).json(errorHelper('00011', req));

    next();
  } catch (err) {
    return res.status(401).json(errorHelper('00012', req, err.message));
  }
  return null;
};

export default checkAuth;
