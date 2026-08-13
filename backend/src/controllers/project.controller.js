const { Project } = require("../models");
const { uploadOnCloudinary } = require("../utils/cloudinary");

exports.createProject = async (req, res) => {
    try {
        const { title, description, goalAmount, raisedAmount, status, startDate, endDate, isFeatured } = req.body;
        let image = { public_id: "", url: "" };
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) {
                image = { public_id: uploadResult.public_id, url: uploadResult.url };
            }
        }

        const project = await Project.create({
            title,
            description,
            goalAmount: goalAmount || 0,
            raisedAmount: raisedAmount || 0,
            status: status || "active",
            startDate: startDate || null,
            endDate: endDate || null,
            isFeatured: isFeatured === "true" || isFeatured === true,
            image,
            createdById: req.user.id
        });

        res.status(201).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.findAll({
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({ success: true, count: projects.length, projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });
        res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProject = async (req, res) => {
    try {
        let project = await Project.findByPk(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        const updatedData = { ...req.body };
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) {
                updatedData.image = { public_id: uploadResult.public_id, url: uploadResult.url };
            }
        }

        await project.update(updatedData);
        res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });
        
        await project.destroy();
        res.status(200).json({ success: true, message: "Project deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
