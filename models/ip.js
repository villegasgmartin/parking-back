const { Schema, model } = require('mongoose');

const AutorizacionIPSchema = new Schema({
    ip: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = model('AutorizacionIP', AutorizacionIPSchema);