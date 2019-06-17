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
const colaborador_services_1 = require("./colaborador.services");
const colaborador_model_1 = require("./colaborador.model");
const cargoModel_1 = require("../../cargo/cargoModel");
const msgHandler_1 = require("../../../helpers/resultHandler/msgHandler");
exports.default = {
    /**
     * Método que nos permite obtener todos los Colaboradores activos
     * de la base de datos
     *
     * @param {*} req
     * @param {*} res
     * @returns {}
     */
    getObtener: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const _result = yield colaborador_model_1.default.find({ Estado: true }).lean(true);
        return res.json(msgHandler_1.msgHandler.sendValue(_result));
    }),
    /**
     * Método que nos permite obtener todos los Colaboradores
     * de la base de datos
     *
     * @param {*} req
     * @param {*} res
     * @returns
     */
    getObtenerAll: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const _result = yield colaborador_model_1.default.find().lean(true);
        return res.json(msgHandler_1.msgHandler.sendValue(_result));
    }),
    /**
     * Agrega un modelo de Colaborador a la base de datos
     *
     * @param {} req
     * @param {*} res
     * @returns
     * @type colaboradorModel
     */
    postAgregar: (req, res) => __awaiter(this, void 0, void 0, function* () {
        //FIXME: Hace falta validar los cargos que se estan ingresando
        const _data = req.body;
        const { error, value } = yield colaborador_services_1.default.valdarAgregarColaborador(_data);
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        let Cargos = colaborador_services_1.default.cargosUnicos(value.Cargo).map(_idCargo => { return new mongoose_1.Types.ObjectId(_idCargo); });
        value.Cargo = Cargos.map(_iC => {
            return { IdCargo: _iC, Estado: true };
        });
        let permisos = [...new Set(yield cargoModel_1.default.aggregate([
                { $match: { '_id': { $in: Cargos } }
                },
                { $unwind: '$Permisos' },
                { $replaceRoot: { 'newRoot': '$Permisos' } },
                {
                    $addFields: {
                        IdPermiso: { $toString: "$IdPermiso" }
                    }
                },
                {
                    $group: {
                        _id: '$IdPermiso',
                        IdPermiso: { $first: '$IdPermiso' }
                    }
                }
            ]))].map(item => {
            return {
                IdPermiso: new mongoose_1.Types.ObjectId(item.IdPermiso.toString()),
                IsFrom: 'Cargo'
            };
        });
        if (Array.from(permisos).length != 0) {
            value.Permisos = permisos;
        }
        yield colaborador_model_1.default
            .create(value)
            .then((data) => { return res.json(msgHandler_1.msgHandler.sendValue(data)); })
            .catch((err) => { return res.status(400).json(msgHandler_1.msgHandler.sendError(err)); });
    }),
    /**
     * Permite Modificar los datos generales del colaborador
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @type colaboradorModel
    **/
    putModificarGeneral: (req, res) => __awaiter(this, void 0, void 0, function* () {
        let { error, value } = colaborador_services_1.default.valModGeneral(req.params.idColaborador, req.body);
        if (error)
            return res.status(400).json(error);
        const idColaborador = new mongoose_1.Types.ObjectId(req.params.idColaborador);
        const _log = yield colaborador_model_1.default.findById(idColaborador);
        yield colaborador_model_1.default
            .updateOne({ _id: idColaborador }, { $set: {
                General: value,
                FechaModificación: Date.now()
            },
            $push: {
                Log: {
                    FechaModificación: Date.now(),
                    Propiedad: 'General',
                    Data: _log ? _log["General"] : null
                }
            }
        }, {
            new: true
        }).then((data) => { return res.json(msgHandler_1.msgHandler.resultCrud(data, 'colaborador', msgHandler_1.crudType.actualizar)); })
            .catch((err) => { return res.status(400).json(msgHandler_1.msgHandler.sendError(err)); });
    }),
    /**
     * Este método agregar un Cargo a un empleado incluyendo todos los permisos que contiene el cargo
     *
     * @param {*} req
     * @param {*} res
     * @returns {error,value}
     */
    putAgregarCargo: (req, res) => __awaiter(this, void 0, void 0, function* () {
        let { error, value } = colaborador_services_1.default.valAgregarCargo(req.params.idColaborador, req.params.idCargo);
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        const idColaborador = new mongoose_1.Types.ObjectId(req.params.idColaborador.toString()), _idCargo = new mongoose_1.Types.ObjectId(req.params.idCargo.toString()), Colaborador = yield colaborador_model_1.default.findById(idColaborador).lean(true), _permisosCol = Colaborador.hasOwnProperty('Permisos') ? Colaborador.Permisos.map(item => item.IdPermiso.toString()) : [], _permisos = yield cargoModel_1.default.aggregate([
            { $match: { _id: new mongoose_1.Types.ObjectId(_idCargo.toString()) } },
            { $unwind: '$Permisos' },
            { $replaceRoot: { 'newRoot': '$Permisos' } },
            {
                $addFields: {
                    IdPermiso: { $toString: "$IdPermiso" }
                }
            },
            { $match: { 'IdPermiso': { $nin: _permisosCol } } },
            {
                $group: {
                    _id: '$IdPermiso',
                    IdPermiso: { $first: '$IdPermiso' }
                }
            },
            {
                $match: { 'IdPermiso': { $ne: _permisosCol } }
            },
            {
                $project: {
                    "IdPermiso": 1,
                    "_id": 0
                }
            },
            {
                $addFields: {
                    IsFrom: 'Cargo'
                }
            }
        ]);
        colaborador_model_1.default
            .updateOne({
            _id: idColaborador,
            'Cargo.IdCargo': { $nin: [_idCargo] }
        }, {
            $push: {
                Cargo: {
                    IdCargo: _idCargo,
                    Estado: true
                },
                Permisos: {
                    $each: _permisos
                },
                Log: {
                    Propiedad: 'Cargo',
                    Data: Colaborador.Cargo
                }
            }
        })
            .then((data) => {
            return res.json(msgHandler_1.msgHandler.resultCrud(data, 'colaborador', msgHandler_1.crudType.actualizar));
        }).catch((err) => {
            return res.status(400).json(err);
        });
    }),
    /**
     * Este método se encarga de eliminar un cargo de un colaborador
     * Ademas este método agrega todo los permisos
     *
     * @param {*} req
     * @param {*} res
     * @returns {error,value}
     */
    putEliminarCargo: (req, res) => __awaiter(this, void 0, void 0, function* () {
        let { error, value } = colaborador_services_1.default.valAgregarCargo(req.params.idColaborador, req.params.idCargo);
        if (error)
            return msgHandler_1.msgHandler.sendError(error);
        let _IdColaborador = new mongoose_1.Types.ObjectId(req.params.idColaborador.toString()), _IdCargo = new mongoose_1.Types.ObjectId(req.params.idCargo.toString());
        const Colaborador = yield colaborador_model_1.default.findById(_IdColaborador).lean(true), _permisos = (yield cargoModel_1.default.aggregate([
            { $match: { _id: new mongoose_1.Types.ObjectId(_IdCargo.toString()) } },
            { $unwind: '$Permisos' },
            { $replaceRoot: { 'newRoot': '$Permisos' } },
            {
                $addFields: {
                    IdPermiso: { $toString: "$IdPermiso" }
                }
            },
            {
                $group: {
                    _id: '$IdPermiso',
                    IdPermiso: { $first: '$IdPermiso' }
                }
            },
            {
                $project: {
                    "IdPermiso": 1,
                    "_id": 0
                }
            }
        ])).map(_permiso => { return _permiso.IdPermiso; });
        colaborador_model_1.default.updateOne({
            _id: _IdColaborador,
            'Cargo.IdCargo': { $eq: _IdCargo }
        }, {
            $pull: {
                Cargo: {
                    IdCargo: _IdCargo
                },
                Permisos: {
                    IdPermiso: { $in: _permisos },
                    IsFrom: 'Cargo'
                }
            },
            $push: {
                Log: {
                    Propiedad: 'Cargo',
                    Data: Colaborador.Cargo
                }
            }
        }).then((data) => {
            return res.json(msgHandler_1.msgHandler.resultCrud(data, 'colaborador', msgHandler_1.crudType.actualizar));
        }).catch((err) => {
            return res.status(400).json(err);
        });
    }),
    /**
     * Este método permite agregar un permiso a un colaborador en especifico
     *
     * @param {*} req
     * @param {*} res
     * @returns {error,value}
     */
    putAgregarPermiso: (req, res) => __awaiter(this, void 0, void 0, function* () {
        let { error, value } = colaborador_services_1.default.valAgregarCargo(req.params.idColaborador, req.params.idPermiso);
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        let _idColaborador = new mongoose_1.Types.ObjectId(req.params.idColaborador.toString()), _idPermiso = new mongoose_1.Types.ObjectId(req.params.idPermiso.toString());
        const Colaborador = yield colaborador_model_1.default.findById(_idColaborador).lean(true);
        yield colaborador_model_1.default
            .updateOne({
            _id: _idColaborador,
            'Permisos.IdPermiso': { $ne: _idPermiso }
        }, {
            $push: {
                Permisos: {
                    IdPermiso: _idPermiso,
                    IsFrom: 'Manual'
                },
                Log: {
                    Propiedad: 'Permisos',
                    Data: Colaborador ? Colaborador.hasOwnProperty('Permisos') ? Colaborador.Permisos : [] : null
                }
            }
        }).then((data) => {
            return res.json(msgHandler_1.msgHandler.sendValue(data));
        }).catch((err) => {
            return res.status(400).json(msgHandler_1.msgHandler.sendError(err));
        });
    }),
    //TODO: Llenar Documentacion
    /**
     * Este método elimina un persona de un colaborador en especifico
     *
     * @param {*} req
     * @param {*} res
     * @returns {error,value}
     */
    putEliminarPermiso: (req, res) => __awaiter(this, void 0, void 0, function* () {
        let { error, value } = colaborador_services_1.default.valAgregarCargo(req.params.idColaborador, req.params.idPermiso);
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        const _idColaborador = new mongoose_1.Types.ObjectId(req.params.idColaborador.toString()), _idPermiso = new mongoose_1.Types.ObjectId(req.params.idPermiso.toString()), Colaborador = yield colaborador_model_1.default.findById(_idColaborador).lean(true);
        yield colaborador_model_1.default
            .updateOne({
            _id: _idColaborador,
            'Permisos.IdPermiso': { $eq: _idPermiso }
        }, {
            $pull: {
                Permisos: {
                    IdPermiso: _idPermiso
                },
            },
            $push: {
                Log: {
                    Propiedad: 'Permisos',
                    Data: Colaborador.hasOwnProperty('Permisos') ? Colaborador.Permisos : []
                }
            }
        }).then((data) => {
            return res.send(data);
        }).catch((err) => {
            return res.status(400).json(err.message);
        });
    })
};
