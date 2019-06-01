import * as Fawn from 'fawn';
import * as Db from 'mongoose';

class Transaction{
    private Instance:any = null;
    private Task:Fawn.Task;
    constructor(db:any){
        if(this.Instance == null){
            Fawn.init(db,'lan_claro');
            this.Task = new Fawn.Task();
            this.Instance = this;
        }
        return this.Instance;
    }
}

export default Transaction;
