const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Invalid or expired token" });
            }
            req.user = decoded; // Attach user data to request
            next(); // Continue to next middleware or route
        });
    } catch (error) {
        return res.status(403).json({ message: "Token verification failed" });
    }
};

module.exports = authMiddleware;