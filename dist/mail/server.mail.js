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
const nodemailer_1 = require("nodemailer");
const msgHandler_1 = require("../helpers/resultHandler/msgHandler");
;
;
function createHtmlOptions(Destinatario, Subject, Html) {
    return {
        from: 'appgolkii@golkiibpo.com',
        to: Destinatario,
        subject: Subject,
        html: Html
    };
}
exports.createHtmlOptions = createHtmlOptions;
const mailConfig = {
    host: "golkiibpo.com",
    port: 465,
    secure: true,
    auth: {
        user: "appgolkii@golkiibpo.com",
        pass: "3l@dIfBBedZF"
    }
};
class serverMail {
    constructor() {
        //Variables
        this.server = null;
        this.sendMail = (data) => __awaiter(this, void 0, void 0, function* () {
            return yield this
                .server
                .sendMail(data)
                .then((data) => {
                return msgHandler_1.msgHandler.sendValue(data);
            })
                .catch((err) => {
                return msgHandler_1.msgHandler.sendError(err);
            });
        });
        if (this.server == null) {
            this.server = nodemailer_1.createTransport(mailConfig);
        }
    }
}
exports.default = new serverMail;
