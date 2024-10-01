const {Schema, model } = require('mongoose');

const TarifasSchema = Schema({


    precioregular:{
        type: Number,
        default: 1200
    },
    precio6horas:{
        type: Number,
        default: 1000
    },
    precio12horas:{
        type: Number,
        default: 800
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
