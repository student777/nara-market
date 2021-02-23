import nodemailer from "nodemailer";
import renderToString from "./table.js";
import {
  user,
  clientId,
  clientSecret,
  refreshToken,
  accessToken,
  fromUser,
  toUser,
} from "./secret.js";
import { from } from "./config.js";
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
    from: fromUser,
    to: toUser,
    subject: `오늘의 나라장터 - ${from}`,
    html: renderToString(pre, tbid),
  });
  return info;
}
