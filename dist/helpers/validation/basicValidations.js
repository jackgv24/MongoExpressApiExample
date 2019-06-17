"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * Clase con distintas validaciones que permitiran generalizar las funciones
 *
 * @class General
 */
class General {
    /**
     * Valida si el Id es del tipo de Datos ObjectId
     *
     * @param {*} Id
     * @returns Boolean
     */
    validarObjectId(Id) {
        // return ObjectId.isValid(Id);
        return mongoose_1.Types.ObjectId.isValid(Id);
    }
}
exports.default = General;
