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
        
        const uid = req.uid
        
       //conprobar si el usuario es un admin o empleado
       const usuarioAdmin = await Admin.findById(uid);

       if(!usuarioAdmin) {

            // Obtener la hora actual para la HoraSalida
            const now = new Date();
            const date = now.toISOString().split('T')[0]; // Obtener la fecha en formato YYYY-MM-DD
            const time = now.toTimeString().split(' ')[0]; // Obtener la hora en formato HH:MM:SS
            
            // Combinar la fecha y la hora en un objeto Date
            const fechaHoraSalida = new Date(`${date}T${time}Z`);

            // Encontrar el registro más reciente del empleado donde HoraSalida esté vacío
            const registro = await Registro.findOneAndUpdate(
                { empleados: uid, HoraSalida: null },
                { HoraSalida: time, fechaSalida:date },
                { new: true }
            );

            if (!registro) {
                return res.status(404).json({ message: 'Registro no encontrado' });
            }

    }

        // Agregar el token a la lista negra
        revokedTokens.add(token);
        console.log('Tokens revocados:', [...revokedTokens]);

        // Respondemos con éxito al usuario
        res.status(200).json({ message: 'Saliste de la sesion' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cerrar sesión' });
    }
};



const validarJWT = async( req = request, res = response, next ) => {

    const token = req.header('x-token');
  
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

const existeAdminPortoken = async( req = request, res = response, next ) => {
        const token = req.header('x-token'); 
        try {
            
            const { uid } = jwt.verify( token, process.env.SECRETORPRIVATEKEY );    
            // leer el usuario que corresponde al uid
            const usuario = await Admin.findById(uid) ;
            if( !usuario ) {
                return res.status(401).json({
                    msg: 'El usuario no existe o no es un admin'
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
    logout,
    existeAdminPortoken
}