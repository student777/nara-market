import renderToString from "./table.js";
import fs from "fs";

export default function sendmail() {
  const { pre, tbid } = JSON.parse(fs.readFileSync("database.json", "utf8"));
  fs.writeFileSync("test.html", renderToString(pre, tbid), "utf8");
  return;
}
