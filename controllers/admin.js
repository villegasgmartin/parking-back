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
const Tarifa = require('../models/tarifas');



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

//actualizar sucursal

const actualizarSucursal = async (req, res = response) => {
    const sucursalId = req.query.sucursalId;  
    const body = req.body;  
    const uid = req.uid;  
    const usuario = await Admin.findById(uid);  

    if (!usuario) {
        return res.status(404).json({
            msg: 'Debe tener permiso para actualizar sucursal'
        });
    }
    
    try {
        
        const sucursal = await Sucursal.findByIdAndUpdate(
            sucursalId,  
            body,       
            { new: true } 
        );

        if (!sucursal) {
            return res.status(404).json({
                msg: 'Sucursal no encontrada'
            });
        }

        res.json({
            sucursal,
            msg: 'Sucursal actualizada'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Error al actualizar la sucursal'
        });
    }
};


/*********************Ingresos y Egresos Autos**************/

const precioInicial = async(req, res) => {
    const {precio} = req.body
    const sucursalId = req.query.sucursal;

    try {
        const tarifa = new Tarifa({precio:precio, sucursal:sucursalId});
        await tarifa.save()
        res.status(200).json({
            msg:'precio actualizado en sucursal',
            tarifa
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Error al agregar tarifa en sucursal'
        });
    }

}


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
    const sucursalId = req.query.sucursalId
    const query = { finalizado: false, patente: patente, sucursal: sucursalId};
    const query2 = { sucursal: sucursalId}

    // Obtener el registro de entrada
    const entrada = await Entrada.findOne(query);
    console.log(entrada)
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
     return;
 }
 
 // Crear objetos Date para fechaEntrada y fechaSalida con sus respectivas horas
 const [entradaHoras, entradaMinutos] = horaEntrada.split(':').map(Number);
 const [salidaHoras, salidaMinutos] = horaSalida.split(':').map(Number);
 
 const fechaEntradaConHora = new Date(fechaEntrada);
 const fechaSalidaConHora = new Date(fechaSalida);
 fechaSalidaConHora.setHours(salidaHoras, salidaMinutos);
 
 const diferenciaMs = fechaSalidaConHora - fechaEntradaConHora;
 const diferenciaMinutos = Math.ceil(diferenciaMs / (1000 * 60)); // Diferencia en minutos
 
 // Calcular las horas completas
 const horasCompletas = Math.floor(diferenciaMinutos / 60);
 
 // Obtener los minutos restantes después de contar las horas completas
 const minutosRestantes = diferenciaMinutos % 60;
 
 // Función para redondear en función de 'fraccionado'
 function redondearTiempo(horasCompletas, minutosRestantes, fraccionado) {
     if (minutosRestantes === 0) return horasCompletas; // Caso de minutos exactos
 
     // Calcular el límite de minutos a partir del cual se incrementa la hora
     if (minutosRestantes > fraccionado) {
         return horasCompletas + 1; // Redondea a la siguiente hora
     } else {
         return horasCompletas + 1; // Asegura al menos una hora
     }
 }
 
//verificar el faccionado
const tarifa = await Tarifa.findOne(query2);
console.log(tarifa.precio , tarifa.aumento,sucursalId)

if(!tarifa.precio) {
    return res.json({msg:'debe agregar precio inicial'});
}
 
 const fraccionado = tarifa.faccionado;
 const tiempoRedondeado = redondearTiempo(horasCompletas, minutosRestantes, fraccionado);
 
 const tiempo = Math.max(tiempoRedondeado, 1)



const total = tarifa.precio *  tiempo * tarifa.aumento;



console.log(tarifa.precio, tiempo , tarifa.aumento)


    try {
        entrada.imgSalida = imgSalidaUrl;
        entrada.horaSalida = horaSalida;
        entrada.fechaSalida = fechaSalida;
        entrada.tiempo = tiempo;
        entrada.finalizado = true;
        entrada.total = total;

        await entrada.save();

        res.status(200).json(entrada);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
};

//obtener link mercado pago
const metodoPago = async(req, res) =>{
    let {patente, metodoPago} = req.body;
    const sucursalId = req.query.sucursal
    const query = { finalizado: true, patente, sucursal: sucursalId};   
    try {
        const entrada = await Entrada.findOne(query);
        console.log(entrada);
        precio = entrada.total;

        if(metodoPago= 'mercado pago'){
            qr = await generarLinkDePago(precio)
        
            entrada.metodoPago = metodoPago;
            entrada.qr = qr;
            await entrada.save();
            res.status(200).json({
                qr,
            })
        }
        else{
            entrada.metodoPago = metodoPago;
    
            res.status(200).json({
                entrada
            })
        }


       
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }

}
//actualizar fraccionado y aumento

const actualizarAumentos = async( req, res)=>{
    let {aumento} = req.body;
    const sucursalId = req.query.sucursalId
    const query2 = { sucursal: sucursalId}

    try {
        const tarifa = await Tarifa.findOne(query2);
        console.log(tarifa)
        console.log(aumento, aumento/100)
        tarifa.aumento = 1 + (aumento/100);

        await tarifa.save()

        res.status(400).json({
            msg:'aumento actualizado'
        })

    } catch ( error) {
        console.error(error);
        res.status(500).json({
            msg: 'No se pudo realizar el aumento'
        });
    }


}

//actualizar fraccionado y aumento

const actualizarFraccionado = async( req, res)=>{
    let {fraccionado} = req.body;
    const sucursalId = req.query.sucursalId
    const query2 = { sucursal: sucursalId}

    try {
        const tarifa = await Tarifa.findOne(query2);
        tarifa.fraccionado = fraccionado;
        await tarifa.save()
        res.status(400).json({
            msg:'fraccionado actualizado'
        })

    } catch ( error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }


}


//ver tarifa por sucursal
const getTarifa = async (req, res) => {
    const sucursalId = req.query.sucursalId
    const query2 = { sucursal: sucursalId}

    try {
        const tarifa = await Tarifa.findOne(query2);
        
        res.status(400).json({
            tarifa
        })

    } catch ( error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}




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

//actualizar convenio
const convenioPut = async (req, res = response) => {
    const convenioId = req.query.convenio;
    const body = req.body;
    const uid = req.uid;
  
    const usuario = await Admin.findById(uid);

    if (!usuario) {
        return res.status(404).json({
            msg: 'Debe tener permiso para ver convenios'
        });
    }
    
    try {
       
        const convenio = await Convenio.findByIdAndUpdate(
            convenioId, // Filtro por ID
            body,       
            { new: true } 
        );

        if (!convenio) {
            return res.status(404).json({
                msg: 'Convenio no encontrado'
            });
        }

        res.json({
            convenio,
            msg: 'Convenio actualizado'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Error al actualizar el convenio'
        });
    }
};

//borrar convenio


const borrarConvenio = async (req, res) =>{
    const convenio = req.query.convenio

    try {
        const result = await Convenio.deleteOne({ _id:new mongoose.Types.ObjectId(convenio) }).exec();
        if (result.deletedCount === 0) {
            return res.status(404).json({ msg: 'convenio no encontrado' });
        }
        res.json({
            msg: 'convenio eliminado'
        });
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
    convenioPut,
    VerComunicado,
    borrarAbonado,
    borrarReserva, 
    getVehiculo,
    actualizarSucursal,
    borrarConvenio,
    metodoPago,
    actualizarFraccionado,
    actualizarAumentos,
    precioInicial,
    getTarifa
}

