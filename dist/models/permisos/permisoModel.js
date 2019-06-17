"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
//FIXME: SE TIENE QUE AGREGAR LOS PERMISOS POR PROCEDIMIENTO ESTO ES UN PROCEDIMIENTO
const TreeItemSchema = new mongoose_1.Schema({
    Idx: {
        type: mongoose_1.Schema.Types.Number,
        required: true
    },
    Item: {
        type: String,
        required: true
    }
}), PermisoSchema = new mongoose_1.Schema({
    Titulo: {
        type: String,
        required: true,
        maxlength: 20
    },
    Descripcion: {
        type: String,
        required: false,
        maxlength: 255
    },
    Area: {
        type: String,
        required: true,
        maxlength: 30
    },
    Tree: {
        type: [TreeItemSchema],
        required: true,
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
exports.default = mongoose_1.model("Permiso", PermisoSchema);
