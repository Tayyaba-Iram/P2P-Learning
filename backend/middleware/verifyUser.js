import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const verifyUser = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer token
  console.log("Token:", token); 

  if (!token) {
    return res.status(401).json({ message: 'Token is missing or invalid' });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = {
      _id: decoded._id,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  });
};

export default verifyUser;
