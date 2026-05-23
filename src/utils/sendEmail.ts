import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, message }: any) => {
  const user = process.env.EMAIL_USER || process.env.MAIL_USER;
  const pass = process.env.EMAIL_PASS || process.env.MAIL_PASS;

  if (!user || !pass) {
    throw new Error("Email credentials are not configured");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: `"ChatApp" <${user}>`,
    to,
    subject,
    html: message,
  });
};

export default sendEmail;
