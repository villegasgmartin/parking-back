const { Router } = require('express');
const { check } = require('express-validator');


const {
    validarCampos,
    validarJWT,
    esAdminRole,
    tieneRole
} = require('../middlewares');

const { crearSucursal, getSucursales, obtenerReservasAdmin, obtenerAbonadoporAdmin, CrearVehiculo, borrarVehiculo, getRegistros, CrearComunicado, borrarComunicado, obtenerConvenio, crearConvenio, VerComunicado, borrarAbonado, borrarReserva } = require('../controllers/admin');


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



module.exports = router;