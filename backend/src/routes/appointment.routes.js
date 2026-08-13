const express = require("express");
const { createAppointmentLetter, getAllAppointmentLetters, getMyAppointmentLetters } = require("../controllers/appointment.controller");
const isAuthenticated = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

const router = express.Router();

router.get("/me", isAuthenticated, getMyAppointmentLetters);

// Admin / Manager / Coordinator routes
router.get("/", isAuthenticated, authorizeRoles(["super_admin", "admin", "manager", "coordinator"]), getAllAppointmentLetters);
router.post("/", isAuthenticated, authorizeRoles(["super_admin", "admin", "manager"]), createAppointmentLetter);

module.exports = router;
