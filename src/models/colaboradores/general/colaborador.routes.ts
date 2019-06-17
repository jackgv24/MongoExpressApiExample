import * as express from 'express';
import colaboradorCtrl from './colaborador.controller';
import errHandler from '../../../middleware/Error/errorHandler';

const colaboradorRouter = express.Router();
colaboradorRouter
.get('/',errHandler(colaboradorCtrl.getObtener))
.post('/',errHandler(colaboradorCtrl.postAgregar))
.put('/:idColaborador/General',errHandler(colaboradorCtrl.putModificarGeneral))
.put('/:idColaborador/Cargo/:idCargo/Agregar',errHandler(colaboradorCtrl.putAgregarCargo))
.put('/:idColaborador/Cargo/:idCargo/Eliminar',errHandler(colaboradorCtrl.putEliminarCargo))
.put('/:idColaborador/Permiso/:idPermiso/Agregar',errHandler(colaboradorCtrl.putAgregarPermiso))
.put('/:idColaborador/Permiso/:idPermiso/Eliminar',errHandler(colaboradorCtrl.putEliminarPermiso));

export {colaboradorRouter}
