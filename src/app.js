const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const path = require("path");

//* Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//* cookie parser
app.use(cookieParser());
app.use(cors());


//* 404 Error Handler

app.use((req, res) => {
    console.log("this path is not found:", req.path);
    res.status(404).json({message: "404! Path Not Found. Please check the path/method"})
})


module.exports = app;