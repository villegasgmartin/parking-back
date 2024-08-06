
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
    ]
});



module.exports= model('Reserva', UserSchema)