const http = require("http");
const renderToString = require("./table.js");
const fetchPrepatation = require("./preparation.js");
const fetchBid = require("./tbid.js");

const hostname = "127.0.0.1";
const port = 3000;
const server = http.createServer(async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  const preData = await fetchPrepatation();
  const tbidData = await fetchBid();
  console.log(`[LOG] 사전규격 data ${preData.length} 건 발견`);
  console.log(`[LOG] 입찰정보 data ${tbidData.length} 건 발견`);
  res.end(renderToString(preData, tbidData));
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
