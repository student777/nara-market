const today = new Date();
const yest = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
export const from = `${yest.getFullYear()}/${
  yest.getMonth() + 1
}/${yest.getDate()}`;
export const to = `${today.getFullYear()}/${
  today.getMonth() + 1
}/${today.getDate()}`;
export const countPerPage = 100; 