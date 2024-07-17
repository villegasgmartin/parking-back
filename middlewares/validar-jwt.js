const { response, request } = require('express');
const jwt = require('jsonwebtoken');

//modelos de usuario
const Empleado = require('../models/empleado')
const Admin = require('../models/usuarioAdmin')


// Simulando una lista negra de tokens revocados
const revokedTokens = new Set();

// Ruta para eliminar el token en el logout
const logout = (req, res) => {
	const token = req.header('x-token').split(' ')[0]; // Obtener el token del encabezado

	// Agregar el token a la lista negra
	revokedTokens.add(token);
    // Mostrando los tokens revocados en consola
    console.log('Tokens revocados:', [...revokedTokens]);
	// Respondemos con éxito al usuario
	res.status(200).json({ message: 'Logged out successfully' });
};



const validarJWT = async( req = request, res = response, next ) => {

    const token = req.header('x-token');
    console.log(token);
    if ( !token ) {
        return res.redirect('/');
    }

    const tokenListaNegra = req.header('x-token').split(' ')[0];
    console.log('token',tokenListaNegra);
    console.log('split', token.split(' ')[0]);
    console.log(revokedTokens);
    // Verificar si el token está en la lista negra
    if (revokedTokens.has(tokenListaNegra)) {
        console.log(tokenListaNegra);
        console.log('token en lista negra');
        return res.redirect('/');
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