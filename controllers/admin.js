const { response, request } = require('express');
const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');



const cloudinary = require('cloudinary').v2;
cloudinary.config(process.env.CLOUDINARY_URL);

const tesseract = require('tesseract.js');


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
const Repeticion = require('../models/repeticion');




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

    console.log(sucursalId, usuario, body)

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
        console.log(sucursal);
        console.log('actualoizada')

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
    let {clase, precioregular,segundoprecio, tercerprecio, fraccionado1,fraccionado2, vehiculo, tolerancia } = req.body
    const sucursalId = req.query.sucursal;
    const query = {sucursal:sucursalId, clase:clase, vehiculo:vehiculo}

    try {
        const clase = await Vehiculo.findOne(query)
        console.log(clase)
        clase.tarifa[0]= precioregular;
        clase.tarifa[1]= segundoprecio;
        clase.tarifa[2]= tercerprecio;
        clase.fraccionado1 = fraccionado1;
        clase.fraccionado2 = fraccionado2;
        clase.tolerancia = tolerancia
        await clase.save()

        res.status(200).json({
            msg:'precios actualizados para la clase en sucursal',
            clase
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Error al agregar tarifa en sucursal'
        });
    }

}

// const ingresoAuto = async(req, res) => {
//     let {patente, imgEntrada,fechaEntrada, horaEntrada, ...rest} = req.body;
//     const sucursalId = req.query.sucursal;
//     patente = patente.toUpperCase()
//     console.log("esta es la sucursal", sucursalId)

//     const uid = req.uid
//     const usuarioAdmin = await Admin.findById(uid) || await Empleado.findById(uid);


//     if(!usuarioAdmin){
//         return res.status(404).json({
//             msg:'debe ser admin para ver las sucursales'
//         })
//     }

//     //verificar si el vehiculo no esta ingresado 

//     const entradaAnterior = await Entrada.findOne({ patente: patente, finalizado: false });
    
//     if (entradaAnterior) {
//         return res.status(404).json({
//             msg: 'El auto ya está ingresado'
//         });
//     }

//     //agrego imagen si es que hay
//     if (req.files) {
// 		const { tempFilePath } = req.files.imgEntrada;

// 		const { secure_url } = await cloudinary.uploader.upload(tempFilePath);

// 		imgEntrada = secure_url;
// 	} else {
// 		imgEntrada =
// 			'https://res.cloudinary.com/dj3akdhb9/image/upload/v1724899221/samples/caravatar_rsuxln.png';
// 	}
    
//        // Obtener la fecha y hora actual con la zona horaria de Argentina

//         const fecha = new Date();

//         // Formatear la hora a la zona horaria de Argentina (GMT-3)
//         const options = {
//         timeZone: 'America/Argentina/Buenos_Aires',
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: false, // Para mostrar la hora en formato 24 horas
//         };
//         // Obtener la hora formateada
//         horaEntrada = fecha.toLocaleTimeString('es-AR', options);
    

//     try {
//         const ingreso = new Entrada({imgEntrada,fechaEntrada:fecha, horaEntrada, ...rest, empleados:uid, sucursal:sucursalId, patente:patente});
//         await ingreso.save();
//         res.status(200).json(ingreso);
        
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             msg: 'Hable con el administrador'
//         });
//     }


// }


