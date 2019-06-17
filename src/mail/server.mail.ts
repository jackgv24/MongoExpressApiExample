import { Transporter, createTransport } from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';
import {msgResult, msgHandler} from '../helpers/resultHandler/msgHandler';

export interface ISendOptions extends MailOptions{};
interface IServer {
    host:string,
    port:number,
    secure:boolean
    auth:{user:string,pass:string}
};

export function createHtmlOptions(Destinatario:string,Subject:string,Html:string):ISendOptions {
    return <ISendOptions> {
        from:'appgolkii@golkiibpo.com',
        to: Destinatario,
        subject: Subject,
        html: Html
    }
}

const mailConfig:IServer = {
    host:"golkiibpo.com",
    port:465,
    secure:true,
    auth:{
        user: "appgolkii@golkiibpo.com",
        pass: "3l@dIfBBedZF"
    }
}

class serverMail {
    //Variables
    private server:Transporter = null;

    constructor(){
        if(this.server == null) {
            this.server = createTransport(mailConfig);
        }
    }
    
    public sendMail = async(data:MailOptions):Promise<msgResult> => {
        return await
        this
        .server
        .sendMail(data)
        .then((data)=>{
            return msgHandler.sendValue(data);
        })
        .catch((err)=>{
            return msgHandler.sendError(err);
        })
    }
}

export default new serverMail;