import * as bcrypt from 'bcrypt'
const Salt = 10;

export default new class PwdService {
    encrypPwd(password){
        const pwdSalt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password,pwdSalt);
    }
    comparePwdHashed(NewPwd,OldPwd){
        return bcrypt.compareSync(NewPwd,OldPwd);
    }
    comparePwd(NewPwd,OldPwd){
        return OldPwd == NewPwd;
    }
}