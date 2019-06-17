import {Request} from 'express';
export function getTokenFromRequest(req:Request):string{
    // console.log(req);
    let Regex:RegExp = /(\w+\.\w+\.\w+)/;
    const headerReq:[string] | string = req.headers['authorization'] || null;

    let Token:string,m:any; 
    if (Array.isArray(headerReq)){
        Token = headerReq.find((item:string)=>{
            if((m=Regex.exec(item))!= null){
                return true;
            }
            return false;
        }) || null;
    } else {
        if((m=Regex.exec(headerReq)) != null){
            Token = m[0];
        }
    }
    return Token;
}