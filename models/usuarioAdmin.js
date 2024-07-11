const {Schema, model } = require('mongoose');

const UserSchema = Schema({
    nombre:{
        type: String,
        required: [true, 'El nombre es requerido']
    },
    correo:{
        type: String,
        required: [true, 'El correo es requerido'],
        unique: true
    },
    password:{
        type: String,
        required: [true, 'La password es requerida']
    },
    
    rol:{
        type: String,
        required: true,
        enum: ['USER_ADMIN']
    }, 
    estado:{
        type: Boolean,
        default: true,
      
    }
    
})

UserSchema.methods.toJSON = function() {
    const { __v, password, _id, ...usuario  } = this.toObject();
    usuario.uid = _id;
    return usuario;
}

module.exports= model('Admin_Parking', UserSchema)