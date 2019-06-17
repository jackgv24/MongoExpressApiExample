import * as Fawn from 'fawn';
import * as Db from 'mongoose';

class Transaction{
    private Instance:any = null;
    private _Task:Fawn.Task;
    constructor(db?:any){
        if(this.Instance == null && db != null){
            Fawn.init(db,'globalNet');
            this._Task = new Fawn.Task();
            this.Instance = this;
        }
        return this.Instance; 
    }
    Task(){
        return this._Task;
    }
}

export default new Transaction;
