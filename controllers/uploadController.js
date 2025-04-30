const upload = require('../middleware/upload');

exports.uploadImage = (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: "File too large. Max size is 500KB." });
            }
            return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        res.status(200).json({
            message: "Image uploaded successfully",
            imageUrl
        });
    });
};
