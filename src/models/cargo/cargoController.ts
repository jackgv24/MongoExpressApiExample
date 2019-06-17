import cargoMdl from './cargoModel';
import cargoSrv from './cargoService';
import colMdl from '../colaboradores/general/colaborador.model';
import {msgHandler,crudType as enumCrud} from '../../helpers/resultHandler/msgHandler';
import {Types} from 'mongoose';
import db from '../../database/transactions';

const Task = db.Task();

export default {
    
    /**
     * Metodo que permite obtener todos los registros de cargos activos de la base de datos
     *
     * @param {*} req
     * @param {*} res
     * @returns Array(permisosModel)
     */
    getObtener: async(req,res) => {
        const _return = 
        await cargoMdl
        .find({Estado:true})
        .select({
            Permisos:false,
            FechaModificacion:false,
            Estado:false
        }).lean(true);

        return res.json(msgHandler.sendValue(_return));
    },
    
    /**
     * Método que permite obtener todos los cargos registrados en la base de datos
     *
     * @param {*} req
     * @param {*} res
     * @returns Array(cargoModel)
     */
    getObtenerAll: async (req,res) => {
        const _return = 
        await cargoMdl
        .find()
        .select({
            Permisos:false,
            FechaModificacion:false
        })
        .lean(true);

        return res.json(_return);
    },

    /**
     * Método que permite buscar un elemento por su ObjectId
     *
     * @module cargoModel
     * @name getBuscarById
     * @param {*} req
     * @param {*} res
     * @returns cargoModel
     */
    getBuscarById: async (req,res) => {
        const id = req.params.idCargo;
        if(!cargoSrv.validarObjectId(id)) return res.status(400).json(msgHandler.errorIdObject('idCargo'));

        const _return = 
        await cargoMdl.find({_id:id,Estado:true});
        return res.json(msgHandler.sendValue(_return));
    },

    /**
     * Método que permite obtener los Permisos de un cargo determinado
     *
     * @param {*} req
     * @param {*} res
     * @returns Array(cargoModel.Permisos)
     */
    //FIXME: Refactorizar validar
    getPermisosById: async (req,res) => {
        const idCargo = req.params.idCargo;
        if(!cargoSrv.validarObjectId(idCargo)) return res.status(400).json(msgHandler.errorIdObject('idCargo'));

        const _return =
        await cargoMdl
        .findOne({
            _id:idCargo,
            Estado:true
        })
        .select({
            Permisos:true,
            Nombre:true,
        });

        const _resultado = _return["Permisos"].filter(element => {
            return element.Estado === true;
        });

        return res.json(msgHandler.sendValue(_resultado));
    },

    /**
     * Agregar un nuevo cargo a la base de datos
     *
     * @param {*} req
     * @param {*} res
     * @returns cargoModel
     */
    postAgregar: async (req,res) => {
        const {error,value} = await cargoSrv.validarAgregar(req.body);
        if(error) return res.status(400).json(msgHandler.sendError(error));

        let _result = await cargoMdl.create(value);
        return res.json(msgHandler.sendValue(_result));
    },

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     */
    //FIXME: Refactorizar validacion
    putModificar:  async (req,res) => {

        if(!cargoSrv.validarObjectId(req.params.idCargo)) return res.status(400).json(msgHandler.errorIdObject('idPermiso'))
        const idCargo:Types.ObjectId = new Types.ObjectId(req.params.idCargo),
        body = req.body;
        const {error,value} = await cargoSrv.validarModificar(body);
        if(error) res.status(400).json(msgHandler.sendError(error));
        await
        cargoMdl
        .updateOne(
            {
                _id: idCargo
            },
            {
                $set:{
                    Nombre: value["Nombre"],
                    Area: value["Area"],
                    Descripcion: value["Descripcion"],
                    Parent: value["Parent"],
                    Funciones: value["Funciones"]
                }
            }
        ).then((data)=>{
            return res.json(msgHandler.resultCrud(data,'cargo',enumCrud.actualizar))
        }).catch((err)=>{
            return res.status(400).json(msgHandler.sendError(err));
        })
    },

    /**
     * Agregar un permiso al modelo de datos de Cargo
     * 
     * @param {*} req
     * @param {*} res
     * @returns
     */
    putAgregarPermisos:async (req,res) => {
        const {error,value} = await cargoSrv.validarPermisoSingle(req.params.idCargo,req.body);
        const 
            idCargo:Types.ObjectId = new Types.ObjectId(req.params.idCargo),
            _permiso:any = value;
        if(error) return res.status(400).json(msgHandler.sendError(error));
        await
        Task
        .update(
        cargoMdl,
        {
            _id:idCargo
        },{
            $push:{'Permisos':_permiso}
        })
        .update(
            colMdl,
        {
            'Cargo.IdCargo':idCargo,
            'Cargo.Estado':true,
            'Permisos.IdPermiso':{$ne:_permiso.IdPermiso}
        },{
            $push:{
                Permisos:{
                    IdPermiso: new Types.ObjectId(_permiso.IdPermiso.toString()),
                    IsFrom:'Cargo'
                }
            }
        }).run({useMongoose: true}).then((data) => {
            return res.json(msgHandler.sendValue('El Permiso se ha agregado correctamente'));
        }).catch((err)=>{
            return res.status(400).json(err.message);
        });
    },

    /**
     * Método que permite eliminar un permiso en especifico de un cargo en especifico
     *  
     * @param {*} req
     * @param {*} res
     */
    putEliminarPermiso: async (req,res) => {

        if(!cargoSrv.validarObjectId(req.params.idCargo.toString())) return res.status(400).json(msgHandler.missingIdProperty('idCargo'));
        if(!cargoSrv.validarObjectId(req.params.idPermiso.toString())) return res.status(400).json(msgHandler.missingIdProperty('idPermiso'));
        
        const
            idCargo = new Types.ObjectId(req.params.idCargo),
            idPermiso = new Types.ObjectId(req.params.idPermiso);
        await 
        Task
        .update(cargoMdl,{'_id':idCargo},{$pull:{'Permisos':{'IdPermiso':idPermiso}}})
        .update(
            colMdl,
            {
                'Cargo.IdCargo':new Types.ObjectId(idCargo.toString()),
                'Cargo.Estado':true, //ultimo cambio
                'Permisos.IdPermiso':idPermiso
            },{
                $pull:{
                    Permisos: {
                        IdPermiso:idPermiso,
                        IsFrom:'Cargo'
                    }
                }
            },
            {
                safe:true
            }
        )
        .run({useMongoose: true})
        .then((data) => {
            return res.json(msgHandler.sendValue('El Permiso se ha eliminado correctamente'));
        }).catch((err)=>{
            return res.status(401).json(err);
        });
    },

    /**
     * Realiza la baja de un cargo en especifico
     *
     * @param {*} req
     * @param {*} res
     * @returns
     */
    deleteDarBaja: async (req,res) => {
        
        if(!req.params.hasOwnProperty('idCargo')) return res.status(400).json(msgHandler.missingIdProperty('idCargo'));
        const idCargo = req.params.idCargo;
        if(!cargoSrv.validarObjectId(idCargo)) return res.status(400).json(msgHandler.errorIdObject('idCargo'))

        //TODO: En vez de eliminar los permisos se pueden desactivar - Pero esto es otro aproach
        
        const cargoPermisos = [];
        Array.from(await cargoMdl
        .find({_id:new Types.ObjectId(idCargo)})
        .select({Permisos:true,_id:false})
        .lean(true))
        .forEach(_data => {
            if(_data.hasOwnProperty('Permisos') && Array.isArray(_data["Permisos"]))  if(Array.from(_data["Permisos"]).length != 0) {
                cargoPermisos.push(..._data["Permisos"].map(t => {return t.IdPermiso}));
            } 
        });

        await
        Task
        .update(
            cargoMdl,
            {'_id':new Types.ObjectId(idCargo.toString())},
            {$set:{Estado:false}}
        )
        .update(
            colMdl,
            {'Cargo.IdCargo': new Types.ObjectId(idCargo.toString())},
            {
                $pull:{
                    'Permisos':{
                        'IdPermiso':{
                            $in:cargoPermisos
                        },
                        'IsFrom':'Cargo'
                    }
                },
                $set:{
                    'Cargo.$.Estado':false
                }
            }
        )
        .run({useMongoose: true})
        .then((data)=> {
            return res.json(data);
        })
        .catch((err)=> {
            return res.status(401).json(msgHandler.sendError(err))
        });
    },
    
    /**
     * Da de alta a un cargo en especifico
     *
     * @param {Request} req
     * @param {Response} res
     * @returns
     */
    putDarAlta: async (req,res) => {
        if(!req.params.hasOwnProperty('idCargo')) return res.status(400).json(msgHandler.missingIdProperty('idPermiso'));
        const idCargo = req.params.idCargo;
        if(!cargoSrv.validarObjectId(idCargo)) return res.status(400).json(msgHandler.errorIdObject('idPermiso'))

        let permisos = [...new Set(await cargoMdl.aggregate([
            {$match:{'_id':new Types.ObjectId(idCargo)}},
            {$unwind:'$Permisos'},
            {$replaceRoot :{'newRoot':'$Permisos'}},
            {
                $addFields: {
                    IdPermiso: { $toString: "$IdPermiso" }
                }
            },
            {$project:{"IdPermiso":1,"_id":0}}
        ]))].map(item =>
            {
                return {
                    IdPermiso:new Types.ObjectId(item.IdPermiso.toString()),
                    IsFrom:'Cargo'
                }
            }
        );
        await
        Task
        .update(cargoMdl,{'_id':new Types.ObjectId(idCargo.toString())},{$set:{'Estado':true}})
        .update(
            colMdl,
            {
                'Cargo.IdCargo':new Types.ObjectId(idCargo),
                'Cargo.Estado':false
            },
            {
                $push:{
                    'Permisos':{
                        $each:permisos
                    }
                },
                $set:{
                    'Cargo.$.Estado':true
                }
            }
        )
        .run({useMongoose: true})
        .then((data)=> {
            return res.json(data);
        }).catch((err)=>{
            return res.status(400).json(err);
        });
    }
}
