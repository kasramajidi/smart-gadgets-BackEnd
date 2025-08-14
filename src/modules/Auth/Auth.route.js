const express = require("express");
const UserRouter = express.Router();
const AuthController = require("./Auth.controller");
const authenticationToken = require("../../middleware/Auth");

UserRouter
    .route("/userAll")
    .get(AuthController.getAll)

UserRouter
    .route("/signup")
    .post(AuthController.signup)

UserRouter
    .route("/login")
    .post(AuthController.login)

UserRouter
    .route("/guest")
    .post(AuthController.guest)

UserRouter
    .route("/logout")
    .post(AuthController.logout)

UserRouter
    .route("/user/remove")
    .delete(authenticationToken, AuthController.remove)

UserRouter
    .route("/user/update/:id")
    .put(authenticationToken, AuthController.update)

UserRouter
    .route("/user/findOne")
    .get(authenticationToken, AuthController.getOne)

module.exports = UserRouter
