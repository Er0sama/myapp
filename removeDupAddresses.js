const mongoose = require("mongoose");
const Address = require("./models/address"); // adjust path if needed

async function removeDuplicateAddresses() {
    await mongoose.connect("mongodb://localhost:27017/your-db-name");

    const allAddresses = await Address.find({}).lean();

    const seen = new Set();
    const duplicates = [];

    for (const addr of allAddresses) {
        // Create a unique key excluding _id and timestamps
        const key = JSON.stringify({
            user: addr.user?.toString() || null,
            fullName: addr.fullName,
            email: addr.email,
            phone: addr.phone,
            street: addr.street,
            city: addr.city,
            state: addr.state || null,
            province: addr.province || null,
            postalCode: addr.postalCode,
            country: addr.country,
        });

        if (seen.has(key)) {
            duplicates.push(addr._id);
        } else {
            seen.add(key);
        }
    }

    if (duplicates.length > 0) {
        const result = await Address.deleteMany({ _id: { $in: duplicates } });
        console.log(`Deleted ${result.deletedCount} duplicate addresses.`);
    } else {
        console.log("No duplicates found.");
    }

    await mongoose.disconnect();
}

removeDuplicateAddresses().catch(console.error);
