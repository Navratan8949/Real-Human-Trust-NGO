const express = require("express");
const { getDashboardStats, fixLiveDb } = require("../controllers/dashboard.controller");
const isAuthenticated = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

const router = express.Router();

router.get("/fix-live-db", fixLiveDb);

// Admin / Manager / Coordinator route's
router.get("/stats", isAuthenticated, authorizeRoles(["super_admin", "admin", "manager", "coordinator"]), getDashboardStats);

module.exports = router;
