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
// import * as Joi from 'joi-es';
const Joi = require("joi");
const basicValidations_1 = require("../../helpers/validation/basicValidations");
const permisoModel_1 = require("./permisoModel");
const msgHandler_1 = require("../../helpers/resultHandler/msgHandler");
const areaService_1 = require("../../models/area/areaService");
const JoiTree = Joi.object().keys({
    Idx: Joi.number().integer().required(),
    Item: Joi.string().required()
});
const JoiPermiso = Joi.object().keys({
    Titulo: Joi.string().max(20),
    Descripcion: Joi.string().max(255),
    Area: Joi.string().required().max(30),
    Tree: Joi.array().items(JoiTree).min(1),
    Path: Joi.string().required(),
    FechaIngreso: Joi.date(),
    FechaModificacion: Joi.date(),
    Estado: Joi.boolean()
});
const IsPathUnique = (_Path) => __awaiter(this, void 0, void 0, function* () {
    const Permisos = (yield permisoModel_1.default.findOne({ Path: _Path }));
    return Permisos ? false : true;
});
class permisoService extends basicValidations_1.default {
    validarModelo(_data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { error, value } = Joi.validate(_data, JoiPermiso);
            if (error && error.details)
                return msgHandler_1.msgHandler.sendError(error.details[0].message);
            if (!(yield areaService_1.default.validarArea(value.Area)))
                return msgHandler_1.msgHandler.sendError('El Area a ingresar no se encuentra registrada en sistema');
            if (!(yield IsPathUnique(value.Path)))
                return msgHandler_1.msgHandler.alredyExist('Path');
            return { error: null, value };
        });
    }
    ;
}
exports.default = new permisoService;
