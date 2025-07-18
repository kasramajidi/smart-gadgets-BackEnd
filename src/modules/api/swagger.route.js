const express = require("express")
const swaggerUi = require("swagger-ui-express")
const swaggerDocument = require("./swagger.json")
const SwaggerRouter = express.Router()

const swaggerOptions = {
    customCss: ".swagger-ui .topbar {display: none};"
}

SwaggerRouter.use("/", swaggerUi.serve)
SwaggerRouter.get("/", swaggerUi.setup(swaggerDocument, swaggerOptions))

module.exports = SwaggerRouter