const {Schema, model } = require('mongoose');

const TarifasSchema = Schema({


    precio:{
        type: Number,
        default: 1200
    },
    aumento:{
        type: Number,
        default: 1
    },
    fraccionado:{
        type:Number,
        default: 60
    },
    sucursal: [
        { type: Schema.Types.ObjectId, ref: 'Sucursal' }
    ]


});

module.exports= model('Tarifa', TarifasSchema)
