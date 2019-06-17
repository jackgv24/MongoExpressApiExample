"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Fawn = require("fawn");
class Transaction {
    constructor(db) {
        this.Instance = null;
        if (this.Instance == null && db != null) {
            Fawn.init(db, 'globalNet');
            this._Task = new Fawn.Task();
            this.Instance = this;
        }
        return this.Instance;
    }
    Task() {
        return this._Task;
    }
}
exports.default = new Transaction;
