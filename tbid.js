const axios = require("axios");
const iconv = require("iconv-lite");
const { JSDOM } = require("jsdom");
const { from, to, countPerPage } = require("./config.js");

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
  const rows = [];
  const dom = new JSDOM(iconv.decode(data, "EUC-KR"));
  const table = dom.window.document.querySelector("div.results > table");
  const rowList = table.querySelectorAll("tbody > tr");
  const reg = new RegExp(process.env.keywords);
  const datereg = /(.+)\((.+)\)/;
  rowList.forEach((row) => {
    const [, num, , name, , agency, , datetime] = row.children;
    const [, dateUpload, dateDue] = datetime.textContent.match(datereg);
    if (reg.test(name.textContent)) {
      rows.push({
        num: num.textContent,
        name: name.textContent,
        agency: agency.textContent,
        dateUpload,
        dateDue,
      });
    }
  });
  return rows;
}

async function parseDetail(row) {
  const [bidno, bidseq] = row.num.split("-");
  const url = `http://www.g2b.go.kr:8081/ep/invitation/publish/bidInfoDtl.do?bidno=${bidno}&bidseq=${bidseq}&releaseYn=Y&taskClCd=5`;
  const { data } = await axios.get(url + row.num, {
    responseType: "arraybuffer",
  });
  const dom = new JSDOM(iconv.decode(data, "EUC-KR"));
  let price;
  try {
    price = dom.window.document
      .querySelectorAll("table[summary*='입찰금액'] div.tb_inner")[3]
      .textContent.trim();
  } catch (e) {
    price = "?";
    console.error(`[ERROR] bid in ${url}`);
  }
  return {
    price,
    ...row,
  };
}

module.exports = async () => {
  const count = await checkTotalCount();
  console.log(`[LOG] ${from} ~ ${to} 게시된 ${count} 개의 입찰정보 검색 중..`);
  const endPage = Math.ceil(count / countPerPage);
  const pages = [];
  for (let i = 1; i <= endPage; i += 1) pages.push(i);
  const searched = [];
  await Promise.all(
    pages.map(async (page) => {
      const rows = await parseTable(page);
      rows.forEach((row) => searched.push(row));
      console.log(`[LOG] 입찰정보 ${page} 번째 페이지 검색 완료`);
    })
  );
  return Promise.all(searched.map((row) => parseDetail(row)));
};
