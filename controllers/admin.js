const { response, request } = require('express');
const bcryptjs = require('bcryptjs');


const cloudinary = require('cloudinary').v2;
cloudinary.config(process.env.CLOUDINARY_URL);


//modelos de usuario
const Empleado = require('../models/empleado')
const Admin = require('../models/usuarioAdmin')
const Sucursal = require('../models/sucursales')
const Entrada = require('../models/In&out');
const calculateRoundedHours = require('../helpers/diferenciaHoras');



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
    const {imgEntrada,fecha, horaEntrada, ...rest} = req.body;
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
			'https://res.cloudinary.com/dj3akdhb9/image/upload/v1695818870/samples/placeholder_profile_jhvdpv.png';
	}
    
        // Obtener la fecha y hora actual
        const now = new Date();


        const month = now.getMonth() + 1; // Los meses en JavaScript van de 0 a 11
        const year = now.getFullYear();

        // Obtener la hora (hora, minutos, segundos)
        const hours = now.getHours();
        const minutes = now.getMinutes();

        // Formatear la fecha y la hora en cadenas
        fecha = `${month} ${year}`;
        horaEntrada = `${hours}:${minutes}`;

    

    try {
        const ingreso = new Entrada({imgEntrada,fecha, horaEntrada, ...rest, empleados:uid, sucursal:sucursalId})
        await ingreso.save();
        res.status(200).json(ingreso);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }


}

const SalidaAuto = async(req, res) => {
    const {imgSalida,fecha,horaSalida, patente, ...rest} = req.body;
    const query = {finalizado:false, patente:patente}


    //sacar el horario de ingreso
    const entrada = await Entrada.find(query)
    const horaEntrada = entrada.horaEntrada;

    
    //agrego imagen si es que hay
    if (req.files) {
		const { tempFilePath } = req.files.imgSalida;

		const { secure_url } = await cloudinary.uploader.upload(tempFilePath);

		imgSalida = secure_url;
	} else {
		imgSalida =
			'https://res.cloudinary.com/dj3akdhb9/image/upload/v1695818870/samples/placeholder_profile_jhvdpv.png';
	}
    
        // Obtener la fecha y hora actual
        const now = new Date();


        const month = now.getMonth() + 1; // Los meses en JavaScript van de 0 a 11
        const year = now.getFullYear();

        // Obtener la hora (hora, minutos, segundos)
        const hours = now.getHours();
        const minutes = now.getMinutes();

        // Formatear la fecha y la hora en cadenas
        fecha = `${month} ${year}`;
        horaSalida = `${hours}:${minutes}`;
        tiempo = calculateRoundedHours(horaSalida,horaEntrada)

    

    try {
        entrada.imgSalida = imgSalida;
        entrada.horaSalida = horaSalida;
        entrada.tiempo = tiempo;

        await entrada.save();

        res.status(200).json(entrada);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }


}


module.exports = {
    getSucursales,
    crearSucursal,
    ingresoAuto,
    SalidaAuto
}

