"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcrypt");
const Salt = 10;
exports.default = new class PwdService {
    encrypPwd(password) {
        const pwdSalt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, pwdSalt);
    }
    comparePwdHashed(NewPwd, OldPwd) {
        return bcrypt.compareSync(NewPwd, OldPwd);
    }
    comparePwd(NewPwd, OldPwd) {
        return OldPwd == NewPwd;
    }
};
