const fetchPrepatation = require("./preparation.js");
const fetchBid = require("./tbid.js");
const reg = require("./keywords.js");
const sendmail = require("./sendmail.js");

exports.main = async (req, res) => {
  const log = [];
  log.push(`[LOG] 개미는 (뚠뚠) 🐜🐜 오늘도 (뚠뚠) 🐜🐜 열심히 일을 하네🎵`);
  log.push(`[LOG] 지정된 키워드: ${reg}`);
  const preData = await fetchPrepatation();
  const tbidData = await fetchBid();
  log.push(`[LOG] 사전규격 data ${preData.length} 건 발견`);
  log.push(`[LOG] 입찰정보 data ${tbidData.length} 건 발견`);
  await sendmail(preData, tbidData);
  log.push("[LOG] 메일 전송 완료");
  log.push("[LOG] 수고했어요 내일봐요😚😚 그럼 이만 *.*");
  console.log(log.join("\n"));
  return res.send(log.join("<br>"));
};
