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
const config = require("config");
const transactions_1 = require("../database/transactions");
const db = require("mongoose");
const chalk_1 = require("chalk");
const Winston = require("winston");
const Path = require("path");
const Log = Winston.createLogger({
    transports: [
        new Winston.transports.File({ filename: Path.join(__dirname, "../log/db.log") })
    ]
});
class Database {
    constructor() {
        this.uriMongo = config["MONGO_URI"];
        this.conSttng = {
            useCreateIndex: true,
            useNewUrlParser: true,
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 1500
        };
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (db.connection.readyState == 0) {
                db
                    .connect(this.uriMongo, this.conSttng)
                    .then(() => {
                    new transactions_1.default(db);
                })
                    .catch((err) => {
                    Log.error(err);
                });
            }
        });
    }
    setMonitor() {
        db.connection.on('connected', () => {
            console.log('Base de datos: ' + chalk_1.default.bgGreen(chalk_1.default.black(' Conectada ')));
        });
        db.connection.on('disconnected', (err) => {
            console.log('Base de datos: ' + chalk_1.default.yellow('Desconectada'));
            Log.error(err);
        });
        db.connection.on('error', function (err) {
            console.log(`Base de datos: ${chalk_1.default.red(err)} error`);
            Log.error(err);
        });
    }
}
exports.default = new Database;
