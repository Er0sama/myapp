require("dotenv").config();
const connectDB = require("./db/connect");
const product_model = require("./model/product");
const products = require("./products.json");

const start = async () => {
    try {
        await connectDB(process.env.MONGODB_URL);
        await product_model.deleteMany();
        await product_model.create(products);
        console.log("success!");
    } catch (error) {
        console.log(error);
    }
};

start();
