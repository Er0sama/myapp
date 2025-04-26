require("dotenv").config();
const connectDB = require("./db/connect");
const order_model = require("./model/order");
const orders = require("./orders.json");

const start = async () => {
    try {
        await connectDB(process.env.MONGODB_URL);
        await order_model.deleteMany();
        await order_model.create(orders);
        console.log("success!");
    } catch (error) {
        console.log(error);
    }
};

start();
