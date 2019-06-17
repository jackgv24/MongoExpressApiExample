"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JWT = require("jsonwebtoken");
const settings_1 = require("../../settings/settings");
const tokenHelpers_1 = require("../../helpers/Token/tokenHelpers");
const user_services_1 = require("../../models/colaboradores/usuarios/user.services");
const msgHandler_1 = require("../../helpers/resultHandler/msgHandler");
function authToken(req, res, next) {
    const Token = tokenHelpers_1.getTokenFromRequest(req);
    var Decode;
    try {
        Decode = JWT.verify(Token, settings_1.SettingsToken.privateKey);
    }
    catch (error) {
        if (error instanceof JWT.JsonWebTokenError) {
            return res.status(401).json(msgHandler_1.msgHandler.resultToken(msgHandler_1.tokenType.expired));
        }
        return res.status(400).json(msgHandler_1.msgHandler.sendError(error));
    }
    const _result = user_services_1.default.valMiddleToken(Decode);
    if (_result instanceof Error) {
        return res.status(401).json(msgHandler_1.msgHandler.resultToken(msgHandler_1.tokenType.corrupted));
    }
    else {
        next();
    }
}
exports.authToken = authToken;
