import * as dotenv from 'dotenv';
import * as express from 'express';
import * as config from "config";
import * as path from "path";
import * as morgan from "morgan";
import * as Winston from "winston";
import * as helmet from 'helmet';
const logger = Winston.createLogger({
    transports:[
        new Winston.transports.File({filename:path.join(__dirname,"../log/errors.log")})
    ]
});

//inicializacion de data
dotenv.config();

//inicializacion de web api
import {mainRoute} from './routes/main';
import {database} from './database/config';
import {msgHandler} from './helpers/resultHandler/msgHandler';
const app = express();

//inicialización de la base de datos
database.connect();

//Asignación de variables
const PORT = config.PORT;

//Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

//Cors
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Routing
app.use('/api',mainRoute);
app.use("*",(req,res)=>{
    return res.status(404).send(msgHandler.sendError('La ruta indicada no se encuentra estipulada'));
});

//Errors
app.use((error,req,res,next)=>{
    logger.log('error',error);
    if(error && error.hasOwnProperty('errmsg')) return res.status(400).json(msgHandler.sendError(error.errmsg));
    if(error) return res.status(500).json(msgHandler.sendError(error));
})

//inicio del servidor en un puerto
app.listen(PORT,()=>{
    if(app.get('env') == 'development'){
        console.clear();
        console.log(`Aplicación corriendo en el puerto ${PORT}`);
    }
});