const { Volunteer } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const sendEmail = require("../utils/sendMail");
const { uploadOnCloudinary } = require("../utils/cloudinary");

const generateToken = (id) => {
    return jwt.sign({ id, role: "volunteer" }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: "30d",
    });
};

exports.applyVolunteer = async (req, res) => {
    try {
        const { fullName, email, mobile, address, message, password } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }

        const existingVolunteer = await Volunteer.findOne({
            where: {
                [Op.or]: [{ email }, { mobile }]
            }
        });

        if (existingVolunteer) {
            return res.status(400).json({ success: false, message: "Email or mobile already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let profileImage = null;
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) {
                profileImage = { public_id: uploadResult.public_id, url: uploadResult.url };
            }
        }

        const volunteer = await Volunteer.create({
            fullName,
            email,
            mobile,
            password: hashedPassword,
            address: address || "",
            message: message || "",
            status: "pending",
            profileImage
        });

        res.status(201).json({ success: true, message: "Volunteer application submitted successfully. You will be able to login once admin approves your request.", volunteer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.loginVolunteer = async (req, res) => {
    try {
        const { emailOrMobile, password } = req.body;

        if (!emailOrMobile || !password) {
            return res.status(400).json({ success: false, message: "Please provide email/mobile and password" });
        }

        const volunteer = await Volunteer.findOne({
            where: {
                [Op.or]: [{ email: emailOrMobile }, { mobile: emailOrMobile }]
            }
        });

        if (!volunteer) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        if (volunteer.status !== "approved") {
            return res.status(403).json({ success: false, message: `Your application is currently ${volunteer.status}. You can login after approval.` });
        }

        if (!volunteer.password) {
            return res.status(400).json({ success: false, message: "Please contact admin to reset your password" });
        }

        const isMatch = await bcrypt.compare(password, volunteer.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(volunteer.id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: volunteer.id,
                id: volunteer.id,
                fullName: volunteer.fullName,
                email: volunteer.email,
                role: "volunteer",
                volunteerId: volunteer.volunteerId
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const volunteer = await Volunteer.findByPk(req.user.id, {
            attributes: { exclude: ["password"] }
        });
        if (!volunteer) return res.status(404).json({ success: false, message: "Volunteer not found" });

        res.status(200).json({ success: true, volunteer, user: { ...volunteer.toJSON(), role: "volunteer" } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateMe = async (req, res) => {
    try {
        const volunteer = await Volunteer.findByPk(req.user.id);
        if (!volunteer) return res.status(404).json({ success: false, message: "Volunteer not found" });

        const { fullName, mobile, address, bloodGroup, dob, gender } = req.body;

        if (fullName) volunteer.fullName = fullName;
        if (mobile) volunteer.mobile = mobile;
        if (address) volunteer.address = address;
        if (bloodGroup) volunteer.bloodGroup = bloodGroup;
        if (dob) volunteer.dob = dob;
        if (gender) volunteer.gender = gender;

        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) {
                volunteer.profileImage = { public_id: uploadResult.public_id, url: uploadResult.url };
            }
        }

        await volunteer.save();
        res.status(200).json({ success: true, message: "Profile updated successfully", volunteer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.getAllVolunteers = async (req, res) => {
    try {
        const volunteers = await Volunteer.findAll({
            order: [["createdAt", "DESC"]],
            attributes: { exclude: ["password"] }
        });
        res.status(200).json({ success: true, count: volunteers.length, volunteers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getVolunteerById = async (req, res) => {
    try {
        const volunteer = await Volunteer.findByPk(req.params.id, { attributes: { exclude: ["password"] } });
        if (!volunteer) return res.status(404).json({ success: false, message: "Volunteer not found" });
        res.status(200).json({ success: true, volunteer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateVolunteerStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const volunteer = await Volunteer.findByPk(req.params.id);

        if (!volunteer) return res.status(404).json({ success: false, message: "Volunteer not found" });

        const oldStatus = volunteer.status;
        volunteer.status = status;

        // Generate volunteerId on approval
        if (status === "approved" && !volunteer.volunteerId) {
            const date = new Date();
            const year = date.getFullYear();
            const count = await Volunteer.count({ where: { status: "approved" } });
            const paddedCount = String(count + 1).padStart(4, '0');
            volunteer.volunteerId = `VOL-${year}-${paddedCount}`;
        }

        await volunteer.save();

        // Send Email if status changed to approved
        if (status === "approved" && oldStatus !== "approved") {
            const emailHtml = `
                <h2>Congratulations!</h2>
                <p>Dear ${volunteer.fullName},</p>
                <p>Your volunteer application has been approved by the admin.</p>
                <p><strong>Your Volunteer ID:</strong> ${volunteer.volunteerId}</p>
                <p>You can now log in to the Volunteer Dashboard using your registered email and the password you created during signup.</p>
                <a href="${process.env.FRONTEND_URL || 'https://realhumantrust.org'}/volunteer/login">Login to Dashboard</a>
            `;
            try {
                await sendEmail({
                    to: volunteer.email,
                    subject: "Volunteer Application Approved - Real Human Trust",
                    html: emailHtml
                });
            } catch (err) {
                console.error("Failed to send approval email:", err);
            }
        }

        res.status(200).json({ success: true, volunteer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createVolunteer = async (req, res) => {
    try {
        const { fullName, email, mobile, address, message, status, password } = req.body;

        const salt = await bcrypt.genSalt(10);
        const plainPassword = password || "123456";
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        let profileImage = null;
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) {
                profileImage = { public_id: uploadResult.public_id, url: uploadResult.url };
            }
        }

        const volunteer = await Volunteer.create({
            fullName,
            email,
            mobile,
            address: address || "",
            message: message || "",
            status: status || "approved",
            password: hashedPassword,
            profileImage
        });

        if (volunteer.status === "approved" && !volunteer.volunteerId) {
            const date = new Date();
            const year = date.getFullYear();
            const count = await Volunteer.count({ where: { status: "approved" } });
            const paddedCount = String(count).padStart(4, '0');
            volunteer.volunteerId = `VOL-${year}-${paddedCount}`;
            await volunteer.save();
        }

        res.status(201).json({ success: true, message: "Volunteer added successfully", volunteer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
