const { response, request } = require('express');
const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');



const cloudinary = require('cloudinary').v2;
cloudinary.config(process.env.CLOUDINARY_URL);


//modelos de usuario
const Empleado = require('../models/empleado')
const Admin = require('../models/usuarioAdmin')
const Sucursal = require('../models/sucursales')
const Entrada = require('../models/in&out');
const calculateRoundedHours = require('../helpers/diferenciaHoras');
const Reserva = require('../models/reservas');
const Abonado = require('../models/abonado');
const Vehiculo = require('../models/vehiculo');
const Registro = require('../models/registro');
const Comunicado = require('../models/comunicado');
const Convenio = require('../models/convenio');
const generarLinkDePago = require('../middlewares/mercado-pago');


/**********Sucursales***********************/
const getSucursales = async (req, res) =>{
    const uid = req.uid
    

    const usuario = await Admin.findById(uid);
 
    if(!usuario){
        return res.status(404).json({
            msg:'debe ser admin para ver las sucursales'
        })
    }
    try {
        const sucursales = await Sucursal.find();
        res.json(sucursales);
    } catch (error) {
        console.error(error);
        res.status(404).json({message: error.message});

    }
}

const crearSucursal = async (req, res) =>{
    const body = req.body;

    const uid = req.uid

    const usuario = await Admin.findById(uid);

    if(!usuario){
        return res.status(404).json({
            msg:'debe ser admin para crear sucursal'
        })
    }


    const sucursal = new Sucursal(body)
    try {
        await sucursal.save()
        res.status(200).json({
            msg: 'Sucursal creada'
        })

    } catch (error) {
        console.error(error);
        res.status(404).json({message: error.message});
    }
}


/*********************Ingresos y Egresos Autos**************/
const ingresoAuto = async(req, res) => {
    let {imgEntrada,fechaEntrada, horaEntrada, ...rest} = req.body;
    const sucursalId = req.query.sucursal;

    const uid = req.uid
    const usuarioAdmin = await Admin.findById(uid) || await Empleado.findById(uid);;
    if(!usuarioAdmin){
        return res.status(404).json({
            msg:'debe ser admin para ver las sucursales'
        })
    }



    //agrego imagen si es que hay
    if (req.files) {
		const { tempFilePath } = req.files.imgEntrada;

		const { secure_url } = await cloudinary.uploader.upload(tempFilePath);

		imgEntrada = secure_url;
	} else {
		imgEntrada =
			'https://res.cloudinary.com/dj3akdhb9/image/upload/v1724899221/samples/caravatar_rsuxln.png';
	}
    
        // Obtener la fecha y hora actual
        const fecha = new Date();


   
        // Obtener la hora (hora, minutos, segundos)
        const hours = fecha.getHours();
        const minutes = fecha.getMinutes();

        // Formatear la fecha y la hora en cadenas
        // fecha = `${month} ${year}`;
        horaEntrada = `${hours}:${minutes}`;

    

    try {
        const ingreso = new Entrada({imgEntrada,fechaEntrada:fecha, horaEntrada, ...rest, empleados:uid, sucursal:sucursalId})
        await ingreso.save();
        res.status(200).json(ingreso);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }


}

