"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const InsumoShema = new mongoose_1.Schema({
    Tipo: {
        type: String,
        required: true,
        enum: ['Gasolina', 'Transporte', 'Alimento']
    },
    Observacion: {
        type: String,
        required: function () {
            return this.Tipo != 'Alimento';
        },
        min: 10,
        max: 50
    },
    Valor: {
        type: Number,
        required: true,
        min: 0,
        max: 5000
    },
    Kilometro: {
        type: Number,
        required: function () {
            return this.Tipo == 'Gasolina';
        },
        min: 0,
        max: 2000
    }
}), DemografiaSchema = new mongoose_1.Schema({
    Departamento: {
        type: String,
        required: true
    },
    Municipio: {
        type: String,
        required: true
    }
}), HojaRutaSchema = new mongoose_1.Schema({
    Colaborador: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'colaboradores',
        index: true,
        required: true
    },
    Descripcion: {
        type: String,
        min: 0,
        max: 255
    },
    Demografia: {
        type: DemografiaSchema,
        required: true,
        default: {
            Departamento: 'Managua',
            Municipio: 'Managua'
        }
    },
    Casos: {
        type: [String],
        required: true,
        min: 1,
        max: 50
    },
    Insumos: {
        type: [InsumoShema],
        min: 1,
        required: true
    },
    FechaSalida: {
        type: Date,
        default: new Date(),
        required: true,
        validate: {
            validator: function (fecha) {
                return new Date() >= fecha;
            },
            message: 'La fecha tiene que ser menor a la fecha y hora actual actual'
        }
    },
    FechaData: {
        type: Date,
        default: Date.now()
    },
    Estado: {
        type: Boolean,
        default: true,
        required: true
    }
});
exports.default = mongoose_1.model('Ruta', HojaRutaSchema);
