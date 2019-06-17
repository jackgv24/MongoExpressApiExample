
import * as express from 'express';
import {colaboradorRouter as generalRouter} from './general/colaborador.routes';
import {userRouter} from './usuarios/user.route';

const colaboradorRouter = express.Router();
colaboradorRouter.use('/general',generalRouter);
colaboradorRouter.use('/user',userRouter);

export {colaboradorRouter};