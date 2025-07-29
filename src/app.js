const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const path = require("path");


const UserRouter = require("./modules/Auth/Auth.route");
const SwaggerRouter = require("./modules/api/swagger.route")
const newLetterRouter= require("./modules/NewLetter/newLetter.route")
const CommentRouter = require("./modules/Comment/comment.route")

//* Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//* cookie parser
app.use(cookieParser());
app.use(cors());

//* Routes
app.use("/auth", UserRouter)
app.use("/api", SwaggerRouter)
app.use("/newLetter", newLetterRouter)
app.use("/comment", CommentRouter)

//* 404 Error Handler

app.use((req, res) => {
    console.log("this path is not found:", req.path);
    res.status(404).json({message: "404! Path Not Found. Please check the path/method"})
})


module.exports = app;