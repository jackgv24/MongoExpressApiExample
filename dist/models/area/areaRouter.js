"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const areaController_1 = require("./areaController");
const errorHandler_1 = require("../../middleware/Error/errorHandler");
exports.areaRouter = express.Router();
exports.areaRouter
    .get('', errorHandler_1.default(areaController_1.default.getObtener))
    .get('/:IdArea', errorHandler_1.default(areaController_1.default.getBuscarById))
    .post('/', errorHandler_1.default(areaController_1.default.postAgregar))
    .put('/:IdArea', errorHandler_1.default(areaController_1.default.putModificar))
    .put('/:IdArea/DarBaja', errorHandler_1.default(areaController_1.default.putDarBaja))
    .put('/:IdArea/DarAlta', errorHandler_1.default(areaController_1.default.putDarAlta));
