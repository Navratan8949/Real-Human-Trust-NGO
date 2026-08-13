const { Testimonial } = require("../models");
const { uploadOnCloudinary } = require("../utils/cloudinary");

exports.createTestimonial = async (req, res) => {
    try {
        const { name, designation, message, rating, status } = req.body;

        let image = { public_id: "", url: "" };
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) {
                image = { public_id: uploadResult.public_id, url: uploadResult.url };
            }
        }

        const testimonial = await Testimonial.create({
            name,
            designation: designation || "",
            message,
            rating: rating || 5,
            status: status || "active",
            image
        });

        res.status(201).json({ success: true, message: "Testimonial added successfully", testimonial });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllTestimonials = async (req, res) => {
    try {
        const query = req.query.public ? { where: { status: "active" } } : {};
        const testimonials = await Testimonial.findAll({
            ...query,
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({ success: true, count: testimonials.length, testimonials });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTestimonial = async (req, res) => {
    try {
        let testimonial = await Testimonial.findByPk(req.params.id);
        if (!testimonial) return res.status(404).json({ success: false, message: "Testimonial not found" });

        const updatedData = { ...req.body };
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) {
                updatedData.image = { public_id: uploadResult.public_id, url: uploadResult.url };
            }
        }

        await testimonial.update(updatedData);
        res.status(200).json({ success: true, message: "Testimonial updated", testimonial });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findByPk(req.params.id);
        if (!testimonial) return res.status(404).json({ success: false, message: "Testimonial not found" });

        await testimonial.destroy();
        res.status(200).json({ success: true, message: "Testimonial deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
