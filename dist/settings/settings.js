"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config = require("config");
exports.Rutas = {
    maxData: 1000
}, exports.SettingsToken = {
    privateKey: Config["PRIVATEKEY"],
    privateRefreshToken: Config["REFRESHTOKEN"],
    validTimeToken: 1500000,
    validAuth: 1260000
}, exports.SettingsCrypto = {
    key: Config["KEYCRYPT"]
}, exports.App = {
    host: "http://golkiibpo.com",
    port: 3000,
    hostUrl: function () {
        return `${this.host}:${this.port}`;
    }
};
