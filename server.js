const app = require("./src/app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const axios = require("axios");

//* Load env variables

const ProductionMode = process.env.NODE_ENV === "production";
if (!ProductionMode) {
    dotenv.config();
}


//* Database Connection

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`onnected to MongoDB ; ${mongoose.connection.host}`);
    } catch (error) {
        console.log(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
}

//* Start the server
function startServer() {
    const PORT = process.env.PORT || 5500;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${ProductionMode ? "production" : "development"} mode on port ${PORT}`);
    });
}

//* Start the application

async function run() {
    try {
        await connectDB();
        startServer();
    } catch (error) {
        console.log(`Error starting the server: ${error.message}`);
        process.exit(1);
    }
}

run();