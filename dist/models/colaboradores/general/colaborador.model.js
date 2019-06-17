"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const permisoSchema = new mongoose_1.Schema({
    IdPermiso: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Permisos'
    },
    IsFrom: {
        type: String,
        enum: ['Manual', 'Cargo'],
        required: true
    },
    FechaModificacion: {
        type: Date,
        default: Date.now()
    }
}), PerfilSchema = new mongoose_1.Schema({
    Foto: {
        type: String
    },
    Settings: new mongoose_1.Schema({
        DarkMode: {
            type: Boolean,
            default: false
        },
        SideBar: {
            type: Boolean,
            default: false
        }
    })
}), GeneralSchema = new mongoose_1.Schema({
    Nombre: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 30
    },
    Apellido: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 30
    },
    Cedula: {
        type: String,
        required: true,
        index: true,
        unique: true,
        match: /\d{3}-{0,1}\d{6}-{0,1}\d{4}[A-z]{1}/
    },
    Email: {
        type: String,
        index: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    }
}), RecoverySchema = new mongoose_1.Schema({
    IpSend: {
        type: String,
        default: null
    },
    EmailSend: {
        type: String,
        index: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    Token: {
        type: String,
        match: /^(\S+(\.|$)){3}/
    },
    Solicitud: {
        type: Boolean,
        default: false
    }
}), SessionSchema = new mongoose_1.Schema({
    DateSession: {
        type: Date,
        default: new Date(),
        required: true
    },
    IpSession: {
        type: String,
        required: true
    },
    Token: {
        type: String,
        match: /^(\S+(\.|$)){3}/,
        required: true,
        default: null
    },
    Auth: {
        type: [Number],
        required: true
    },
    //Para el Auth tendra que validar 
    ValidToken: {
        type: Date,
        required: true
    },
    ValidAuth: {
        type: Date,
        required: true
    },
    Disable: {
        type: Boolean,
        default: false
    }
}), UserSchema = new mongoose_1.Schema({
    username: {
        type: String,
        min: 5,
        max: 20,
        required: () => {
            if (this.User != null || this.password != null)
                return true;
            return false;
        }
    },
    password: {
        type: String,
        required: () => {
            if (this.User != null || this.password != null)
                return true;
            return false;
        }
    },
    Session: {
        type: SessionSchema,
        default: null
    },
    Recovery: {
        type: RecoverySchema,
        default: null
    },
    IsCreated: {
        type: Boolean,
        default: false
    },
    Disable: {
        type: Boolean,
        default: false
    },
    FechaModificacion: {
        type: Date,
        default: Date.now()
    }
});
const LogSchema = new mongoose_1.Schema({
    FechaModificacion: {
        type: Date,
        default: Date.now()
    },
    Propiedad: {
        type: String,
        required: true,
        index: true
    },
    Data: {
        type: JSON,
        required: true
    }
});
const CargoSchema = new mongoose_1.Schema({
    IdCargo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'cargos'
    },
    Estado: {
        type: Boolean,
        default: true
    },
    FechaIngreso: {
        type: Date,
        default: Date.now()
    }
});
//Main Schema
const ColaboradoresSchema = new mongoose_1.Schema({
    General: {
        type: GeneralSchema,
        required: true,
        unique: true
    },
    Cargo: {
        type: [CargoSchema],
        required: true
    },
    Permisos: {
        type: [permisoSchema],
        default: []
    },
    User: {
        //TODO: Hace falta agregar el reegenerar token
        //TODO: Hace falta agregar la lista de dispositivos que estan siendo usados
        type: UserSchema,
        default: {
            User: null,
            password: null,
            IsCreated: false,
            Session: null,
            Recovery: {
                IpSend: null,
                EmailSend: null,
                Solicitud: false,
                Token: null,
                Estado: false
            },
            fechaModificacion: Date.now(),
            Disable: false
        }
    },
    Perfil: {
        type: PerfilSchema,
        default: {
            Foto: null,
            Settings: {
                DarkMode: false,
                SideBar: false
            }
        }
    },
    Estado: {
        type: Boolean,
        default: true
    },
    Log: {
        type: [LogSchema],
        default: []
    }
});
ColaboradoresSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        if (RegExp(/Cedula/).test(error.errmsg))
            next(new Error('La cedula del colaborador ya se encuentra registradad'));
    }
    ;
    if (error)
        next(error);
    next();
});
exports.default = mongoose_1.model('Colaborador', ColaboradoresSchema, 'colaboradores');
