const { response } = require('express');
const bcryptjs = require('bcryptjs')

//modelos de usuario
const Empleado = require('../models/empleado')
const Admin = require('../models/usuarioAdmin')


const { generarJWT } = require('../helpers/generar-jwt');


const login = async(req, res = response) => {

    const { correo, password } = req.body;

    try {
      
        // Verificar si el email existe
        const usuario = await Empleado.findOne({ correo }) || await Admin.findOne({correo}) ;
        if ( !usuario ) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - correo'
            });
        }
        console.log(usuario)
        // SI el usuario está activo
        if ( !usuario.estado ) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - estado: false'
            });
        }

        // Verificar la contraseña
        const validPassword = bcryptjs.compareSync( password, usuario.password );
        if ( !validPassword ) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - password'
            });
        }

        // Generar el JWT
        const token = await generarJWT( usuario.id );

        res.json({
            usuario,
            token
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }   

}



module.exports = {
    login
}
