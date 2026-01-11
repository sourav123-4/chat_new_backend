import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, message }: any) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"ChatApp" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: message,
  });
};

export default sendEmail;
