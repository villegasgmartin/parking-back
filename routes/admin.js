const { Router } = require('express');
const { check } = require('express-validator');


const {
    validarCampos,
    validarJWT,
    esAdminRole,
    tieneRole
} = require('../middlewares');

const { crearSucursal, getSucursales } = require('../controllers/admin');


const router = Router();

router.post('/new-sucursal',[
    validarJWT,
    validarCampos
],crearSucursal );

router.get('/sucursales',[
    validarJWT,
    validarCampos
],getSucursales );



module.exports = router;