"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const settings_1 = require("../../../settings/settings");
const JWT = require("jsonwebtoken");
const msgHandler_1 = require("../../../helpers/resultHandler/msgHandler");
const pwdService_1 = require("../../../security/pwdService");
const mailTemplate_1 = require("../../../helpers/templates/mailTemplate");
const server_mail_1 = require("../../../mail/server.mail");
const colaborador_model_1 = require("../general/colaborador.model");
const user_services_1 = require("./user.services");
const cryptoData_1 = require("../../../security/cryptoData");
const pwdService_2 = require("../../../security/pwdService");
exports.default = {
    //#region Post
    postAgregarUsuario: (req, res) => __awaiter(this, void 0, void 0, function* () {
        let { error, value } = yield user_services_1.default.valAgregar(req.params.idColaborador, req.body);
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        const idColaborador = new mongoose_1.Types.ObjectId(req.params.idColaborador), Crypted = pwdService_1.default.encrypPwd(value.password);
        console.log(Crypted);
        return yield colaborador_model_1.default
            .updateOne({
            _id: idColaborador,
            'User.IsCreated': false,
            Estado: true
        }, {
            $set: {
                'User.username': value.username,
                'User.password': Crypted,
                'User.IsCreated': true
            }
        })
            .then((data) => {
            return res.json(msgHandler_1.msgHandler.resultCrud(data, 'Usuario', msgHandler_1.crudType.agregar));
        })
            .catch((err) => {
            return res.status(400).json(msgHandler_1.msgHandler.sendError(err));
        });
    }),
    postLinkResetPwd: (req, res) => __awaiter(this, void 0, void 0, function* () {
        //correo electronico => Body
        //validacion del correo electronico
        const { error, value } = yield user_services_1.default.valPwdReset(req.body);
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        //obtener el usuario
        const ColDb = yield colaborador_model_1.default.findOne({ "General.Email": value.Email }).lean(true), Token = JWT.sign({
            Coldt: ColDb["_id"],
            Fecha: Date.now()
        }, settings_1.SettingsToken.privateKey, {
            expiresIn: '20m'
        }), linkReset = `${settings_1.App.hostUrl()}/account/reset/${Token}`, Recovery = {
            IpSend: req.ip,
            EmailSend: ColDb.General.Email,
            Solicitud: true,
            Token: Token
        };
        //Todo se guarda en el usuario
        yield colaborador_model_1.default.updateOne({
            _id: ColDb._id
        }, {
            'User.Recovery': Recovery
        }).catch((error) => {
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error.message));
        });
        return yield server_mail_1.default.sendMail({
            from: 'appgolkii@golkiibpo.com',
            to: ColDb.General.Email,
            subject: `${ColDb.General.Nombre} aquí tienes el enlace para restablecer tu contraseña!`,
            html: mailTemplate_1.mailPwdResetTemplate(linkReset)
        })
            .then((data) => {
            return res.json(msgHandler_1.msgHandler.sendValue(data));
        })
            .catch((err) => {
            return res.status(400).json(msgHandler_1.msgHandler.sendError(err));
        });
    }),
    postRestablecerPwd: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { error, value } = yield user_services_1.default.valRestablecerPwd(req.body);
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        return yield colaborador_model_1.default.updateOne({
            _id: value.idColaborador
        }, {
            $set: {
                'User.Recovery': null,
                'User.password': value.Pwd,
                'User.FechaModificacion': new Date()
            }
        }).then((data) => {
            return res.json(msgHandler_1.msgHandler.successUpdate(null));
        }).catch((err) => {
            res.statusMessage = 'ACTUALIZADO';
            return res.status(200).json(msgHandler_1.msgHandler.sendError(err));
        });
    }),
    postAuth: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const data = req.body;
        const { error, value } = yield user_services_1.default.valAuth(data);
        let Colaborador = yield colaborador_model_1.default
            .findOne({ 'User.username': value.username, 'User.Disable': false })
            .lean(true);
        if (!Colaborador)
            return res.status(401).json(msgHandler_1.msgHandler.sendError('Usuario no existe'));
        const dataSession = Colaborador.User.Session || null, force = value.forceSession || false;
        if (!pwdService_2.default.comparePwdHashed(value.password, Colaborador.User.password))
            return res.status(400).json(msgHandler_1.msgHandler.sendError('Contraseña incorrecta'));
        if (dataSession && !force) {
            let { error, value } = user_services_1.default.valSession(dataSession);
            if (error)
                return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
            let Session = value;
            if (Session.ValidToken.getTime() >= Date.now())
                return res.status(401).json(msgHandler_1.msgHandler.sendError('Ya existe una session abierta con este usuario'));
        }
        //crear un token de retorno
        const refreshToken = JWT.sign({}, settings_1.SettingsToken.privateRefreshToken), 
        //Se define el tipo de data que se va a ingresar
        _dataToken = {
            Token: refreshToken,
            IpRequest: req.ip,
        }, 
        //Se cifra los datos que se va a enviar en el token
        { Auth, Cipher } = cryptoData_1.default.encrypt(_dataToken), 
        //Se crea el token que se va a enviar
        token = JWT.sign({
            IdCol: Colaborador._id,
            DCT: Cipher.toString()
        }, settings_1.SettingsToken.privateKey, {
            expiresIn: '20m'
        }), 
        //Se crea el objeto de session que se va ingresar en la base de datos
        Session = {
            DateSession: Date.now(),
            IpSession: req.ip,
            Token: refreshToken,
            Auth: Auth,
            ValidToken: new Date(Date.now() + settings_1.SettingsToken.validTimeToken),
            ValidAuth: new Date(Date.now() + settings_1.SettingsToken.validAuth),
            Disable: false
        };
        //Se ingresan los datos en la base de datos
        const _result = yield colaborador_model_1.default
            .updateOne({
            'User.username': data.username
        }, {
            $set: {
                'User.Session': Session
            }
        })
            .then((res) => {
            return msgHandler_1.msgHandler.resultCrud(res, 'colaborador', msgHandler_1.crudType.actualizar, 'Actualizado');
        })
            .catch((err) => {
            return msgHandler_1.msgHandler.sendError(err);
        });
        if (_result.error)
            return res.status(400).json(_result.error);
        const JwtResult = {
            username: Colaborador.User.username,
            Token: token
        };
        // let decrypt = Crypt.decrypt(Array.from(Cipher),Array.from(Auth));
        // console.log(decrypt);
        return res.json(msgHandler_1.msgHandler.sendValue(JwtResult));
    }),
    postRefreshToken: (req, res) => __awaiter(this, void 0, void 0, function* () {
        let { error, value } = user_services_1.default.valRefreshToken(req.body);
        //Se procede a validar si los datos y el token son correctos
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        //Validamos si existe una session y el usuario esta correcto
        const Colaborador = yield colaborador_model_1.default.find({ _id: value.IdCol, 'User.Session.Disable': false }).lean(true);
        if (!Colaborador)
            return res.status(401).json(msgHandler_1.msgHandler.sendError("Usuario no posee una sesión activa"));
        const Session = Colaborador.User.Session || null;
        if (!Session)
            return res.status(401).json(msgHandler_1.msgHandler.sendError('Usuario no ha iniciado sesión'));
        let valSession = user_services_1.default.valSession(Session);
        if (!valSession.error)
            return res.status(401).json(msgHandler_1.msgHandler.sendError("Usuario no posee una Session valida activa"));
        //Se valida si el token principal
        let _Session = valSession.value;
        if (_Session.ValidAuth.getTime() < Date.now())
            return res.status(401).json("Token Invalalido");
        //Deciframos el Token. Si no posee errores vamos al siguiente Step
        let DesCipher, DCT = Array.from(value.DCT, (v, k) => {
            return Number.parseInt(v);
        });
        if ((DesCipher = cryptoData_1.default.decrypt(DCT, Session.Auth)) instanceof Error)
            return res.status(401).json(msgHandler_1.msgHandler.sendError("Usuario no posee un token valido"));
        //Validamos si el Refresh Token es valido;
        const dataDescifrada = JSON.parse(DesCipher);
        if (dataDescifrada.Token != Session.Token)
            return res.status(401).json(msgHandler_1.msgHandler.sendError("Usuario no posee un token valido"));
        //Creamos un nuevo token y hacemos un updagrade de la informacion de la base de datos
        const _USession = yield colaborador_model_1.default
            .updateOne({
            _id: value.IdCol
        }, {
            $set: {
                'User.Session.ValidToken': new Date(Date.now() + settings_1.SettingsToken.validTimeToken),
                'User.Session.validAuth': new Date(Date.now() + settings_1.SettingsToken.validAuth)
            }
        }).then((data) => {
            //Se valida que se encuentre en el formato correcto con la informacion necesario.
            if (data.n == 1 && (data["nModified"] == 1 || data["nMatched"] == 1 || data["nUpserted"] == 1) && data.ok == 1)
                return 'Se ha actualizado correctamente';
            else
                return Error("Ah ocurrido al momento de actualizar la información");
        }).catch((error) => {
            if (error instanceof Error)
                return error;
            return new Error(error);
        });
        //Se valida que la información se pudo ingresar correctamente
        if (_USession instanceof Error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        const token = JWT.sign({
            IdCol: value.IdCol,
            DCT: value.DCT
        }, settings_1.SettingsToken.privateKey, {
            expiresIn: '20m'
        });
        return res.json(msgHandler_1.msgHandler.sendValue(token));
    }),
    postLogOut: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { error, value } = user_services_1.default.valLogOut(req.body);
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        return yield colaborador_model_1.default
            .updateOne({
            _id: value.IdCol
        }, {
            $set: {
                'User.Session': null
            }
        }).then((data) => {
            let { error, value } = msgHandler_1.msgHandler.resultCrud(data, 'user', msgHandler_1.crudType.actualizar);
            if (error)
                return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
            return res.json(msgHandler_1.msgHandler.sendValue(true));
        }).catch((error) => {
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        });
    }),
    //#endregion
    //#region PUT
    putModUser: (req, res) => __awaiter(this, void 0, void 0, function* () {
        let { error, value } = yield user_services_1.default.valModUsr(req.params.idColaborador, req.body);
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        const idColaborador = new mongoose_1.Types.ObjectId(req.params.idColaborador.toString()), data = req.body, pwdCrypted = pwdService_1.default.encrypPwd(value.password);
        let UserData = yield colaborador_model_1.default.findById(idColaborador).lean(true);
        if (!UserData.hasOwnProperty('User'))
            throw new Error('Este modelo no se puede actualizar debido a la insuficiencia de datos del modelo');
        UserData = UserData.User;
        return yield colaborador_model_1.default
            .updateOne({
            _id: idColaborador,
            Estado: true
        }, {
            $set: {
                'User.username': value.username,
                'User.password': pwdCrypted,
                'User.FechaModificacion': Date.now()
            },
            $push: {
                Log: {
                    Propiedad: 'User',
                    Data: {
                        User: UserData.User
                    },
                    FechaModificacion: Date.now()
                }
            }
        })
            .then((data) => {
            return res.json(msgHandler_1.msgHandler.sendValue(data));
        })
            .catch((err) => {
            return res.status(400).json(msgHandler_1.msgHandler.sendError(err));
        });
    }),
    putModUserName: (req, res) => __awaiter(this, void 0, void 0, function* () {
        let { error, value } = yield user_services_1.default.valModUsrName(req.params.idColaborador, req.body);
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        const idColaborador = new mongoose_1.Types.ObjectId(req.params.idColaborador);
        return yield colaborador_model_1.default
            .updateOne({
            _id: idColaborador,
            'User.User': value.OldUser
        }, {
            $set: {
                'User.User': value.NewUser,
                'User.FechaModificacion': Date.now()
            }
        })
            .then((data) => { return res.json(msgHandler_1.msgHandler.sendValue(data)); })
            .catch((err) => { return res.status(400).json(msgHandler_1.msgHandler.sendError(err)); });
    }),
    putChangePwd: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { error, value } = yield user_services_1.default.valChangePwd(req.params.idColaborador, req.body);
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        let idColaborador = new mongoose_1.Types.ObjectId(req.params.idColaborador), data = value;
        return yield colaborador_model_1.default
            .updateOne({
            _id: idColaborador, 'User.username': value.username
        }, {
            $set: {
                'User.password': value.NewPwd,
                'User.FechaModificacion': Date.now()
            }
        })
            .then((data) => {
            return res.json(msgHandler_1.msgHandler.resultCrud(data, 'Usuario', msgHandler_1.crudType.actualizar));
        })
            .catch((err) => {
            return res.status(400).json(msgHandler_1.msgHandler.sendError(err));
        });
    }),
    putDisableUser: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { error, value } = yield user_services_1.default.valUserDisable(req.params.idColaborador, req.body);
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        const idColaborador = new mongoose_1.Types.ObjectId(req.params.idColaborador);
        return yield colaborador_model_1.default
            .updateOne({
            _id: idColaborador,
            'User.username': value.username
        }, {
            $set: {
                'User.Disable': true,
                'User.FechaModificacion': Date.now()
            }
        }).then((data) => {
            return res.json(msgHandler_1.msgHandler.sendValue(data));
        }).catch((err) => {
            return res.status(400).json(msgHandler_1.msgHandler.sendError(err));
        });
    }),
    putAbleUser: (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { error, value } = yield user_services_1.default.valUserAble(req.params.idColaborador, req.body);
        if (error)
            return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
        const idColaborador = new mongoose_1.Types.ObjectId(req.params.idColaborador);
        return yield colaborador_model_1.default
            .updateOne({
            _id: idColaborador,
            'User.username': value.username
        }, {
            $set: {
                'User.Disable': false,
                'User.FechaModificacion': Date.now()
            }
        }).then((data) => {
            return res.json(msgHandler_1.msgHandler.sendValue(data));
        }).catch((err) => {
            return res.status(400).json(msgHandler_1.msgHandler.sendError(err));
        });
    })
    //#endregion
};
