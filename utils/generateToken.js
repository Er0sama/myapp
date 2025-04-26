const jwt = require('jsonwebtoken')

const generateToken = (userId, role) => {
    const isAdmin = role === "admin";

    return jwt.sign(
        { id: userId, isAdmin },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "5m" }
    );
};

module.exports = generateToken;
