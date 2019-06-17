"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const permisoModel_1 = require("./permisoModel");
const colaborador_model_1 = require("../colaboradores/general/colaborador.model");
const cargoModel_1 = require("../cargo/cargoModel");
const permisoServices_1 = require("./permisoServices");
const msgHandler_1 = require("../../helpers/resultHandler/msgHandler");
const transactions_1 = require("../../database/transactions");
const Task = transactions_1.default.Task();
exports.default = {
    // /**
    //  *  Método que devuelve todos los permisos activos
    //  *
    //  * @param {*} req
    //  * @param {*} res
    //  * @returns Array<permisoModel>
    //  */
    getBuscar: (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield permisoModel_1.default
            .find({ Estado: true }).select({
            Descripcion: true,
            Area: true,
            Tree: true,
            Path: true,
            IsTag: true,
            Titulo: true
        })
            .lean(true)
            .then((data) => { return res.json(msgHandler_1.msgHandler.sendValue(data)); })
            .catch((err) => { return res.status(400).json(msgHandler_1.msgHandler.sendError(err)); });
    }),
    /**
     * Devuelve todos los permisos
     *
     * @param {*} req
     * @param {*} res
     * @returns Array<permisoModel>
     */
    getBuscarAll: (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield permisoModel_1.default
            .find()
            .lean(true)
            .then((data) => { return res.json(msgHandler_1.msgHandler.sendValue(data)); })
            .catch((err) => { return res.status(400).json(msgHandler_1.msgHandler.sendError(err)); });
    }),
    /**
     * Metodo que permíte buscar un permiso por su Id
     *
     * @param {*} req
     * @param {*} res
     * @returns permisoModel
     */
    getBuscarById: (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield permisoModel_1.default
            .find({ _id: req.params.idPermiso, Estado: true })
            .select({
            Descripcion: true,
            Area: true,
            Tree: true,
            Path: true
        })
            .lean(true)
            .then((data) => { return res.json(msgHandler_1.msgHandler.sendValue(data)); })
            .catch((err) => { return res.status(400).json(msgHandler_1.msgHandler.sendError(err)); });
    }),
    /**
     * Método que agrega un permiso a la base de datos
     *
     * @param {*} req
     * @param {*} res
     * @returns permisoModel
     */
    postAgregar: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { error, value } = yield permisoServices_1.default.validarModelo(req.body);
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        yield permisoModel_1.default
            .create(value)
            .then((data) => { return res.json(msgHandler_1.msgHandler.sendValue(data)); })
            .catch((err) => { return res.status(400).sendError(err); });
    }),
    /**
     * Método que modifica un modelo de Permiso
     *
     * @param {*} req
     * @param {*} res
     * @returns permisoModel
     */
    putModificar: (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (!req.params.hasOwnProperty('idPermiso'))
            return res.status(400).json(msgHandler_1.msgHandler.sendError('La propiedad idPermiso no ha sido especificada'));
        const _idPermiso = req.params.idPermiso;
        if (!permisoServices_1.default.validarObjectId(_idPermiso))
            return res.status(400).json(msgHandler_1.msgHandler.sendError('El id ingresado no cumple con el formato requerido'));
        const { error, value } = yield permisoServices_1.default.validarModelo(req.body);
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendValue(error));
        yield permisoModel_1.default
            .updateOne({
            id: _idPermiso
        }, {
            $set: {
                Titulo: value.Titulo,
                Descripcion: value.Descripcion,
                Area: value.Area,
                Tree: value.Tree,
                Path: value.Path,
                FechaModificacion: Date.now()
            }
        })
            .then((data) => { return res.json(msgHandler_1.msgHandler.resultCrud(data, 'Permiso', msgHandler_1.crudType.actualizar)); })
            .catch((err) => { return res.status(400).json(msgHandler_1.msgHandler.sendError(err)); });
    }),
    /**
     *
     * Método que da de baja a un permiso
     *
     * @param {*} req
     * @param {*} res
     * @returns permisoModel
     */
    putDarBaja: (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (!req.params.hasOwnProperty('idPermiso'))
            return res.status(400).json(msgHandler_1.msgHandler.sendError('La propiedad idPermiso no ha sido especificada'));
        const _idPermiso = req.params.idPermiso;
        if (!permisoServices_1.default.validarObjectId(_idPermiso))
            return res.status(400).json(msgHandler_1.msgHandler.sendError('El id ingresado no cumple con el formato requerido'));
        const Permiso = yield permisoModel_1.default.findOne({ _id: _idPermiso });
        Permiso.set({
            Estado: false
        });
        yield permisoModel_1.default
            .updateOne({
            _id: _idPermiso
        }, {
            $set: {
                Estado: false
            }
        })
            .then((data) => { return res.json(msgHandler_1.msgHandler.resultCrud(data, 'Permiso', msgHandler_1.crudType.actualizar)); })
            .catch((err) => { return res.status(400).sendError(err); });
    }),
    /**
     * Método que da de alta a un permiso
     *
     * @param {*} req
     * @param {*} res
     * @returns permisoModel
     */
    putDarAlta: (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (!req.params.hasOwnProperty('idPermiso'))
            return res.status(400).json(msgHandler_1.msgHandler.sendError('La propiedad idPermiso no ha sido especificada'));
        const id = req.params.idPermiso;
        if (!permisoServices_1.default.validarObjectId(id))
            return res.status(400).json(msgHandler_1.msgHandler.sendError('El id ingresado no cumple con el formato requerido'));
        yield permisoModel_1.default
            .updateOne({ _id: id }, {
            $set: {
                Estado: true
            }
        })
            .then((data) => { return res.json(msgHandler_1.msgHandler.resultCrud(data, 'Permisos', msgHandler_1.crudType.actualizar)); })
            .catch((err) => { return res.status(400).json(msgHandler_1.msgHandler.sendError(err)); });
    }),
    /**
     * Procedimiento que permite dar de baja a un Permiso
     *
     * @param {*} req
     * @param {*} res
     * @returns
     */
    delPermiso: (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (!permisoServices_1.default.validarObjectId(req.params.idPermiso))
            return res.status(400).json(msgHandler_1.msgHandler.errorIdObject('IdPermiso'));
        const _idPermiso = new mongoose_1.Types.ObjectId(req.params.idPermiso);
        yield Task
            .remove(permisoModel_1.default, { _id: _idPermiso })
            .update(colaborador_model_1.default, { 'Permisos.IdPermiso': { $eq: _idPermiso } }, { $pull: { Permisos: { IdPermiso: _idPermiso } } })
            .update(cargoModel_1.default, { 'Permisos.IdPermiso': { $eq: _idPermiso } }, { $pull: { Permisos: { IdPermiso: _idPermiso } } })
            .run({ useMongoose: true })
            .then((data) => { return res.json(msgHandler_1.msgHandler.sendValue(data)); })
            .catch((err) => { return res.status(400).json(msgHandler_1.msgHandler.sendError(err)); });
    })
};
