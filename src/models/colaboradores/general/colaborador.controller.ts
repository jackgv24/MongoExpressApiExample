
import {Types} from 'mongoose';
import colSrv from './colaborador.services';
import colMdl from './colaborador.model';
import cargoModel from '../../cargo/cargoModel';
import {msgHandler,crudType as  enumCrud} from '../../../helpers/resultHandler/msgHandler';

export default {
    /**
     * Método que nos permite obtener todos los Colaboradores activos
     * de la base de datos
     *
     * @param {*} req
     * @param {*} res
     * @returns {}
     */
    getObtener: async (req,res) => {
        const _result = await colMdl.find({Estado: true}).lean(true);
        return res.json(msgHandler.sendValue(_result));
    },
    
    /**
     * Método que nos permite obtener todos los Colaboradores
     * de la base de datos
     *
     * @param {*} req
     * @param {*} res
     * @returns
     */
    getObtenerAll: async (req,res) => {
        const _result = await colMdl.find().lean(true);
        return res.json(msgHandler.sendValue(_result));
    },

    /**
     * Agrega un modelo de Colaborador a la base de datos
     *
     * @param {} req
     * @param {*} res
     * @returns
     * @type colaboradorModel
     */
    postAgregar: async (req,res) => {
        //FIXME: Hace falta validar los cargos que se estan ingresando
        const _data = req.body;
        const {error,value} = await colSrv.valdarAgregarColaborador(_data);
        if(error) return res.status(400).json(msgHandler.sendError(error));

        let Cargos = colSrv.cargosUnicos(value.Cargo).map(_idCargo => {return new Types.ObjectId(_idCargo)});
        value.Cargo = Cargos.map(_iC=> {
            return {IdCargo:_iC,Estado:true}
        });

        let permisos = [...new Set(await cargoModel.aggregate([
                {$match:
                    {'_id':{$in:Cargos}}
                },
                {$unwind:'$Permisos'},
                {$replaceRoot :{'newRoot':'$Permisos'}},
                {
                    $addFields: {
                        IdPermiso: { $toString: "$IdPermiso" }
                    }
                },
                {
                    $group:{
                        _id:'$IdPermiso',
                        IdPermiso:{$first:'$IdPermiso'}
                    }
                }
            ]))].map(item =>
                {
                    return {
                        IdPermiso:new Types.ObjectId(item.IdPermiso.toString()),
                        IsFrom:'Cargo'
                    }
                }
            );
        
        if(Array.from(permisos).length != 0){
            value.Permisos = permisos;
        }

        await colMdl
        .create(value)
        .then((data)=>{return res.json(msgHandler.sendValue(data))})
        .catch((err)=>{return res.status(400).json(msgHandler.sendError(err))});
    },

    /**
     * Permite Modificar los datos generales del colaborador
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @type colaboradorModel
    **/
    putModificarGeneral: async (req,res) => {
        let {error,value} = colSrv.valModGeneral(req.params.idColaborador,req.body);
        if(error) return res.status(400).json(error);

        const 
            idColaborador = new Types.ObjectId(req.params.idColaborador);

        const _log = await colMdl.findById(idColaborador);

        await 
        colMdl
        .updateOne(
            {_id:idColaborador},
            {  $set:{
                    General:value,
                    FechaModificación: Date.now()
                },
                $push:{
                    Log: {
                        FechaModificación:Date.now(),
                        Propiedad:'General',
                        Data: _log? _log["General"]:null
                    }
                }
            },{
                new:true
            }
        ).then((data)=>{return res.json(msgHandler.resultCrud(data,'colaborador',enumCrud.actualizar))})
        .catch((err)=> {return res.status(400).json(msgHandler.sendError(err))})
    },

    /**
     * Este método agregar un Cargo a un empleado incluyendo todos los permisos que contiene el cargo
     *
     * @param {*} req
     * @param {*} res
     * @returns {error,value}
     */
    putAgregarCargo: async (req,res) => {

        let {error,value} = colSrv.valAgregarCargo(req.params.idColaborador,req.params.idCargo);
        if(error) return res.status(400).json(msgHandler.sendError(error));

        const 
            idColaborador = new Types.ObjectId(req.params.idColaborador.toString()),
            _idCargo = new Types.ObjectId(req.params.idCargo.toString()),
            Colaborador = await colMdl.findById(idColaborador).lean(true),
            _permisosCol = Colaborador.hasOwnProperty('Permisos')? Colaborador.Permisos.map(item=> item.IdPermiso.toString()): [],
            _permisos = await cargoModel.aggregate([
                {$match:{_id:new Types.ObjectId(_idCargo.toString())}},
                {$unwind:'$Permisos'},
                {$replaceRoot :{'newRoot':'$Permisos'}},
                {
                    $addFields: {
                        IdPermiso: { $toString: "$IdPermiso" }
                    }
                },
                {$match:{'IdPermiso':{$nin:_permisosCol}}},
                {
                    $group:{
                        _id:'$IdPermiso',
                        IdPermiso:{$first:'$IdPermiso'}
                    }
                },
                {
                    $match:{'IdPermiso':{$ne:_permisosCol}}
                },
                {
                    $project:{
                        "IdPermiso":1,
                        "_id":0
                    }
                },
                {
                    $addFields:{
                        IsFrom: 'Cargo'
                    }
                }
            ]);

        colMdl
        .updateOne(
            {
                _id:idColaborador,
                'Cargo.IdCargo':{$nin:[_idCargo]}
            },
            {
                $push:{
                    Cargo:{
                        IdCargo:_idCargo,
                        Estado:true
                    },
                    Permisos:{
                        $each:_permisos
                    },
                    Log:{
                        Propiedad:'Cargo',
                        Data:Colaborador.Cargo
                    }
                }
            }
        )
        .then((data)=>{
            return res.json(msgHandler.resultCrud(data,'colaborador',enumCrud.actualizar));
        }).catch((err)=>{
            return res.status(400).json(err);
        })
    },

    /**
     * Este método se encarga de eliminar un cargo de un colaborador
     * Ademas este método agrega todo los permisos
     *
     * @param {*} req
     * @param {*} res
     * @returns {error,value}
     */
    putEliminarCargo: async (req,res) => {

        let {error,value} = colSrv.valAgregarCargo(req.params.idColaborador,req.params.idCargo);
        if(error) return msgHandler.sendError(error);

        let
            _IdColaborador = new Types.ObjectId(req.params.idColaborador.toString()),
            _IdCargo = new Types.ObjectId(req.params.idCargo.toString());
        
        const
            Colaborador = await colMdl.findById(_IdColaborador).lean(true),
            _permisos = (await cargoModel.aggregate([
                {$match:{_id:new Types.ObjectId(_IdCargo.toString())}},
                {$unwind:'$Permisos'},
                {$replaceRoot :{'newRoot':'$Permisos'}},
                {
                    $addFields: {
                        IdPermiso: { $toString: "$IdPermiso" }
                    }
                },
                {
                    $group:{
                        _id:'$IdPermiso',
                        IdPermiso:{$first:'$IdPermiso'}
                    }
                },
                {
                    $project:{
                        "IdPermiso":1,
                        "_id":0
                    }
                }
            ])).map(_permiso => {return _permiso.IdPermiso});

        colMdl.updateOne(
            {
                _id:_IdColaborador,
                'Cargo.IdCargo':{$eq:_IdCargo}
            },
            {
                $pull:{
                    Cargo:{
                        IdCargo:_IdCargo
                    },
                    Permisos:{
                        IdPermiso:{$in:_permisos},
                        IsFrom:'Cargo'
                    }
                },
                $push:{
                    Log:{
                        Propiedad:'Cargo',
                        Data:Colaborador.Cargo
                    }
                }
            }
        ).then((data)=>{
            return res.json(msgHandler.resultCrud(data,'colaborador',enumCrud.actualizar));
        }).catch((err)=>{
            return res.status(400).json(err);
        });
    },

    /**
     * Este método permite agregar un permiso a un colaborador en especifico
     *
     * @param {*} req
     * @param {*} res
     * @returns {error,value}
     */
    putAgregarPermiso: async (req,res) => {
        let {error,value} = colSrv.valAgregarCargo(req.params.idColaborador,req.params.idPermiso);
        if(error) return res.status(400).json(msgHandler.sendError(error));

        let
            _idColaborador = new Types.ObjectId(req.params.idColaborador.toString()),
            _idPermiso = new Types.ObjectId(req.params.idPermiso.toString());
        
        const 
            Colaborador = await colMdl.findById(_idColaborador).lean(true);
        await 
        colMdl
        .updateOne(
            {
                _id:_idColaborador,
                'Permisos.IdPermiso':{$ne:_idPermiso}
            },
            {
                $push:{
                    Permisos:{
                        IdPermiso: _idPermiso,
                        IsFrom: 'Manual'
                    },
                    Log:{
                        Propiedad:'Permisos',
                        Data: Colaborador?Colaborador.hasOwnProperty('Permisos')? Colaborador.Permisos: []:null
                    }
                }
            }
        ).then((data) => {
            return res.json(msgHandler.sendValue(data));
        }).catch((err)=> {
            return res.status(400).json(msgHandler.sendError(err));
        })
    },

    //TODO: Llenar Documentacion
    /**
     * Este método elimina un persona de un colaborador en especifico
     *
     * @param {*} req
     * @param {*} res
     * @returns {error,value}
     */
    putEliminarPermiso: async (req,res) => {
        let {error,value} = colSrv.valAgregarCargo(req.params.idColaborador,req.params.idPermiso);
        if(error) return res.status(400).json(msgHandler.sendError(error));

        const
            _idColaborador = new Types.ObjectId(req.params.idColaborador.toString()),
            _idPermiso = new Types.ObjectId(req.params.idPermiso.toString()),
            Colaborador = await colMdl.findById(_idColaborador).lean(true);
            
        await colMdl
        .updateOne(
            {
                _id:_idColaborador,
                'Permisos.IdPermiso':{$eq:_idPermiso}
            },
            {
                $pull:{
                    Permisos:{
                        IdPermiso:_idPermiso
                    },
                },
                $push:{
                    Log:{
                        Propiedad:'Permisos',
                        Data:Colaborador.hasOwnProperty('Permisos')? Colaborador.Permisos: []
                    }
                }
            }
        ).then((data)=>{
            return res.send(data);
        }).catch((err)=>{
            return res.status(400).json(err.message);
        })
    }
};