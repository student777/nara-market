import axios from "axios";
import iconv from "iconv-lite";
import { JSDOM } from "jsdom";
// eslint-disable-next-line import/extensions
import reg from "./keywords.js";
import { from, to, countPerPage } from "./config.js";

export default async function preparation() {
  const count = await checkTotalCount();
  console.log(`[LOG] ${from} ~ ${to} 게시된 ${count} 개의 사전규격 검색 중..`);
  const endPage = Math.ceil(count / countPerPage);
  const searched = [];
  await Promise.all(
    Array.from(Array(endPage), (_, index) => index + 1).map(async (pageNum) => {
      (await parseTable(pageNum)).forEach((d) => searched.push(d));
      console.log(`[LOG] 사전규격 ${pageNum} 번째 페이지 검색 완료`);
    })
  );
  await Promise.all(
    searched.map(async (s) => {
      const { price, end_date } = await parseDetail(s.num);
      s.price = price;
      s.end_date = end_date;
    })
  );
  return searched;
}

async function checkTotalCount() {
  const url = `http://www.g2b.go.kr:8081/ep/preparation/prestd/preStdPublishList.do?taskClCds=5&fromRcptDt=${from}&toRcptDt=${to}&useTotalCount=Y`;
  const { data } = await axios.get(url, {
    responseType: "arraybuffer",
  });
  const dom = new JSDOM(iconv.decode(data, "EUC-KR"));
  const totalCount = dom.window.document
    .querySelector("div.inforight > span.page")
    .textContent.match(/\d+/)[0];
  return totalCount;
}

async function parseTable(page) {
  const url = `http://www.g2b.go.kr:8081/ep/preparation/prestd/preStdPublishList.do?taskClCds=5&recordCountPerPage=${countPerPage}&fromRcptDt=${from}&toRcptDt=${to}&currentPageNo=${page}`;
  const { data } = await axios.get(url, {
    responseType: "arraybuffer",
  });
  const ret = [];
  const dom = new JSDOM(iconv.decode(data, "EUC-KR"));
  const table = dom.window.document.querySelector("div.results > table");
  const rowList = table.querySelectorAll("tbody > tr");
  rowList.forEach((row) => {
    const [, num, , name, agency, datetime] = row.children;
    const name2 = name.textContent.replace(/\\t|\\n/g, "");
    if (reg.test(name2)) {
      ret.push({
        num: num.textContent,
        name: name.textContent,
        agency: agency.textContent,
        datetime: datetime.textContent,
      });
    }
  });
  return ret;
}

async function parseDetail(num) {
  const url = `https://www.g2b.go.kr:8143/ep/preparation/prestd/preStdDtl.do?preStdRegNo=${num}`;
  const { data } = await axios.get(url, {
    responseType: "arraybuffer",
  });
  const dom = new JSDOM(iconv.decode(data, "EUC-KR"));
  const [, , price, endDate] = dom.window.document.querySelector(
    "table.table_info > tbody"
  ).children;
  return {
    price: price.children[1].textContent,
    end_date: endDate.children[3].textContent,
  };
}
