const { Router } = require('express');
const { check } = require('express-validator');


const { validarCampos } = require('../middlewares/validar-campos');


const { login } = require('../controllers/auth');
const { logout, validarJWT } = require('../middlewares/validar-jwt');


const router = Router();

router.post('/login',[
    check('correo', 'El correo es obligatorio').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validarCampos
],login );

router.get('/logout',[
    validarJWT,
    validarCampos
] ,logout);

module.exports = router;