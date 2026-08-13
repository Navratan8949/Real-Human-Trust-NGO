const { Team } = require("../models");
const { uploadOnCloudinary } = require("../utils/cloudinary");

exports.getAllTeamMembers = async (req, res) => {
    try {
        const team = await Team.findAll({
            where: { status: "active" },
            order: [["order", "ASC"]],
        });
        res.status(200).json({ success: true, count: team.length, team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createTeamMember = async (req, res) => {
    try {
        const { name, designation, description, email, phone, website, socialLinks, order } = req.body;

        let photo = { public_id: "", url: "" };
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) photo = { public_id: uploadResult.public_id, url: uploadResult.url };
        }

        let parsedSocial = {};
        if (typeof socialLinks === "string") {
            try { parsedSocial = JSON.parse(socialLinks); } catch (e) {}
        } else if (typeof socialLinks === "object" && socialLinks !== null) {
            parsedSocial = socialLinks;
        }

        const member = await Team.create({
            name,
            designation,
            description: description || "",
            email: email || "",
            phone: phone || "",
            website: website || "",
            socialLinks: parsedSocial,
            order: order || 0,
            photo,
            createdById: req.user.id,
        });

        res.status(201).json({ success: true, member });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTeamMember = async (req, res) => {
    try {
        const member = await Team.findByPk(req.params.id);
        if (!member) return res.status(404).json({ success: false, message: "Team member not found" });

        const updatedData = { ...req.body };
        if (typeof updatedData.socialLinks === "string") {
            try { updatedData.socialLinks = JSON.parse(updatedData.socialLinks); } catch (e) {}
        }
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) updatedData.photo = { public_id: uploadResult.public_id, url: uploadResult.url };
        }

        await member.update(updatedData);
        res.status(200).json({ success: true, member });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTeamMember = async (req, res) => {
    try {
        const member = await Team.findByPk(req.params.id);
        if (!member) return res.status(404).json({ success: false, message: "Team member not found" });

        await member.destroy();
        res.status(200).json({ success: true, message: "Team member deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
