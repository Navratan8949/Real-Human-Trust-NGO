const { SiteContent } = require("../models");
const { uploadOnCloudinary } = require("../utils/cloudinary");

exports.getContentByKey = async (req, res) => {
    try {
        const content = await SiteContent.findOne({ where: { key: req.params.key } });
        if (!content) return res.status(404).json({ success: false, message: "Content not found" });
        res.status(200).json({ success: true, content });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllContent = async (req, res) => {
    try {
        const contents = await SiteContent.findAll();
        res.status(200).json({ success: true, contents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.upsertContent = async (req, res) => {
    try {
        const { key, title, content, content_hi, content_gu } = req.body;

        let image = undefined;
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) image = { public_id: uploadResult.public_id, url: uploadResult.url };
        }

        const updateData = {
            key,
            title: title || "",
            content: content || "",
            content_hi: content_hi || "",
            content_gu: content_gu || "",
            updatedById: req.user.id,
        };
        if (image) updateData.image = image;

        let siteContent = await SiteContent.findOne({ where: { key } });
        if (siteContent) {
            await siteContent.update(updateData);
        } else {
            siteContent = await SiteContent.create(updateData);
        }

        res.status(200).json({ success: true, siteContent });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteContent = async (req, res) => {
    try {
        const content = await SiteContent.findByPk(req.params.id);
        if (!content) return res.status(404).json({ success: false, message: "Content not found" });
        await content.destroy();
        res.status(200).json({ success: true, message: "Content deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.uploadMedia = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "No file provided" });
        const uploadResult = await uploadOnCloudinary(req.file.path);
        if (!uploadResult) throw new Error("Cloudinary upload failed");
        res.status(200).json({ success: true, url: uploadResult.url });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
