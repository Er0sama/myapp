require("dotenv").config();
const connectDB = require("./db/connect");
const Order = require("./model/order");
const orders = require("./orders.json");

const start = async () => {
    try {
        await connectDB(process.env.MONGODB_URL);

        // Clear existing orders
        const deleted = await Order.deleteMany();
        console.log(`Deleted ${deleted.deletedCount} existing orders.`);

        // Insert new orders
        // const inserted = await Order.insertMany(orders);
        //console.log(`Successfully inserted ${inserted.length} new orders.`);

        process.exit(0); // Exit gracefully
    } catch (error) {
        console.error("Error seeding orders:", error);
        process.exit(1); // Exit with failure
    }
};

start();
