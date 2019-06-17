import {IUser} from '../usuarios/user.interface'
import { string, boolean } from 'joi';
import { ObjectId } from 'bson';

interface IPermiso {
    IdPermiso:string,
    IsFrom:string,
    FechaModificacion:Date
}

interface IPerfil {
    Foto:string,
    Settings:{
        DarkMode?:boolean,
        SideBar?:boolean
    }
}

interface IGeneral {
    Nombre:string,
    Apellido:string,
    Cedula:string,
    Email:string
}

interface ILog {
    FechaModificacion:Date,
    Propiedad:string,
    Data:JSON
}

interface ICargo{
    IdCargo:string,
    Estado:boolean,
    FechaIngreso:Date
}

export interface IColaborador {
    _id:string,
    General:IGeneral,
    Cargo:ICargo,
    Permisos:ICargo[],
    User:IUser,
    Perfil:IPerfil,
    Estado:boolean,
    Log:ILog[]
}