const ingresoAuto = async (req, res) => {
    try {
        let { imgEntrada, fechaEntrada, horaEntrada, patente: patenteInput, ...rest } = req.body;
        const sucursalId = req.query.sucursal;
        const uid = req.uid;

        const usuarioAdmin = await Admin.findById(uid) || await Empleado.findById(uid);
        if (!usuarioAdmin) {
            return res.status(404).json({ msg: 'Debe ser admin para ver las sucursales' });
        }

        const imgDefault = 'https://res.cloudinary.com/dj3akdhb9/image/upload/v1724899221/samples/caravatar_rsuxln.png';
        let imgUrl = imgDefault; // Imagen por defecto
        let patente = null;
        const patenteRegex = /^[A-Za-z0-9]+$/; // Regex para validar patentes

        // Procesar imagen si está presente
        if (req.files && req.files.imgEntrada) {
            const { tempFilePath } = req.files.imgEntrada;

            // Subir imagen a Cloudinary
            const { secure_url } = await cloudinary.uploader.upload(tempFilePath);
            imgUrl = secure_url;

            console.log("URL de Cloudinary:", secure_url);

            // Intentar extraer la patente con OCR
            const ocrResult = await tesseract.recognize(tempFilePath, 'eng');
            const patenteOCR = ocrResult.data.text.replace(/\s+/g, '').toUpperCase();

            console.log("Patente OCR extraída:", patenteOCR);

            // Validar patente extraída con OCR
            if (patenteOCR && patenteRegex.test(patenteOCR)) {
                patente = patenteOCR;
            }
        }

        // Priorizar patente del input si está presente y es válida
        if (patenteInput && patenteRegex.test(patenteInput.toUpperCase())) {
            patente = patenteInput.toUpperCase();
        }

        // Retornar error si no se obtuvo una patente válida
        if (!patente) {
            return res.status(400).json({
                msg: 'Debe proporcionar una patente válida (ya sea en el input o extraída de la imagen)'
            });
        }

        // Validar consistencia entre patente del input y OCR si ambas están presentes
        if (patenteInput && patente && patenteInput.toUpperCase() !== patente) {
            return res.status(400).json({
                msg: 'La patente proporcionada no coincide con la extraída de la imagen'
            });
        }

        // Verificar si el vehículo ya está ingresado
        let repeticionPatente = await Repeticion.find();
        if(!repeticionPatente){
            repeticionPatente = 2
        }
        console.log("repeticiones", repeticionPatente);
        const entradaSucursal = await Entrada.countDocuments({ patente, finalizado: false , sucursal: sucursalId});
        const entradasTotales = await Entrada.countDocuments({ patente, finalizado: false , sucursal: sucursalId});

        if (entradaSucursal > 1) {
            return res.status(400).json({ msg: 'El auto ya está ingresado en la sucursal'});
        }
        if (entradasTotales > repeticionPatente) {
            return res.status(400).json({ msg: 'El auto ya está ingresado '+ entradaAnterior + " veces"});
        }

        // Obtener fecha y hora actuales
        const fecha = new Date();
        const options = {
            timeZone: 'America/Argentina/Buenos_Aires',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        };
        horaEntrada = fecha.toLocaleTimeString('es-AR', options);

        // Crear registro de entrada
        const ingreso = new Entrada({
            imgEntrada: imgUrl, // Imagen final (ya sea subida o predeterminada)
            fechaEntrada: fecha,
            horaEntrada,
            ...rest,
            empleados: uid,
            sucursal: sucursalId,
            patente,
        });

        await ingreso.save();

        res.status(200).json(ingreso);
    } catch (error) {
        console.error("Error procesando la solicitud:", error);
        res.status(500).json({ msg: 'Error al procesar la solicitud, contacte al administrador' });
    }
};


//post cantidad repeticiones

const agregarRepeticiones = async (req, res) => {
    const {repeticiones} = req.body;

    try {
        const repeticion = new Repeticion();
        const body = {
            repeticion: repeticiones
        }

        await repeticion.save(body);

        res.status(200).json(repeticion);
    } catch (error) {
        console.error("Error procesando la solicitud:", error);
        res.status(500).json({ msg: 'Error al procesar la solicitud, contacte al administrador' });
    }
}

//get cantidad repeticiones

const getRepeticiones = async (req, res) => {
   

    try {
        const repeticion = await Repeticion.findOne()

        res.status(200).json(repeticion);
    } catch (error) {
        console.error("Error procesando la solicitud:", error);
        res.status(500).json({ msg: 'Error al procesar la solicitud, contacte al administrador' });
    }
}

//editar repeticion
const putRepeticiones = async (req, res) => {
    const {repeticiones} = req.body;

    try {
        const repeticion = await Repeticion.findOne()
        
         // Actualiza la propiedad del documento
         repeticion.repeticion = repeticiones;

         // Guarda los cambios en la base de datos
         await repeticion.save();

        res.status(200).json(repeticion)


    } catch (error) {
        console.error("Error procesando la solicitud:", error);
        res.status(500).json({ msg: 'Error al procesar la solicitud, contacte al administrador' });
    }
}


