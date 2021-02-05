import axios from "axios";
import iconv from "iconv-lite";
import { JSDOM } from "jsdom";
// eslint-disable-next-line import/extensions
import reg from "./keywords.js";

export default async function tbid(from, to) {
  const listUrl = `http://www.g2b.go.kr:8101/ep/tbid/tbidList.do?searchType=1&taskClCds=5&searchDtType=1&fromBidDt=${from}&toBidDt=${to}&recordCountPerPage=100`;
  const { data } = await axios.get(listUrl, {
    responseType: "arraybuffer",
  });
  const searched = [];
  const dom = new JSDOM(iconv.decode(data, "EUC-KR"));
  const table = dom.window.document.querySelector("div.results > table");
  const rowList = table.querySelectorAll("tbody > tr");
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
      try {
        const price = domDetail.window.document
          .querySelectorAll("div.section > table.table_info")[3]
          .querySelector("tbody").children[1].children[3];
        const dd = s;
        dd.price = price.textContent.trim();
      } catch {
        console.log(`[ERROR] bid in ${detailUrl}`);
      }
    })
  );
  return searched;
}
