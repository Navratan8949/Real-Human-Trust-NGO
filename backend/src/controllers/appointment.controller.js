const { AppointmentLetter, Member, User } = require("../models");
const pdf = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateLetterNo = () => {
    return "RHT-AL-" + Date.now().toString().slice(-6);
};

exports.createAppointmentLetter = async (req, res) => {
    try {
        const { memberId, designation, department, joiningDate } = req.body;

        const member = await Member.findByPk(memberId, {
            include: [{ model: User, as: "user" }]
        });
        if (!member) {
            return res.status(404).json({ success: false, message: "Member not found" });
        }

        const letterNo = generateLetterNo();

        const pdfFileName = `${letterNo}.pdf`;
        const localPdfPath = path.join(__dirname, "..", "..", "public", "uploads", "appointments", pdfFileName);

        const dirPath = path.dirname(localPdfPath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const doc = new pdf();
        const writeStream = fs.createWriteStream(localPdfPath);
        doc.pipe(writeStream);

        doc.fontSize(22).text("Real Human Education & Charitable Trust", { align: "center", underline: true });
        doc.moveDown();
        doc.fontSize(16).text("APPOINTMENT LETTER", { align: "center" });
        doc.moveDown();

        doc.fontSize(12).text(`Letter No: ${letterNo}`, { align: "right" });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });
        doc.moveDown();

        doc.text(`To,`);
        doc.text(`Name: ${member.user?.fullName || "Member"}`);
        doc.text(`Member ID: ${member.memberId}`);
        doc.text(`Email: ${member.user?.email || ""}`);
        doc.moveDown();

        doc.text(`Subject: Appointment for the position of ${designation}`, { underline: true });
        doc.moveDown();

        doc.text(`Dear ${member.user?.fullName || "Member"},`);
        doc.moveDown();
        doc.text(`We are pleased to appoint you as ${designation} in the ${department || "General"} department at Real Human Education & Charitable Trust.`);
        doc.text(`Your effective joining date is ${new Date(joiningDate).toLocaleDateString()}.`);
        doc.moveDown();
        doc.text("We believe your skills and experience will be an excellent match for our organization. We look forward to your positive impact in our NGO's mission.");
        doc.moveDown(2);

        doc.text("Sincerely,");
        doc.moveDown();

        const signaturePath = path.join(__dirname, "..", "..", "public", "images", "signature.png");
        if (fs.existsSync(signaturePath)) {
            doc.image(signaturePath, { width: 120 });
            doc.moveDown(0.2);
        } else {
            doc.text("_______________________");
        }

        doc.text("Authorized Signatory");
        doc.text("Real Human Education & Charitable Trust");

        doc.end();

        writeStream.on("finish", async () => {
            try {
                const pdfUrl = `${process.env.FRONTEND_URL || ""}/public/uploads/appointments/${pdfFileName}`;

                const appointmentLetter = await AppointmentLetter.create({
                    memberId,
                    letterNo,
                    designation,
                    department: department || "",
                    joiningDate,
                    pdf: { public_id: "", url: pdfUrl }
                });

                const populatedLetter = await AppointmentLetter.findByPk(appointmentLetter.id, {
                    include: [{
                        model: Member,
                        as: "member",
                        include: [{ model: User, as: "user", attributes: ["fullName", "email"] }]
                    }]
                });

                res.status(201).json({ success: true, message: "Appointment letter generated successfully", appointmentLetter: populatedLetter });
            } catch (saveError) {
                console.error(saveError);
                res.status(500).json({ success: false, message: "Failed to save appointment letter" });
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllAppointmentLetters = async (req, res) => {
    try {
        const where = {}
        if (req.query.memberId) {
            where.memberId = req.query.memberId
        }

        const letters = await AppointmentLetter.findAll({
            where,
            include: [{
                model: Member,
                as: "member",
                include: [{ model: User, as: "user", attributes: ["fullName", "email"] }]
            }],
            order: [["createdAt", "DESC"]],
        });

        res.status(200).json({ success: true, count: letters.length, letters });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyAppointmentLetters = async (req, res) => {
    try {
        const member = await Member.findOne({ where: { userId: req.user.id } });
        if (!member) {
            return res.status(404).json({ success: false, message: "Member profile not found" });
        }

        const letters = await AppointmentLetter.findAll({
            where: { memberId: member.id },
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({ success: true, count: letters.length, letters });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
