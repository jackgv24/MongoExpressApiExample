import {Message,msgResult} from './generalHandler';
import {ValidationError} from 'joi'
// import {ValidationError} from 'joi-es'

export interface actionData{
    n:number,
    [operationAction:string]:number,
    ok:number
}
export interface msgResult extends msgResult{};
export interface msgCustom<T> extends msgResult{
    value:T
};

export enum crudType {
    "actualizar",
    "eliminar",
    "agregar"
}

export enum tokenType{
    "corrupted",
    "invalid",
    "expired",
    "ok",
    "custom"
}
enum flowType{
    "error",
    "success",
    "pending"
}

class MsgHandler extends Message {

    /**
     * Mensaje de error por falta de la propiedad de un Objeto
     * @param {*} IdRequire
     * @returns String
     */
    missingIdProperty(IdRequire:String):msgResult{
        return new MsgHandler(`La propiedad ${IdRequire} no ha sido especificada`,null);
    }

    missingBodyProperty(propiedad: String):msgResult{
        return new MsgHandler(`No se encontro la propiedad ${propiedad}. Para poder continuar continuar con el flujo es necesario este dato.`,null);
    }

    /**
     * Este método retorna un mensaje para cuando no se encuentra el registro
     *
     * @param {String} model
     * @returns {msgResult}
     * @memberof MsgHandler
     */
    missingModelData(model:String):msgResult{
        return new MsgHandler(`El ${model} no se encuentra registrado`,null);
    }
    
    doNotExist(campo:String):msgResult{
        return new MsgHandler(`El valor del campo ${campo} no se encuentra registrado. Favor ingrese un dato valido.`,null);
    }

    alredyExist(campo:String):msgResult{
        return new MsgHandler(`El ${campo} ya se encuentra registrado. Favor ingresar otro.`,null);
    }

    /**
     * Mensaje de error por no ser un ObjectId
     * @param {*} IdRequire
     * @returns String
     */
    errorIdObject(IdData:String):msgResult{
        return new MsgHandler(`El ${IdData} ingresado no tiene el formato correcto`,null);
    }

    errorCrud(crudType:crudType):msgResult{
        return new MsgHandler(`Lo sentimos no se ha podido ${crudType.toString()}`,null);
    }
    
    cantFind(model:String,crudType:crudType):msgResult{
        if(!crudType) throw new Error('favor especificar el crudType');
        return new MsgHandler(`No se pudo encontrar el ${model} para poderlo ${crudType}`,null);                
    }

    cantModified(model,crudType:crudType):msgResult{
        return new MsgHandler(`No se pudo ${crudType} el ${model}`,null);            
    }

    /**
    * @param {n,nModified,ok} data
    * @param {Collecion que se esta utilizando} model
    * @param {Tipo de Operacion} crud
    */
    resultCrud(data:actionData, model:String, crud:crudType,Message:string=null):msgResult{
        if(!data.hasOwnProperty('n')&&!data.hasOwnProperty('ok')) throw new Error('El formato esperado para el método no es el adecuado');
        if(data.n==1 && (data["nModified"] == 1 || data["nMatched"] == 1 || data["nUpserted"] == 1) && data.ok ==1) return new MsgHandler(null,!Message?'Se ha actualizado correctamente':Message);
        else if(data.ok == 1) return this.errorCrud(crudType.actualizar)
        else if(data.nModified) return this.cantModified(model,crud);
    }

    resultsCrud(data:Array<actionData>,model:string,crud:crudType):msgResult{
        for(var action of data){
            if(!action.hasOwnProperty('nModified') && !action.hasOwnProperty('nMatched') && !action.hasOwnProperty('nUpserted')) throw new Error('El formato esperado para el método no es el adecuado');
            if(action.ok==0) return this.errorCrud(crudType.actualizar);
        }
        return new MsgHandler(null,'Se ha actualizado correctamente');
    }

    successUpdate(_model):msgResult{
        if(!_model) new MsgHandler('Se ha actualizado correctamente',null);
        return new MsgHandler(`El ${_model} se ha actualizado correctamente`,null);
    }

    resultToken(TToken:tokenType):msgResult {
        let retorno:{mensaje:string,type:flowType};
        switch (TToken) {
            case tokenType.ok:
                retorno = {mensaje:"Token valido",type:flowType.success};
               break;
            case tokenType.invalid:
                retorno = {mensaje:"Token no valido.",type:flowType.error};
               break;
            case tokenType.expired:
                retorno = {mensaje:"Token expirado",type:flowType.error};
                break;
            case tokenType.corrupted:
                retorno = {mensaje:"Token corrupto",type:flowType.error};
                break;
            default:
                retorno = {mensaje:"Error",type:flowType.error};
                break;
        }
        return retorno.type == flowType.error? new MsgHandler(retorno.mensaje,null):new MsgHandler(null,retorno.mensaje);
    }
}


export const msgHandler =  new MsgHandler(null,null);