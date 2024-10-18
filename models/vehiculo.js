
const {Schema, model } = require('mongoose');

const UserSchema = new Schema({
    vehiculo: {
        type: String,
        required: [true, 'El vehiculo es requerido']
    },
    clase: {
        type: String,
        required: [true, 'La clase es requerido']
    },
    admin: [
        { type: Schema.Types.ObjectId, ref: 'Admin_Parking' }
    ],
    sucursal: [
        { type: Schema.Types.ObjectId, ref: 'Sucursal' }
    ],
    tarifa: [
        {
            type: Number
        }
    ],
    aumento: {
        type: Number,
        default: 1
    },
    fraccionado1: {
        type: Number,
        default: 60
    },
    fraccionado2: {
        type: Number,
        default: 60
    },
    tolerancia:{
        type: Number,
        default: 15
    }
});




module.exports= model('Vehiculo', UserSchema)