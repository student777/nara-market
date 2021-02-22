import axios from "axios";
import iconv from "iconv-lite";
import { JSDOM } from "jsdom";
// eslint-disable-next-line import/extensions
import reg from "./keywords.js";
import { from, to, countPerPage } from "./config.js";

export default async function tbid() {
  const count = await checkTotalCount();
  console.log(`[LOG] ${from} ~ ${to} 게시된 ${count} 개의 입찰정보 검색 중..`);
  const endPage = Math.ceil(count / countPerPage);
  const searched = [];
  await Promise.all(
    Array.from(Array(endPage), (_, index) => index + 1).map(async (pageNum) => {
      (await parseTable(pageNum)).forEach((d) => searched.push(d));
      console.log(`[LOG] 입찰정보 ${pageNum} 번째 페이지 검색 완료`);
    })
  );
  await Promise.all(
    searched.map(async (s) => {
      const price = await parseDetail(s.num);
      s.price = price;
    })
  );
  return searched;
}

async function checkTotalCount() {
  const url = `http://www.g2b.go.kr:8101/ep/tbid/tbidList.do?searchType=1&taskClCds=5&searchDtType=1&fromBidDt=${from}&toBidDt=${to}&useTotalCount=Y`;
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
  const url = `http://www.g2b.go.kr:8101/ep/tbid/tbidList.do?searchType=1&taskClCds=5&searchDtType=1&fromBidDt=${from}&toBidDt=${to}&recordCountPerPage=${countPerPage}&currentPageNo=${page}`;
  const { data } = await axios.get(url, {
    responseType: "arraybuffer",
  });
  const ret = [];
  const dom = new JSDOM(iconv.decode(data, "EUC-KR"));
  const table = dom.window.document.querySelector("div.results > table");
  const rowList = table.querySelectorAll("tbody > tr");
  const datereg = /(.+)\((.+)\)/;
  rowList.forEach((row) => {
    const [, num, , name, , agency, , datetime] = row.children;
    const name2 = name.textContent.replace(/\\t|\\n/g, "");
    const [, dateStart, dateEnd] = datetime.textContent.match(datereg);
    if (reg.test(name2)) {
      ret.push({
        num: num.textContent,
        name: name.textContent,
        agency: agency.textContent,
        datetime: dateStart,
        date_end: dateEnd,
      });
    }
  });
  return ret;
}

async function parseDetail(num) {
  const [bidno, bidseq] = num.split("-");
  const url = `http://www.g2b.go.kr:8081/ep/invitation/publish/bidInfoDtl.do?bidno=${bidno}&bidseq=${bidseq}&releaseYn=Y&taskClCd=5`;
  const { data } = await axios.get(url + num, {
    responseType: "arraybuffer",
  });
  const dom = new JSDOM(iconv.decode(data, "EUC-KR"));
  try {
    const price = dom.window.document
      .querySelectorAll("div.section > table.table_info")[3]
      .querySelector("tbody").children[1].children[3];
    return price.textContent.trim();
  } catch {
    console.error(`[ERROR] bid in ${url}`);
    return "[ERROR]";
  }
}
