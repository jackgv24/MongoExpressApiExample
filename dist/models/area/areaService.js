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
// const Joi = require('joi-es');
const Joi = require("joi");
const basicValidations_1 = require("../../helpers/validation/basicValidations");
const areaModel_1 = require("./areaModel");
const msgHandler_1 = require("../../helpers/resultHandler/msgHandler");
const areaValidation = Joi.object().keys({
    Nombre: Joi.string().max(20).required(),
    Descripcion: Joi.string().max(255),
    FechaIngreso: Joi.date(),
    FechaModificacion: Joi.date(),
    Estado: Joi.boolean()
});
const validarModelo = (body) => {
    const { error, value } = Joi.validate(body, areaValidation);
    //validación de modelo de datos
    if (error && error.details)
        return msgHandler_1.msgHandler.sendError(error.details[0].message);
    //Se valida que sea unico el tipo de datos
    return msgHandler_1.msgHandler.sendValue(value);
};
class areaService extends basicValidations_1.default {
    /**
     *Funcion que permite validar el modelo de datos de un Area
     *
     * @param {Este es el modelo ha validar} body
     * @returns {Retorna un objeto con 2 datos un error y un value. Si ocurrio un fallo en el campo de error aparecera el error}
     */
    validarAgregar(body) {
        return validarModelo(body);
    }
    ;
    /**
     * Valida los datos correspondiente para luego proceder a modificar el objecto
     *
     * @param {*} id
     * @param {*} body
     * @returns { Retorna un objeto con un 2 propiedades un error y un value. Si ocurre algun inconveniente la propiedad [error] envia un mensaje del error que ocurrio }
     */
    validarModificar(id, body) {
        if (!this.validarObjectId(id))
            return msgHandler_1.msgHandler.sendError('El Id ingresado no tiene el formato correcto');
        return validarModelo(body);
    }
    ;
    validarArea(area) {
        return __awaiter(this, void 0, void 0, function* () {
            const _r = yield areaModel_1.default.findOne({ Nombre: area }).select({ _id: 1 });
            return _r ? true : false;
        });
    }
}
exports.default = new areaService;
