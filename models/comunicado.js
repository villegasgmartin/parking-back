
const {Schema, model } = require('mongoose');

const UserSchema = new Schema({
    Comunicado: {
        type: String,
        required: [true, 'El Comunicado es requerido']
    },
    Fecha: {
        type: Date,
        required: [true, 'La fecha es requerido']
    },
     admin: [
        { type: Schema.Types.ObjectId, ref: 'Admin_Parking' }
    ]
});



module.exports= model('Comunicado', UserSchema)