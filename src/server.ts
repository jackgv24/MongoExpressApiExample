//inicialización de todas las variables
import * as express from 'express';
import * as config from 'config';
import db from './database/config';
import Chalk from 'chalk';


const app = express();
const PORT = config['PORT'];

//Inicialización de Bases de Datos
db.connect();

app.listen(PORT,()=>{
    console.clear();
    console.log(`Aplicacion escuchando en el puerto ${Chalk.bgGreen(Chalk.black(PORT))}`);
})