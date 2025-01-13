
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
    ],
    fraccionado:{
        type: Number
    },
    impresion:{
        type: Number,
        default: 8
    },
    datosSucursal:{
        type:Boolean,
        default: true,
    },
    datosImagenes:{
        type:Boolean,
        default: true,
    }
    
})


module.exports= model('Sucursal', UserSchema)