const SalidaAuto = async (req, res) => {
    let { imgSalida, horaSalida, patente, mercadoPago, tipo, clase, ...rest } = req.body;
    const sucursalId = req.query.sucursalId;
    const query = { finalizado: false, patente: patente, sucursal: sucursalId };

    // Obtener el registro de entrada
    const entrada = await Entrada.findOne(query) || await Reserva.findOne(query);

    if (!mercadoPago) mercadoPago = false;

    let fechaEntrada, horaEntrada;
    if (entrada.tipo === 'Reserva') {
        fechaEntrada = entrada.fechaIngreso;
        horaEntrada = entrada.horaIngreso;
    } else {
        horaEntrada = entrada.horaEntrada;
        fechaEntrada = entrada.fechaEntrada;
    }

    // Agregar imagen si es que hay
    let imgSalidaUrl;
    if (req.files) {
        const { tempFilePath } = req.files.imgSalida;
        const { secure_url } = await cloudinary.uploader.upload(tempFilePath);
        imgSalidaUrl = secure_url;
    } else {
        imgSalidaUrl = 'https://res.cloudinary.com/dj3akdhb9/image/upload/v1724899221/samples/caravatar_rsuxln.png';
    }

    // Obtener la fecha y hora actual
    const fechaSalida = new Date();
    const options = {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    horaSalida = fechaSalida.toLocaleTimeString('es-AR', options);

    // Crear objetos Date para fechaEntrada y fechaSalida con sus respectivas horas
    const [entradaHoras, entradaMinutos] = horaEntrada.split(':').map(Number);
    const [salidaHoras, salidaMinutos] = horaSalida.split(':').map(Number);

    const fechaEntradaConHora = new Date(fechaEntrada);
    const fechaSalidaConHora = new Date(fechaSalida);

    // Establecer las horas y minutos en los objetos de fecha
    fechaEntradaConHora.setHours(entradaHoras, entradaMinutos);
    fechaSalidaConHora.setHours(salidaHoras, salidaMinutos);

    // Validar si es el mismo día
    const esMismoDia = fechaEntradaConHora.toDateString() === fechaSalidaConHora.toDateString();

    if (!esMismoDia && fechaSalidaConHora < fechaEntradaConHora) {
        res.status(400).json({
            msg: 'Error: La hora de salida no puede ser anterior a la hora de entrada.'
        });
        return;
    }

    // Si es el mismo día, ajustamos la fecha de salida para evitar sumar días innecesarios
    if (esMismoDia) {
        fechaSalidaConHora.setDate(fechaEntradaConHora.getDate());
    }

    // Calcular la diferencia de tiempo
    const diferenciaMs = fechaSalidaConHora - fechaEntradaConHora;
    const diferenciaMinutos = Math.ceil(diferenciaMs / (1000 * 60)); // Diferencia en minutos

    const horasCompletas = Math.floor(diferenciaMinutos / 60); // Horas completas
    const minutosRestantes = diferenciaMinutos % 60; // Minutos restantes

    console.log("datos", fechaEntradaConHora, fechaSalidaConHora, horaEntrada, horaSalida, horasCompletas, minutosRestantes);

    // Verificar el fraccionado y redondear el tiempo si es necesario
    const vehiculoInfo = await Vehiculo.findOne({ sucursal: sucursalId, vehiculo: tipo, clase: clase });
    const { fraccionado1, fraccionado2, tarifa, tolerancia } = vehiculoInfo;

    let fraccionadoSuc = 0;
    const fraccionadoSucursal = await Sucursal.findOne({ _id: sucursalId });
    if (fraccionadoSucursal.fraccionado) {
        fraccionadoSuc = fraccionadoSucursal.fraccionado;
    }

    // Función para calcular el tiempo con fraccionado y tolerancia
    function calcularTiempoCobro(horas, minutos, tolerancia) {
        if (fraccionadoSuc > 0) {
            if (minutos < fraccionadoSuc && minutos < tolerancia) {
                return horas + fraccionadoSuc / 60;
            }

            let fraccionesCompletas = Math.floor(minutos / fraccionadoSuc);
            let minutosRestantes = minutos % fraccionadoSuc;
            if (minutosRestantes > tolerancia) {
                fraccionesCompletas += 1;
            }

            let totalMinutos = fraccionesCompletas * fraccionadoSuc;
            let horasAdicionales = totalMinutos / 60;
            return parseFloat((horas + horasAdicionales).toFixed(1));
        } else {
            return minutos > tolerancia ? horas + 1 : Math.max(1, horas);
        }
    }

    const tiempoRedondeado = calcularTiempoCobro(horasCompletas, minutosRestantes, tolerancia);

    // Función para calcular el costo basado en las horas pasadas
    function calcularTarifaPorHoras(horas, tolerancia, fraccionado1, fraccionado2, tarifa) {
        let total = 0;

        if (horas > 24) {
            const diasCompletos = Math.floor(horas / 24);
            total += diasCompletos * tarifa[2];

            const horasRestantes = horas % 24;

            if (horasRestantes <= fraccionado1) {
                total += horasRestantes * tarifa[0];
            } else if (horasRestantes <= fraccionado2) {
                total += tarifa[1]*horasRestantes;
            } else {
                total += tarifa[2]*horasRestantes;
            }
            console.log("tarifa", diasCompletos, total, horasRestantes, tarifa[0], tarifa[1], tarifa[2]);
        } else {
            if (horas <= 1) {
                total = tarifa[0]*horas;
            } else if (horas <= fraccionado1) {
                total = horas * tarifa[0];
            } else if (horas <= fraccionado2) {
                total = tarifa[1]*horas;
            } else {
                total = tarifa[2]*horas;
            }
        }

        return total;
    }
    console.log("dataos tarifa",tiempoRedondeado, tolerancia, fraccionado1, fraccionado2, tarifa )
    const total = calcularTarifaPorHoras(tiempoRedondeado, tolerancia, fraccionado1, fraccionado2, tarifa);

    try {
        entrada.imgSalida = imgSalidaUrl;
        entrada.horaSalida = horaSalida;
        entrada.fechaSalida = fechaSalida;
        entrada.tiempo = tiempoRedondeado;
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



// Función para redondear el tiempo en función de 'fraccionado'
function redondearTiempo(horasCompletas, minutosRestantes, fraccionado) {
    if (minutosRestantes === 0) return horasCompletas;

    if (minutosRestantes > fraccionado) {
        return horasCompletas + 1;
    } else {
        return horasCompletas + 1;
    }
}


//get ingreso
const getIngreso = async(req, res) => {
    const sucursalId = req.query.sucursal
    const query = { finalizado: false,sucursal: sucursalId}; 

    try {
        const entrada = await Entrada.find(query);
        const numeroEntradas = await Entrada.countDocuments(query);
        const numeroReservas = await Reserva.countDocuments(query);

        const totalingresos = numeroEntradas + numeroReservas;
        const reservas =await Reserva.find(query);
        const ingresos = {
            entrada,
            reservas,
            totalingresos
        };

        res.status(200).json({
            ingresos
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

//get egresos por sucursal para gastos
const getEgresosSaldos = async (req, res) => {
    const sucursalId = req.query.sucursal;
    const mesTexto = req.query.mes; // Mes proporcionado como texto ("enero", "febrero", etc.)
    const año = req.query.año; // Año proporcionado
    const query = { finalizado: true, sucursal: sucursalId };

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
        if (mesTexto && año) {
            const mes = meses[mesTexto.toLowerCase()]; // Convertimos el texto a minúsculas y lo mapeamos
            if (mes === undefined) {
                return res.status(400).json({
                    msg: 'El mes proporcionado no es válido',
                });
            }

            // Rango de fechas basado en el mes y año proporcionado
            const inicioMes = new Date(año, mes, 1); // Primer día del mes
            const finMes = new Date(año, mes + 1, 0); // Último día del mes
            query.fechaSalida = { $gte: inicioMes, $lte: finMes }; // Filtro por rango de fechas
        }

        const salidas = await Entrada.find(query);
        const reservas = await Reserva.find(query);

        // Calcular los totales
        const totalSalidas = salidas.reduce((sum, item) => sum + item.total, 0);
        const totalReservas = reservas.reduce((sum, item) => sum + item.total, 0);
        const total = totalSalidas + totalReservas;

        const egresos = {
            salidas,
            reservas,
            total,
        };

        res.status(200).json({
            egresos,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
        });
    }
};


//gastos de salidas por usuario
const getEgresosSaldosEmpleado = async (req, res) => {
    const sucursalId = req.query.sucursal;
    const uid = req.uid;
    const mesTexto = req.query.mes; // Mes proporcionado como texto ("enero", "febrero", etc.)
    const año = req.query.año; // Año proporcionado
    const query = { finalizado: true, sucursal: sucursalId, empleados: uid };

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
        if (mesTexto && año) {
            const mes = meses[mesTexto.toLowerCase()]; // Convertimos el texto a minúsculas y lo mapeamos
            if (mes === undefined) {
                return res.status(400).json({
                    msg: 'El mes proporcionado no es válido',
                });
            }

            // Rango de fechas basado en el mes y año proporcionado
            const inicioMes = new Date(año, mes, 1); // Primer día del mes
            const finMes = new Date(año, mes + 1, 0); // Último día del mes
            query.fechaSalida = { $gte: inicioMes, $lte: finMes }; // Filtro por rango de fechas
        }

        const salidas = await Entrada.find(query);
        const reservas = await Reserva.find(query);

        // Calcular los totales
        const totalSalidas = salidas.reduce((sum, item) => sum + item.total, 0);
        const totalReservas = reservas.reduce((sum, item) => sum + item.total, 0);
        const total = totalSalidas + totalReservas;

        const egresos = {
            salidas,
            reservas,
            total,
        };

        res.status(200).json({
            egresos,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador',
        });
    }
};




//get egresos
const getEgresos = async(req, res) => {
    const sucursalId = req.query.sucursal
    const query = { finalizado: true,sucursal: sucursalId}; 

    try {
        const salidas = await Entrada.find(query);
        const reservas =await Reserva.find(query);
        const egresos = {
            salidas,
            reservas
        };
        res.status(200).json({
            egresos
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

//get egresos por patente y sucursal
const getEgresoPorPatente = async(req, res) => {
    let {patente} = req.body;
    const sucursalId = req.query.sucursal
    const query = { finalizado: true,sucursal: sucursalId, patente}; 

    try {
        const egreso = await Entrada.find(query);
        res.status(200).json({
            egreso
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

//get ingreso por patente
const getIngresoPorPatente = async(req, res) => {
    let {patente} = req.query;
    const query = { finalizado: false, patente}; 
    console.log(query);

    try {
        const ingreso = await Entrada.find(query);
        res.status(200).json({
            ingreso
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}
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
    const clase = req.query.clase
    const vehiculo = req.query.vehiculo
    const query2 = { sucursal: sucursalId, clase:clase, vehiculo}

    try {
        const tarifa = await Vehiculo.findOne(query2);
        console.log(tarifa)
        console.log(aumento, aumento/100)
        tarifa.aumento = 1 + (aumento/100);

        const increase = 1 + (aumento/100);

        tarifa.tarifa[0] = tarifa.tarifa[0]*increase;
        tarifa.tarifa[1] = tarifa.tarifa[1]*increase;
        tarifa.tarifa[2] = tarifa.tarifa[2]*increase;

        await tarifa.save()
        res.status(200).json({
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
    let {fraccionado, clase} = req.body;
    const sucursalId = req.query.sucursalId
    const query2 = { sucursal: sucursalId, clase:clase}

    try {
        const tarifa = await Vehiculo.findOne(query2);
        tarifa.fraccionado = fraccionado;
        await tarifa.save()
        res.status(200).json({
            msg:'fraccionado actualizado'
        })

    } catch ( error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }


}


//ver tarifa por sucursal y clase y vehiculo
const getTarifa = async (req, res) => {
 
    const sucursalId = req.query.sucursalId
    const vehiculo = req.query.vehiculo
    const clase = req.query.clase
    const query2 = { sucursal: sucursalId, clase:clase, vehiculo:vehiculo}

    try {
        const tarifa = await Vehiculo.findOne(query2);
        
        res.status(200).json({
            tarifa
        })

    } catch ( error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

// clase por vehiculo y sucursal
const getclases = async (req, res) => {
    // const {vehiculo} = req.body;
    const sucursalId = req.query.sucursalId
    const vehiculo = req.query.vehiculo
    const query2 = { sucursal: sucursalId, vehiculo:vehiculo}

    try {
        const clases = await Vehiculo.distinct('clase', query2);
       
        
        res.status(200).json({
            clases
        })

    } catch ( error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}

// vehiculos por sucursal
const getvehiculosPorSucursal = async (req, res) => {
    
    const sucursalId = req.query.sucursalId
    const query2 = { sucursal: sucursalId}

    try {
        const vehiculos = await Vehiculo.distinct('vehiculo', query2);
       
        
        res.status(200).json({
            vehiculos
        })

    } catch ( error) {
        console.error(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }
}




//borrar ingreso

const borrarIngreso = async (req, res) =>{
    const patente = req.query.patente
    const query = { patente: patente, finalizado: false }

    try {
        const result = await Entrada.deleteOne(query).exec();
        if (result.deletedCount === 0) {
            return res.status(404).json({ msg: 'patente no encontrada' });
        }
        res.json({
            msg: 'Ingreso eliminado'
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({message: error.message});
    }
}

//borrar egreso
const borrarEgreso = async (req, res) =>{
    const patente = req.query.patente
    const query = { patente: patente, finalizado: true }

    try {
        const result = await Entrada.deleteOne(query).exec();
        if (result.deletedCount === 0) {
            return res.status(404).json({ msg: 'patente no encontrada' });
        }
        res.json({
            msg: 'Egreso eliminado'
        });
    } catch (error) {
        console.error(error);
        res.status(404).json({message: error.message});
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
        
    let {admin,tafia,transporte, clase} = req.body;
    const sucursalId = req.query.sucursalId;
    const uid = req.uid
    const usuarioAdmin = await Admin.findById(uid)
    tarifa = [1500, 1300, 1200]
    transporte = transporte.toUpperCase()

    const query = {vehiculo:transporte, clase, sucursal:sucursalId}

    //verificar si hay un auto y clase igual en la sucursal
    const verificarClase = await Vehiculo.findOne(query)
   if (verificarClase){
    clasecomparada = verificarClase.clase
    if(clasecomparada == clase){
        
        return res.status(404).json({
            msg:'mismo vehiculo y clase en la sucursal'
        })
    }
   }
    

    if(!usuarioAdmin){
        return res.status(404).json({
            msg:'debe ser admin para crear convenio'
        })
    }
    const vehiculo = new Vehiculo({vehiculo:transporte, clase,admin:uid, sucursal:sucursalId, tarifa});

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
    const sucursal = req.query.sucursalId

 
    if(!usuario){
        return res.status(404).json({
            msg:'debe tener permiso para ver vehiculos'
        })
    }
    try {
        const vehiculos = await Vehiculo.find({sucursal:sucursal});
        res.json(vehiculos);
    } catch (error) {
        console.error(error);
        res.status(404).json({message: error.message});

    }
}

//borrar vehiculo

const borrarVehiculo = async (req, res) =>{
    const sucursal = req.query.sucursalId
    const vehiculo = req.query.vehiculo
    const clase = req.query.clase
    console.log(clase, sucursal, vehiculo)

    try {
        const result = await Vehiculo.deleteOne({ vehiculo, clase, sucursal }).exec();
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

//get todos los admin
const getAdmins = async (req, res) => {

    try {
        const admins = await Admin.find({estado:true});

        res.status(200).json({
            admins
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
    getTarifa,
    getIngreso,
    getEgresos,
    getEgresosSaldos,
    getEgresoPorPatente,
    borrarIngreso,
    borrarEgreso,
    getclases,
    getvehiculosPorSucursal,
    getEgresosSaldosEmpleado,
    getAdmins,
    getIngresoPorPatente,
    agregarRepeticiones,
    getRepeticiones,
    putRepeticiones
}

