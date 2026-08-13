const { Gallery } = require("../models");
const { uploadOnCloudinary } = require("../utils/cloudinary");

exports.createGalleryItem = async (req, res) => {
    try {
        const { title, description, type, videoUrl, category, status } = req.body;

        let image = { public_id: "", url: "" };
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) {
                image = { public_id: uploadResult.public_id, url: uploadResult.url };
            }
        }

        const galleryItem = await Gallery.create({
            title,
            description: description || "",
            type,
            image,
            videoUrl: videoUrl || "",
            category: category || "",
            status: status || "active",
            createdById: req.user.id,
        });

        res.status(201).json({ success: true, galleryItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllGalleryItems = async (req, res) => {
    try {
        const filter = { status: "active" };

        if (req.query.type && ["photo", "video"].includes(req.query.type)) {
            filter.type = req.query.type;
        }
        if (req.query.category) {
            filter.category = req.query.category;
        }

        const limit = parseInt(req.query.limit) || 100;

        const galleryItems = await Gallery.findAll({
            where: filter,
            order: [["createdAt", "DESC"]],
            limit,
        });

        res.status(200).json({ success: true, count: galleryItems.length, galleryItems });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getGalleryItemById = async (req, res) => {
    try {
        const galleryItem = await Gallery.findByPk(req.params.id);
        if (!galleryItem) return res.status(404).json({ success: false, message: "Gallery item not found" });
        res.status(200).json({ success: true, galleryItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateGalleryItem = async (req, res) => {
    try {
        const { title, description, category, status, videoUrl } = req.body;
        const galleryItem = await Gallery.findByPk(req.params.id);
        if (!galleryItem) return res.status(404).json({ success: false, message: "Gallery item not found" });

        if (title) galleryItem.title = title;
        if (description !== undefined) galleryItem.description = description;
        if (category !== undefined) galleryItem.category = category;
        if (status) galleryItem.status = status;
        if (videoUrl !== undefined) galleryItem.videoUrl = videoUrl;

        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) {
                galleryItem.image = { public_id: uploadResult.public_id, url: uploadResult.url };
            }
        }

        await galleryItem.save();
        res.status(200).json({ success: true, galleryItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteGalleryItem = async (req, res) => {
    try {
        const galleryItem = await Gallery.findByPk(req.params.id);
        if (!galleryItem) return res.status(404).json({ success: false, message: "Gallery item not found" });
        await galleryItem.destroy();
        res.status(200).json({ success: true, message: "Gallery item deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
