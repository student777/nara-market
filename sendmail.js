import nodemailer from "nodemailer";
import renderToString from "./table.js";
import fs from "fs";

export default async function sendmail() {
  const { pre, tbid } = JSON.parse(fs.readFileSync("database.json", "utf8"));
  let testAccount = await nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>',
    to: "test@naver.com",
    subject: "Hello ✔",
    html: renderToString(pre, tbid),
  });
  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  return;
}
