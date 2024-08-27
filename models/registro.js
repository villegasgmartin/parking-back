
const {Schema, model } = require('mongoose');

const UserSchema = new Schema({
    fechaEntrada: {
        type: Date,
        required: [true, 'El fecha es requerido']
    },
    HoraEntrada: {
        type: String,
        required: [true, 'La fecha de ingreso es requerida']
    },
    fechaSalida: {
        type: Date,
    },
    HoraSalida: {
        type: String,
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
    ],
    NombreSucursal:{
        type: String
    }
});



module.exports= model('Registro', UserSchema)