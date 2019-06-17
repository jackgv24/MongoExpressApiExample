"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cargoController_1 = require("./cargoController");
const errorHandler_1 = require("../../middleware/Error/errorHandler");
exports.cargoRouter = express.Router();
exports.cargoRouter
    .get('/', errorHandler_1.default(cargoController_1.default.getObtener))
    .get('/:idCargo', errorHandler_1.default(cargoController_1.default.getBuscarById))
    .get('/:idCargo/Permisos', errorHandler_1.default(cargoController_1.default.getPermisosById))
    .post('/', errorHandler_1.default(cargoController_1.default.postAgregar))
    .put('/:idCargo', errorHandler_1.default(cargoController_1.default.putModificar))
    .put('/:idCargo/Permiso/Agregar', errorHandler_1.default(cargoController_1.default.putAgregarPermisos))
    .put('/:idCargo/Permiso/:idPermiso/Eliminar', errorHandler_1.default(cargoController_1.default.putEliminarPermiso))
    .put('/:idCargo/Alta', errorHandler_1.default(cargoController_1.default.putDarAlta))
    .delete('/:idCargo/Baja', errorHandler_1.default(cargoController_1.default.deleteDarBaja));
