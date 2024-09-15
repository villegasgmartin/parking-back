const { Router } = require('express');
const { check } = require('express-validator');


const {
    validarCampos,
    validarJWT,
    esAdminRole,
    tieneRole
} = require('../middlewares');

const { crearSucursal, getSucursales, obtenerReservasAdmin, obtenerAbonadoporAdmin, CrearVehiculo, borrarVehiculo, getRegistros, CrearComunicado, borrarComunicado, obtenerConvenio, crearConvenio, VerComunicado, borrarAbonado, borrarReserva, getVehiculo, convenioPut, actualizarSucursal, borrarConvenio, precioInicial, actualizarAumentos, actualizarFraccionado, getTarifa } = require('../controllers/admin');
const { obtenerGastoporSucursal } = require('../controllers/usuarios');


const router = Router();

router.post('/new-sucursal',[
    validarJWT,
    validarCampos
],crearSucursal );

router.get('/sucursales',[
    validarJWT,
    validarCampos
],getSucursales );

router.get('/reservas-sucursal',[
    validarJWT,
    validarCampos
],obtenerReservasAdmin );

router.get('/abonados-sucursal',[
    validarJWT,
    validarCampos
],obtenerAbonadoporAdmin );

router.post('/nuevo-vehiculo',[
    validarJWT,
    validarCampos
],CrearVehiculo );

router.delete('/borrar-vehiculo',[
    validarJWT,
    validarCampos
],borrarVehiculo );

router.get('/registros-sucursal',[
    validarJWT,
    validarCampos
],getRegistros );

router.post('/nuevo-comunicado',[
    validarJWT,
    validarCampos
], CrearComunicado);

router.delete('/borrar-comunicado',[
    validarJWT,
    validarCampos
], borrarComunicado);

router.get('/comunicados',[
    validarJWT,
    validarCampos
], VerComunicado);

router.get('/convenios',[
    validarJWT,
    validarCampos
], obtenerConvenio);

router.post('/nuevo-convenio',[
    validarJWT,
    validarCampos
], crearConvenio);

router.delete('/borrar-abonado',[
    validarJWT,
    validarCampos
], borrarAbonado);

router.delete('/borrar-reserva',[
    validarJWT,
    validarCampos
], borrarReserva);

router.get('/get-vehiculos',[
    validarJWT,
    validarCampos
] ,getVehiculo)

//obtener convenios

router.get('/gastos-sucursal',[
    validarJWT,
    validarCampos
],obtenerGastoporSucursal)

router.put('/actualizar-convenio',[
    validarJWT,
    validarCampos 
],convenioPut )

router.put('/actualizar-sucursal',[
    validarJWT,
    validarCampos 
],actualizarSucursal )

router.delete('/borrar-convenio',[
    validarJWT,
    validarCampos
], borrarConvenio);


//agregar precio en sucursal

router.post('/nuevo-precio',[
    validarJWT,
    validarCampos
], precioInicial);

router.put('/actualizar-aumentos',[
    validarJWT,
    validarCampos 
], actualizarAumentos)


router.put('/actualizar-franccionado',[
    validarJWT,
    validarCampos 
], actualizarFraccionado)

router.get('/tarifas',[
    validarJWT,
    validarCampos 
], getTarifa)


module.exports = router;