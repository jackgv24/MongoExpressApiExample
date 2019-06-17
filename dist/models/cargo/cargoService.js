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
const Joi = require("joi");
// import * as Joi from 'joi-es';
//Se instancia la variable de Joi ObjectId
const basicValidations_1 = require("../../helpers/validation/basicValidations");
const cargoModel_1 = require("./cargoModel");
const areaService_1 = require("../../models/area/areaService");
const msgHandler_1 = require("../../helpers/resultHandler/msgHandler");
const lodash = require("lodash");
const JoiFunciones = Joi.object().keys({
    Descripcion: Joi.string().required().max(255),
    FechaIngreso: Joi.date(),
    Estado: Joi.bool()
}), JoiPermisos = Joi.object().keys({
    IdPermiso: Joi.string(),
    Estado: Joi.bool()
}), cargoValidacion = Joi.object().keys({
    Nombre: Joi.string().required().max(20),
    Area: Joi.string().required(),
    Descripcion: Joi.string().max(255),
    Parent: Joi.string(),
    Funciones: Joi.array().items(JoiFunciones).min(1),
    Permisos: Joi.array().items(JoiPermisos)
}), validarPermisos = (Permisos) => {
    let _data = {}, retorno = true;
    //Se realiza la validación para ver si es un array
    if (!Array.isArray(Permisos))
        return false;
    for (let item of Permisos) {
        //Si esta alojado en memoria entonces significa que este registro se encuentra duplicado
        if (_data.hasOwnProperty(item.IdPermiso)) {
            retorno = false;
            break;
        }
        //Si no esta alojado en memoria entonces significa que no esta repetido y se ingresa en memoria para luego ser validado
        _data[item.IdPermiso] = item;
    }
    return retorno;
}, validarModelo = (body) => __awaiter(this, void 0, void 0, function* () {
    const { error, value } = Joi.validate(body, cargoValidacion);
    if (error && error.details)
        return msgHandler_1.msgHandler.sendError(error.details[0].message);
    //Validacion del area que se le va a ingresar a un cargo
    if (!(yield areaService_1.default.validarArea(value.Area)))
        return msgHandler_1.msgHandler.doNotExist('Area');
    //Validacion de los permisos
    // el primer if() es para validar si existe la propiedad Permisos en el objeto
    // el segundo if() es para validar si hay IdPermisos repetidos
    if (body.hasOwnProperty('Permisos'))
        if (!validarPermisos(body.Permisos))
            return msgHandler_1.msgHandler.sendError('No pueden existir permisos duplicados en un mismo cargo');
    return msgHandler_1.msgHandler.sendValue(value);
});
class cargoService extends basicValidations_1.default {
    /**
     * Realiza la validación para agregar un Cargo
     *
     * @param {*} body
     * @returns Promise(Message)
     * @memberof cargoService
     */
    validarAgregar(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const { error, value } = yield validarModelo(body);
            if (error)
                return msgHandler_1.msgHandler.sendError(error);
            if (value.hasOwnProperty('Permisos'))
                return msgHandler_1.msgHandler.sendError('No se puede agregar el permiso. Primero se tiene que agregar un Cargo para luego agregarle los permisos');
            return msgHandler_1.msgHandler.sendValue(value);
        });
    }
    /**
     * @
     * Realiza la validacion para modificar un Cargo
     *
     * @param {*} body
     * @returns
     * @memberof cargoService
     */
    validarModificar(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const { error, value } = yield validarModelo(body);
            if (error)
                return msgHandler_1.msgHandler.sendError(error);
            return msgHandler_1.msgHandler.sendValue(value);
        });
    }
    validarPermisoMultiples(Permisos) {
        const data = Permisos.map(item => {
            return lodash.pick(item, ['IdPermiso', 'Estado']);
        });
        const { error, value } = Joi.array().items(JoiPermisos).min(1).validate(data);
        if (error)
            return msgHandler_1.msgHandler.sendError(error);
        return msgHandler_1.msgHandler.sendValue(Permisos);
    }
    //FIXME:Se tiene que refactorizar el método;
    validarPermisoSingle(idCargo, Permiso) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('No se ha fregado 1');
            if (!this.validarObjectId(idCargo))
                return msgHandler_1.msgHandler.errorIdObject('Id Cargo');
            console.log('No se ha fregado 2');
            const _Permiso = lodash.pick(Permiso, ['IdPermiso', 'Estado']);
            let { error, value } = JoiPermisos.validate(_Permiso);
            if (error)
                return msgHandler_1.msgHandler.sendError(error.details[0].message);
            const _dataCargo = (yield cargoModel_1.default.findOne({ _id: idCargo })).toObject();
            //Se valida que exista el cargo
            if (!_dataCargo)
                return msgHandler_1.msgHandler.doNotExist('Cargo');
            //Se valida que no existan permisos repetidos
            if (_dataCargo.hasOwnProperty('Permisos')) {
                let Permisos = Array.from(_dataCargo.Permisos);
                for (const item of Permisos) {
                    if (item["IdPermiso"] == _Permiso.IdPermiso) {
                        return msgHandler_1.msgHandler.sendError('Lo sentimos la ruta o direccion ya a sido ingresado a este cargo');
                    }
                }
            }
            else {
                return msgHandler_1.msgHandler.sendValue(value);
            }
            return error ? msgHandler_1.msgHandler.sendError(error) : msgHandler_1.msgHandler.sendValue(value);
        });
    }
    validarCargoById(idCargo) {
        return __awaiter(this, void 0, void 0, function* () {
            const _data = yield cargoModel_1.default.findById(idCargo);
            return _data ? true : false;
        });
    }
    validarCargos(Cargos) {
        if (!Array.isArray(Cargos))
            return false;
        //Hay que mejorar este proceso
        let _data = Cargos.map(item => {
            let cargo = cargoModel_1.default.findById(item.IdCargo);
            return cargo ? true : false;
        }).find(item => {
            return item == false;
        });
        return !_data ? true : false;
    }
}
exports.default = new cargoService;
