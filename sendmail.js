const nodemailer = require("nodemailer");
const renderToString = require("./table.js");
const {
  user,
  clientId,
  clientSecret,
  refreshToken,
  accessToken,
  fromUser,
  toUser,
} = require("./secret.js");
const { from } = require("./config.js");

module.exports = async (pre, tbid) => {
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
};
