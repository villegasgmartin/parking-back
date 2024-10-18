
const {Schema, model } = require('mongoose');

const UserSchema = Schema({
    nombre:{
        type: String,
        required: [true, 'El nombre es requerido']
    },
    correo:{
        type: String,
        required: [true, 'El correo es requerido'],
        unique: true
    },
    password:{
        type: String,
        required: [true, 'La password es requerida']
    },
    telefono:{
        type: Number,
    },
    rol:{
        type: String,
        required: true,
        enum: ['USER_EMPLOYE']
    }, 
    estado:{
        type: Boolean,
        default: true,
      
    },
    sucursal: {
        type: Schema.Types.ObjectId,
        ref: 'Sucursal',
        required: true
    },
    sucursalNombre:{
        type: String,
        required: [true, 'La sucursal es requerida']
    },
    historial:{
        type: Boolean,
        default: false,
      
    },
    reservas:{
        type: Boolean,
        default: false,
      
    },
    abonados:{
        type: Boolean,
        default: false,
      
    },
    saldos:{
        type: Boolean,
        default: false,
      
    },
    empleados:{
        type: Boolean,
        default: false,
      
    },
    tutoriales:{
        type: Boolean,
        default: false,
      
    },
    imagenes:{
        type: Boolean,
        default: false,
    }
  

    
})

UserSchema.methods.toJSON = function() {
    const { __v, password, _id, ...usuario  } = this.toObject();
    usuario.uid = _id;
    return usuario;
}

module.exports= model('Empleado', UserSchema)