const fs = require("fs");
const path = require("path");

const uploadsDir = path.join(__dirname, "..", "..", "public", "uploads");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const saveLocalFile = async (localTempFilePath) => {
    try {
        if (!localTempFilePath || !fs.existsSync(localTempFilePath)) {
            throw new Error("File not found at specified temp path");
        }

        const ext = path.extname(localTempFilePath) || "";
        const baseName = path.basename(localTempFilePath, ext);
        const fileName = `${baseName}-${Date.now()}${ext}`;
        const targetPath = path.join(uploadsDir, fileName);

        fs.copyFileSync(localTempFilePath, targetPath);

        try {
            fs.unlinkSync(localTempFilePath);
        } catch (e) {
            // Ignore temp cleanup errors
        }

        const relativeUrl = `/public/uploads/${fileName}`;

        return {
            public_id: fileName,
            url: relativeUrl,
        };
    } catch (error) {
        console.error("Error saving local file:", error.message);
        if (localTempFilePath && fs.existsSync(localTempFilePath)) {
            try {
                fs.unlinkSync(localTempFilePath);
            } catch (e) {}
        }
        return null;
    }
};

const deleteLocalFile = async (public_id) => {
    try {
        if (!public_id) return false;
        const targetPath = path.join(uploadsDir, public_id);
        if (fs.existsSync(targetPath)) {
            fs.unlinkSync(targetPath);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error deleting local file:", error.message);
        return false;
    }
};

module.exports = {
    saveLocalFile,
    deleteLocalFile,
    uploadOnCloudinary: saveLocalFile,
    deleteFromCloudinary: deleteLocalFile,
};
