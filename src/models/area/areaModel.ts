import { model, Schema } from 'mongoose';

const AreaSchema = new Schema({
    Nombre:{
        type: String,
        unique:true,
        required:true,
        index:true,
        maxlength:20,
        minlength:0
    },
    Descripcion:{
        type:String,
        maxlength:255,
        minlength:0
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
            msg:`La fecha de modificación no puede ser menor a ${this.FechaIngreso}`
        }
    },
    Estado: {
        type: Boolean,
        default: true
    }
});

AreaSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) next(new Error('El nombre del Area debe ser único'));
    if(error) next(error);
    next();
});

export default model('Area',AreaSchema);