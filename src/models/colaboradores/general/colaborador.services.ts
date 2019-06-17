import * as joi from 'joi';
// import * as joi from 'joi-es';
import colModel from './colaborador.model';
import cargoSrv from '../../cargo/cargoService'
import {msgHandler} from '../../../helpers/resultHandler/msgHandler';
import general from '../../../helpers/validation/basicValidations';


const 
JoiPerfil = joi.object().keys({
    Foto: joi.string(),
    Settings: joi.object().keys({
        DarkMode: joi.boolean(),
        SideBar: joi.boolean()
    })
})
,JoiTelefonos = joi.object().keys({
    Telefono: joi.string().regex(/^[2,5,7,8,9]{1}\d{7}$/),
    Operadora: joi.string().min(3).max(12)
})
,JoiGeneral = joi.object().keys({
    Nombre: joi.string().required().min(5).max(30),
    Apellido: joi.string().required().min(5).max(30),
    Cedula: joi.string().required().regex(/\d{3}-{0,1}\d{6}-{0,1}\d{4}[A-z]{1}/),
    Email: joi.string().email(),
    Telefonos: joi.array().items(JoiTelefonos)
})
,JoiCargo = joi.object().keys({
    IdCargo: joi.string(),
    FechaIngreso: joi.date()
})
,JoiColaborador = joi.object().keys({
    General: JoiGeneral,
    Cargo: joi.array().items(JoiCargo).min(1),
    Perfil: JoiPerfil,
    Estado: joi.boolean()
})


class colaboradorService extends general {
    /**
     * Método que permite validar el modelo de datos para un Colaborador
     *
     * @param {*} data
     * @returns {error:'Mensaje de Error',value: 'informacion'}
     * @memberof colaboradorService
     */
    async valdarAgregarColaborador(data) {
        const{error,value} = joi.validate(data,JoiColaborador);
        if(error) return {error};
        if(!await cargoSrv.validarCargos(value.Cargo)) return msgHandler.doNotExist('Cargo');
        if(data.hasOwnProperty('User')) return msgHandler.sendError('Error. No se puede crear un Usuario sin antes haber creado un Colaborador');
        let uniCedula = await colModel.findOne({'General.Cedula':value.General.Cedula}).lean(true);
        if(uniCedula) return msgHandler.sendError('La cedula ingresada ya se encuentra registrada');
        return {error:null,value};
    }

    validarGeneral(data){
        const{error,value} = joi.validate(data,JoiGeneral);
        if(error) return msgHandler.sendError(error);
        return {error,value};
    }

    valModGeneral(idColaborador:string,data:any){
        if(!this.validarObjectId(idColaborador)) return msgHandler.errorIdObject('Id Colaborador');
        let {error,value} = this.validarGeneral(data);
        if(error) return msgHandler.sendError(error);
    }

    valAgregarCargo(idColaborador:string,idCargo:string){
        if(!this.validarObjectId(idColaborador)) return msgHandler.errorIdObject('Id Colaborador');
        if(!this.validarObjectId(idCargo)) return msgHandler.errorIdObject('Id Cargo');
        return msgHandler.sendValue(true);
    }

    valEliminarCargo(idColaborador,idCargo){
        if(!this.validarObjectId(idColaborador)) return msgHandler.errorIdObject('Id Colaborador');
        if(!this.validarObjectId(idCargo)) return msgHandler.errorIdObject('Id Cargo');
        return msgHandler.sendValue(true);
    }

    valAgregarPermiso(idColaborador,idPermiso){
        if(!this.validarObjectId(idColaborador)) return msgHandler.errorIdObject('Id Colaborador');
        if(!this.validarObjectId(idPermiso)) return msgHandler.errorIdObject('Id Permiso');
        return msgHandler.sendValue(true);
    }

    valEliminarPermiso(idColaborador,idPermiso){
        if(!this.validarObjectId(idColaborador)) return msgHandler.errorIdObject('Id Colaborador');
        if(!this.validarObjectId(idPermiso)) return msgHandler.errorIdObject('Id Permiso');
        return msgHandler.sendValue(true);
    }

    cargosUnicos(data){
        const _Cargos = [];
        //Se obtienen los permisos que tiene el cargo
        if(!Array.isArray(data))throw new Error('La variable proporcionada tiene que ser un Array');
        if(Array.from(data).length == 0) return []

        data.forEach(item => {
            if(item.hasOwnProperty('IdCargo')){
                _Cargos.push(item.IdCargo.toString());
            }
        });
        return [...new Set(_Cargos)];
    }

    permisosUnicos(data){
        if(!Array.isArray(data)) return [];
        
        const _dirtyPermisos = [];

        data.forEach(item=> {
            if(item.hasOwnProperty('Permisos') && Array.isArray(item.Permisos)){
                _dirtyPermisos.push(...item.Permisos.map(obj=> obj.IdPermiso.toString()));
            }
        });

        return [...new Set(_dirtyPermisos)];        
    }
};

export default new colaboradorService;