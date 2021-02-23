import nodemailer from "nodemailer";
import renderToString from "./table.js";
import {
  user,
  clientId,
  clientSecret,
  refreshToken,
  accessToken,
} from "./secret.js";
import fs from "fs";

export default async function sendmail() {
  const { pre, tbid } = JSON.parse(fs.readFileSync("database.json", "utf8"));
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    secure: true,
    port: 465,
    auth: {
      type: "OAuth2",
      user: user,
      clientId: clientId,
      clientSecret: clientSecret,
      refreshToken: refreshToken,
      accessToken: accessToken,
      expires: 3599,
    },
  });
  let info = await transporter.sendMail({
    from: '"Crawling Bot" <web@ccc.expert>',
    to: "web@ccc.expert",
    subject: "Hello ✔",
    html: renderToString(pre, tbid),
  });
  return info;
}
