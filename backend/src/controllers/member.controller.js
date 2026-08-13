const { Member, User } = require("../models");
const { Op } = require("sequelize");
const QRCode = require("qrcode");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const { SendVerificationCode } = require("../utils/sendMail");

const generateMemberId = () => {
    return "RHTM" + Math.floor(100000 + Math.random() * 900000);
};

exports.applyMembership = async (req, res) => {
    try {
        let { bloodGroup, occupation, membershipType, referredBy } = req.body;
        const userId = req.user.id;

        let resolvedReferrerId = null;
        if (referredBy && typeof referredBy === "string" && referredBy.trim() !== "") {
            const referrer = await Member.findOne({
                where: { memberId: referredBy.trim() }
            });
            if (referrer) {
                resolvedReferrerId = referrer.userId;
            } else {
                const userReferrer = await User.findOne({
                    where: { fullName: referredBy.trim() }
                });
                if (userReferrer) {
                    resolvedReferrerId = userReferrer.id;
                }
            }
        }

        let existingMember = await Member.findOne({ where: { userId } });
        if (existingMember && existingMember.membershipStatus !== "rejected") {
            return res.status(400).json({ success: false, message: "Membership already applied." });
        }

        const memberId = existingMember ? existingMember.memberId : generateMemberId();

        let profileImage = existingMember ? existingMember.profileImage : { public_id: "", url: "" };
        const profileFile = req.files && req.files["profileImage"] ? req.files["profileImage"][0] : null;
        if (profileFile) {
            const uploadResult = await uploadOnCloudinary(profileFile.path);
            if (uploadResult) {
                profileImage = { public_id: uploadResult.public_id, url: uploadResult.url };
            }
        }

        let idProof = existingMember ? existingMember.idProof : { public_id: "", url: "" };
        const idProofFile = req.files && req.files["idProof"] ? req.files["idProof"][0] : null;
        if (idProofFile) {
            const uploadResult = await uploadOnCloudinary(idProofFile.path);
            if (uploadResult) {
                idProof = { public_id: uploadResult.public_id, url: uploadResult.url };
            }
        }

        let paymentScreenshot = existingMember ? existingMember.paymentScreenshot : { public_id: "", url: "" };
        const paymentScreenshotFile = req.files && req.files["paymentScreenshot"] ? req.files["paymentScreenshot"][0] : null;
        if (paymentScreenshotFile) {
            const uploadResult = await uploadOnCloudinary(paymentScreenshotFile.path);
            if (uploadResult) {
                paymentScreenshot = { public_id: uploadResult.public_id, url: uploadResult.url };
            }
        }

        let member;
        if (existingMember) {
            existingMember.bloodGroup = bloodGroup || "";
            existingMember.occupation = occupation || "";
            existingMember.membershipType = membershipType || "general";
            existingMember.referredById = resolvedReferrerId;
            existingMember.profileImage = profileImage;
            existingMember.idProof = idProof;
            existingMember.paymentScreenshot = paymentScreenshot;
            existingMember.membershipStatus = "pending";
            existingMember.rejectionReason = "";
            await existingMember.save();
            member = existingMember;
        } else {
            member = await Member.create({
                userId,
                memberId,
                bloodGroup: bloodGroup || "",
                occupation: occupation || "",
                membershipType: membershipType || "general",
                referredById: resolvedReferrerId,
                profileImage,
                idProof,
                paymentScreenshot,
                membershipStatus: "pending",
            });
        }

        res.status(201).json({ success: true, message: "Membership application submitted successfully.", member });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllMembers = async (req, res) => {
    try {
        const members = await Member.findAll({
            include: [
                { model: User, as: "user", attributes: ["id", "_id", "fullName", "email", "mobile", "role", "profileImage"] },
                { model: User, as: "referredBy", attributes: ["id", "_id", "fullName", "email", "profileImage"] }
            ],
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({ success: true, count: members.length, members });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.approveMember = async (req, res) => {
    try {
        const member = await Member.findByPk(req.params.id, {
            include: [{ model: User, as: "user", attributes: ["id", "_id", "fullName", "email"] }]
        });
        if (!member) {
            return res.status(404).json({ success: false, message: "Member not found" });
        }

        member.membershipStatus = "approved";

        const verificationLink = `${process.env.FRONTEND_URL || "https://realhumantrust.org"}/verify-member/${member.memberId}`;
        const qrCodeData = await QRCode.toDataURL(verificationLink);

        member.qrCode = qrCodeData;
        await member.save();

        if (member.user && member.user.email) {
            const userEmail = member.user.email;
            const userName = member.user.fullName;
            try {
                SendVerificationCode(
                    userEmail,
                    `<p>Dear ${userName},</p><p>Congratulations! Your membership application has been approved.</p><p>Your unique Member ID is: <strong>${member.memberId}</strong></p><p>You can now log in to the Member Dashboard to access your profile, ID card, and exclusive features.</p><p>Welcome to the team!</p><p>Best Regards,<br/>Real Human Trust Team</p>`,
                    "Membership Approved - Real Human Trust",
                    `Dear ${userName},\n\nCongratulations! Your membership application has been approved.\nYour unique Member ID is: ${member.memberId}\n\nYou can now log in to the Member Dashboard to access your profile, ID card, and exclusive features.\n\nWelcome to the team!\n\nBest Regards,\nReal Human Trust Team`
                );
            } catch (emailError) {
                console.error("Error sending approval email:", emailError);
            }
        }

        res.status(200).json({ success: true, message: "Member approved and QR Code generated", member });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.rejectMember = async (req, res) => {
    try {
        const { reason } = req.body;
        const member = await Member.findByPk(req.params.id, {
            include: [{ model: User, as: "user", attributes: ["id", "_id", "fullName", "email"] }]
        });
        if (!member) {
            return res.status(404).json({ success: false, message: "Member not found" });
        }

        member.membershipStatus = "rejected";
        member.rejectionReason = reason || "No reason provided by administration.";
        await member.save();

        if (member.user && member.user.email) {
            const userEmail = member.user.email;
            const userName = member.user.fullName;
            try {
                SendVerificationCode(
                    userEmail,
                    `<p>Dear ${userName},</p><p>We regret to inform you that your membership application has been rejected at this time.</p><p><strong>Reason provided by administration:</strong><br/>${reason || "No reason provided by administration."}</p><p>If you have any questions, please contact our support team.</p><p>Best Regards,<br/>Real Human Trust Team</p>`,
                    "Membership Application Status - Real Human Trust",
                    `Dear ${userName},\n\nWe regret to inform you that your membership application has been rejected at this time.\n\nReason provided by administration:\n${reason || "No reason provided by administration."}\n\nIf you have any questions, please contact our support team.\n\nBest Regards,\nReal Human Trust Team`
                );
            } catch (emailError) {
                console.error("Error sending rejection email:", emailError);
            }
        }

        res.status(200).json({ success: true, message: "Member application rejected", member });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyProfile = async (req, res) => {
    try {
        const member = await Member.findOne({
            where: { userId: req.user.id },
            include: [{ model: User, as: "user", attributes: ["id", "_id", "fullName", "email", "mobile", "dob", "address", "state", "district", "profileImage"] }]
        });
        if (!member) return res.status(404).json({ success: false, message: "Member profile not found" });

        res.status(200).json({ success: true, member });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateMemberProfile = async (req, res) => {
    try {
        const { fullName, mobile, dob, address, state, district, bloodGroup, occupation } = req.body;

        const member = await Member.findOne({ where: { userId: req.user.id } });
        if (!member) {
            return res.status(404).json({ success: false, message: "Member profile not found" });
        }

        const user = await User.findByPk(req.user.id);

        if (fullName) user.fullName = fullName;
        if (mobile) user.mobile = mobile;
        if (dob) user.dob = dob;
        if (address) user.address = address;
        if (state) user.state = state;
        if (district) user.district = district;
        await user.save();

        if (bloodGroup) member.bloodGroup = bloodGroup;
        if (occupation) member.occupation = occupation;

        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) {
                member.profileImage = {
                    public_id: uploadResult.public_id,
                    url: uploadResult.url
                };
            }
        }

        await member.save();

        const updatedMember = await Member.findByPk(member.id, {
            include: [{ model: User, as: "user", attributes: ["id", "_id", "fullName", "email", "mobile", "dob", "address", "state", "district", "profileImage"] }]
        });

        res.status(200).json({ success: true, message: "Profile updated successfully", member: updatedMember });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createMemberDirectly = async (req, res) => {
    try {
        const { fullName, email, mobile, password, bloodGroup, occupation, membershipType } = req.body;
        const bcrypt = require("bcryptjs");

        if (!fullName || !email || !mobile) {
            return res.status(400).json({ success: false, message: "Please provide fullName, email, and mobile" });
        }

        let user = await User.findOne({
            where: { [Op.or]: [{ email }, { mobile }] }
        });

        if (!user) {
            if (!password) {
                return res.status(400).json({ success: false, message: "Please provide a password for the new user account" });
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user = await User.create({
                fullName, email, mobile, password: hashedPassword, role: "member"
            });
        }

        const existingMember = await Member.findOne({ where: { userId: user.id } });
        if (existingMember) {
            return res.status(400).json({ success: false, message: "This user is already a member" });
        }

        const memberId = generateMemberId();

        const member = await Member.create({
            userId: user.id,
            memberId,
            bloodGroup: bloodGroup || "",
            occupation: occupation || "",
            membershipType: membershipType || "general",
            createdById: req.user.id,
            membershipStatus: "approved",
        });

        const verificationLink = `${process.env.FRONTEND_URL || "https://realhumantrust.org"}/verify-member/${member.memberId}`;
        member.qrCode = await QRCode.toDataURL(verificationLink);
        await member.save();

        const populatedMember = await Member.findByPk(member.id, {
            include: [{ model: User, as: "user", attributes: ["id", "_id", "fullName", "email", "mobile", "role"] }]
        });

        if (populatedMember.user && populatedMember.user.email) {
            const userEmail = populatedMember.user.email;
            const userName = populatedMember.user.fullName;
            const loginInfo = !password ? "" : `\nYour account has been created with this email. Password: ${password}\n`;
            const loginInfoHtml = !password ? "" : `<p>Your account has been created with this email. Password: <strong>${password}</strong></p>`;
            try {
                SendVerificationCode(
                    userEmail,
                    `<p>Dear ${userName},</p><p>Your membership has been successfully created by the administration.</p><p>Your unique Member ID is: <strong>${member.memberId}</strong></p>${loginInfoHtml}<p>You can log in to the Member Dashboard to access your profile, ID card, and exclusive features.</p><p>Welcome to the team!</p><p>Best Regards,<br/>Real Human Trust Team</p>`,
                    "Welcome to Real Human Trust - Membership Created",
                    `Dear ${userName},\n\nYour membership has been successfully created by the administration.\nYour unique Member ID is: ${member.memberId}\n${loginInfo}\nYou can log in to the Member Dashboard to access your profile, ID card, and exclusive features.\n\nWelcome to the team!\n\nBest Regards,\nReal Human Trust Team`
                );
            } catch (emailError) {
                console.error("Error sending creation email:", emailError);
            }
        }

        res.status(201).json({ success: true, message: "Member created successfully", member: populatedMember });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyPublicMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        const member = await Member.findOne({
            where: { memberId: memberId.trim() },
            include: [{ model: User, as: "user", attributes: ["id", "_id", "fullName", "email", "mobile", "profileImage"] }]
        });

        if (!member) {
            return res.status(404).json({ success: false, message: "Member record not found" });
        }

        res.status(200).json({
            success: true,
            verified: member.membershipStatus === "approved",
            member: {
                memberId: member.memberId,
                fullName: member.user?.fullName || "N/A",
                profileImage: member.profileImage?.url || member.user?.profileImage?.url || "",
                membershipType: member.membershipType,
                bloodGroup: member.bloodGroup,
                occupation: member.occupation,
                joiningDate: member.joiningDate,
                membershipStatus: member.membershipStatus
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
