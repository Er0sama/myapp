function validateStringField(value, fieldName, options = {}) {
    const { min = 1, max = 100 } = options;

    if ((value === undefined || value === null)) {
        return `${fieldName} is required`;
    }

    if (typeof value !== "string") {
        return `${fieldName} must be a string`;
    }

    const trimmed = value.trim();

    if (trimmed.length < min) {
        return `${fieldName} must be at least ${min} characters`;
    }

    if (trimmed.length > max) {
        return `${fieldName} must be at most ${max} characters`;
    }

    return null; // no error
}

module.exports = validateStringField;
