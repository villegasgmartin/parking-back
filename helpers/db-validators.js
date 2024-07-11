const Rol = require('../models/role');
//modelos de usuario
const Empleado = require('../models/empleado')


const esRoleValido = async(rol = '') => {

    const existeRol = await Rol.findOne({ rol });
    if ( !existeRol ) {
        throw new Error(`El rol ${ rol } no está registrado en la BD`);
    }
}

const emailExiste = async( correo = '' ) => {

    // Verificar si el correo existe
    const existeEmail = await Empleado.findOne({ correo });
   

    if ( existeEmail) {
        throw new Error(`El correo: ${ correo }, ya está registrado`);
    }
}

const existeUsuarioPorId = async( id ) => {
    
    // Verificar si el correo existe
    const existeUsuario = await Empleado.findById(id);
    



    if ( !existeUsuario ) {
        throw new Error(`El id no existe ${ id }`);
    }
}



module.exports = {
    esRoleValido,
    emailExiste,
    existeUsuarioPorId
}
