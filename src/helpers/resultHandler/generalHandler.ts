import { any } from "joi";

export interface msgResult {
    error: Object;
    value:Object
}
export class Message implements msgResult {
    error: Object;
    value: Object;
    /**
     *Crea un instancia Message
        * @param { Retorno de información de donde se encuentra el posible error } error
        * @param { Si no hubo ningun tipo de fallo entonces retorna el resultado esperado } value
        */
    constructor(_error:Object,_mensaje: Object){
        if(_error){this.error = _error; this.value = null}
        else if(!_error&&_mensaje){this.error = null; this.value = _mensaje}
        else{this.error = null; this.value = null}
    }
    
    /**
     * Retorna un mensaje de error
     *
     * @param {*} _error
     * @returns {error,value}
     */
    sendError(data:Object):msgResult{
        if(data.hasOwnProperty('joi')){
            if(!Array.isArray(data["details"])) return new Message(data["message"],null);
            if(data["details"].length != 0) return new Message(data["details"][0].message,null);
        }
        if(data.hasOwnProperty('message')) return new Message(data["message"],null);
        
        return new Message(data,null);
    }

    /**
     * Retorna la data en el formato establecido
     *
     * @param {*} content
     * @returns {error,value}
     */
    sendValue(data:any):msgResult{
        return new Message(null,data);
    }
} 