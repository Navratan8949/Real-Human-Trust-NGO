const jwt = require("jsonwebtoken");
const { User, Volunteer } = require("../models");

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Please login first.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

        let user;
        if (decoded.role === "volunteer") {
            user = await Volunteer.findByPk(decoded.id, {
                attributes: { exclude: ["password"] },
            });
        } else {
            user = await User.findByPk(decoded.id, {
                attributes: { exclude: ["password"] },
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (decoded.role !== "volunteer" && !user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated.",
            });
        }
        
        if (decoded.role === "volunteer" && user.status !== "approved") {
            return res.status(403).json({
                success: false,
                message: "Your application is not approved.",
            });
        }

        req.user = user;
        req.user.role = decoded.role || user.role;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};

const checkOptionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
        if (!token) return next();

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ["password"] },
        });
        if (user && user.isActive) {
            req.user = user;
        }
        next();
    } catch (error) {
        next();
    }
};

isAuthenticated.checkOptionalAuth = checkOptionalAuth;
module.exports = isAuthenticated;