import areaModel from './areaModel';
import areaService from './areaService';
import {msgHandler,crudType as  enumCrud} from '../../helpers/resultHandler/msgHandler';
import {Types} from 'mongoose';

export default {
    
    /**
     * Extrae todas aquellas Areas activas.
     *
     * @param {*} req
     * @param {*} res
     * @returns Array<AreaModel>
     */
    getObtener: async(req,res) => {
            const _result = 
            await areaModel
            .find({Estado:true})
            .select({FechaModificacion:0}).lean(true);
            return res.status(200).json(msgHandler.sendValue(_result));
    },

    /**
     * Extrae todas aquellas areas registradas en el sistema.
     *
     * @param {*} req
     * @param {*} res
     * @returns Array<AreaModel>
     */
    getObtenerAll: async(req,res) => {
            const _result = await areaModel.find().lean(true);
            return res.status(200).json(msgHandler.sendValue(_result));
    },

    /**
     * Realiza la busqueda del Area por medio de un Id de Area.
     *
     * @param {*} req
     * @param {*} res
     * @returns AreaModel
     */
    getBuscarById: async(req,res) => {
            const IdArea = req.params.IdArea;
            if(!areaService.validarObjectId(IdArea)) return res.status(400).json(msgHandler.missingIdProperty('idArea'))
            const _result = await areaModel.findOne({_id:IdArea}).select({FechaModificacion:0});;
            return res.status(200).json(msgHandler.sendValue(_result));
    },

    /**
     * Agrega un nueva area en la base de datos
     *
     * @param {*} req
     * @param {*} res
     * @returns AreaModel
     */
    postAgregar: async (req,res) => {
            const {error,value} = areaService.validarAgregar(req.body);
            if(error) return res.status(400).json(msgHandler.sendError(error));
            const _result = await areaModel.create(value);
            return res.status(200).json(msgHandler.sendValue(_result));
    },

    /**
     * Modifica un area con un Id especifico
     *
     * @param {*} req
     * @param {*} res
     * @returns AreaModel
     */
    putModificar: async (req,res) => {

            const 
                idArea = new Types.ObjectId(req.params.IdArea), 
                body = req.body;
            const {error,value} = areaService.validarModificar(idArea,body);
            if(error) return res.status(200).send(msgHandler.sendValue(value));

            await
            areaModel
            .updateOne(
                {
                    _id:idArea
                },
                {
                    $set:{
                        Nombre: body["Nombre"],
                        Descripcion: body["Descripcion"],
                        FechaModificacion: Date.now()
                    }
                }
            )
            .then((data)=>{
                return res.status(200).json(msgHandler.sendValue(data));
            })
            .catch((err)=>{
                return res.status(400).json(msgHandler.resultCrud(err,'area',enumCrud.actualizar));
            })
    },

    /**
     * Realiza la baka de un Area
     *
     * @param {*} req
     * @param {*} res
     * @returns areaModel
     */
    putDarBaja: async (req,res) => {
            if(!req.params.hasOwnProperty('idArea')) return res.status(400).json(msgHandler.missingIdProperty('idArea'));
            const _id = req.params.IdArea;
            if(!areaService.validarObjectId(_id)) return res.status(400).json(msgHandler.errorIdObject('idArea'));
            
            // const _area = areaModel.findById(_id);
            // if(!_area) return res.status(400).json(msgHandler.sendError('No existe el Area, con el codigo especificado.'));
            await
            areaModel
            .updateOne(
                {_id:new Types.ObjectId(_id)},
                {
                    $set:{
                        Estado:false
                    }
                }
            ).then((data)=>{
                return res.status(200).json(msgHandler.resultCrud(data,'area',enumCrud.actualizar));
            }).catch((err)=>{
                return res.status(400).json(msgHandler.sendError(err));
            })
    },

    /**
     * Realiza el alta de un Area
     *
     * @param {*} req
     * @param {*} res
     * @returns areaModel
     */
    putDarAlta: async (req,res) => {

        if(!areaService.validarObjectId(req.params.IdArea)) return res.status(400).json(msgHandler.missingIdProperty('idArea'));
        const idArea = new Types.ObjectId(req.params.IdArea);
        
        await
        areaModel
        .updateOne(
            {_id:idArea},
            {
                $set:{
                    Estado:true
                }
            }
        ).then((data)=>{
            return res.json(msgHandler.resultCrud(data,'area',enumCrud.actualizar));
        }).catch((err)=>{
            return res.status(400).json(msgHandler.sendError(err));
        })
    }
}