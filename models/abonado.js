
const {Schema, model } = require('mongoose');

const UserSchema = new Schema({
    Titula: {
        type: String,
        required: [true, 'El patente es requerido']
    },
    DNI: {
        type: Number,
        required: [true, 'La fecha de ingreso es requerida']
    },
    NumeroTramite: {
        type: Number,
        required: [true, 'El NumeroTramite es requerida']
    },
    Correo: {
        type: Number,
        required: [true, 'el Correo de egreso es requerida']
    },
    Profesion: {
        type: String
       
    },
    Correo: {
        type: String,
        required: [true, 'el Correo de egreso es requerida']
    },
    Telefono: {
        type: Number,
        required: [true, 'El Telefono de egreso es requerida']
    },
    Marca: {
        type: String,
        required: [true, 'La Marca de egreso es requerida']
    },
    Modelo: {
        type: String,
        required: [true, 'El Modelo de egreso es requerida']
    },
    Ano: {
        type: Number,
        required: [true, 'El Año de egreso es requerida']
    },
    Patente: {
        type: String,
        required: [true, 'La Patente de egreso es requerida']
    },
    Color: {
        type: String
       
    },
    NombreAutorizado: {
        type: String
       
    },
    DniAutorizado: {
        type: Number
       
    },
    CuitAutorizado: {
        type: Number
       
    },
    ProfesionAutorizado: {
        type: String
       
    },
    CorreoAutorizado: {
        type: String
       
    },
    ProfesionAutorizado: {
        type: String
       
    },
    empleados: [
        { type: Schema.Types.ObjectId, ref: 'Empleado' }
    ],
    sucursal: [
        { type: Schema.Types.ObjectId, ref: 'Sucursal' }
    ]
});



module.exports= model('Abonado', UserSchema)