const { Complaint, Member, User } = require("../models");
const { SendVerificationCode } = require("../utils/sendMail");

exports.raiseComplaint = async (req, res) => {
    try {
        const { subject, message } = req.body;
        
        const member = await Member.findOne({ where: { userId: req.user.id } });
        if (!member) {
            return res.status(403).json({ success: false, message: "Member profile not found" });
        }

        const complaint = await Complaint.create({
            memberId: member.id,
            subject,
            message,
            status: "pending"
        });

        res.status(201).json({ success: true, message: "Complaint submitted successfully", complaint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyComplaints = async (req, res) => {
    try {
        const member = await Member.findOne({ where: { userId: req.user.id } });
        if (!member) {
            return res.status(403).json({ success: false, message: "Member profile not found" });
        }

        const complaints = await Complaint.findAll({
            where: { memberId: member.id },
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({ success: true, count: complaints.length, complaints });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.findAll({
            include: [{
                model: Member,
                as: "member",
                include: [{ model: User, as: "user", attributes: ["fullName", "email", "mobile"] }]
            }],
            order: [["createdAt", "DESC"]],
        });
        
        res.status(200).json({ success: true, count: complaints.length, complaints });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findByPk(req.params.id, {
            include: [
                {
                    model: Member,
                    as: "member",
                    include: [{ model: User, as: "user", attributes: ["fullName", "email", "mobile"] }]
                },
                { model: User, as: "resolvedBy", attributes: ["fullName", "email", "role"] }
            ]
        });

        if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
        res.status(200).json({ success: true, complaint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.resolveComplaint = async (req, res) => {
    try {
        const { status, reply } = req.body;
        const complaint = await Complaint.findByPk(req.params.id, {
            include: [{
                model: Member,
                as: "member",
                include: [{ model: User, as: "user", attributes: ["fullName", "email"] }]
            }]
        });

        if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

        complaint.status = status || complaint.status;
        complaint.reply = reply || complaint.reply;
        
        if (status === "resolved" || status === "closed") {
            complaint.resolvedById = req.user.id;
            complaint.resolvedAt = new Date();
        }

        await complaint.save();

        if ((status === "resolved" || status === "closed") && complaint.member && complaint.member.user && complaint.member.user.email) {
            const userEmail = complaint.member.user.email;
            const userName = complaint.member.user.fullName;
            try {
                SendVerificationCode(
                    userEmail,
                    `<p>Dear ${userName},</p><p>Your complaint regarding "<strong>${complaint.subject}</strong>" has been updated to "<strong>${status}</strong>".</p><p><strong>Admin Reply:</strong><br/>${reply || "No additional remarks."}</p><p>If you have any further issues, please reach out to us.</p><p>Best Regards,<br/>Real Human Trust Support Team</p>`,
                    `Update on your Complaint: ${complaint.subject} - Real Human Trust`,
                    `Dear ${userName},\n\nYour complaint regarding "${complaint.subject}" has been updated to "${status}".\n\nAdmin Reply:\n${reply || "No additional remarks."}\n\nIf you have any further issues, please reach out to us.\n\nBest Regards,\nReal Human Trust Support Team`
                );
            } catch (emailError) {
                console.error("Error sending complaint email:", emailError);
            }
        }

        res.status(200).json({ success: true, message: "Complaint updated successfully", complaint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
