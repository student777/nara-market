const axios = require("axios");
const iconv = require("iconv-lite");
const { JSDOM } = require("jsdom");
const reg = require("./keywords.js");
const { from, to, countPerPage } = require("./config.js");

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
  const rows = [];
  const dom = new JSDOM(iconv.decode(data, "EUC-KR"));
  const table = dom.window.document.querySelector("div.results > table");
  const rowList = table.querySelectorAll("tbody > tr");
  rowList.forEach((row) => {
    const [, num, , name, agency, date] = row.children;
    if (reg.test(name.textContent)) {
      rows.push({
        num: num.textContent,
        name: name.textContent.replace(/\t|\n/g, ""),
        agency: agency.textContent.replace(/\t|\n/g, ""),
        date: date.textContent.replace(/\t|\n/g, ""),
      });
    }
  });
  return rows;
}

async function parseDetail(row) {
  const url = `https://www.g2b.go.kr:8143/ep/preparation/prestd/preStdDtl.do?preStdRegNo=${row.num}`;
  const { data } = await axios.get(url, {
    responseType: "arraybuffer",
  });
  const dom = new JSDOM(iconv.decode(data, "EUC-KR"));
  const [, , price] = dom.window.document.querySelector(
    "table.table_info > tbody"
  ).children;
  return {
    price: price.children[1].textContent.replace(/\t|\n/g, ""),
    ...row,
  };
}

module.exports = async () => {
  const count = await checkTotalCount();
  console.log(`[LOG] ${from} ~ ${to} 게시된 ${count} 개의 사전규격 검색 중..`);
  const endPage = Math.ceil(count / countPerPage);
  const pages = [];
  for (let i = 1; i <= endPage; i += 1) pages.push(i);
  const searched = [];
  await Promise.all(
    pages.map(async (page) => {
      const rows = await parseTable(page);
      rows.forEach((row) => searched.push(row));
      console.log(`[LOG] 사전규격 ${page} 번째 페이지 검색 완료`);
    })
  );
  return Promise.all(searched.map((row) => parseDetail(row)));
};
