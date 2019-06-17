"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const express = require("express");
const config = require("config");
const path = require("path");
const morgan = require("morgan");
const Winston = require("winston");
const helmet = require("helmet");
const logger = Winston.createLogger({
    transports: [
        new Winston.transports.File({ filename: path.join(__dirname, "../log/errors.log") })
    ]
});
//inicializacion de data
dotenv.config();
//inicializacion de web api
const main_1 = require("./routes/main");
const config_1 = require("./database/config");
const msgHandler_1 = require("./helpers/resultHandler/msgHandler");
const app = express();
//inicialización de la base de datos
config_1.database.connect();
//Asignación de variables
const PORT = config.PORT;
//Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));
//Cors
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
//Routing
app.use('/api', main_1.mainRoute);
app.use("*", (req, res) => {
    return res.status(404).send(msgHandler_1.msgHandler.sendError('La ruta indicada no se encuentra estipulada'));
});
//Errors
app.use((error, req, res, next) => {
    logger.log('error', error);
    if (error && error.hasOwnProperty('errmsg'))
        return res.status(400).json(msgHandler_1.msgHandler.sendError(error.errmsg));
    if (error)
        return res.status(500).json(msgHandler_1.msgHandler.sendError(error));
});
//inicio del servidor en un puerto
app.listen(PORT, () => {
    if (app.get('env') == 'development') {
        console.clear();
        console.log(`Aplicación corriendo en el puerto ${PORT}`);
    }
});
