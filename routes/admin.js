const { Router } = require('express');
const { check } = require('express-validator');


const {
    validarCampos,
    validarJWT,
    esAdminRole,
    tieneRole,
    existeAdminPortoken
} = require('../middlewares');

const { crearSucursal, getSucursales, obtenerReservasAdmin, obtenerAbonadoporAdmin, CrearVehiculo, borrarVehiculo, getRegistros, CrearComunicado, borrarComunicado, obtenerConvenio, crearConvenio, VerComunicado, borrarAbonado, borrarReserva, getVehiculo, convenioPut, actualizarSucursal, borrarConvenio, precioInicial, actualizarAumentos, actualizarFraccionado, getTarifa, getclases, getvehiculosPorSucursal, getEgresosSaldos, getEgresosSaldosEmpleado, getAdmins, getIngresoPorPatente, agregarRepeticiones, getRepeticiones, putRepeticiones, getSucursalporId, imprimirFacturaAfip } = require('../controllers/admin');
const { obtenerGastoporSucursal, obtenerGastoporUsuario } = require('../controllers/usuarios');


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

router.get('/clases',[
    validarJWT,
    validarCampos
], getclases );

router.get('/vehiculos',[
    validarJWT,
    validarCampos
], getvehiculosPorSucursal );



router.delete('/borrar-vehiculo',[
    validarJWT,
    existeAdminPortoken,
    validarCampos
],borrarVehiculo );

router.get('/registros-sucursal',[
    validarJWT,
    existeAdminPortoken,
    validarCampos
],getRegistros );

router.post('/nuevo-comunicado',[
    validarJWT,
    existeAdminPortoken,
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
    validarJWT
], borrarReserva);

router.get('/get-vehiculos',[
    validarJWT,
    validarCampos
] ,getVehiculo)

//obtener convenios

router.get('/gastos-sucursal',[
    validarJWT,
    validarCampos
],obtenerGastoporSucursal);

router.get('/gastos-administrativos',[
    validarJWT,
    validarCampos
],getEgresosSaldos)

router.get('/gastos-administrativos-empledo',[
    validarJWT,
    validarCampos
],getEgresosSaldosEmpleado)

router.put('/actualizar-convenio',[
    validarJWT,
    validarCampos 
],convenioPut )

router.put('/actualizar-sucursal',[
    validarJWT,
    existeAdminPortoken,
    validarCampos 
],actualizarSucursal )

router.delete('/borrar-convenio',[
    validarJWT,
    existeAdminPortoken,
    validarCampos
], borrarConvenio);


//agregar precio en sucursal

router.post('/nuevo-precio',[
    validarJWT,
    existeAdminPortoken,
    validarCampos
], precioInicial);

router.put('/actualizar-aumentos',[
    validarJWT,
    existeAdminPortoken,
    validarCampos 
], actualizarAumentos)


router.put('/actualizar-franccionado',[
    validarJWT,
    existeAdminPortoken,
    validarCampos 
], actualizarFraccionado)

router.get('/tarifas',[
    validarJWT,
    existeAdminPortoken,
    validarCampos 
], getTarifa);

//get de admins

router.get('/admins',[
    validarJWT,
    existeAdminPortoken,
    validarCampos 
], getAdmins)

router.get('/ingreso-por-patente', getIngresoPorPatente)


//repeticiones de patentes

router.post('/repetir-patente', [
    validarJWT,
    existeAdminPortoken,
    validarCampos 
],agregarRepeticiones);

router.get('/get-duplicados', [
    validarJWT,
    existeAdminPortoken,
    validarCampos 
],getRepeticiones);

router.put('/actualizar-duplicados', [
    validarJWT,
    existeAdminPortoken,
    validarCampos 
],putRepeticiones);

router.get('/gastos-usuario', [
    validarJWT,
    check('sucursal', 'No es un ID válido').isMongoId(),
    validarCampos
], obtenerGastoporUsuario)

//get sucursal  por id para usuario
router.get('/sucursal-usuario', [
    validarJWT,
    validarCampos 
], getSucursalporId)

//imprimir factura afip
router.get('/imprimir-afip', [
    validarJWT,
    validarCampos 
], imprimirFacturaAfip)

module.exports = router;