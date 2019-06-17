import * as Config from 'config';

export const Rutas = {
    maxData:1000
}, 
SettingsToken = {
    privateKey:Config["PRIVATEKEY"],
    privateRefreshToken:Config["REFRESHTOKEN"],
    validTimeToken:1500000,
    validAuth:1260000
},
SettingsCrypto = {
    key:Config["KEYCRYPT"]
},
App = {
    host:"http://golkiibpo.com",
    port:3000,
    hostUrl: function(){
        return `${this.host}:${this.port}`
    }
}