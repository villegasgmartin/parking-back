const nodemailer = require('nodemailer');




let transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY
  }
})





function cierreCaja(emailContent, empleado, dia){
  transporter.sendMail({
    from: "villegasgmartin@gmail.com", // verified sender email
    to: "brendagomez1310@gmail.com",
    subject: `Cierre caja de ${empleado}`, // Subject line
    text: "cierre de caja " + dia,  // plain text body
    html:  emailContent, // html body
  }, function(error, info){
    if (error) {
      console.error(error);
    } else {
      
      console.log(info, 'enviado');
    }
  });
}



module.exports = {
  cierreCaja,

  
}