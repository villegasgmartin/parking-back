
const {Schema, model } = require('mongoose');

const UserSchema = Schema({
    patente:{
        type: String,
        required: [true, 'El patente es requerido']
    },
    tipo:{
        type: Number,
        required: [true, 'El tipo de vehiculo es requerido'],
    },
    horaEntrada:{
        type: String,
    },
    fecha:{
        type: String,      
    },
    horaSalida:{
        type: String,
    },
    tiempo: {
        type: Number
    },
    metodoPago:{
        type: String,
    },
    total:{
        type: Number,
    },
    imgEntrada:{
        type: String,
    },
    imgSalida:{
        type: String,
    },
    finalizado:{
        type: Boolean,
        default: false
    },
    empleados: [
        { type: Schema.Types.ObjectId, ref: 'Empleado' }
    ],
    sucursal: [
        { type: Schema.Types.ObjectId, ref: 'Sucursal' }
    ]
    
})



module.exports= model('Entrada', UserSchema)