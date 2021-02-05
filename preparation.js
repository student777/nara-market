import axios from "axios";
import iconv from "iconv-lite";
import { JSDOM } from "jsdom";
// eslint-disable-next-line import/extensions
import reg from "./keywords.js";

export default async function prepatation(from, to) {
  const listUrl = `http://www.g2b.go.kr:8081/ep/preparation/prestd/preStdPublishList.do?taskClCds=5&recordCountPerPage=100&fromRcptDt=${from}&toRcptDt=${to}`;
  const { data } = await axios.get(listUrl, {
    responseType: "arraybuffer",
  });
  const searched = [];
  const dom = new JSDOM(iconv.decode(data, "EUC-KR"));
  const table = dom.window.document.querySelector("div.results > table");
  const rowList = table.querySelectorAll("tbody > tr");
  rowList.forEach((row) => {
    const [, num, , name, agency, datetime] = row.children;
    const name2 = name.textContent.replace(/\\t|\\n/g, "");
    if (reg.test(name2)) {
      searched.push({
        num: num.textContent,
        name: name.textContent,
        agency: agency.textContent,
        datetime: datetime.textContent,
      });
    }
  });
  await Promise.all(
    searched.map(async (s) => {
      const detailUrl = `https://www.g2b.go.kr:8143/ep/preparation/prestd/preStdDtl.do?preStdRegNo=${s.num}`;
      const detailPage = await axios.get(detailUrl, {
        responseType: "arraybuffer",
      });
      const domDetail = new JSDOM(iconv.decode(detailPage.data, "EUC-KR"));
      const [, , price, endDate] = domDetail.window.document.querySelector(
        "table.table_info > tbody"
      ).children;
      const dd = s;
      dd.price = price.children[1].textContent;
      dd.end_date = endDate.children[3].textContent;
    })
  );

  return searched;
}
