
const {Schema, model } = require('mongoose');

const UserSchema = new Schema({
    vehiculo: {
        type: String,
        required: [true, 'El vehiculo es requerido']
    }
});



module.exports= model('Vehiculo', UserSchema)