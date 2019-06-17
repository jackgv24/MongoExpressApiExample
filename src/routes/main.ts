import * as express from 'express';
import {permisosRouter} from '../models/permisos/permisoRouter';
import {cargoRouter} from '../models/cargo/cargoRouter';
import {areaRouter} from '../models/area/areaRouter';
import {colaboradorRouter} from '../models/colaboradores/colaboradores.router';

const mainRoute = express.Router();

mainRoute.use('/area',areaRouter);
mainRoute.use('/permiso',permisosRouter);
mainRoute.use('/cargo',cargoRouter);
mainRoute.use('/colaborador',colaboradorRouter);

export {mainRoute};
