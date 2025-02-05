const nodemailer = require('nodemailer');




let transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
      user: "apikey",
      pass: "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"
  }
})





function cierreCaja(emailContent, empleado, dia){
  transporter.sendMail({
    from: "villegasgmartin@gmail.com", // verified sender email
    to: "vjtreuthardt@gmail.com",
    cc: "brendagomez1310@gmail.com",
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
