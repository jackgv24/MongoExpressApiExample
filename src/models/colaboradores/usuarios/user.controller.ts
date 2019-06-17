import { Request, Response } from "express";
import {Types} from 'mongoose';
import {SettingsToken as Sttng,App as AppSttng}  from '../../../settings/settings';
import * as JWT from 'jsonwebtoken';
import {msgHandler,crudType as  enumCrud, msgCustom, msgResult} from '../../../helpers/resultHandler/msgHandler';
import pwdSecurity from '../../../security/pwdService';
import {mailPwdResetTemplate as mailReset} from '../../../helpers/templates/mailTemplate';
import Mail from '../../../mail/server.mail';
import ColMdl from '../general/colaborador.model';
import userSrv from "./user.services";
import { IAuth, IChangePwd, IChangeUsername, IUserDisable, IPwdReset, IRecovery,IPwdChange,ITokenDecipher, IRTokenData, ISession} from './user.interface';
import {IColaborador} from '../general/colaborador.interface';
import Crypt,{ICipher} from '../../../security/cryptoData';
import pwdHandler from '../../../security/pwdService';

export default {

    //#region Post
    postAgregarUsuario: async(req:Request,res:Response):Promise<Response> => {
        let {error,value} = <msgCustom<IAuth>>await userSrv.valAgregar(req.params.idColaborador,req.body);
        if(error) return res.status(400).json(msgHandler.sendError(error));

        const 
            idColaborador = new Types.ObjectId(req.params.idColaborador),
            Crypted = pwdSecurity.encrypPwd(value.password);
        console.log(Crypted);

        return await
        ColMdl
        .updateOne(
            {
                _id:idColaborador,
                'User.IsCreated':false,
                Estado:true
            },
            {
                $set:{
                    'User.username':value.username,
                    'User.password':Crypted,
                    'User.IsCreated':true
                }
            }
        )
        .then((data)=>{
            return res.json(msgHandler.resultCrud(data,'Usuario',enumCrud.agregar))
        })
        .catch((err)=>{
            return res.status(400).json(msgHandler.sendError(err));
        })
    },

    postLinkResetPwd: async (req:Request,res:Response): Promise<Response> =>{
        //correo electronico => Body
        //validacion del correo electronico
        const {error,value} = <msgCustom<IPwdReset>>await userSrv.valPwdReset(req.body);
        if(error) return res.status(400).json(msgHandler.sendError(<any>error));
        //obtener el usuario
        const ColDb = <IColaborador>await ColMdl.findOne({"General.Email":value.Email}).lean(true),
        Token:string = JWT.sign(
            {
                Coldt:ColDb["_id"],
                Fecha:Date.now()
            },
            Sttng.privateKey,
            {
                expiresIn:'20m'
            }
        ),
        linkReset:string = `${AppSttng.hostUrl()}/account/reset/${Token}`,
        Recovery:IRecovery = {
            IpSend:req.ip,
            EmailSend: ColDb.General.Email,
            Solicitud:true,
            Token:Token
        };

        //Todo se guarda en el usuario
        await ColMdl.updateOne(
            {
                _id:ColDb._id
            },
            {
                'User.Recovery':Recovery
            }
        ).catch((error:Error)=>{
            return res.status(400).json(msgHandler.sendError(error.message));
        });
        return await Mail.sendMail({
            from:'appgolkii@golkiibpo.com',
            to: ColDb.General.Email,
            subject: `${ColDb.General.Nombre} aquí tienes el enlace para restablecer tu contraseña!`,
            html: mailReset(linkReset)
        })
        .then((data)=>{
            return res.json(msgHandler.sendValue(data));
        })
        .catch((err)=>{
            return res.status(400).json(msgHandler.sendError(err));
        });
    },

    postRestablecerPwd: async (req:Request, res:Response):Promise<Response> =>{
        const {error,value} = <msgCustom<IPwdChange>>await userSrv.valRestablecerPwd(req.body);
        if(error) return res.status(400).json(msgHandler.sendError(error));

        return await
        ColMdl.updateOne(
            {
                _id:value.idColaborador
            },
            {
                $set:{
                    'User.Recovery':null,
                    'User.password': value.Pwd,
                    'User.FechaModificacion': new Date()
                }
            }
        ).then((data)=>{
            return res.json(msgHandler.successUpdate(null));
        }).catch((err)=>{
            res.statusMessage = 'ACTUALIZADO'
            return res.status(200).json(msgHandler.sendError(err));
        });
    },

    postAuth: async (req:Request,res:Response):Promise<Response> =>{
        
        const data = <IAuth>req.body;
        const {error,value} = <msgCustom<IAuth>>await userSrv.valAuth(data);

        let Colaborador = <IColaborador> await ColMdl
        .findOne({'User.username':value.username,'User.Disable':false})
        .lean(true);

        if(!Colaborador) return res.status(401).json(msgHandler.sendError('Usuario no existe'));

        const 
            dataSession = Colaborador.User.Session || null,
            force = value.forceSession || false;
        
        if(!pwdHandler.comparePwdHashed(value.password,Colaborador.User.password)) return res.status(400).json(msgHandler.sendError('Contraseña incorrecta'));
            
        if(dataSession && !force){
            let {error,value} = <msgCustom<ISession>>userSrv.valSession(dataSession);
            if(error) return res.status(400).json(msgHandler.sendError(error));

            let Session:ISession = value;
            if(Session.ValidToken.getTime() >= Date.now()) return res.status(401).json(msgHandler.sendError('Ya existe una session abierta con este usuario'));
        }

            
        //crear un token de retorno
        const 
            refreshToken:string = JWT.sign(
                {},
                Sttng.privateRefreshToken
            ),
            //Se define el tipo de data que se va a ingresar
            _dataToken:ITokenDecipher = {
                Token:refreshToken,
                IpRequest:req.ip,
            },
            //Se cifra los datos que se va a enviar en el token
            {Auth,Cipher} = Crypt.encrypt(_dataToken),
            //Se crea el token que se va a enviar
            token = JWT.sign(
                {  
                    IdCol:Colaborador._id,
                    DCT:Cipher.toString()
                },
                Sttng.privateKey,
                {
                    expiresIn:'20m'
                }
            ),
            //Se crea el objeto de session que se va ingresar en la base de datos
            Session:ISession = {
                DateSession:Date.now(),
                IpSession:req.ip,
                Token:refreshToken,
                Auth: Auth,
                ValidToken: new Date(Date.now() + Sttng.validTimeToken),
                ValidAuth: new Date(Date.now() + Sttng.validAuth),
                Disable:false
            };

        //Se ingresan los datos en la base de datos
        const _result:msgResult = await ColMdl
        .updateOne(
            {
                'User.username': data.username
            },{
                $set:{
                    'User.Session':Session
                }
            }
        )
        .then((res)=>{
            return msgHandler.resultCrud(res,'colaborador',enumCrud.actualizar,'Actualizado');
        })
        .catch((err)=>{
            return msgHandler.sendError(err);
        });

        if(_result.error) return res.status(400).json(_result.error);
        const JwtResult = {
            username:Colaborador.User.username,
            Token:token
        };

        // let decrypt = Crypt.decrypt(Array.from(Cipher),Array.from(Auth));
        // console.log(decrypt);
        return res.json(msgHandler.sendValue(JwtResult));
    },

    postRefreshToken: async (req:Request,res:Response):Promise<Response> =>{

        let{error,value} = <msgCustom<IRTokenData>>userSrv.valRefreshToken(req.body);
        //Se procede a validar si los datos y el token son correctos
        if(error) return res.status(400).json(msgHandler.sendError(error));
        
        //Validamos si existe una session y el usuario esta correcto
        const Colaborador = <IColaborador> await ColMdl.find({_id:value.IdCol,'User.Session.Disable':false}).lean(true);
        if(!Colaborador) return res.status(401).json(msgHandler.sendError("Usuario no posee una sesión activa"));
        const Session = Colaborador.User.Session || null;
        if(!Session) return res.status(401).json(msgHandler.sendError('Usuario no ha iniciado sesión'));

        let valSession:msgCustom<ISession> = userSrv.valSession(Session)
        if(!valSession.error) return res.status(401).json(msgHandler.sendError("Usuario no posee una Session valida activa"));
        
        //Se valida si el token principal
        let _Session = valSession.value;
        if(_Session.ValidAuth.getTime() < Date.now()) return res.status(401).json("Token Invalalido");
        //Deciframos el Token. Si no posee errores vamos al siguiente Step
        let 
            DesCipher,
            DCT = Array.from(value.DCT,(v,k)=>{
                return Number.parseInt(v);
            });
        if((DesCipher = Crypt.decrypt(DCT,Session.Auth)) instanceof Error) return res.status(401).json(msgHandler.sendError("Usuario no posee un token valido"));

        //Validamos si el Refresh Token es valido;
        const dataDescifrada:ITokenDecipher = <ITokenDecipher>JSON.parse(DesCipher);
        if(dataDescifrada.Token != Session.Token) return res.status(401).json(msgHandler.sendError("Usuario no posee un token valido"))

        //Creamos un nuevo token y hacemos un updagrade de la informacion de la base de datos

        const _USession:string|Error = await ColMdl
        .updateOne(
            {
                _id: value.IdCol
            },
            {
                $set:{
                    'User.Session.ValidToken':new Date(Date.now() + Sttng.validTimeToken),
                    'User.Session.validAuth':new Date(Date.now() + Sttng.validAuth)
                }
            }
        ).then((data)=>{
            //Se valida que se encuentre en el formato correcto con la informacion necesario.
            if(data.n==1 && (data["nModified"] == 1 || data["nMatched"] == 1 || data["nUpserted"] == 1) && data.ok ==1) return 'Se ha actualizado correctamente';
            else return Error("Ah ocurrido al momento de actualizar la información");
        }).catch((error)=>{
            if(error instanceof Error) return <Error>error;
            return new Error(error);
        })
        //Se valida que la información se pudo ingresar correctamente
        if(_USession instanceof Error) return res.status(400).json(msgHandler.sendError(error))
        const token = JWT.sign(
            {  
                IdCol:value.IdCol,
                DCT:value.DCT
            },
            Sttng.privateKey,
            {
                expiresIn:'20m'
            }
        )
        return res.json(msgHandler.sendValue(token));
    },

    postLogOut: async(req:Request,res:Response):Promise<Response> =>{
        const {error,value} = <msgCustom<IRTokenData>> userSrv.valLogOut(req.body); 
        if(error) return res.status(400).json(msgHandler.sendError(error));

        return await ColMdl
        .updateOne({
            _id:value.IdCol
        },{
            $set:{
                'User.Session':null
            }
        }).then((data)=>{
            let {error,value} = msgHandler.resultCrud(data,'user',enumCrud.actualizar);
            if(error) return res.status(400).json(msgHandler.sendError(error));
            return res.json(msgHandler.sendValue(true));
        }).catch((error)=>{
            return res.status(400).json(msgHandler.sendError(error));
        });
    },
    //#endregion

    //#region PUT
    putModUser: async(req:Request,res:Response):Promise<Response> =>{
        let {error,value} = <msgCustom<IAuth>>await userSrv.valModUsr(req.params.idColaborador,req.body);
        if(error) return res.status(400).json(msgHandler.sendError(error));

        const 
            idColaborador = new Types.ObjectId(req.params.idColaborador.toString()),
            data = req.body,
            pwdCrypted = pwdSecurity.encrypPwd(value.password);
        let 
            UserData = await ColMdl.findById(idColaborador).lean(true);
        if(!UserData.hasOwnProperty('User')) throw new Error('Este modelo no se puede actualizar debido a la insuficiencia de datos del modelo');
            UserData = UserData.User;

        return await
        ColMdl
        .updateOne(
            {
                _id:idColaborador,
                Estado:true
            },
            {
                $set:{
                    'User.username':value.username,
                    'User.password':pwdCrypted,
                    'User.FechaModificacion':Date.now()
                },
                $push:{
                    Log:{
                        Propiedad:'User',
                        Data:{
                            User:UserData.User
                        },
                        FechaModificacion:Date.now()
                    }
                }
            }
        )
        .then((data)=>{
            return res.json(msgHandler.sendValue(data));
        })
        .catch((err)=>{
            return res.status(400).json(msgHandler.sendError(err));
        })
    },

    putModUserName: async(req:Request,res:Response):Promise<Response> => {
        let {error,value} = <msgCustom<IChangeUsername>>await userSrv.valModUsrName(req.params.idColaborador,req.body);
        if(error) return res.status(400).json(msgHandler.sendError(error));
        
        const idColaborador = new Types.ObjectId(req.params.idColaborador);

        return await
        ColMdl
        .updateOne(
            {
                _id:idColaborador,
                'User.User':value.OldUser
            },
            {
                $set:{
                    'User.User':value.NewUser,
                    'User.FechaModificacion':Date.now()
                }
            }
        )
        .then((data)=>{return res.json(msgHandler.sendValue(data))})
        .catch((err)=>{return res.status(400).json(msgHandler.sendError(err))});
    },

    putChangePwd: async(req:Request,res:Response):Promise<Response>=>{
        const {error,value} = <msgCustom<IChangePwd>>await userSrv.valChangePwd(req.params.idColaborador,req.body);
        if(error) return res.status(400).json(msgHandler.sendError(error));

        let 
            idColaborador = new Types.ObjectId(req.params.idColaborador),
            data = value;
        
        return await
        ColMdl
        .updateOne
        (
            {
                _id:idColaborador,'User.username':value.username
            },
            {
                $set:{
                    'User.password':value.NewPwd,
                    'User.FechaModificacion':Date.now()
                }
            }
        )
        .then((data)=>{
            return res.json(msgHandler.resultCrud(data,'Usuario',enumCrud.actualizar));
        })
        .catch((err)=>{
            return res.status(400).json(msgHandler.sendError(err));
        })
    },

    putDisableUser: async(req:Request,res:Response):Promise<Response>=>{
        const {error,value} = <msgCustom<IUserDisable>>await userSrv.valUserDisable(req.params.idColaborador,req.body);
        if(error) return res.status(400).json(msgHandler.sendError(error));
        const idColaborador = new Types.ObjectId(req.params.idColaborador);
        
        return await 
        ColMdl
        .updateOne(
            {
                _id:idColaborador,
                'User.username':value.username
            },
            {
                $set:{
                    'User.Disable':true,
                    'User.FechaModificacion':Date.now()
                }
            }
        ).then((data)=>{
            return res.json(msgHandler.sendValue(data));
        }).catch((err)=>{
            return res.status(400).json(msgHandler.sendError(err));
        });
    },

    putAbleUser: async(req:Request,res:Response):Promise<Response>=>{
        const {error,value} = <msgCustom<IUserDisable>>await userSrv.valUserAble(req.params.idColaborador,req.body);
        if(error) return res.status(400).json(msgHandler.sendError(error));
        const idColaborador = new Types.ObjectId(req.params.idColaborador);
        
        return await
        ColMdl
        .updateOne(
            {
                _id:idColaborador,
                'User.username':value.username
            },
            {
                $set:{
                    'User.Disable':false,
                    'User.FechaModificacion':Date.now()
                }
            }
        ).then((data)=>{
            return res.json(msgHandler.sendValue(data));
        }).catch((err)=>{
            return res.status(400).json(msgHandler.sendError(err));
        });
    }
    //#endregion


}