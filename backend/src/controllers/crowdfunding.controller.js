const { Crowdfunding, Project } = require("../models");
const { uploadOnCloudinary } = require("../utils/cloudinary");

exports.createCampaign = async (req, res) => {
    try {
        const { project, projectId, title, description, targetAmount, startDate, endDate, status } = req.body;

        let image = { public_id: "", url: "" };
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) {
                image = { public_id: uploadResult.public_id, url: uploadResult.url };
            }
        }

        const campaign = await Crowdfunding.create({
            projectId: projectId || project,
            title,
            description,
            targetAmount,
            startDate: startDate || null,
            endDate: endDate || null,
            status: status || "active",
            image
        });

        res.status(201).json({ success: true, campaign });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Crowdfunding.findAll({
            include: [{ model: Project, as: "project", attributes: ["id", "_id", "title"] }],
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({ success: true, count: campaigns.length, campaigns });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCampaignById = async (req, res) => {
    try {
        const campaign = await Crowdfunding.findByPk(req.params.id, {
            include: [{ model: Project, as: "project", attributes: ["id", "_id", "title", "description"] }]
        });
        if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });
        res.status(200).json({ success: true, campaign });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCampaign = async (req, res) => {
    try {
        let campaign = await Crowdfunding.findByPk(req.params.id);
        if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

        const updatedData = { ...req.body };
        if (updatedData.project) {
            updatedData.projectId = updatedData.project;
        }
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) {
                updatedData.image = { public_id: uploadResult.public_id, url: uploadResult.url };
            }
        }

        await campaign.update(updatedData);
        res.status(200).json({ success: true, campaign });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCampaign = async (req, res) => {
    try {
        const campaign = await Crowdfunding.findByPk(req.params.id);
        if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

        await campaign.destroy();
        res.status(200).json({ success: true, message: "Campaign deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
