const {Schema, model } = require('mongoose');

const TarifasSchema = Schema({


    Precios:{
        type: Number
    },
    precio6horas:{
        type: Number
    },
    precio12horas:{
        type: Number
    },
    sucursal: [
        { type: Schema.Types.ObjectId, ref: 'Sucursal' }
    ]


});

module.exports= model('Tarifa', TarifasSchema)
