import * as express from 'express';
import prmCtrl from './permisoController';
import errorHandler from '../../middleware/Error/errorHandler';

export const permisosRouter = express.Router();

permisosRouter
.get('',errorHandler(prmCtrl.getBuscar))
.get('/:idPermiso',errorHandler(prmCtrl.getBuscarById))
.post('/',errorHandler(prmCtrl.postAgregar))
.put('/:idPermiso',errorHandler(prmCtrl.putModificar))
.delete('/:idPermiso',errorHandler(prmCtrl.delPermiso));