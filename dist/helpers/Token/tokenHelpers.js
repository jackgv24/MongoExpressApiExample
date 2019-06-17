"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getTokenFromRequest(req) {
    // console.log(req);
    let Regex = /(\w+\.\w+\.\w+)/;
    const headerReq = req.headers['authorization'] || null;
    let Token, m;
    if (Array.isArray(headerReq)) {
        Token = headerReq.find((item) => {
            if ((m = Regex.exec(item)) != null) {
                return true;
            }
            return false;
        }) || null;
    }
    else {
        if ((m = Regex.exec(headerReq)) != null) {
            Token = m[0];
        }
    }
    return Token;
}
exports.getTokenFromRequest = getTokenFromRequest;
