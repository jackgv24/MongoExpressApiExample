import * as express from 'express';
import usrCtrl from './user.controller';
import errorHandler from '../../../middleware/Error/errorHandler';
import {authToken} from '../../../middleware/Auth/Auth.middleware';
const 
    userRouter = express.Router();

userRouter
.post('/:idColaborador/agregar/',errorHandler(usrCtrl.postAgregarUsuario))
.put('/:idColaborador/modificar',errorHandler(usrCtrl.putModUser))
.put('/:idColaborador/usuario/cambio/username',errorHandler(usrCtrl.putModUserName))
.put('/:idColaborador/usuario/cambio/pwd',errorHandler(usrCtrl.putChangePwd))
.put('/:idColaborador/usuario/cambio/pwd',errorHandler(usrCtrl.putDisableUser))
.post('/password/link',errorHandler(usrCtrl.postLinkResetPwd))
.post('/password/reset',errorHandler(usrCtrl.postRestablecerPwd))
.post('/auth',errorHandler(usrCtrl.postAuth))
.post('/auth/refresh',errorHandler(usrCtrl.postRefreshToken));

export {userRouter};
