import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const verifyUser = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];  // Extract token from Authorization header
  
    if (!token) {
      return res.status(401).json({ message: "Token is missing or invalid" });
    }
  
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
  
      // Attach decoded data to request object
      req.user = {
        _id: decoded._id,  // Attach _id from the decoded token
        email: decoded.email,
        name: decoded.name,
      };
  
      next();  // Proceed to the next middleware/route handler
    });
  };
  
  

export default verifyUser;
