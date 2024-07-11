
const {Schema, model } = require('mongoose');

const UserSchema = Schema({
    nombre:{
        type: String,
        required: [true, 'El nombre es requerido']
    },
    cuit:{
        type: Number,
        required: [true, 'El cuit es requerido'],
    },
    iibb:{
        type: String
    },
    razonsocial:{
        type: String,
        required:[true, 'La razon social es requerido']
      
    },
    direccion:{
        type: String,
        required:[true, 'La direccion es requerido']
    },
    telefono: {
        type: Number
    },
    correo:{
        type: String,
    },
    empleados: [
        { type: Schema.Types.ObjectId, ref: 'Empleado' }
    ]
    
})

UserSchema.methods.toJSON = function() {
    const { __v, password, _id, ...usuario  } = this.toObject();
    usuario.uid = _id;
    return usuario;
}

module.exports= model('Sucursal', UserSchema)