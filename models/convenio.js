
const {Schema, model } = require('mongoose');

const UserSchema = new Schema({
    Empresa: {
        type: String,
        required: [true, 'La Empresa es requerido']
    },
    Nombre: {
        type: String,
        required: [true, 'El Nombre es requerido']
    },
    RazonSocial: {
        type: String,
        required: [true, 'La RazonSocial es requerida']
    },
    cuit: {
        type: Number,
        required: [true, 'El cuit es requerida']
    },
    direccion: {
        type: String,
        required: [true, 'La direccion es requerida']
    },
    telefono: {
        type: String,
        required: [true, 'El telefono es requerido']
    },
    correo: {
        type: String,
        required: [true, 'El correo es requerido']
    },
    habilitar: {
        type: Boolean,
        default: false
    },
    admin: [
        { type: Schema.Types.ObjectId, ref: 'Admin_Parking' }
    ],
    sucursal: [
        { type: Schema.Types.ObjectId, ref: 'Sucursal' }
    ]
});



module.exports= model('Convenio', UserSchema)