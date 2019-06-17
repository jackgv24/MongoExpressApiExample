import {Request,Response,NextFunction} from 'express';
import * as JWT from 'jsonwebtoken';
import {SettingsToken as sttng} from '../../settings/settings';
import {getTokenFromRequest} from '../../helpers/Token/tokenHelpers';
import { ITokenData, IToken } from '../../models/colaboradores/usuarios/user.interface';
import userSrvs from '../../models/colaboradores/usuarios/user.services';
import { msgHandler, tokenType } from '../../helpers/resultHandler/msgHandler';

export function authToken(req:Request,res:Response,next:NextFunction) {
    const Token = getTokenFromRequest(req);
    var Decode;
    try {
        Decode = JWT.verify(Token,sttng.privateKey);
    } catch (error) {
        if(error instanceof JWT.JsonWebTokenError){
            return res.status(401).json(msgHandler.resultToken(tokenType.expired));
        }
        return res.status(400).json(msgHandler.sendError(error));
    }
    const _result:ITokenData|Error = userSrvs.valMiddleToken(Decode);
    if(_result instanceof Error){
        return res.status(401).json(msgHandler.resultToken(tokenType.corrupted));
    } else {
        next();
    }
    
}