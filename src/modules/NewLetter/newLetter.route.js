const express = require("express")
const newLetterRouter = express.Router()
const newLetterController = require("./newLetter.controller")
const authenticationToken = require("../../middleware/Auth");

newLetterRouter
    .route("/create")
    .post(newLetterController.create)

newLetterRouter
    .route("/getall")
    .get(authenticationToken, newLetterController.getAll)

newLetterRouter
    .route("/findOne")
    .get(authenticationToken, newLetterController.findOne)

newLetterRouter
    .route("/remove")
    .delete(authenticationToken, newLetterController.remove)

newLetterRouter
    .route("/update")
    .put(authenticationToken, newLetterController.update)

module.exports = newLetterRouter