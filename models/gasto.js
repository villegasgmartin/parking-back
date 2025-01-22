
const {Schema, model } = require('mongoose');

const UserSchema = new Schema({
    Fecha: {
        type: Date
    },
    Nombre: {
        type: String,
        required: [true, 'El Nombre es requerida']
    },
    importe: {
        type: String,
        required: [true, 'El Importe es requerida']
    },
    img: {
        type: String,
        required: [true, 'La Imagen  es requerida']
    },
    empleados: [
        { type: Schema.Types.ObjectId, ref: 'Empleado' }
    ],
    sucursal: [
        { type: Schema.Types.ObjectId, ref: 'Sucursal' }
    ],
    cierreCaja:{
        type:Boolean,
        default: true
    }
});


module.exports= model('Gasto', UserSchema)