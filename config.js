const today = new Date();
const yest = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
exports.from = `${yest.getFullYear()}/${yest.getMonth() + 1}/${yest.getDate()}`;
exports.to = `${today.getFullYear()}/${
  today.getMonth() + 1
}/${today.getDate()}`;
exports.countPerPage = 100;
