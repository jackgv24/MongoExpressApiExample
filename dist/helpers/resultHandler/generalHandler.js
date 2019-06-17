"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Message {
    /**
     *Crea un instancia Message
        * @param { Retorno de información de donde se encuentra el posible error } error
        * @param { Si no hubo ningun tipo de fallo entonces retorna el resultado esperado } value
        */
    constructor(_error, _mensaje) {
        if (_error) {
            this.error = _error;
            this.value = null;
        }
        else if (!_error && _mensaje) {
            this.error = null;
            this.value = _mensaje;
        }
        else {
            this.error = null;
            this.value = null;
        }
    }
    /**
     * Retorna un mensaje de error
     *
     * @param {*} _error
     * @returns {error,value}
     */
    sendError(data) {
        if (data.hasOwnProperty('joi')) {
            if (!Array.isArray(data["details"]))
                return new Message(data["message"], null);
            if (data["details"].length != 0)
                return new Message(data["details"][0].message, null);
        }
        if (data.hasOwnProperty('message'))
            return new Message(data["message"], null);
        return new Message(data, null);
    }
    /**
     * Retorna la data en el formato establecido
     *
     * @param {*} content
     * @returns {error,value}
     */
    sendValue(data) {
        return new Message(null, data);
    }
}
exports.Message = Message;
