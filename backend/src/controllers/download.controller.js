const { Download } = require("../models");
const { uploadOnCloudinary } = require("../utils/cloudinary");

exports.getAllDownloads = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = { status: "active" };
        if (category) filter.category = category;

        const downloads = await Download.findAll({
            where: filter,
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({ success: true, count: downloads.length, downloads });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createDownload = async (req, res) => {
    try {
        const { title, description, category, fileType } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "File is required" });
        }

        const uploadResult = await uploadOnCloudinary(req.file.path);
        if (!uploadResult) {
            return res.status(500).json({ success: false, message: "File upload failed" });
        }

        const download = await Download.create({
            title,
            description: description || "",
            category: category || "document",
            fileType: fileType || "pdf",
            file: { public_id: uploadResult.public_id, url: uploadResult.url },
            createdById: req.user.id,
        });

        res.status(201).json({ success: true, download });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateDownload = async (req, res) => {
    try {
        const download = await Download.findByPk(req.params.id);
        if (!download) return res.status(404).json({ success: false, message: "Download not found" });

        await download.update(req.body);
        res.status(200).json({ success: true, download });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteDownload = async (req, res) => {
    try {
        const download = await Download.findByPk(req.params.id);
        if (!download) return res.status(404).json({ success: false, message: "Download not found" });

        await download.destroy();
        res.status(200).json({ success: true, message: "Download deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
