
const {Schema, model } = require('mongoose');

const UserSchema = new Schema({
    vehiculo: {
        type: String,
        required: [true, 'El vehiculo es requerido']
    },
     admin: [
        { type: Schema.Types.ObjectId, ref: 'Admin_Parking' }
    ]
});



module.exports= model('Vehiculo', UserSchema)