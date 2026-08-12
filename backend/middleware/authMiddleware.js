import jwt from 'jsonwebtoken';

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.userID = decoded.id;
        req.userRole = decoded.role;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Authentication failed" });
    }
}

export const requireRole = (role) => (req, res, next) => {
    if (req.userRole !== role) {
        return res.status(403).json({ message: `Only ${role} accounts can perform this action` });
    }
    next();
}

export default isAuthenticated;
