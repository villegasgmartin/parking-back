const { response } = require('express');
const bcryptjs = require('bcryptjs')
const mongoose = require('mongoose');

//modelos de usuario
const Empleado = require('../models/empleado')
const Admin = require('../models/usuarioAdmin')
const Registro = require('../models/registro')
const Sucursal = require('../models/sucursales');
const AutorizacionIP = require('../models/ip');

const { generarJWT } = require('../helpers/generar-jwt');



const login = async(req, res = response) => {

    const { correo, password } = req.body;
     // Obtener la IP del cliente
     const clienteIP = req.headers['x-forwarded-for'] || req.ip;
    console.log(clienteIP)
     try {

       
        // //  Verificar si la IP está autorizada
        //  const ipAutorizada = await AutorizacionIP.findOne({ ip: clienteIP });
        //  if (!ipAutorizada) {
        //      return res.status(403).json({
        //          msg: 'Acceso denegado desde esta IP'
        //      });
        //  }
      
        // Verificar si el email existe
        const usuario = await Empleado.findOne({ correo }) || await Admin.findOne({correo});
        if ( !usuario ) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - correo'
            });
        }

      
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
        const HoraEntrada = new Date(`${time}Z`);

        //verificar si es admin o empleado para guardar la hora de ingreso

        // const usuarioAdmin = await Admin.findOne({correo})
        // if(!usuarioAdmin){
        //     const sucursalUsuario = usuario.sucursal
        //     const sucursal = await Sucursal.findById({ _id:new mongoose.Types.ObjectId(sucursalUsuario) });
        //     const  sucursalNombre = sucursal.nombre
        //     const registro = new Registro({
        //         fechaEntrada: date, // Puede ser solo la fecha o también puedes combinarla con la hora
        //         HoraEntrada: time,
        //         empleados: usuario.id,
        //         Nombre: usuario.nombre,
        //         NombreSucursal: sucursalNombre,
        //         sucursal: usuario.sucursal
        //     });
            
        //     await registro.save();
        // }
        
        

        // Generar el JWT
        const token = await generarJWT( usuario.id );

        res.json({
            usuario,
            token, 
            

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
