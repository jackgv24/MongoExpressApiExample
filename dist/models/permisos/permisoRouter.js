"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const permisoController_1 = require("./permisoController");
const errorHandler_1 = require("../../middleware/Error/errorHandler");
exports.permisosRouter = express.Router();
exports.permisosRouter
    .get('', errorHandler_1.default(permisoController_1.default.getBuscar))
    .get('/:idPermiso', errorHandler_1.default(permisoController_1.default.getBuscarById))
    .post('/', errorHandler_1.default(permisoController_1.default.postAgregar))
    .put('/:idPermiso', errorHandler_1.default(permisoController_1.default.putModificar))
    .delete('/:idPermiso', errorHandler_1.default(permisoController_1.default.delPermiso));
