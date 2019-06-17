
import { model, Schema, SchemaTypes } from 'mongoose';
//FIXME: SE TIENE QUE AGREGAR LOS PERMISOS POR PROCEDIMIENTO ESTO ES UN PROCEDIMIENTO
const 
    TreeItemSchema = new Schema({
        Idx: {
            type:Schema.Types.Number,
            required:true
        },
        Item: {
            type: String,
            required: true
        }
    }),
    PermisoSchema = new Schema({
        Titulo: {
            type: String,
            required: true,
            maxlength:20
        },
        Descripcion: {
            type:String,
            required:false,
            maxlength:255
        },
        Area: {
            type: String,
            required: true,
            maxlength:30
        },
        Tree: {
            type:[TreeItemSchema],
            required:true,
            min: 1
        },
        Path: {
            type: String,
            required: true
        },
        FechaIngreso: {
            type: Date,
            default: new Date()
        },
        FechaModificacion: {
            type: Date,
            default: new Date()
        },
        Estado: {
            type: Boolean,
            default: true,
            required: true
        }
    });


export default model("Permiso",PermisoSchema);