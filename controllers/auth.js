const { response } = require('express');
const bcryptjs = require('bcryptjs')

//modelos de usuario
const Empleado = require('../models/empleado')
const Admin = require('../models/usuarioAdmin')
const Registro = require('../models/registro')


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

        const now = new Date();
        const date = now.toISOString().split('T')[0]; // Obtener la fecha en formato YYYY-MM-DD
        const time = now.toTimeString().split(' ')[0]; // Obtener la hora en formato HH:MM:SS
        
        // Combinar la fecha y la hora en un objeto Date
        const fechaHoraEntrada = new Date(`${date}T${time}Z`);
        
        const registro = new Registro({
            fecha: date, // Puede ser solo la fecha o también puedes combinarla con la hora
            HoraEntrada: fechaHoraEntrada,
            empleados: usuario.id,
            Nombre: usuario.nombre,
            sucursal: usuario.sucursal
        });
        
        await registro.save();

        // Generar el JWT
        const token = await generarJWT( usuario.id );

        res.json({
            usuario,
            token, 
            registro

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
