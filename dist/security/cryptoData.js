"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Crypto = require("crypto");
const settings_1 = require("../settings/settings");
;
exports.default = new class Safe {
    constructor() {
        this.password = settings_1.SettingsCrypto.key;
        this.IV = Crypto.randomBytes(12);
        this.AAD = Buffer.from('0123456789', 'hex');
    }
    encrypt(data) {
        try {
            const cipher = Crypto
                .createCipheriv('aes-192-ccm', this.password, this.IV, {
                authTagLength: 16
            });
            const ToDataText = JSON.stringify(data);
            cipher.setAAD(this.AAD, {
                plaintextLength: Buffer.byteLength(ToDataText)
            });
            const ciphertext = cipher.update(ToDataText, 'utf8');
            cipher.final();
            let Auth = Array.from(cipher.getAuthTag());
            let Cipher = Array.from(ciphertext);
            return { Cipher, Auth };
        }
        catch (exception) {
            throw new Error(exception.message);
        }
    }
    decrypt(Cipher, Auth) {
        const AuthKey = Buffer.from(Auth), CipherData = Buffer.from(Cipher), decipher = Crypto.createDecipheriv('aes-192-ccm', this.password, this.IV, {
            authTagLength: 16
        });
        decipher.setAuthTag(AuthKey);
        decipher.setAAD(this.AAD, {
            plaintextLength: CipherData.length
        });
        let _Decipher = decipher.update(CipherData, null, 'utf8');
        try {
            decipher.final();
        }
        catch (error) {
            return error;
        }
        return JSON.parse(_Decipher);
    }
};
