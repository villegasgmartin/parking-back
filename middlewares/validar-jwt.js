const { response, request } = require('express');
const jwt = require('jsonwebtoken');

//modelos de usuario
const Empleado = require('../models/empleado')
const Admin = require('../models/usuarioAdmin')
const Registro = require('../models/registro')

// Simulando una lista negra de tokens revocados
const revokedTokens = new Set();

// Ruta para eliminar el token en el logout
const logout = async (req, res) => {
    try {
        const token = req.header('x-token').split(' ')[0]; // Obtener el token del encabezado

        // Decodificar el token para obtener el ID del usuario (esto depende de cómo codificaste tu token)
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Asegúrate de tener tu JWT_SECRET configurado
        const userId = decoded.id;

        // Obtener la hora actual para la HoraSalida
        const now = new Date();
        const time = now.toTimeString().split(' ')[0];

        // Encontrar el registro más reciente del empleado donde HoraSalida esté vacío
        const registro = await Registro.findOneAndUpdate(
            { empleados: userId, HoraSalida: null },
            { HoraSalida: time },
            { new: true }
        );

        if (!registro) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }

        // Agregar el token a la lista negra
        revokedTokens.add(token);
        console.log('Tokens revocados:', [...revokedTokens]);

        // Respondemos con éxito al usuario
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cerrar sesión' });
    }
};



const validarJWT = async( req = request, res = response, next ) => {

    const token = req.header('x-token');
    console.log(token);
    if ( !token ) {
        return res.json({ msg: 'Token Invalido' });
    }

    const tokenListaNegra = req.header('x-token').split(' ')[0];

    // Verificar si el token está en la lista negra
    if (revokedTokens.has(tokenListaNegra)) {
       
        return res.json({ msg: 'Token Invalido' });
    }

    try {
        
        const { uid } = jwt.verify( token, process.env.SECRETORPRIVATEKEY );
        console.log(uid)
        req.uid = uid;

        // leer el usuario que corresponde al uid
        const usuario = await Empleado.findById( uid ) || await Admin.findById(uid) ;

        

        if( !usuario ) {
            return res.status(401).json({
                msg: 'Token no válido - usuario no existe DB'
            })
        }

        // Verificar si el uid tiene estado true
        if ( !usuario.estado ) {
            return res.status(401).json({
                msg: 'Token no válido - usuario con estado: false'
            })
        }
        
        
        req.usuario = usuario;
        next();

    } catch (error) {

        console.log(error);
        res.status(401).json({
            msg: 'Token no válido'
        })
    }

}




module.exports = {
    validarJWT,
    logout
}