const gotoProductPage = (slug) => {
  window.open(`${process.env.REACT_APP_FRONTEND}/product/` + slug, "_blank");
};
module.exports = {
  gotoProductPage,
};
