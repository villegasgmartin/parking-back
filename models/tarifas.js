const {Schema, model } = require('mongoose');

const TarifasSchema = Schema({


    Precios:{
        
    },
    precio6horas:{
   
    },
    precio12horas:{

    },
    sucursal: [
        { type: Schema.Types.ObjectId, ref: 'Sucursal' }
    ]


});

module.exports= model('Tarifa', TarifasSchema)
