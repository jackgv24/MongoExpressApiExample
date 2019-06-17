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
const joi = require("joi");
// import * as joi from 'joi-es';
const colaborador_model_1 = require("./colaborador.model");
const cargoService_1 = require("../../cargo/cargoService");
const msgHandler_1 = require("../../../helpers/resultHandler/msgHandler");
const basicValidations_1 = require("../../../helpers/validation/basicValidations");
const JoiPerfil = joi.object().keys({
    Foto: joi.string(),
    Settings: joi.object().keys({
        DarkMode: joi.boolean(),
        SideBar: joi.boolean()
    })
}), JoiGeneral = joi.object().keys({
    Nombre: joi.string().required().min(5).max(30),
    Apellido: joi.string().required().min(5).max(30),
    Cedula: joi.string().required().regex(/\d{3}-{0,1}\d{6}-{0,1}\d{4}[A-z]{1}/),
    Email: joi.string().email()
}), JoiCargo = joi.object().keys({
    IdCargo: joi.string(),
    FechaIngreso: joi.date()
}), JoiColaborador = joi.object().keys({
    General: JoiGeneral,
    Cargo: joi.array().items(JoiCargo).min(1),
    Perfil: JoiPerfil,
    Estado: joi.boolean()
});
class colaboradorService extends basicValidations_1.default {
    /**
     * Método que permite validar el modelo de datos para un Colaborador
     *
     * @param {*} data
     * @returns {error:'Mensaje de Error',value: 'informacion'}
     * @memberof colaboradorService
     */
    valdarAgregarColaborador(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { error, value } = joi.validate(data, JoiColaborador);
            if (error)
                return { error };
            if (!(yield cargoService_1.default.validarCargos(value.Cargo)))
                return msgHandler_1.msgHandler.doNotExist('Cargo');
            if (data.hasOwnProperty('User'))
                return msgHandler_1.msgHandler.sendError('Error. No se puede crear un Usuario sin antes haber creado un Colaborador');
            let uniCedula = yield colaborador_model_1.default.findOne({ 'General.Cedula': value.General.Cedula }).lean(true);
            if (uniCedula)
                return msgHandler_1.msgHandler.sendError('La cedula ingresada ya se encuentra registrada');
            return { error: null, value };
        });
    }
    validarGeneral(data) {
        const { error, value } = joi.validate(data, JoiGeneral);
        if (error)
            return msgHandler_1.msgHandler.sendError(error);
        return { error, value };
    }
    valModGeneral(idColaborador, data) {
        if (!this.validarObjectId(idColaborador))
            return msgHandler_1.msgHandler.errorIdObject('Id Colaborador');
        let { error, value } = this.validarGeneral(data);
        if (error)
            return msgHandler_1.msgHandler.sendError(error);
    }
    valAgregarCargo(idColaborador, idCargo) {
        if (!this.validarObjectId(idColaborador))
            return msgHandler_1.msgHandler.errorIdObject('Id Colaborador');
        if (!this.validarObjectId(idCargo))
            return msgHandler_1.msgHandler.errorIdObject('Id Cargo');
        return msgHandler_1.msgHandler.sendValue(true);
    }
    valEliminarCargo(idColaborador, idCargo) {
        if (!this.validarObjectId(idColaborador))
            return msgHandler_1.msgHandler.errorIdObject('Id Colaborador');
        if (!this.validarObjectId(idCargo))
            return msgHandler_1.msgHandler.errorIdObject('Id Cargo');
        return msgHandler_1.msgHandler.sendValue(true);
    }
    valAgregarPermiso(idColaborador, idPermiso) {
        if (!this.validarObjectId(idColaborador))
            return msgHandler_1.msgHandler.errorIdObject('Id Colaborador');
        if (!this.validarObjectId(idPermiso))
            return msgHandler_1.msgHandler.errorIdObject('Id Permiso');
        return msgHandler_1.msgHandler.sendValue(true);
    }
    valEliminarPermiso(idColaborador, idPermiso) {
        if (!this.validarObjectId(idColaborador))
            return msgHandler_1.msgHandler.errorIdObject('Id Colaborador');
        if (!this.validarObjectId(idPermiso))
            return msgHandler_1.msgHandler.errorIdObject('Id Permiso');
        return msgHandler_1.msgHandler.sendValue(true);
    }
    cargosUnicos(data) {
        const _Cargos = [];
        //Se obtienen los permisos que tiene el cargo
        if (!Array.isArray(data))
            throw new Error('La variable proporcionada tiene que ser un Array');
        if (Array.from(data).length == 0)
            return [];
        data.forEach(item => {
            if (item.hasOwnProperty('IdCargo')) {
                _Cargos.push(item.IdCargo.toString());
            }
        });
        return [...new Set(_Cargos)];
    }
    permisosUnicos(data) {
        if (!Array.isArray(data))
            return [];
        const _dirtyPermisos = [];
        data.forEach(item => {
            if (item.hasOwnProperty('Permisos') && Array.isArray(item.Permisos)) {
                _dirtyPermisos.push(...item.Permisos.map(obj => obj.IdPermiso.toString()));
            }
        });
        return [...new Set(_dirtyPermisos)];
    }
}
;
exports.default = new colaboradorService;
