const express = require("express");
const { 
    applyVolunteer, 
    loginVolunteer,
    getMe,
    updateMe,
    getAllVolunteers, 
    getVolunteerById, 
    updateVolunteerStatus, 
    createVolunteer 
} = require("../controllers/volunteer.controller");
const isAuthenticated = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const upload = require("../utils/multer");

const router = express.Router();

// Public routes
router.post("/apply", upload.single("profileImage"), applyVolunteer);
router.post("/login", loginVolunteer);

// Volunteer Protected routes
router.get("/me", isAuthenticated, authorizeRoles(["volunteer"]), getMe);
router.put("/me", isAuthenticated, authorizeRoles(["volunteer"]), upload.single("profileImage"), updateMe);

// Admin / Manager / Coordinator routes
router.get("/", isAuthenticated, authorizeRoles(["super_admin", "admin", "manager", "coordinator"]), getAllVolunteers);
router.get("/:id", isAuthenticated, authorizeRoles(["super_admin", "admin", "manager", "coordinator"]), getVolunteerById);
router.put("/:id/status", isAuthenticated, authorizeRoles(["super_admin", "admin", "manager"]), updateVolunteerStatus);
router.post("/", isAuthenticated, authorizeRoles(["super_admin", "admin", "manager"]), upload.single("profileImage"), createVolunteer);

module.exports = router;
