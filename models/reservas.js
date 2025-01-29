
const {Schema, model } = require('mongoose');

const UserSchema = new Schema({
    patente: {
        type: String,
        required: [true, 'La patente es requerida']
    },
    fechaIngreso: {
        type: Date,
        required: [true, 'La fecha de ingreso es requerida']
    },
    horaIngreso: {
        type: Date,
        required: [true, 'La hora de ingreso es requerida']
    },
    fechaEgreso: {
        type: Date,
        required: [true, 'La fecha de egreso es requerida']
    },
    horaEgreso: {
        type: Date,
        required: [true, 'La hora de egreso es requerida']
    },
    empleados: [
        { type: Schema.Types.ObjectId, ref: 'Empleado' }
    ],
    sucursal: [
        { type: Schema.Types.ObjectId, ref: 'Sucursal' }
    ],
    imgSalida:{
        type: String,
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
    total:{
        type: Number,
    },
    finalizado:{
        type: Boolean,
        default: false
    },
    tipo:{
        type: String,
        default: 'Reserva'
    },
    metodoPago:{
        type: String,
        
    },
    qr:{
      type:String  
    },
    cierreCaja:{
        type: Boolean,
        default: true
    },
    tipo:{
        type: String,
        default: 'Ingreso'
    },
    clase: {
        type: String,
        required: [true, 'La clase es requerido']
    },
});



module.exports= model('Reserva', UserSchema)