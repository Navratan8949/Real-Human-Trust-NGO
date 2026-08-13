const { Award } = require("../models");
const { uploadOnCloudinary } = require("../utils/cloudinary");

exports.getAllAwards = async (req, res) => {
    try {
        const awards = await Award.findAll({
            where: { status: "active" },
            order: [["year", "DESC"]],
        });
        res.status(200).json({ success: true, count: awards.length, awards });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createAward = async (req, res) => {
    try {
        const { title, description, awardedBy, year } = req.body;

        let image = { public_id: "", url: "" };
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) image = { public_id: uploadResult.public_id, url: uploadResult.url };
        }

        const award = await Award.create({
            title,
            description: description || "",
            awardedBy: awardedBy || "",
            year,
            image,
            createdById: req.user.id,
        });

        res.status(201).json({ success: true, award });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAward = async (req, res) => {
    try {
        const award = await Award.findByPk(req.params.id);
        if (!award) return res.status(404).json({ success: false, message: "Award not found" });

        await award.update(req.body);
        res.status(200).json({ success: true, award });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteAward = async (req, res) => {
    try {
        const award = await Award.findByPk(req.params.id);
        if (!award) return res.status(404).json({ success: false, message: "Award not found" });

        await award.destroy();
        res.status(200).json({ success: true, message: "Award deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
