import axios from "axios";
import fs from "fs";
import iconv from "iconv-lite";
import { JSDOM } from "jsdom";
// eslint-disable-next-line import/extensions
import keywords from "./keywords.js";

const url = `http://www.g2b.go.kr:8081/ep/preparation/prestd/preStdPublishList.do?taskClCds=5&recordCountPerPage=100`;
const output = "./output.json";

(async () => {
  const { data } = await axios.get(url, {
    responseType: "arraybuffer",
  });
  const searched = [];
  const dom = new JSDOM(iconv.decode(data, "EUC-KR"));
  const table = dom.window.document.querySelector("div.results > table");
  const rowList = table.querySelectorAll("tbody > tr");
  const reg = new RegExp(keywords.join("|"));
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
  fs.writeFile(
    output,
    JSON.stringify(searched, null, 1).replace(/\\t|\\n/g, ""),
    () => {}
  );
})();
