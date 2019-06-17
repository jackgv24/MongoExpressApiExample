"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const user_controller_1 = require("./user.controller");
const errorHandler_1 = require("../../../middleware/Error/errorHandler");
const userRouter = express.Router();
exports.userRouter = userRouter;
userRouter
    .post('/:idColaborador/agregar/', errorHandler_1.default(user_controller_1.default.postAgregarUsuario))
    .put('/:idColaborador/modificar', errorHandler_1.default(user_controller_1.default.putModUser))
    .put('/:idColaborador/usuario/cambio/username', errorHandler_1.default(user_controller_1.default.putModUserName))
    .put('/:idColaborador/usuario/cambio/pwd', errorHandler_1.default(user_controller_1.default.putChangePwd))
    .put('/:idColaborador/usuario/cambio/pwd', errorHandler_1.default(user_controller_1.default.putDisableUser))
    .post('/password/link', errorHandler_1.default(user_controller_1.default.postLinkResetPwd))
    .post('/password/reset', errorHandler_1.default(user_controller_1.default.postRestablecerPwd))
    .post('/auth', errorHandler_1.default(user_controller_1.default.postAuth))
    .post('/auth/refresh', errorHandler_1.default(user_controller_1.default.postRefreshToken));
