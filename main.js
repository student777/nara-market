import fs from "fs";
import fetchPrepatation from "./preparation.js";
import fetchBid from "./tbid.js";
import reg from "./keywords.js";

(async () => {
  console.log(`[LOG] 개미는 (뚠뚠) 🐜🐜 오늘도 (뚠뚠) 🐜🐜 열심히 일을 하네🎵`);
  console.log(`[LOG] 지정된 키워드: ${reg}`);
  const preData = await fetchPrepatation();
  const tbidData = await fetchBid();
  const output = {
    pre: preData,
    tbid: tbidData,
  };
  fs.writeFile(
    "./database.json",
    JSON.stringify(output, null, 1).replace(/\\t|\\n/g, ""),
    () => {}
  );
  console.log(`[LOG] 사전규격 data ${preData.length} 건 발견`);
  console.log(`[LOG] 입찰정보 data ${tbidData.length} 건 발견`);
  console.log(`[LOG] 수고했어요 내일봐요😚😚 그럼 이만 *.*`);
})();
