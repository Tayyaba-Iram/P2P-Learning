import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;  // Make sure you're getting the token from cookies

    if (!token) {
        return res.json("The token is missing");
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {  // Use your secret from env
        if (err) {
            return res.json("The token is wrong");
        } else {
            req.email = decoded.email;
            req.name = decoded.name;
            next();  // Proceed to the next middleware or route
        }
    });
};

export default verifyUser;
