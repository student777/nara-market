import fs from "fs";
import fetchPrepatation from "./preparation.js";
import fetchBid from "./tbid.js";

(async () => {
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
})();
