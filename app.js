require("dotenv").config();
const express = require('express');
const cors = require('cors');
const app = express();


const errorHandler = require('./middleware/errorHandler');
const connectDB = require("./db/connect");
const product_routes = require("./routes/product");
const user_routes = require("./routes/user");
const order_routes = require("./routes/order");
const category_routes = require("./routes/category");
const axios_testing = require("./routes/axiosTesting");
const path = require('path');

app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Welcome to the Rest API');
});

app.use("/api/axiosTesting", axios_testing);
app.use("/api/products", product_routes);
app.use("/api/users", user_routes);
app.use("/api/orders", order_routes);
app.use("/api/categories", category_routes);

app.use(errorHandler);

const start = async () => {
    try {
        await connectDB(process.env.MONGODB_URL);
        app.listen(process.env.PORT, () => {
            console.log(`Example app listening on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
};

start();











