import axios from "axios";
import fs from "fs";
import iconv from "iconv-lite";
import { JSDOM } from "jsdom";
// eslint-disable-next-line import/extensions
import keywords from "./keywords.js";

const today = new Date();
const weekBefore = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
const listUrl = `http://www.g2b.go.kr:8101/ep/tbid/tbidList.do?searchType=1&taskClCds=5&searchDtType=1&fromBidDt=${weekBefore.getFullYear()}/${
  weekBefore.getMonth() + 1
}/${weekBefore.getDate()}&toBidDt=${today.getFullYear()}/${
  today.getMonth() + 1
}/${today.getDate()}&recordCountPerPage=100`;

const output = "./output2.json";

(async () => {
  const { data } = await axios.get(listUrl, {
    responseType: "arraybuffer",
  });
  const searched = [];
  const dom = new JSDOM(iconv.decode(data, "EUC-KR"));
  const table = dom.window.document.querySelector("div.results > table");
  const rowList = table.querySelectorAll("tbody > tr");
  const reg = new RegExp(keywords.join("|"));
  const datereg = /(.+)\((.+)\)/;
  rowList.forEach((row) => {
    const [, num, , name, , agency, , datetime] = row.children;
    const name2 = name.textContent.replace(/\\t|\\n/g, "");
    const [, dateStart, dateEnd] = datetime.textContent.match(datereg);
    if (reg.test(name2)) {
      searched.push({
        num: num.textContent,
        name: name.textContent,
        agency: agency.textContent,
        datetime: dateStart,
        date_end: dateEnd,
      });
    }
  });
  await Promise.all(
    searched.map(async (s) => {
      const [bidno, bidseq] = s.num.split("-");
      const detailUrl = `http://www.g2b.go.kr:8081/ep/invitation/publish/bidInfoDtl.do?bidno=${bidno}&bidseq=${bidseq}&releaseYn=Y&taskClCd=5`;
      const detailPage = await axios.get(detailUrl + s.num, {
        responseType: "arraybuffer",
      });
      const domDetail = new JSDOM(iconv.decode(detailPage.data, "EUC-KR"));
      const price = domDetail.window.document
        .querySelectorAll("div.section > table.table_info")[3]
        .querySelector("tbody").children[1].children[3];
      const dd = s;
      dd.price = price.textContent.trim();
    })
  );
  fs.writeFile(
    output,
    JSON.stringify(searched, null, 1).replace(/\\t|\\n/g, ""),
    () => {}
  );
})();
