const { NGOCertificate } = require("../models");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const { populateTemplate } = require("../utils/certificateTemplate");

// Get all NGO certificates
exports.getAllNGOCertificates = async (req, res) => {
    try {
        const certificates = await NGOCertificate.findAll({
            where: { isActive: true },
            order: [["issueDate", "DESC"]],
        });

        const populated = certificates.map(cert => ({
            ...cert.toJSON(),
            populatedTemplate: populateTemplate(cert.template, cert),
        }));

        res.status(200).json({ success: true, count: populated.length, certificates: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single NGO certificate
exports.getNGOCertificateById = async (req, res) => {
    try {
        const certificate = await NGOCertificate.findByPk(req.params.id);
        if (!certificate) return res.status(404).json({ success: false, message: "Certificate not found" });

        const populated = {
            ...certificate.toJSON(),
            populatedTemplate: populateTemplate(certificate.template, certificate),
        };

        res.status(200).json({ success: true, certificate: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Preview populated certificate HTML
exports.previewNGOCertificate = async (req, res) => {
    try {
        const certificate = await NGOCertificate.findByPk(req.params.id);
        if (!certificate) return res.status(404).json({ success: false, message: "Certificate not found" });

        const populatedHtml = populateTemplate(certificate.template, certificate);

        res.status(200).setHeader("Content-Type", "text/html");
        res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${certificate.title} - Preview</title>
              <style>
                body { margin: 0; padding: 20px; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                .certificate-container { background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; max-width: 900px; width: 100%; }
                .certificate-body { padding: 0; }
                @media print {
                  body { background: white; padding: 0; }
                  .certificate-container { box-shadow: none; border-radius: 0; max-width: 100%; }
                }
              </style>
            </head>
            <body>
              <div class="certificate-container">
                <div class="certificate-body">${populatedHtml}</div>
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() { window.print(); }, 500);
                };
              </script>
            </body>
          </html>
        `);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create NGO certificate (Super Admin)
exports.createNGOCertificate = async (req, res) => {
    try {
        const { title, description, certificateNo, issuedBy, issueDate, template } = req.body;

        if (!title || !certificateNo || !issuedBy) {
            return res.status(400).json({ success: false, message: "Title, certificate number, and issued by are required" });
        }

        let image = { public_id: "", url: "" };
        let pdf = { public_id: "", url: "" };
        let sealImage = { public_id: "", url: "" };
        let backgroundImage = { public_id: "", url: "" };

        if (req.files?.image) {
            const uploadResult = await uploadOnCloudinary(req.files.image[0].path);
            if (uploadResult) image = { public_id: uploadResult.public_id, url: uploadResult.url };
        }

        if (req.files?.pdf) {
            const uploadResult = await uploadOnCloudinary(req.files.pdf[0].path);
            if (uploadResult) pdf = { public_id: uploadResult.public_id, url: uploadResult.url };
        }

        if (req.files?.sealImage) {
            const uploadResult = await uploadOnCloudinary(req.files.sealImage[0].path);
            if (uploadResult) sealImage = { public_id: uploadResult.public_id, url: uploadResult.url };
        }

        if (req.files?.backgroundImage) {
            const uploadResult = await uploadOnCloudinary(req.files.backgroundImage[0].path);
            if (uploadResult) backgroundImage = { public_id: uploadResult.public_id, url: uploadResult.url };
        }

        const certificate = await NGOCertificate.create({
            title,
            description: description || "",
            certificateNo,
            issuedBy,
            issueDate: issueDate || null,
            template: template || "",
            image,
            pdf,
            sealImage,
            backgroundImage,
        });

        res.status(201).json({ success: true, certificate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update NGO certificate (Super Admin)
exports.updateNGOCertificate = async (req, res) => {
    try {
        const certificate = await NGOCertificate.findByPk(req.params.id);
        if (!certificate) return res.status(404).json({ success: false, message: "Certificate not found" });

        const { title, description, certificateNo, issuedBy, issueDate, template, isActive } = req.body;

        if (title) certificate.title = title;
        if (description !== undefined) certificate.description = description;
        if (certificateNo) certificate.certificateNo = certificateNo;
        if (issuedBy) certificate.issuedBy = issuedBy;
        if (issueDate !== undefined) certificate.issueDate = issueDate;
        if (template !== undefined) certificate.template = template;
        if (isActive !== undefined) certificate.isActive = isActive;

        if (req.files?.image) {
            const uploadResult = await uploadOnCloudinary(req.files.image[0].path);
            if (uploadResult) certificate.image = { public_id: uploadResult.public_id, url: uploadResult.url };
        }

        if (req.files?.pdf) {
            const uploadResult = await uploadOnCloudinary(req.files.pdf[0].path);
            if (uploadResult) certificate.pdf = { public_id: uploadResult.public_id, url: uploadResult.url };
        }

        if (req.files?.sealImage) {
            const uploadResult = await uploadOnCloudinary(req.files.sealImage[0].path);
            if (uploadResult) certificate.sealImage = { public_id: uploadResult.public_id, url: uploadResult.url };
        }

        if (req.files?.backgroundImage) {
            const uploadResult = await uploadOnCloudinary(req.files.backgroundImage[0].path);
            if (uploadResult) certificate.backgroundImage = { public_id: uploadResult.public_id, url: uploadResult.url };
        }

        await certificate.save();

        res.status(200).json({ success: true, certificate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete NGO certificate (Super Admin)
exports.deleteNGOCertificate = async (req, res) => {
    try {
        const certificate = await NGOCertificate.findByPk(req.params.id);
        if (!certificate) return res.status(404).json({ success: false, message: "Certificate not found" });

        await certificate.destroy();
        res.status(200).json({ success: true, message: "Certificate deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
