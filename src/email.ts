// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: "carifio24@gmail.com",
//     pass: "C@rifio00"
//   }
// });

// export async function sendEmail(to: string, from: string, subject: string, body: string) {
//   const options = {
//     from: from,
//     to: to,
//     subject: subject,
//     text: body
//   };
//   transporter.sendMail(options, (error, info) => {
//     if (error) {
//       console.log(error);
//     } else {
//       console.log("Email sent: " + info.response);
//     }
//   });
// }
