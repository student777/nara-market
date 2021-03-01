const nodemailer = require("nodemailer");
const renderToString = require("./table.js");
const { from } = require("./config.js");

module.exports = async (pre, tbid) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    secure: true,
    port: 465,
    auth: {
      type: "OAuth2",
      user: process.env.user,
      clientId: process.env.clientId,
      clientSecret: process.env.clientSecret,
      refreshToken: process.env.refreshToken,
      accessToken: process.env.accessToken,
      expires: 3599,
    },
  });
  const info = await transporter.sendMail({
    from: process.env.fromUser,
    to: process.env.toUser,
    subject: `오늘의 나라장터 - ${from}`,
    html: renderToString(pre, tbid),
  });
  return info;
};
