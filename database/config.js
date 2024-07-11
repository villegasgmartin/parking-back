
const mongoose = require('mongoose');

const dbConnection = async () => {

    try {

        await mongoose.connect(process.env.MONGODB_URL_ATLAS);

        console.log('Connected');
        
    } catch (error) {
        console.error(error);
        throw new Error('Error en la connection: ' + error.message);
    }

}

module.exports = {
    dbConnection
}