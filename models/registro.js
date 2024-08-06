
const {Schema, model } = require('mongoose');

const UserSchema = new Schema({
    fecha: {
        type: Date,
        required: [true, 'El fecha es requerido']
    },
    HoraEntrada: {
        type: Date,
        required: [true, 'La fecha de ingreso es requerida']
    },
    HoraSalida: {
        type: Date,
    },
    Nombre: {
        type: String,
        required: [true, 'El Nombre de egreso es requerida']
    },
    empleados: [
        { type: Schema.Types.ObjectId, ref: 'Empleado' }
    ],
    sucursal: [
        { type: Schema.Types.ObjectId, ref: 'Sucursal' }
    ]
});



module.exports= model('Registro', UserSchema)