const SalidaAuto = async (req, res) => {
    let { imgSalida, horaSalida, patente, mercadoPago, ...rest } = req.body;
    const query = { finalizado: false, patente: patente };

    // Obtener el registro de entrada
    const entrada = await Entrada.findOne(query); // Cambiado a findOne para obtener un único registro
    if (!mercadoPago) {
        mercadoPago = false;
    }
    const horaEntrada = entrada.horaEntrada;
    const fechaEntrada = entrada.fechaEntrada;

    // Agregar imagen si es que hay
    let imgSalidaUrl;
    if (req.files) {
        const { tempFilePath } = req.files.imgSalida;
        const { secure_url } = await cloudinary.uploader.upload(tempFilePath);
        imgSalidaUrl = secure_url;
    } else {
        imgSalidaUrl =
            'https://res.cloudinary.com/dj3akdhb9/image/upload/v1724899221/samples/caravatar_rsuxln.png';
    }

 // Obtener la fecha y hora actual
 const fechaSalida = new Date();
horaSalida = `${fechaSalida.getHours()}:${fechaSalida.getMinutes()}`;

// Asegurarse de que `horaEntrada` tiene el formato correcto antes de usarlo
if (!horaEntrada || !horaEntrada.includes(':')) {
    console.error('Formato incorrecto en horaEntrada');
}

// Crear objetos Date para fechaEntrada y fechaSalida con sus respectivas horas
const [entradaHoras, entradaMinutos] = horaEntrada.split(':').map(Number);
const [salidaHoras, salidaMinutos] = horaSalida.split(':').map(Number);

// Utilizar directamente fechaEntrada
const fechaEntradaConHora = new Date(fechaEntrada);
const fechaSalidaConHora = new Date(fechaSalida);
fechaSalidaConHora.setHours(salidaHoras, salidaMinutos);

const diferenciaMs = fechaSalidaConHora - fechaEntradaConHora;
const tiempoMinutos = Math.round(diferenciaMs / (1000 * 60));
console.log(`Tiempo en minutos: ${tiempoMinutos}`);



 
    // Convertir a horas redondeadas

    //si mercadopago es tru mostrar el link
    if(mercadoPago){
        precio = tiempoMinutos * 1500;
        qr = await generarLinkDePago(precio)
    }
    if(!mercadoPago){
        qr = ''
    }

    try {
        entrada.imgSalida = imgSalidaUrl;
        entrada.horaSalida = horaSalida;
        entrada.fechaSalida = fechaSalida;
        entrada.tiempo = tiempoMinutos;
        entrada.finalizado = true;
        entrada.qr = qr;

        await entrada.save();

        res.status(200).json(entrada);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
};

//ver todas la reservas
const obtenerReservasAdmin = async (req, res) =>{
    const sucursalId = req.query.sucursal;
    const uid = req.uid

    const query = {sucursal: sucursalId}
    const admin = await Admin.findById(uid);

 
    if(!admin){
        return res.status(404).json({
            msg:'No es Admin para ver las reservas'
        })
    }
    try {
        const reservas = await Reserva.find(query);
        res.json(reservas);
    } catch (error) {
        console.error(error);
        res.status(404).json({message: error.message});

    }
}

const obtenerAbonadoporAdmin = async (req, res) =>{
    const sucursalId = req.query.sucursal;
    const uid = req.uid

    

    const query = {sucursal: sucursalId}
    const usuario = await Admin.findById(uid);

 
    if(!usuario){
        return res.status(404).json({
            msg:'debe tener permiso para ver reservas'
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

//crear vehiculo
const CrearVehiculo = async (req, res = response) => {
        
    let {admin,...body} = req.body;
    const uid = req.uid
    const usuarioAdmin = await Admin.findById(uid)
    if(!usuarioAdmin){
        return res.status(404).json({
            msg:'debe ser admin para crear convenio'
        })
    }
    const vehiculo = new Vehiculo({...body,admin:uid});

    try {
        await vehiculo.save()

        res.json({
           
            vehiculo
            
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({message: error.message});
    }
   
}

const getVehiculo = async (req, res) => {
    const uid = req.uid

    const usuario = await Admin.findById(uid);

 
    if(!usuario){
        return res.status(404).json({
            msg:'debe tener permiso para ver vehiculos'
        })
    }
    try {
        const vehiculos = await Vehiculo.find();
        res.json(vehiculos);
    } catch (error) {
        console.error(error);
        res.status(404).json({message: error.message});

    }
}

//borrar vehiculo

const borrarVehiculo = async (req, res) =>{
    const vehiculo = req.query.vehiculo

    try {
        const result = await Vehiculo.deleteOne({ vehiculo }).exec();
        if (result.deletedCount === 0) {
            return res.status(404).json({ msg: 'Vehiculo no encontrado' });
        }
        res.json({
            msg: 'Vehiculo eliminado'
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({message: error.message});
    }
}


//ver registros 
const getRegistros = async (req, res) =>{
    const sucursalId = req.query.sucursal;
    const uid = req.uid

    const query = {sucursal: sucursalId}
    const usuario = await Admin.findById(uid);
    console.log(usuario, query)
 
    if(!usuario){
        return res.status(404).json({
            msg:'debe tener permiso para ver registros'
        })
    }
    try {
        const registro = await Registro.find(query);
        res.json(registro);
    } catch (error) {
        console.error(error);
        res.status(404).json({message: error.message});

    }
}

//crear comunicado
const CrearComunicado = async (req, res = response) => {
        
    let {texto} = req.body;
    const uid = req.uid
    
     //obtener horario de entrada
     const now = new Date();

     // Obtener la fecha en formato YYYY-MM-DD
     const date = now.toISOString().split('T')[0];

     const comunicado = new Comunicado({Comunicado:texto, Fecha:date, admin: uid});

    try {
        await comunicado.save()

        res.json({
           
            comunicado
            
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({message: error.message});
    }
   
}

//borrar comunicado

const borrarComunicado = async (req, res) => {
    const texto = req.query.texto; 
    try {
       
        const result = await Comunicado.deleteOne({ Comunicado:texto }).exec();
        if (result.deletedCount === 0) {
            return res.status(404).json({ msg: 'Comunicado no encontrado' });
        }
        res.json({
            msg: 'Comunicado eliminado'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message }); // Cambia el estado a 500 para errores del servidor
    }
};

//obtener comunicados

const VerComunicado = async (req, res) =>{
    

    try {
        const comunicados = await Comunicado.find()
        res.json({
            comunicados
        })
    } catch (error) {
        console.error(error);
        res.status(404).json({message: error.message});
    }
}

//crear convenio

const crearConvenio = async(req, res) => {
    const { empleados, sucursal, ...body } = req.body;
    const sucursalId = req.query.sucursal;
    

    const uid = req.uid
    const usuarioAdmin = await Admin.findById(uid)
    if(!usuarioAdmin){
        return res.status(404).json({
            msg:'debe ser admin para crear convenio'
        })
    }


    const convenio = new Convenio({...body, admin:uid, sucursal:sucursalId})

    await convenio.save();
    
    res.json({convenio,
        msg:'convenio creado'
    } );
}

//obtener los convenio
const obtenerConvenio = async (req, res) =>{
    const sucursalId = req.query.sucursal;
    const uid = req.uid

    const query = {sucursal: sucursalId}
    const usuario = await Admin.findById(uid);

 
    if(!usuario){
        return res.status(404).json({
            msg:'debe tener permiso para ver convenios'
        })
    }
    try {
        const convenios = await Convenio.find(query);
        res.json(convenios);
    } catch (error) {
        console.error(error);
        res.status(404).json({message: error.message});

    }
}

const borrarAbonado = async (req, res) =>{
    const abonado = req.query.abonado

    try {
        const result = await Abonado.deleteOne({ _id:new mongoose.Types.ObjectId(abonado) }).exec();
        if (result.deletedCount === 0) {
            return res.status(404).json({ msg: 'abonado no encontrado' });
        }
        res.json({
            msg: 'abonado eliminado'
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({message: error.message});
    }
}

const borrarReserva = async (req, res) =>{
    const reserva = req.query.reserva

    try {
        const result = await Reserva.deleteOne({ _id:new mongoose.Types.ObjectId(reserva) }).exec();
        if (result.deletedCount === 0) {
            return res.status(404).json({ msg: 'reserva no encontrado' });
        }
        res.json({
            msg: 'reserva eliminado'
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({message: error.message});
    }
}

module.exports = {
    getSucursales,
    crearSucursal,
    ingresoAuto,
    SalidaAuto,
    obtenerReservasAdmin,
    obtenerAbonadoporAdmin,
    CrearVehiculo,
    borrarVehiculo,
    getRegistros,
    CrearComunicado,
    borrarComunicado,
    obtenerConvenio,
    crearConvenio,
    VerComunicado,
    borrarAbonado,
    borrarReserva, 
    getVehiculo
}

