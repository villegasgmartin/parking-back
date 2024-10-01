
const {Schema, model } = require('mongoose');

const UserSchema = Schema({
    patente:{
        type: String,
        required: [true, 'El patent es requerido']
    },
    tipo:{
        type: String,
        required: [true, 'El tipo de vehiculo es requerido'],
    },
    horaEntrada:{
        type: String,
        required: [true, 'La horaEntrada de vehiculo es requerido'],
    },
    fechaEntrada:{
        type: Date, 
        required: [true, 'La fechaEntrada de vehiculo es requerido'],     
    },
    horaSalida:{
        type: String,
    },
    fechaSalida:{
        type: Date,   
    },
    tiempo: {
        type: Number
    },
    metodoPago:{
        type: String,
        
    },
    qr:{
      type:String  
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
    ],
    tipo:{
        type: String,
        default: 'Ingreso'
    }
    
})



module.exports= model('Entrada', UserSchema)