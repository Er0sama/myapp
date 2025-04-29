const Address = require("../model/address");
const validateStringField = require("./validateStringField");
const mongoose = require("mongoose");

const saveAddress = async (data, userId = null) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid ID " });
    }

    const {
        fullName,
        email,
        phone,
        street,
        city,
        state,
        province,
        postalCode,
        country
    } = data;

    const fullNameError = validateStringField(fullName, "Full Name", { min: 3, max: 50 });
    if (fullNameError) throw new Error(fullNameError);

    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
        throw new Error("A valid email is required");
    }

    if (!phone || typeof phone !== "string" || !/^\d{10,15}$/.test(phone.trim())) {
        throw new Error("Phone number must be a string of 10–15 digits");
    }

    const streetError = validateStringField(street, "Street", { min: 5, max: 100 });
    if (streetError) throw new Error(streetError);

    const cityError = validateStringField(city, "City", { min: 2, max: 50 });
    if (cityError) throw new Error(cityError);

    if (!postalCode || typeof postalCode !== "string" || !/^\d{4,10}$/.test(postalCode.trim())) {
        throw new Error("Postal code must be a string of 4–10 digits");
    }

    const countryError = validateStringField(country, "Country", { min: 2, max: 50 });
    if (countryError) throw new Error(countryError);

    const existingAddress = await Address.findOne({
        user: userId,
        fullName,
        email,
        phone,
        street,
        city,
        state,
        province,
        postalCode,
        country,
    });

    if (existingAddress) {
        console.log("Address already exists, skipping.");
        return existingAddress;
    }
    // Create and save address
    const address = new Address({
        fullName,
        email,
        phone,
        street,
        city,
        state,
        province,
        postalCode,
        country,
        user: userId,
    });

    return await address.save();
};

const validateAddress = (data) => {
    const {
        fullName,
        email,
        phone,
        street,
        city,
        province,
        state,
        postalCode,
        country
    } = data;

    const fullNameError = validateStringField(fullName, "Full Name", { min: 3, max: 50 });
    if (fullNameError) return fullNameError;

    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
        return "A valid email is required";
    }

    if (!phone || typeof phone !== "string" || !/^\d{10,15}$/.test(phone.trim())) {
        return "Phone number must be a string of 10–15 digits";
    }

    const streetError = validateStringField(street, "Street", { min: 5, max: 100 });
    if (streetError) return streetError;

    const cityError = validateStringField(city, "City", { min: 2, max: 50 });
    if (cityError) return cityError;

    if (!postalCode || typeof postalCode !== "string" || !/^\d{4,10}$/.test(postalCode.trim())) {
        return "Postal code must be a string of 4–10 digits";
    }

    const countryError = validateStringField(country, "Country", { min: 2, max: 50 });
    if (countryError) return countryError;

    return null;  // No errors, the address is valid
};


module.exports = { saveAddress, validateAddress };
