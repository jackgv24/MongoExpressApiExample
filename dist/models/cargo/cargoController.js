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
const cargoModel_1 = require("./cargoModel");
const cargoService_1 = require("./cargoService");
const colaborador_model_1 = require("../colaboradores/general/colaborador.model");
const msgHandler_1 = require("../../helpers/resultHandler/msgHandler");
const mongoose_1 = require("mongoose");
const transactions_1 = require("../../database/transactions");
const Task = transactions_1.default.Task();
exports.default = {
    /**
     * Metodo que permite obtener todos los registros de cargos activos de la base de datos
     *
     * @param {*} req
     * @param {*} res
     * @returns Array(permisosModel)
     */
    getObtener: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const _return = yield cargoModel_1.default
            .find({ Estado: true })
            .select({
            Permisos: false,
            FechaModificacion: false,
            Estado: false
        }).lean(true);
        return res.json(msgHandler_1.msgHandler.sendValue(_return));
    }),
    /**
     * Método que permite obtener todos los cargos registrados en la base de datos
     *
     * @param {*} req
     * @param {*} res
     * @returns Array(cargoModel)
     */
    getObtenerAll: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const _return = yield cargoModel_1.default
            .find()
            .select({
            Permisos: false,
            FechaModificacion: false
        })
            .lean(true);
        return res.json(_return);
    }),
    /**
     * Método que permite buscar un elemento por su ObjectId
     *
     * @module cargoModel
     * @name getBuscarById
     * @param {*} req
     * @param {*} res
     * @returns cargoModel
     */
    getBuscarById: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const id = req.params.idCargo;
        if (!cargoService_1.default.validarObjectId(id))
            return res.status(400).json(msgHandler_1.msgHandler.errorIdObject('idCargo'));
        const _return = yield cargoModel_1.default.find({ _id: id, Estado: true });
        return res.json(msgHandler_1.msgHandler.sendValue(_return));
    }),
    /**
     * Método que permite obtener los Permisos de un cargo determinado
     *
     * @param {*} req
     * @param {*} res
     * @returns Array(cargoModel.Permisos)
     */
    //FIXME: Refactorizar validar
    getPermisosById: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const idCargo = req.params.idCargo;
        if (!cargoService_1.default.validarObjectId(idCargo))
            return res.status(400).json(msgHandler_1.msgHandler.errorIdObject('idCargo'));
        const _return = yield cargoModel_1.default
            .findOne({
            _id: idCargo,
            Estado: true
        })
            .select({
            Permisos: true,
            Nombre: true,
        });
        const _resultado = _return["Permisos"].filter(element => {
            return element.Estado === true;
        });
        return res.json(msgHandler_1.msgHandler.sendValue(_resultado));
    }),
    /**
     * Agregar un nuevo cargo a la base de datos
     *
     * @param {*} req
     * @param {*} res
     * @returns cargoModel
     */
    postAgregar: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { error, value } = yield cargoService_1.default.validarAgregar(req.body);
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        let _result = yield cargoModel_1.default.create(value);
        return res.json(msgHandler_1.msgHandler.sendValue(_result));
    }),
    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     */
    //FIXME: Refactorizar validacion
    putModificar: (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (!cargoService_1.default.validarObjectId(req.params.idCargo))
            return res.status(400).json(msgHandler_1.msgHandler.errorIdObject('idPermiso'));
        const idCargo = new mongoose_1.Types.ObjectId(req.params.idCargo), body = req.body;
        const { error, value } = yield cargoService_1.default.validarModificar(body);
        if (error)
            res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        yield cargoModel_1.default
            .updateOne({
            _id: idCargo
        }, {
            $set: {
                Nombre: value["Nombre"],
                Area: value["Area"],
                Descripcion: value["Descripcion"],
                Parent: value["Parent"],
                Funciones: value["Funciones"]
            }
        }).then((data) => {
            return res.json(msgHandler_1.msgHandler.resultCrud(data, 'cargo', msgHandler_1.crudType.actualizar));
        }).catch((err) => {
            return res.status(400).json(msgHandler_1.msgHandler.sendError(err));
        });
    }),
    /**
     * Agregar un permiso al modelo de datos de Cargo
     *
     * @param {*} req
     * @param {*} res
     * @returns
     */
    putAgregarPermisos: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { error, value } = yield cargoService_1.default.validarPermisoSingle(req.params.idCargo, req.body);
        const idCargo = new mongoose_1.Types.ObjectId(req.params.idCargo), _permiso = value;
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        yield Task
            .update(cargoModel_1.default, {
            _id: idCargo
        }, {
            $push: { 'Permisos': _permiso }
        })
            .update(colaborador_model_1.default, {
            'Cargo.IdCargo': idCargo,
            'Cargo.Estado': true,
            'Permisos.IdPermiso': { $ne: _permiso.IdPermiso }
        }, {
            $push: {
                Permisos: {
                    IdPermiso: new mongoose_1.Types.ObjectId(_permiso.IdPermiso.toString()),
                    IsFrom: 'Cargo'
                }
            }
        }).run({ useMongoose: true }).then((data) => {
            return res.json(msgHandler_1.msgHandler.sendValue('El Permiso se ha agregado correctamente'));
        }).catch((err) => {
            return res.status(400).json(err.message);
        });
    }),
    /**
     * Método que permite eliminar un permiso en especifico de un cargo en especifico
     *
     * @param {*} req
     * @param {*} res
     */
    putEliminarPermiso: (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (!cargoService_1.default.validarObjectId(req.params.idCargo.toString()))
            return res.status(400).json(msgHandler_1.msgHandler.missingIdProperty('idCargo'));
        if (!cargoService_1.default.validarObjectId(req.params.idPermiso.toString()))
            return res.status(400).json(msgHandler_1.msgHandler.missingIdProperty('idPermiso'));
        const idCargo = new mongoose_1.Types.ObjectId(req.params.idCargo), idPermiso = new mongoose_1.Types.ObjectId(req.params.idPermiso);
        yield Task
            .update(cargoModel_1.default, { '_id': idCargo }, { $pull: { 'Permisos': { 'IdPermiso': idPermiso } } })
            .update(colaborador_model_1.default, {
            'Cargo.IdCargo': new mongoose_1.Types.ObjectId(idCargo.toString()),
            'Cargo.Estado': true,
            'Permisos.IdPermiso': idPermiso
        }, {
            $pull: {
                Permisos: {
                    IdPermiso: idPermiso,
                    IsFrom: 'Cargo'
                }
            }
        }, {
            safe: true
        })
            .run({ useMongoose: true })
            .then((data) => {
            return res.json(msgHandler_1.msgHandler.sendValue('El Permiso se ha eliminado correctamente'));
        }).catch((err) => {
            return res.status(401).json(err);
        });
    }),
    /**
     * Realiza la baja de un cargo en especifico
     *
     * @param {*} req
     * @param {*} res
     * @returns
     */
    deleteDarBaja: (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (!req.params.hasOwnProperty('idCargo'))
            return res.status(400).json(msgHandler_1.msgHandler.missingIdProperty('idCargo'));
        const idCargo = req.params.idCargo;
        if (!cargoService_1.default.validarObjectId(idCargo))
            return res.status(400).json(msgHandler_1.msgHandler.errorIdObject('idCargo'));
        //TODO: En vez de eliminar los permisos se pueden desactivar - Pero esto es otro aproach
        const cargoPermisos = [];
        Array.from(yield cargoModel_1.default
            .find({ _id: new mongoose_1.Types.ObjectId(idCargo) })
            .select({ Permisos: true, _id: false })
            .lean(true))
            .forEach(_data => {
            if (_data.hasOwnProperty('Permisos') && Array.isArray(_data["Permisos"]))
                if (Array.from(_data["Permisos"]).length != 0) {
                    cargoPermisos.push(..._data["Permisos"].map(t => { return t.IdPermiso; }));
                }
        });
        yield Task
            .update(cargoModel_1.default, { '_id': new mongoose_1.Types.ObjectId(idCargo.toString()) }, { $set: { Estado: false } })
            .update(colaborador_model_1.default, { 'Cargo.IdCargo': new mongoose_1.Types.ObjectId(idCargo.toString()) }, {
            $pull: {
                'Permisos': {
                    'IdPermiso': {
                        $in: cargoPermisos
                    },
                    'IsFrom': 'Cargo'
                }
            },
            $set: {
                'Cargo.$.Estado': false
            }
        })
            .run({ useMongoose: true })
            .then((data) => {
            return res.json(data);
        })
            .catch((err) => {
            return res.status(401).json(msgHandler_1.msgHandler.sendError(err));
        });
    }),
    /**
     * Da de alta a un cargo en especifico
     *
     * @param {Request} req
     * @param {Response} res
     * @returns
     */
    putDarAlta: (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (!req.params.hasOwnProperty('idCargo'))
            return res.status(400).json(msgHandler_1.msgHandler.missingIdProperty('idPermiso'));
        const idCargo = req.params.idCargo;
        if (!cargoService_1.default.validarObjectId(idCargo))
            return res.status(400).json(msgHandler_1.msgHandler.errorIdObject('idPermiso'));
        let permisos = [...new Set(yield cargoModel_1.default.aggregate([
                { $match: { '_id': new mongoose_1.Types.ObjectId(idCargo) } },
                { $unwind: '$Permisos' },
                { $replaceRoot: { 'newRoot': '$Permisos' } },
                {
                    $addFields: {
                        IdPermiso: { $toString: "$IdPermiso" }
                    }
                },
                { $project: { "IdPermiso": 1, "_id": 0 } }
            ]))].map(item => {
            return {
                IdPermiso: new mongoose_1.Types.ObjectId(item.IdPermiso.toString()),
                IsFrom: 'Cargo'
            };
        });
        yield Task
            .update(cargoModel_1.default, { '_id': new mongoose_1.Types.ObjectId(idCargo.toString()) }, { $set: { 'Estado': true } })
            .update(colaborador_model_1.default, {
            'Cargo.IdCargo': new mongoose_1.Types.ObjectId(idCargo),
            'Cargo.Estado': false
        }, {
            $push: {
                'Permisos': {
                    $each: permisos
                }
            },
            $set: {
                'Cargo.$.Estado': true
            }
        })
            .run({ useMongoose: true })
            .then((data) => {
            return res.json(data);
        }).catch((err) => {
            return res.status(400).json(err);
        });
    })
};
