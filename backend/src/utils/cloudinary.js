const { saveLocalFile, deleteLocalFile } = require("./fileUpload");

module.exports = {
    uploadOnCloudinary: saveLocalFile,
    deleteFromCloudinary: deleteLocalFile,
};