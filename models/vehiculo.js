
const {Schema, model } = require('mongoose');

const UserSchema = new Schema({
    vehiculo: {
        type: String,
        required: [true, 'El vehiculo es requerido']
    },
    clase: {
        type: String,
        required: [true, 'El vehiculo es requerido']
    },
    admin: [
        { type: Schema.Types.ObjectId, ref: 'Admin_Parking' }
    ],
    sucursal: [
        { type: Schema.Types.ObjectId, ref: 'Sucursal' }
    ],
    tarifa: [
        {
            precioregular: { type: Number, default: 1200 },
            segundoprecio: { type: Number, default: 1000 },
            tercerprecio: { type: Number, default: 800 }
        }
    ],
    aumento: {
        type: Number,
        default: 1
    },
    fraccionado: {
        type: Number,
        default: 60
    }
});




module.exports= model('Vehiculo', UserSchema)