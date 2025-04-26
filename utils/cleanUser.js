
function cleanUser(userDoc) {
    const { password, __v, ...userWithoutSensitiveFields } = userDoc.toObject();
    return userWithoutSensitiveFields;
}

module.exports = cleanUser;
