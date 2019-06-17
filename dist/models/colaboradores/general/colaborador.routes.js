"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const colaborador_controller_1 = require("./colaborador.controller");
const errorHandler_1 = require("../../../middleware/Error/errorHandler");
const colaboradorRouter = express.Router();
exports.colaboradorRouter = colaboradorRouter;
colaboradorRouter
    .get('/', errorHandler_1.default(colaborador_controller_1.default.getObtener))
    .post('/', errorHandler_1.default(colaborador_controller_1.default.postAgregar))
    .put('/:idColaborador/General', errorHandler_1.default(colaborador_controller_1.default.putModificarGeneral))
    .put('/:idColaborador/Cargo/:idCargo/Agregar', errorHandler_1.default(colaborador_controller_1.default.putAgregarCargo))
    .put('/:idColaborador/Cargo/:idCargo/Eliminar', errorHandler_1.default(colaborador_controller_1.default.putEliminarCargo))
    .put('/:idColaborador/Permiso/:idPermiso/Agregar', errorHandler_1.default(colaborador_controller_1.default.putAgregarPermiso))
    .put('/:idColaborador/Permiso/:idPermiso/Eliminar', errorHandler_1.default(colaborador_controller_1.default.putEliminarPermiso));
