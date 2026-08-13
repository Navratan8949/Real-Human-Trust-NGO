const { Donation, Member, User, Project, Crowdfunding } = require("../models");
const { Op } = require("sequelize");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const { generateReceiptPDF } = require("../utils/generatePDF");

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "mock_key_id",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_key_secret",
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER || "test@gmail.com",
        pass: process.env.EMAIL_PASS || "testpassword",
    },
});

const generateReceiptNumber = () => {
    return "RHT-REC-" + Date.now().toString().slice(-6);
};

exports.createOrder = async (req, res) => {
    try {
        const { amount, paymentMethod, message, fullName, email, phone, purpose, upiId, projectId, campaignId } = req.body;

        let userId = req.user ? req.user.id : null;
        let memberId = null;
        if (userId) {
            const member = await Member.findOne({ where: { userId } });
            if (member) memberId = member.id;
        }

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: generateReceiptNumber(),
        };

        let order;
        try {
            order = await razorpayInstance.orders.create(options);
        } catch (err) {
            // fallback mock order if keys are missing
            order = { id: "order_mock_" + Date.now(), amount: options.amount, currency: "INR", receipt: options.receipt };
        }

        const donation = await Donation.create({
            userId,
            memberId,
            fullName,
            email,
            phone,
            purpose,
            upiId,
            amount,
            paymentMethod: paymentMethod || "online",
            receiptNumber: options.receipt,
            message,
            paymentId: "pending",
            projectId: projectId || null,
            campaignId: campaignId || null,
        });

        res.status(200).json({ success: true, order, donationId: donation.id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donationId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "mockkeysecret")
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature || process.env.NODE_ENV !== "production";

        if (isAuthentic) {
            const donation = await Donation.findByPk(donationId, {
                include: [{
                    model: Member,
                    as: "member",
                    include: [{ model: User, as: "user", attributes: ["fullName", "email"] }]
                }]
            });

            if (!donation) {
                return res.status(404).json({ success: false, message: "Donation record not found" });
            }

            donation.paymentId = razorpay_payment_id;
            donation.paymentStatus = "success";
            await donation.save();

            if (donation.projectId) {
                const project = await Project.findByPk(donation.projectId);
                if (project) {
                    project.raisedAmount = Number(project.raisedAmount) + Number(donation.amount);
                    await project.save();
                }
            }

            if (donation.campaignId) {
                const campaign = await Crowdfunding.findByPk(donation.campaignId);
                if (campaign) {
                    campaign.raisedAmount = Number(campaign.raisedAmount) + Number(donation.amount);
                    await campaign.save();
                }
            }

            const donorName = donation.fullName || (donation.member && donation.member.user && donation.member.user.fullName) || "Donor";
            const donorEmail = donation.email || (donation.member && donation.member.user && donation.member.user.email) || "";

            try {
                const pdfPath = await generateReceiptPDF(donation, donorName, donorEmail);
                const mailOptions = {
                    from: process.env.EMAIL_USER || "test@gmail.com",
                    to: donorEmail,
                    subject: "Donation Receipt - Real Human Trust",
                    text: "Thank you for your donation. Please find your 80G receipt attached.",
                    attachments: [
                        {
                            filename: `Receipt-${donation.receiptNumber}.pdf`,
                            path: pdfPath,
                        },
                    ],
                };
                await transporter.sendMail(mailOptions);
            } catch (emailError) {
                console.error("Error sending email:", emailError);
            }

            res.status(200).json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid Signature" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllDonations = async (req, res) => {
    try {
        const donations = await Donation.findAll({
            include: [
                {
                    model: Member,
                    as: "member",
                    include: [{ model: User, as: "user", attributes: ["fullName", "email"] }]
                },
                { model: Project, as: "project", attributes: ["title"] },
                { model: Crowdfunding, as: "campaign", attributes: ["title"] }
            ],
            order: [["createdAt", "DESC"]],
        });

        res.status(200).json({ success: true, count: donations.length, donations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyDonations = async (req, res) => {
    try {
        const userId = req.user.id;
        const userObj = await User.findByPk(userId);
        const member = await Member.findOne({ where: { userId } });

        const queryOr = [{ userId }];
        if (userObj && userObj.email) {
            queryOr.push({ email: userObj.email });
        }
        if (member) {
            queryOr.push({ memberId: member.id });
        }

        const donations = await Donation.findAll({
            where: { [Op.or]: queryOr },
            include: [
                { model: Project, as: "project", attributes: ["title"] },
                { model: Crowdfunding, as: "campaign", attributes: ["title"] }
            ],
            order: [["createdAt", "DESC"]],
        });

        res.status(200).json({ success: true, count: donations.length, donations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createManualDonation = async (req, res) => {
    try {
        const { amount, paymentMethod, transactionId, message, fullName, email, phone, purpose, upiId, projectId, campaignId } = req.body;

        let userId = req.user ? req.user.id : null;
        let memberId = null;
        if (userId) {
            const member = await Member.findOne({ where: { userId } });
            if (member) memberId = member.id;
        }

        let paymentProof = { public_id: "", url: "" };
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) {
                paymentProof = { public_id: uploadResult.public_id, url: uploadResult.url };
            }
        }

        const donation = await Donation.create({
            userId,
            memberId,
            fullName,
            email,
            phone,
            purpose,
            upiId,
            amount,
            paymentMethod,
            transactionId,
            receiptNumber: generateReceiptNumber(),
            message,
            paymentId: "manual",
            paymentStatus: "pending",
            paymentProof,
            projectId: projectId || null,
            campaignId: campaignId || null,
        });

        res.status(201).json({ success: true, message: "Manual donation submitted for verification.", donation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyManualDonation = async (req, res) => {
    try {
        const { status } = req.body;
        const donation = await Donation.findByPk(req.params.id, {
            include: [{
                model: Member,
                as: "member",
                include: [{ model: User, as: "user", attributes: ["fullName", "email"] }]
            }]
        });

        if (!donation) return res.status(404).json({ success: false, message: "Donation not found" });

        donation.paymentStatus = status;
        await donation.save();

        if (status === "verified") {
            if (donation.projectId) {
                const project = await Project.findByPk(donation.projectId);
                if (project) {
                    project.raisedAmount = Number(project.raisedAmount) + Number(donation.amount);
                    await project.save();
                }
            }

            if (donation.campaignId) {
                const campaign = await Crowdfunding.findByPk(donation.campaignId);
                if (campaign) {
                    campaign.raisedAmount = Number(campaign.raisedAmount) + Number(donation.amount);
                    await campaign.save();
                }
            }

            const donorName = donation.fullName || (donation.member && donation.member.user && donation.member.user.fullName) || "Donor";
            const donorEmail = donation.email || (donation.member && donation.member.user && donation.member.user.email) || "";

            (async () => {
                try {
                    const pdfPath = await generateReceiptPDF(donation, donorName, donorEmail);
                    const mailOptions = {
                        from: process.env.EMAIL_USER || "test@gmail.com",
                        to: donorEmail,
                        subject: "Donation Receipt - Real Human Trust",
                        text: "Your offline donation has been verified! Please find your 80G receipt attached.",
                        attachments: [{ filename: `Receipt-${donation.receiptNumber}.pdf`, path: pdfPath }],
                    };
                    await transporter.sendMail(mailOptions);
                } catch (emailError) {
                    console.error("Error sending email or PDF:", emailError);
                }
            })();
        }

        return res.status(200).json({ success: true, message: `Donation ${status}`, donation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDonationById = async (req, res) => {
    try {
        const donation = await Donation.findByPk(req.params.id, {
            include: [
                { model: Project, as: "project", attributes: ["title"] },
                { model: Crowdfunding, as: "campaign", attributes: ["title"] }
            ]
        });

        if (!donation) {
            return res.status(404).json({ success: false, message: "Donation not found" });
        }

        res.status(200).json({ success: true, donation });
    } catch (error) {
        res.status(500).json({ success: false, message: "Invalid donation ID or server error" });
    }
};
