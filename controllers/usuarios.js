const { response, request } = require('express');
const bcryptjs = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
cloudinary.config(process.env.CLOUDINARY_URL);
//modelos de usuario
const Empleado = require('../models/empleado')
const Admin = require('../models/usuarioAdmin');
const Sucursal = require('../models/sucursales');
const Reserva = require('../models/reservas');
const Abonado = require('../models/abonado');
const Gasto = require('../models/gasto');
const Convenio = require('../models/convenio');


const usuariosGetTotal = async (req = request, res = response) => {
    const { limite = 15, desde = 0 } = req.query;
    const sucursal = req.query.sucursal;
    const query = { estado: true, sucursal };

    try {
        // Obtener el conteo total de documentos en las dos colecciones
        const [totalEmpleados, totalAdmins] = await Promise.all([
            Empleado.countDocuments(query),
            Admin.countDocuments(query)
        ]);

        const total = totalEmpleados + totalAdmins;

        let usuarios = [];
        let skip = Number(desde);
        let limit = Number(limite);

        // Obtener los empleados
        if (skip < totalEmpleados) {
            const empleados = await Empleado.find(query).skip(skip).limit(limit).exec();
            usuarios = usuarios.concat(empleados);
            limit -= empleados.length;
            skip = 0;
        } else {
            skip -= totalEmpleados;
        }

        // Obtener los admins
        if (limit > 0) {
            const admins = await Admin.find(query).skip(skip).limit(limit).exec();
            usuarios = usuarios.concat(admins);
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
    const id = req.query.id;
    console.log("id en funcion", id);

    try {
        const usuario =  await Empleado.findById( id ) || await Admin.findById(id) ;
        console.log("usuario", usuario);

        res.status(200).json(usuario)
    } catch (error) {
        res.status(500).json({
            msg: error
        })
    }
   



}




const usuariosPost = async (req, res = response) => {
    try {
        let { password, correo, ...resto } = req.body;
        const sucursalId = req.query.sucursal;
        console.log("sucursalId: " + sucursalId)
        // Agregar el ID del empleado a la sucursal correspondiente
        const sucursal = await Sucursal.findById(sucursalId);
        if (!sucursal) {
            return res.status(404).json({
                msg: 'Sucursal no encontrada'
            });
        }

        const sucursalNombre = sucursal.nombre;
        

        // verificar si existe un empleado con el mismo email
        const usuario = await Empleado.findOne({ correo }) || await Admin.findOne({ correo });
       
        if (usuario){
            return res.status(400).json({
                msg: 'El email ya está registrado'
            });
        }

        // Crear el empleado
        const nuevoUsuario = new Empleado({ password, sucursal: sucursalId, sucursalNombre, correo, ...resto });

        // Encriptar la contraseña
        const salt = bcryptjs.genSaltSync();
        nuevoUsuario.password = bcryptjs.hashSync(password, salt);

        // Guardar el empleado en la base de datos
        await nuevoUsuario.save();

        sucursal.empleados.push(nuevoUsuario._id);
        await sucursal.save();

        res.json({
            usuario: nuevoUsuario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
};

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
    let user = await Empleado.findById(id) || await Admin.findById(id)

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

//crear reservas

const crearReserva = async(req, res) => {
    const {empleado, sucursal, ...body } = req.body;
    const sucursalId = req.query.sucursal;
    

    const uid = req.uid
    const usuarioAdmin = await Admin.findById(uid) || await Empleado.findById(uid);
    if(!usuarioAdmin){
        return res.status(404).json({
            msg:'debe ser admin para crear reservas'
        })
    }

    const trabajador = await Empleado.findById(uid)
    if(trabajador){
        if(!trabajador.reservas){
            return res.status(404).json({
                msg:'debe estar habilitado para crear reserva'
            });  
        }
    }

    const reserva = new Reserva({...body, empleados:uid, sucursal:sucursalId})

    await reserva.save();
    
    res.json({reserva,
        msg:'reserva creada'
    } );
}

//obtener las reservas solo para ese empleado
const obtenerReservasporUsuario = async (req, res) =>{
    const sucursalId = req.query.sucursal;
    const uid = req.uid

    const query = {empleados: uid, sucursal: sucursalId}
    const usuario = await Empleado.findById(uid);

    console.log(query);
    if(!usuario){
        return res.status(404).json({
            msg:'debe tener permiso para ver reservas'
        })
    }
    try {
        console.log(query);
        const reservas = await Reserva.find(query);
        res.json(reservas);
    } catch (error) {
        console.error(error);
        res.status(404).json({message: error.message});

    }
}

    
//crear Abonado

const crearAbonado = async(req, res) => {
    let { empleado, sucursal , NumeroTramite, ...body} = req.body;
    const sucursalId = req.query.sucursal;
    NumeroTramite = uuidv4();

    const uid = req.uid
    const usuarioAdmin = await Admin.findById(uid) || await Empleado.findById(uid);
    if(!usuarioAdmin){
        return res.status(404).json({
            msg:'debe ser admin para crear abonado'
        })
    }

    const trabajador = await Empleado.findById(uid)
    if(trabajador){
        if(!trabajador.abonados){
            return res.status(404).json({
                msg:'debe estar habilitado para crear abonado'
            });  
        }
    }

    const abonado = new Abonado({...body, empleados:uid, sucursal:sucursalId, NumeroTramite})

    await abonado.save();
    
    res.json({abonado,
        msg:'abonado creado'
    } );
}

//obtener los abonados solo para ese empleado
const obtenerAbonadoporUsuario = async (req, res) =>{
    const sucursalId = req.query.sucursal;
    const uid = req.uid

    const query = {empleados: uid, sucursal: sucursalId}
    const usuario = await Empleado.findById(uid);

 
    if(!usuario){
        return res.status(404).json({
            msg:'debe tener permiso para ver abonados'
        })
    }
    try {
        const abonados = await Abonado.find(query);
        res.json(abonados);
    } catch (error) {
        console.error(error);
        res.status(404).json({message: error.message});

    }
}

//crear Gasto

const crearGasto = async(req, res) => {
    const {sucursal, ...body } = req.body;
    const sucursalId = req.query.sucursal;
    console.log(body)

    const uid = req.uid
    const usuarioAdmin = await Admin.findById(uid) || await Empleado.findById(uid);
    if(!usuarioAdmin){
        return res.status(404).json({
            msg:'debe estar logeado para crear gasto'
        })
    }

    const trabajador = await Empleado.findById(uid)
    if(trabajador){
        if(!trabajador.saldos){
            return res.status(404).json({
                msg:'debe estar habilitado para crear gastos'
            });  
        }
    }

    
    //agrego imagen si es que hay
    if (req.files) {
		const { tempFilePath } = req.files.img;

		const { secure_url } = await cloudinary.uploader.upload(tempFilePath);

		imgEntrada = secure_url;
	} else {
		imgEntrada =
			'https://res.cloudinary.com/dj3akdhb9/image/upload/v1695818870/samples/placeholder_profile_jhvdpv.png';
	}

    const gasto = new Gasto({ ...body, empleados:uid, sucursal:sucursalId, img:imgEntrada })

    await gasto.save();
    
    res.json({gasto,
        msg:'abonado creado'
    } );
}

//obtener los gastos solo para ese empleado
const obtenerGastoporUsuario = async (req, res) => {
    const sucursalId = req.query.sucursal;
    const mesTexto = req.query.mes; // Mes como texto ("enero", "febrero", etc.)
    const año = req.query.año; // Año como número
    const uid = req.uid;

    const query = { empleados: uid, sucursal: sucursalId };

    // Mapeo de meses de texto a índices
    const meses = {
        enero: 0,
        febrero: 1,
        marzo: 2,
        abril: 3,
        mayo: 4,
        junio: 5,
        julio: 6,
        agosto: 7,
        septiembre: 8,
        octubre: 9,
        noviembre: 10,
        diciembre: 11,
    };

    try {
        // Verificar permisos del usuario
        const usuario = await Empleado.findById(uid) || await Admin.findById(uid);
        if (!usuario) {
            return res.status(404).json({
                msg: 'Debe tener permiso para ver reservas',
            });
        }

        // Aplicar filtro de fecha si mes y año están presentes
        if (mesTexto && año) {
            const mes = meses[mesTexto.toLowerCase()]; // Convertir el texto a minúsculas y mapear
            if (mes === undefined) {
                return res.status(400).json({
                    msg: 'El mes proporcionado no es válido',
                });
            }

            // Crear rango de fechas
            const inicioMes = new Date(año, mes, 1); // Primer día del mes
            const finMes = new Date(año, mes + 1, 0); // Último día del mes
            query.Fecha = { $gte: inicioMes, $lte: finMes };
        }

        console.log(mesTexto,año )

        // Buscar gastos con el filtro
        const gastos = await Gasto.find(query);

        res.json(gastos);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
        });
    }
};


//obtener los gastos por sucursal

const obtenerGastoporSucursal = async (req, res) => {
    const sucursalId = req.query.sucursal;
    const mesTexto = req.query.mes; // Mes proporcionado como texto ("enero", "febrero", etc.)
    const año = req.query.año; // Año proporcionado
    const uid = req.uid;
    

    const query = { sucursal: sucursalId };

    // Mapeo de meses de texto a números
    const meses = {
        enero: 0,
        febrero: 1,
        marzo: 2,
        abril: 3,
        mayo: 4,
        junio: 5,
        julio: 6,
        agosto: 7,
        septiembre: 8,
        octubre: 9,
        noviembre: 10,
        diciembre: 11,
    };

    try {
        // Verificación de permisos
        const usuario = await Empleado.findById(uid) || await Admin.findById(uid);
        if (!usuario) {
            return res.status(404).json({
                msg: 'Debe tener permiso para ver reservas',
            });
        }

        // Aplicar filtro por mes y año si están presentes
        if (mesTexto && año) {
            const mes = meses[mesTexto.toLowerCase()]; // Convertir el texto a minúsculas y mapear
            if (mes === undefined) {
                return res.status(400).json({
                    msg: 'El mes proporcionado no es válido',
                });
            }

            // Crear el rango de fechas para el mes y año proporcionado
            const inicioMes = new Date(año, mes, 1); // Primer día del mes
            const finMes = new Date(año, mes + 1, 0); // Último día del mes
            query.Fecha = { $gte: inicioMes, $lte: finMes }; // Filtro por rango de fechas
        }

        // Buscar gastos con el filtro
        const gastos = await Gasto.find(query);

        res.json(gastos);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
        });
    }
};






module.exports = {
    usuariosGetTotal,
    usuariosPost,
    usuariosDelete,
    usuariosPut,
    AdminPost,
    getUsuario,
    crearReserva,
    obtenerReservasporUsuario,
    obtenerAbonadoporUsuario,
    crearAbonado,
    obtenerGastoporUsuario,
    crearGasto, 
    obtenerGastoporSucursal
}