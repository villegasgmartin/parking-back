
const {Schema, model } = require('mongoose');

const UserSchema = new Schema({
    vehiculo: {
        type: String,
        required: [true, 'El vehiculo es requerido']
    },
    clase: {
        type: String
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
       default: 3 
       //horas 0-23
    },
    fraccionado2: {
        type: Number,
        default: 6
        //horas 0-23
    },
    tolerancia:{
        type: Number,
        default: 15
        //min 0-59
    }
});




module.exports= model('Vehiculo', UserSchema)