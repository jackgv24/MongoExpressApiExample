import {model,Schema}  from 'mongoose';

const FuncionesSchema = new Schema({
    Descripcion: {
        type:String,
        maxlength:255,
        required: true
    },
    Estado: {
        type: Boolean,
        default: true
    },
    FechaModificacion: {
        type: Date,
        default: Date.now()
    }
});

const PermisoSchema = new Schema({
    IdPermiso:{
        type: Schema.Types.ObjectId,
        ref:'Permisos',
        required:true
    },
    Estado: {
        type:Boolean,
        required:true,
        default: true
    },
    FechaModificacion:{
        type:Date,
        default:Date.now()
    }
});

const CargoSchema = new Schema({
    Nombre: {
        type: String,
        unique: true,
        index: true,
        required: true,
        maxlength: 20
    },
    Area:{
        type:String,
        required:true
    },
    Descripcion: {
        type: String,
        maxlength: 255
    },
    Parent: {
        type: String
    },
    Funciones: {
        type: [FuncionesSchema],
        min: 1,
        required:true,
        default:[]
    },
    Permisos: {
        type: [PermisoSchema],
        default: []
    },
    FechaIngreso: {
        type: Date,
        default: Date.now()
    },
    FechaModificacion: {
        type: Date,
        default: Date.now(),
        validate: {
            validator: function (v) {
                return v >= this.FechaIngreso
            },
            msg: `La fecha de modificación no puede ser menor a ${this.FechaIngreso}`
        }
    },
    Estado: {
        type: Boolean,
        default: true
    }
});

export default model('Cargo',CargoSchema);