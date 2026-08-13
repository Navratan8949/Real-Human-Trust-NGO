const { Certificate, Member, User, Volunteer } = require("../models");
const { generateCertificatePDF } = require("../utils/generatePDF");
const { SendVerificationCode } = require("../utils/sendMail");
const path = require("path");
const fs = require("fs");

exports.createCertificate = async (req, res) => {
    try {
        const { member, memberId, volunteer, volunteerId, certificateNo, title, description, status } = req.body;
        const actualMemberId = member || memberId;
        const actualVolunteerId = volunteer || volunteerId;

        if (!actualMemberId && !actualVolunteerId) {
            return res.status(400).json({ success: false, message: "Either Member ID or Volunteer ID is required" });
        }

        let userName = "Recipient";
        let userEmail = "";

        if (actualMemberId) {
            const memberDoc = await Member.findByPk(actualMemberId, {
                include: [{ model: User, as: "user" }]
            });
            if (!memberDoc) return res.status(404).json({ success: false, message: "Member not found" });
            userName = memberDoc.user ? memberDoc.user.fullName : "Member";
            userEmail = memberDoc.user ? memberDoc.user.email : "";
        } else if (actualVolunteerId) {
            const volunteerDoc = await Volunteer.findByPk(actualVolunteerId);
            if (!volunteerDoc) return res.status(404).json({ success: false, message: "Volunteer not found" });
            userName = volunteerDoc.fullName || "Volunteer";
            userEmail = volunteerDoc.email;
        }

        let pdf = { public_id: "", url: "" };
        const pdfPath = await generateCertificatePDF({ certificateNo, title, description }, userName);
        
        if (pdfPath) {
            const fileName = path.basename(pdfPath);
            const localUrl = `${req.protocol}://${req.get("host")}/public/certificates/${fileName}`;
            pdf = { public_id: fileName, url: localUrl };
        }

        const certificate = await Certificate.create({
            memberId: actualMemberId || null,
            volunteerId: actualVolunteerId || null,
            certificateNo,
            title,
            description: description || "",
            status: status || "active",
            pdf
        });

        const populatedCertificate = await Certificate.findByPk(certificate.id, {
            include: [
                { model: Member, as: "member", include: [{ model: User, as: "user", attributes: ["fullName", "email"] }] },
                { model: Volunteer, as: "volunteer", attributes: ["fullName", "email"] }
            ]
        });

        if (userEmail) {
            SendVerificationCode(
                userEmail,
                `<p>Dear ${userName},</p><p>We are delighted to inform you that you have been awarded a new certificate: "<strong>${title}</strong>".</p><p>Description: ${description}</p><p>You can view and download your certificate from your Dashboard.</p><p>Thank you for your continuous support!</p><p>Best Regards,<br/>Real Human Trust Team</p>`,
                "Congratulations! You have received a new Certificate - Real Human Trust",
                `Dear ${userName},\n\nWe are delighted to inform you that you have been awarded a new certificate: "${title}".\n\nDescription: ${description}\n\nYou can view and download your certificate from your Dashboard.\n\nThank you for your continuous support!\n\nBest Regards,\nReal Human Trust Team`
            );
        }

        res.status(201).json({ success: true, certificate: populatedCertificate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllCertificates = async (req, res) => {
    try {
        const where = {}
        if (req.query.memberId) where.memberId = req.query.memberId;
        if (req.query.volunteerId) where.volunteerId = req.query.volunteerId;

        const certificates = await Certificate.findAll({
            where,
            include: [
                { model: Member, as: "member", include: [{ model: User, as: "user", attributes: ["fullName", "email"] }] },
                { model: Volunteer, as: "volunteer", attributes: ["fullName", "email"] }
            ],
            order: [["issueDate", "DESC"]],
        });
        res.status(200).json({ success: true, count: certificates.length, certificates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyCertificates = async (req, res) => {
    try {
        let certificates = [];
        
        if (req.user.role === "volunteer") {
            certificates = await Certificate.findAll({
                where: { volunteerId: req.user.id },
                order: [["issueDate", "DESC"]],
            });
        } else {
            const member = await Member.findOne({ where: { userId: req.user.id } });
            if (!member) return res.status(404).json({ success: false, message: "Member not found" });
            certificates = await Certificate.findAll({
                where: { memberId: member.id },
                order: [["issueDate", "DESC"]],
            });
        }

        res.status(200).json({ success: true, count: certificates.length, certificates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findByPk(req.params.id);
        if (!certificate) return res.status(404).json({ success: false, message: "Certificate not found" });

        const { member, memberId, volunteer, volunteerId, certificateNo, title, description, status } = req.body;
        const actualMemberId = member || memberId || certificate.memberId;
        const actualVolunteerId = volunteer || volunteerId || certificate.volunteerId;

        let userName = "Recipient";
        if (actualMemberId) {
            const memberDoc = await Member.findByPk(actualMemberId, { include: [{ model: User, as: "user" }] });
            userName = memberDoc && memberDoc.user ? memberDoc.user.fullName : "Member";
        } else if (actualVolunteerId) {
            const volDoc = await Volunteer.findByPk(actualVolunteerId);
            userName = volDoc ? volDoc.fullName : "Volunteer";
        }

        let pdf = certificate.pdf;
        const pdfPath = await generateCertificatePDF({ certificateNo: certificateNo || certificate.certificateNo, title: title || certificate.title, description: description !== undefined ? description : certificate.description }, userName);
        if (pdfPath) {
            const fileName = path.basename(pdfPath);
            const localUrl = `${req.protocol}://${req.get("host")}/public/certificates/${fileName}`;
            
            if (pdf && pdf.public_id) {
                const oldPath = path.join(__dirname, "..", "..", "public", "certificates", pdf.public_id);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            pdf = { public_id: fileName, url: localUrl };
        }

        await certificate.update({
            memberId: actualMemberId || null,
            volunteerId: actualVolunteerId || null,
            certificateNo: certificateNo || certificate.certificateNo,
            title: title || certificate.title,
            description: description !== undefined ? description : certificate.description,
            status: status || certificate.status,
            pdf
        });

        const populatedCertificate = await Certificate.findByPk(certificate.id, {
            include: [
                { model: Member, as: "member", include: [{ model: User, as: "user", attributes: ["fullName", "email"] }] },
                { model: Volunteer, as: "volunteer", attributes: ["fullName", "email"] }
            ]
        });

        res.status(200).json({ success: true, certificate: populatedCertificate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findByPk(req.params.id);
        if (!certificate) return res.status(404).json({ success: false, message: "Certificate not found" });

        if (certificate.pdf && certificate.pdf.public_id) {
            const oldPath = path.join(__dirname, "..", "..", "public", "certificates", certificate.pdf.public_id);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        await certificate.destroy();
        res.status(200).json({ success: true, message: "Certificate deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
