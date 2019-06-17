import {Types} from 'mongoose';

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
    validarObjectId(Id:string) {
        // return ObjectId.isValid(Id);
        return Types.ObjectId.isValid(Id);
    }
}

export default General;