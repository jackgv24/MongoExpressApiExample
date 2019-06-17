import * as express from 'express';
import cargoController from './cargoController';
import errorHandler from '../../middleware/Error/errorHandler';

export const cargoRouter = express.Router();
cargoRouter
.get('/',errorHandler(cargoController.getObtener))
.get('/:idCargo',errorHandler(cargoController.getBuscarById))
.get('/:idCargo/Permisos',errorHandler(cargoController.getPermisosById))
.post('/',errorHandler(cargoController.postAgregar))
.put('/:idCargo',errorHandler(cargoController.putModificar))
.put('/:idCargo/Permiso/Agregar',errorHandler(cargoController.putAgregarPermisos))
.put('/:idCargo/Permiso/:idPermiso/Eliminar',errorHandler(cargoController.putEliminarPermiso))
.put('/:idCargo/Alta',errorHandler(cargoController.putDarAlta))
.delete('/:idCargo/Baja',errorHandler(cargoController.deleteDarBaja));