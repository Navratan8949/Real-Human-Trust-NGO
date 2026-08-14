const { User, Volunteer } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uploadOnCloudinary } = require("../utils/cloudinary");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: "30d",
    });
};

exports.setupFirstAdmin = async (req, res) => {
    try {
        const adminCount = await User.count({ where: { role: "super_admin" } });
        if (adminCount > 0) {
            return res.status(403).json({ success: false, message: "Super Admin already exists. Please use normal login/registration." });
        }

        const { fullName, email, mobile, password } = req.body;
        if (!fullName || !email || !mobile || !password) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let profileImage = { public_id: "", url: "" };
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) {
                profileImage = { public_id: uploadResult.public_id, url: uploadResult.url };
            }
        }

        const user = await User.create({
            fullName,
            email,
            mobile,
            password: hashedPassword,
            role: "super_admin",
            profileImage,
        });

        res.status(201).json({ success: true, message: "First Super Admin created successfully", user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { fullName, email, mobile, password, role, gender, dob, state, district, address, userType } = req.body;

        if (!fullName || !email || !mobile || !password) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }

        const userExists = await User.findOne({
            where: {
                [Op.or]: [{ email }, { mobile }],
            },
        });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User with this email or mobile already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let assignedRole = "member";
        if (req.user && ["super_admin", "admin"].includes(req.user.role) && role) {
            assignedRole = role;
        }

        let profileImage = { public_id: "", url: "" };
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) {
                profileImage = { public_id: uploadResult.public_id, url: uploadResult.url };
            }
        }

        const user = await User.create({
            fullName,
            email,
            mobile,
            password: hashedPassword,
            role: assignedRole,
            profileImage,
            gender: gender || "",
            dob: dob || null,
            state: state || "",
            district: district || "",
            address: address || "",
            userType: userType || "",
        });

        const token = generateToken(user.id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            success: true,
            token,
            user: {
                _id: user.id,
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                userType: user.userType,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.memberLogin = async (req, res) => {
    try {
        const { emailOrMobile, password } = req.body;

        if (!emailOrMobile || !password) {
            return res.status(400).json({ success: false, message: "Please provide email/mobile and password" });
        }

        const user = await User.findOne({
            where: {
                [Op.or]: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
            },
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        if (user.role !== "member") {
            return res.status(403).json({ success: false, message: "Please use the admin login portal" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Account has been deactivated" });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user.id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user.id,
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.adminLogin = async (req, res) => {
    try {
        const { emailOrMobile, password } = req.body;

        if (!emailOrMobile || !password) {
            return res.status(400).json({ success: false, message: "Please provide email/mobile and password" });
        }

        const user = await User.findOne({
            where: {
                [Op.or]: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
            },
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const adminRoles = ["super_admin", "admin", "manager", "coordinator"];
        if (!adminRoles.includes(user.role)) {
            return res.status(403).json({ success: false, message: "Access denied. You are not an admin/staff." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Account has been deactivated" });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user.id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user.id,
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        if (req.user.role === "volunteer") {
            const volunteer = await Volunteer.findByPk(req.user.id, {
                attributes: { exclude: ["password"] },
            });
            return res.status(200).json({
                success: true,
                user: { ...volunteer.toJSON(), role: "volunteer" },
            });
        }

        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ["password"] },
        });
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.logout = async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
};
