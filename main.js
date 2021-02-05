import fs from "fs";
import fetchPrepatation from "./preparation.js";
import fetchBid from "./tbid.js";

const today = new Date();
const yest = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
const from = `${yest.getFullYear()}/${yest.getMonth() + 1}/${yest.getDate()}`;
const to = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

(async () => {
  const preData = await fetchPrepatation(from, to);
  const tbidData = await fetchBid(from, to);
  const output = {
    pre: preData,
    tbid: tbidData,
  };
  fs.writeFile(
    "./database.json",
    JSON.stringify(output, null, 1).replace(/\\t|\\n/g, ""),
    () => {}
  );
})();
