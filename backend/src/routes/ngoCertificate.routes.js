const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const upload = require("../utils/multer");
const {
    getAllNGOCertificates,
    getNGOCertificateById,
    createNGOCertificate,
    updateNGOCertificate,
    deleteNGOCertificate,
    previewNGOCertificate,
} = require("../controllers/ngoCertificate.controller");

// Public
router.get("/", getAllNGOCertificates);
router.get("/:id", getNGOCertificateById);
router.get("/:id/preview", previewNGOCertificate);

// Super Admin only
router.post(
    "/",
    isAuthenticated,
    authorizeRoles(["super_admin"]),
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "pdf", maxCount: 1 },
        { name: "sealImage", maxCount: 1 },
        { name: "backgroundImage", maxCount: 1 },
    ]),
    createNGOCertificate
);
router.put(
    "/:id",
    isAuthenticated,
    authorizeRoles(["super_admin"]),
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "pdf", maxCount: 1 },
        { name: "sealImage", maxCount: 1 },
        { name: "backgroundImage", maxCount: 1 },
    ]),
    updateNGOCertificate
);
router.delete("/:id", isAuthenticated, authorizeRoles(["super_admin"]), deleteNGOCertificate);

module.exports = router;
