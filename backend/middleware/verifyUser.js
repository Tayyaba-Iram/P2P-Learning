import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const verifyUser = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer token, extracts the token part only

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

/* Think of a concert ticket 🎫. 
Whoever holds the ticket is allowed to enter the concert — 
the staff won’t ask your name or ID, they just check the ticket.
The token is the ticket, and Bearer means “I hold it.”*/