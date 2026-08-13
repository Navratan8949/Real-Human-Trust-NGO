const { EventRegistration, Event, Member, User } = require("../models");
const { Op } = require("sequelize");
const { SendVerificationCode } = require("../utils/sendMail");

exports.registerForEvent = async (req, res) => {
    try {
        const { eventId, fullName, email, mobile, remarks } = req.body;

        if (!eventId || !fullName || !email || !mobile) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }

        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        if (event.registrationLastDate && new Date() > new Date(event.registrationLastDate)) {
            return res.status(400).json({ success: false, message: "Registration deadline has passed" });
        }

        if (event.maxParticipants) {
            const currentRegistrations = await EventRegistration.count({
                where: {
                    eventId,
                    status: { [Op.ne]: "cancelled" }
                }
            });
            if (currentRegistrations >= event.maxParticipants) {
                return res.status(400).json({ success: false, message: "Event is full" });
            }
        }

        const existingRegistration = await EventRegistration.findOne({
            where: {
                email: email.toLowerCase(),
                eventId
            }
        });
        if (existingRegistration) {
            return res.status(400).json({ success: false, message: "You are already registered for this event" });
        }

        const user = await User.findOne({ where: { email: email.toLowerCase() } });
        let memberId = null;
        if (user) {
            const member = await Member.findOne({ where: { userId: user.id } });
            if (member) memberId = member.id;
        }

        const registration = await EventRegistration.create({
            memberId,
            fullName,
            email: email.toLowerCase(),
            mobile,
            eventId,
            remarks: remarks || "",
            status: "registered"
        });

        try {
            SendVerificationCode(
                email.toLowerCase(),
                `<p>Dear ${fullName},</p><p>Your registration for the event "<strong>${event.title}</strong>" has been confirmed.</p><p><strong>Date:</strong> ${event.eventDate ? new Date(event.eventDate).toDateString() : "TBA"}<br/><strong>Location:</strong> ${event.location || "TBA"}</p><p>We look forward to seeing you there!</p><p>Best Regards,<br/>Real Human Trust Team</p>`,
                "Event Registration Confirmed - Real Human Trust",
                `Dear ${fullName},\n\nYour registration for the event "${event.title}" has been confirmed.\n\nDate: ${event.eventDate ? new Date(event.eventDate).toDateString() : "TBA"}\nLocation: ${event.location || "TBA"}\n\nWe look forward to seeing you there!\n\nBest Regards,\nReal Human Trust Team`
            );
        } catch (emailError) {
            console.error("Error sending event registration email:", emailError);
        }

        res.status(201).json({ success: true, message: "Registered successfully", registration });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyEventRegistrations = async (req, res) => {
    try {
        const userId = req.user.id;
        const member = await Member.findOne({ where: { userId } });
        if (!member) {
            return res.status(403).json({ success: false, message: "Member profile not found" });
        }

        const registrations = await EventRegistration.findAll({
            where: { memberId: member.id },
            include: [{ model: Event, as: "event", attributes: ["title", "eventDate", "location"] }]
        });
        res.status(200).json({ success: true, registrations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getEventRegistrations = async (req, res) => {
    try {
        const registrations = await EventRegistration.findAll({
            where: { eventId: req.params.eventId },
            include: [{
                model: Member,
                as: "member",
                include: [{ model: User, as: "user", attributes: ["fullName", "email", "mobile"] }]
            }]
        });
        res.status(200).json({ success: true, count: registrations.length, registrations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateRegistrationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const registration = await EventRegistration.findByPk(req.params.id);

        if (!registration) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }

        registration.status = status;
        await registration.save();

        res.status(200).json({ success: true, registration });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
