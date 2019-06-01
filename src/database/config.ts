import * as config from 'config';
import Transaction from '../database/transactions';
import * as db from 'mongoose';
import chalk from 'chalk';
import * as Winston from 'winston';
import * as Path from 'path'
const 
    Log = Winston.createLogger({
        transports:[
            new Winston.transports.File({filename:Path.join(__dirname,"../log/db.log")})
        ]
    });

class Database {
    protected uriMongo:string = config["MONGO_URI"];
    protected conSttng:any = { 
        useCreateIndex: true,
        useNewUrlParser: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1500
    };

    async connect(){
        if(db.connection.readyState == 0) {
            db
            .connect(this.uriMongo,this.conSttng)
            .then(()=> {
                new Transaction(db);
            })
            .catch((err)=>{
                Log.error(err);
            });
        }
    }

    setMonitor(){
        db.connection.on('connected',()=>{
            console.log('Base de datos: '+chalk.bgGreen(chalk.black(' Conectada ')));
        });
        db.connection.on('disconnected', (err) =>{
                console.log('Base de datos: '+chalk.yellow('Desconectada'));
                Log.error(err);
        });
        db.connection.on('error', function(err){
                console.log(`Base de datos: ${chalk.red(err)} error`);
                Log.error(err);
        });
    }
}

export default new Database;