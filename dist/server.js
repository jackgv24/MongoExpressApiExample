"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//inicialización de todas las variables
const express = require("express");
const config = require("config");
const config_1 = require("./database/config");
const chalk_1 = require("chalk");
const app = express();
const PORT = config['PORT'];
//Inicialización de Bases de Datos
config_1.default.connect();
app.listen(PORT, () => {
    console.clear();
    console.log(`Aplicacion escuchando en el puerto ${chalk_1.default.bgGreen(chalk_1.default.black(PORT))}`);
});
