const style = `
  body {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0;
    padding: 0;
    line-height: 1.3em;
  }
  table {
    clear: both;
    width: 100%;
    font-size: 12px;
    max-width: 1080px;
    border-top: #589dda solid 2px;
    border-bottom: #589dda solid 2px;
  }
  th {
    border-right: 1px solid #fff;
    border-bottom: 1px solid #fff;
    padding: 6px 4px;
    line-height: 1.3;
    background: #ccdef6;
    color: #000;
    text-align: center;
  }
  td {
    border-right: 1px solid #fff;
    border-bottom: 1px solid #fff;
    padding: 6px 4px;
    line-height: 1.3;
    background: #f4f8fd;
    text-align: center;
    word-break: normal;
  }
`;

module.exports = (pre, tbid) => {
  const preRow = pre.map((row) => {
    const url = `https://www.g2b.go.kr:8143/ep/preparation/prestd/preStdDtl.do?preStdRegNo=${row.num}`;
    return `
      <tr>
        <td><a href="${url}">${row.num}</a></td>
        <td>${row.name}</td>
        <td>${row.agency}</td>
        <td>${row.date}</td>
        <td>${row.price}</td>
      </tr>
    `;
  });
  const tbidRow = tbid.map((row) => {
    const [bidno, bidseq] = row.num.split("-");
    const url = `http://www.g2b.go.kr:8081/ep/invitation/publish/bidInfoDtl.do?bidno=${bidno}&bidseq=${bidseq}&releaseYn=Y&taskClCd=5`;
    return `
      <tr>
        <td><a href="${url}">${row.num}</a></td>
        <td>${row.name}</td>
        <td>${row.agency}</td>
        <td>${row.dateUpload}<br>(${row.dateDue})</td>
        <td>${row.price}</td>
      </tr>
    `;
  });
  return `
    <html>
      <head>
        <style>${style}</style>
      </head>
      <body>
        <h2>용역-사전규격 공개</h2>
        <table>
          <tr><th>등록번호</th><th>사업명</th><th>수요기관</th><th>공개일시</th><th>배정예산액</th></tr>
          ${preRow.join("")}
        </table>
        <h2>용역 - 공고 현황</h2>
        <table>
          <tr><th>공고번호</th><th>공고명</th><th>공고기관</th><th>입력일시<br>(입찰마감일시)</th><th>배정예산</th></tr>
          ${tbidRow.join("")}
        </table>
      </body>
    </html>
 `;
};
