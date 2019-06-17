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
const areaModel_1 = require("./areaModel");
const areaService_1 = require("./areaService");
const msgHandler_1 = require("../../helpers/resultHandler/msgHandler");
const mongoose_1 = require("mongoose");
exports.default = {
    /**
     * Extrae todas aquellas Areas activas.
     *
     * @param {*} req
     * @param {*} res
     * @returns Array<AreaModel>
     */
    getObtener: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const _result = yield areaModel_1.default
            .find({ Estado: true })
            .select({ FechaModificacion: 0 }).lean(true);
        return res.status(200).json(msgHandler_1.msgHandler.sendValue(_result));
    }),
    /**
     * Extrae todas aquellas areas registradas en el sistema.
     *
     * @param {*} req
     * @param {*} res
     * @returns Array<AreaModel>
     */
    getObtenerAll: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const _result = yield areaModel_1.default.find().lean(true);
        return res.status(200).json(msgHandler_1.msgHandler.sendValue(_result));
    }),
    /**
     * Realiza la busqueda del Area por medio de un Id de Area.
     *
     * @param {*} req
     * @param {*} res
     * @returns AreaModel
     */
    getBuscarById: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const IdArea = req.params.IdArea;
        if (!areaService_1.default.validarObjectId(IdArea))
            return res.status(400).json(msgHandler_1.msgHandler.missingIdProperty('idArea'));
        const _result = yield areaModel_1.default.findOne({ _id: IdArea }).select({ FechaModificacion: 0 });
        ;
        return res.status(200).json(msgHandler_1.msgHandler.sendValue(_result));
    }),
    /**
     * Agrega un nueva area en la base de datos
     *
     * @param {*} req
     * @param {*} res
     * @returns AreaModel
     */
    postAgregar: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { error, value } = areaService_1.default.validarAgregar(req.body);
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        const _result = yield areaModel_1.default.create(value);
        return res.status(200).json(msgHandler_1.msgHandler.sendValue(_result));
    }),
    /**
     * Modifica un area con un Id especifico
     *
     * @param {*} req
     * @param {*} res
     * @returns AreaModel
     */
    putModificar: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const idArea = new mongoose_1.Types.ObjectId(req.params.IdArea), body = req.body;
        const { error, value } = areaService_1.default.validarModificar(idArea, body);
        if (error)
            return res.status(200).send(msgHandler_1.msgHandler.sendValue(value));
        yield areaModel_1.default
            .updateOne({
            _id: idArea
        }, {
            $set: {
                Nombre: body["Nombre"],
                Descripcion: body["Descripcion"],
                FechaModificacion: Date.now()
            }
        })
            .then((data) => {
            return res.status(200).json(msgHandler_1.msgHandler.sendValue(data));
        })
            .catch((err) => {
            return res.status(400).json(msgHandler_1.msgHandler.resultCrud(err, 'area', msgHandler_1.crudType.actualizar));
        });
    }),
    /**
     * Realiza la baka de un Area
     *
     * @param {*} req
     * @param {*} res
     * @returns areaModel
     */
    putDarBaja: (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (!req.params.hasOwnProperty('idArea'))
            return res.status(400).json(msgHandler_1.msgHandler.missingIdProperty('idArea'));
        const _id = req.params.IdArea;
        if (!areaService_1.default.validarObjectId(_id))
            return res.status(400).json(msgHandler_1.msgHandler.errorIdObject('idArea'));
        // const _area = areaModel.findById(_id);
        // if(!_area) return res.status(400).json(msgHandler.sendError('No existe el Area, con el codigo especificado.'));
        yield areaModel_1.default
            .updateOne({ _id: new mongoose_1.Types.ObjectId(_id) }, {
            $set: {
                Estado: false
            }
        }).then((data) => {
            return res.status(200).json(msgHandler_1.msgHandler.resultCrud(data, 'area', msgHandler_1.crudType.actualizar));
        }).catch((err) => {
            return res.status(400).json(msgHandler_1.msgHandler.sendError(err));
        });
    }),
    /**
     * Realiza el alta de un Area
     *
     * @param {*} req
     * @param {*} res
     * @returns areaModel
     */
    putDarAlta: (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (!areaService_1.default.validarObjectId(req.params.IdArea))
            return res.status(400).json(msgHandler_1.msgHandler.missingIdProperty('idArea'));
        const idArea = new mongoose_1.Types.ObjectId(req.params.IdArea);
        yield areaModel_1.default
            .updateOne({ _id: idArea }, {
            $set: {
                Estado: true
            }
        }).then((data) => {
            return res.json(msgHandler_1.msgHandler.resultCrud(data, 'area', msgHandler_1.crudType.actualizar));
        }).catch((err) => {
            return res.status(400).json(msgHandler_1.msgHandler.sendError(err));
        });
    })
};
