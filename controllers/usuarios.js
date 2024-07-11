const { response, request } = require('express');
const bcryptjs = require('bcryptjs');


//modelos de usuario
const Empleado = require('../models/empleado')
const Admin = require('../models/usuarioAdmin');
const Sucursal = require('../models/sucursales');

const usuariosGetTotal = async(req = request, res = response) => {
    const { limite = 5, desde = 0 } = req.query;
    const sucursal = req.query.sucursal;
    const query = { estado: true, sucursal };

    try {
        // Obtener el conteo total de documentos en las tres colecciones
        const totalUsuarios = await Promise.all([
            Empleado.countDocuments(query),
        ]);

        const total = totalUsuarios;

        let usuarios = [];
        let skip = Number(desde);
        let limit = Number(limite);

        // Obtener los usuarios de User_Servicio
        if (skip < totalUsuarios) {
            const totalUsuarios = await Empleado.find(query).skip(skip).limit(limit).exec();
            usuarios = totalUsuarios;
            limit -= totalUsuarios.length;
            skip = 0;
        } else {
            skip -= totalUsuarios;
        }

        res.json({
            total,
            usuarios
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Error en el servidor'
        });
    }
};

const getUsuario = async (req, res) => {
    const {id} = req.query;


    try {
        const usuario =  await Empleado.findById( id ) || await Admin.findById(id) ;

        res.status(200).json(usuario)
    } catch (error) {
        res.status(500).json({
            msg: error
        })
    }
   



}




const usuariosPost = async (req, res = response) => {
    try {
        let { password, ...resto } = req.body;
        const sucursalId = req.query.sucursal;

        // Crear el empleado
        const usuario = new Empleado({ password, ...resto, sucursal: sucursalId });

        // Encriptar la contraseña
        const salt = bcryptjs.genSaltSync();
        usuario.password = bcryptjs.hashSync(password, salt);

        // Guardar el empleado en la base de datos
        await usuario.save();

        // Agregar el ID del empleado a la sucursal correspondiente
        const sucursal = await Sucursal.findById(sucursalId);
        if (!sucursal) {
            return res.status(404).json({
                msg: 'Sucursal no encontrada'
            });
        }
        
        

        sucursal.empleados.push(usuario._id);
        await sucursal.save();

        res.json({
            usuario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}
const AdminPost = async (req, res = response) => {
        
    let {password, ...resto} = req.body;

    const usuario = new Admin({password, ...resto});

    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync( password, salt );

    await usuario.save()

    res.json({
       
        usuario
        
    });
}


const usuariosPut = async (req, res = response) => {

    const uid = req.uid
    const usuarioAdmin = await Admin.findById(uid);
    if(!usuarioAdmin){
        return res.status(404).json({
            msg:'debe ser admin para ver las sucursales'
        })
    }


    const { id } = req.query;
    console.log(id);
    const { _id, password, correo, ...resto } = req.body;

     // Buscar el usuario en las tres colecciones
     let user = await Empleado.findById(id)

     if (!user) {
         return res.status(404).json({
             msg: 'Usuario no encontrado'
         });
     }
 
    

    if ( password ) {
        // Encriptar la contraseña
        const salt = bcryptjs.genSaltSync();
        resto.password = bcryptjs.hashSync( password, salt );
    }

    
        usuario = await Empleado.findByIdAndUpdate( id, resto );
    
    res.json({usuario,
        msg: 'Usuario actualizado'
    } );
}



const usuariosDelete = async(req, res = response) => {
    const { id } = req.query;


    // Buscar el usuario en las tres colecciones
    let user = await Empleado.findById(id)

    if (!user) {
        return res.status(404).json({
            msg: 'Usuario no encontrado'
        });
    }

    // Actualizar el estado del usuario encontrado
    user.estado = false;
    await user.save();
    
    res.json({user,
        msg:'Usuario eliminado'
    } );
}




module.exports = {
    usuariosGetTotal,
    usuariosPost,
    usuariosDelete,
    usuariosPut,
    AdminPost,
    getUsuario
}