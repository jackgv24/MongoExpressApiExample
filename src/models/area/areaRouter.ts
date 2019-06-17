import * as express from 'express';
import areaController from './areaController';
import errorHandler from '../../middleware/Error/errorHandler';

export const areaRouter = express.Router();
areaRouter
.get('',errorHandler(areaController.getObtener))
.get('/:IdArea',errorHandler(areaController.getBuscarById))
.post('/',errorHandler(areaController.postAgregar))
.put('/:IdArea',errorHandler(areaController.putModificar))
.put('/:IdArea/DarBaja',errorHandler(areaController.putDarBaja))
.put('/:IdArea/DarAlta',errorHandler(areaController.putDarAlta));
