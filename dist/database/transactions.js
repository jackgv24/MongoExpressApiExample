"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fawn = require("fawn");
class Transaction {
    constructor(db) {
        this.Instance = null;
        if (this.Instance == null) {
            Fawn.init(db, 'lan_claro');
            this.Task = new Fawn.Task();
            this.Instance = this;
        }
        return this.Instance;
    }
}
exports.default = Transaction;
