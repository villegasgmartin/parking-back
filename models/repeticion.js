
const {Schema, model } = require('mongoose');

const RepeticionSchema = new Schema({
    repeticion: {
        type: Number,
        default: 2
    }
});


module.exports= model('Repeticion', RepeticionSchema)