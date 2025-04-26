//require("dotenv").config()
const mongoose = require("mongoose");

const connectDB = (uri) => {
    try {
        return mongoose.connect(uri, {
            useUnifiedTopology: true,
        });
    }
    catch (err) {
        console.error("MongoDB connection error!", err.msg);
        process.exit(-1);
    }
};

module.exports = connectDB;
