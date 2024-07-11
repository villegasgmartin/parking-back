const { response, request } = require('express');
const bcryptjs = require('bcryptjs');


const cloudinary = require('cloudinary').v2;
cloudinary.config(process.env.CLOUDINARY_URL);


//modelos de usuario
const Empleado = require('../models/empleado')
const Admin = require('../models/usuarioAdmin')
const Sucursal = require('../models/sucursales')



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
    const {img, ...rest} = req.body;
    const sucursal = req.query.sucursal;

    //agrego imagen si es que hay
    if (req.files) {
		const { tempFilePath } = req.files.img;

		const { secure_url } = await cloudinary.uploader.upload(tempFilePath);

		img_url = secure_url;
	} else {
		img_url =
			'https://res.cloudinary.com/dj3akdhb9/image/upload/v1695818870/samples/placeholder_profile_jhvdpv.png';
	}
    
    // valido que sea admin o empleado con permiso
    

    try {
        
    } catch (error) {
        
    }


}
module.exports = {
    getSucursales,
    crearSucursal
}