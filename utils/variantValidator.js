const Category = require("../model/category");

// Maps category names to allowed variant options
const allowedVariantsMap = {
    clothing: ["S", "M", "L", "XL"],
    drinks: ["250ml", "500ml", "1L", "2L"],

};

const validateVariantsByCategory = async (categoryId, variants) => {
    if (!Array.isArray(variants) || variants.length === 0) return true; // allow empty variant list

    const category = await Category.findById(categoryId);
    if (!category || !category.name) {
        throw new Error("Invalid category");
    }

    const allowed = allowedVariantsMap[category.name.toLowerCase()];
    if (!allowed) return true;

    for (const v of variants) {
        if (!v.size || !allowed.includes(v.size)) {
            throw new Error(`Invalid variant '${v.size}' for category '${category.name}'. Allowed: ${allowed.join(", ")}`);
        }
    }

    return true;
};

module.exports = validateVariantsByCategory;
