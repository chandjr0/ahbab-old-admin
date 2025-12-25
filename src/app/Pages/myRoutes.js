import React from "react";

const pagesRoutes = [
  {
    path: "/dashboard",
    component: React.lazy(() => import("./dashboard/dashboard")),
  },
  {
    path: "/dashboard-reseller",
    component: React.lazy(() => import("./dashboard/resellerDashboard")),
  },
  {
    path: "/dashboard-reseller-wise/:id/:name",
    component: React.lazy(() => import("./dashboard/resellerWiseDashboard")),
  },
  {
    path: "/create-order",
    component: React.lazy(() => import("./order/posOrder/posOrder")),
  },
  {
    path: "/update-order/:serialId",
    component: React.lazy(() =>
      import("./order/posOrderUpdate/posOrderUpdate")
    ),
  },
  {
    path: "/update-affiliate-order/:serialId/:type",
    component: React.lazy(() =>
      import("./order/posOrderUpdate/posOrderUpdate")
    ),
  },
  {
    path: "/incomplete-order",
    component: React.lazy(() => import("./incompleteOrder/IncompleteOrder")),
  },

  {
    path: "/order-list",
    component: React.lazy(() => import("./order/orderList/orderlist")),
  },
  {
    path: "/order-view/:serialId",
    component: React.lazy(() => import("./order/orderView/orderView")),
  },
  {
    path: "/reseller-order-view/:serialId",
    component: React.lazy(() => import("./order/reSellerOrderView/orderView")),
  },
  {
    path: "/multiple-order-view",
    component: React.lazy(() => import("./order/orderView/multipleOrderView")),
  },
  {
    path: "/reseller-multiple-order-view",
    component: React.lazy(() => import("./order/reSellerOrderView/multipleOrderView")),
  },
  {
    path: "/order-return-refund",
    component: React.lazy(() => import("./order/returnRefund/returnRefund")),
  },

  {
    path: "/create-purchase",
    component: React.lazy(() =>
      import("./purchase/purchaseCreate/createPurchase")
    ),
  },
  
  {
    path: "/create-purchase-balance",
    component: React.lazy(() =>
      import("./purchase/stockManage/stockProcess")
    ),
  },
  {
    path: "/purchase-list",
    component: React.lazy(() => import("./purchase/purchaseList/purchaseList")),
  },
  {
    path: "/stockProcess-list",
    component: React.lazy(() => import("./purchase/stockManage/stockProcessList")),
  },
  {
    path: "/purchase-view/:serialId",
    component: React.lazy(() => import("./purchase/purhaseView/purchaseView")),
  },
  {
    path: "/customer",
    component: React.lazy(() => import("./customer/customerList")),
  },
  {
    path: "/sms-list",
    component: React.lazy(() => import("./sms/smsList")),
  },
  {
    path: "/direct-sms",
    component: React.lazy(() => import("./sms/bulkMsgSend")),
  },
  {
    path: "/create-supplier",
    component: React.lazy(() => import("./supplier/createSupplier")),
  },
  {
    path: "/update-supplier/:supplierId",
    component: React.lazy(() => import("./supplier/updateSupplier")),
  },
  {
    path: "/supplier-list",
    component: React.lazy(() => import("./supplier/supplierList")),
  },
  {
    path: "/expense-head",
    component: React.lazy(() => import("./expenseHead/expenseHead")),
  },
  {
    path: "/create-expense",
    component: React.lazy(() => import("./expense/createExpense")),
  },
  {
    path: "/update-expense/:expenseId",
    component: React.lazy(() => import("./expense/updateExpense")),
  },
  {
    path: "/expense-list",
    component: React.lazy(() => import("./expense/expenseList")),
  },
  {
    path: "/create-product",
    component: React.lazy(() =>
      import("./product/createProduct/createProducts")
    ),
  },
  {
    path: "/update-product/:productSlug",
    component: React.lazy(() =>
      import("./product/updateProduct/updateProducts")
    ),
  },
  {
    path: "/product-list",
    component: React.lazy(() => import("./product/productList/productList")),
  },
  // {
  //   path: "/alert-products",
  //   component: React.lazy(() => import("./product/stockAlert/stockAlert")),
  // },
  {
    path: "/create-category",
    component: React.lazy(() => import("./category/createCategory")),
  },
  {
    path: "/update-category/:categoryId",
    component: React.lazy(() => import("./category/updateCategory")),
  },
  {
    path: "/category-list",
    component: React.lazy(() => import("./category/CategoryList")),
  },
  {
    path: "/create-attribute",
    component: React.lazy(() => import("./attributes/createAttribute")),
  },
  {
    path: "/update-attribute/:attributeId",
    component: React.lazy(() => import("./attributes/updateAttribute")),
  },
  {
    path: "/attribute-list",
    component: React.lazy(() => import("./attributes/AttributeList")),
  },
  {
    path: "/create-attribute-value",
    component: React.lazy(() => import("./attributes/createAttributeValue")),
  },
  {
    path: "/update-attribute-value/:attributeValueId",
    component: React.lazy(() => import("./attributes/updateAttributeValue")),
  },
  {
    path: "/attribute-value-list",
    component: React.lazy(() => import("./attributes/AttributeValueList ")),
  },
  {
    path: "/create-brand",
    component: React.lazy(() => import("./brand/createBrand")),
  },
  {
    path: "/update-brand/:brandId",
    component: React.lazy(() => import("./brand/updateBrand")),
  },
  {
    path: "/brand-list",
    component: React.lazy(() => import("./brand/brandList")),
  },
  {
    path: "/sticker",
    component: React.lazy(() => import("./sticker/sticker")),
  },
  {
    path: "/create-promo",
    component: React.lazy(() => import("./promo/createPromo")),
  },
  {
    path: "/update-promo/:promoId",
    component: React.lazy(() => import("./promo/updatePromo.jsx")),
  },
  {
    path: "/promo-list",
    component: React.lazy(() => import("./promo/promoList")),
  },
  {
    path: "/create-campaign",
    component: React.lazy(() => import("./campaign/createCampaign")),
  },
  {
    path: "/update-campaign/:campaignId",
    component: React.lazy(() => import("./campaign/updateCampaign")),
  },
  {
    path: "/view-campaign/:campaignId",
    component: React.lazy(() => import("./campaign/Details/viewCampaign")),
  },
  {
    path: "/campaign-list",
    component: React.lazy(() => import("./campaign/campaignList")),
  },
  // {
  //   path: "/section/:sectionSlug",
  //   component: React.lazy(() =>
  //     import("./section/sectionProducts/sectionProducts")
  //   ),
  // },
  // {
  //   path: "/section",
  //   component: React.lazy(() => import("./section/sectionCrud/sectionDetails")),
  // },
  {
    path: "/flash-deal",
    component: React.lazy(() => import("./flashdeal/flashdeal")),
  },
  {
    path: "/courier",
    component: React.lazy(() => import("./courier/courier")),
  },
  {
    path: "/courier-service",
    component: React.lazy(() => import("./courierService/courierService.jsx")),
  },
  // {
  //   path: "/divisions",
  //   component: React.lazy(() => import("./locations/divisions")),
  // },
  {
    path: "/districts",
    component: React.lazy(() => import("./locations/district")),
  },
  {
    path: "/upazila",
    component: React.lazy(() => import("./locations/upazila")),
  },
  {
    path: "/home-view",
    component: React.lazy(() => import("./homeView/homeView")),
  },
  {
    path: "/page-update",
    component: React.lazy(() => import("./singlePage/pageUpdate")),
  },
  {
    path: "/page-view",
    component: React.lazy(() => import("./singlePage/pagesView")),
  },
  {
    path: "/delivery-charge",
    component: React.lazy(() => import("./deliveryCharge/deliveryCharge")),
  },
  {
    path: "/pop-up-img",
    component: React.lazy(() => import("./media/popupImg")),
  },
  {
    path: "/slider-img",
    component: React.lazy(() => import("./media/sliders")),
  },
  {
    path: "/brand-img",
    component: React.lazy(() => import("./media/brandImg")),
  },
  {
    path: "/fb-pixel",
    component: React.lazy(() => import("./media/fbPixel")),
  },
  {
    path: "/google-scripts",
    component: React.lazy(() => import("./media/google")),
  },
  {
    path: "/other-scripts",
    component: React.lazy(() => import("./media/thirdPartyScripts")),
  },
  {
    path: "/banner-img",
    component: React.lazy(() => import("./media/bannerImg")),
  },
  {
    path: "/banner-text",
    component: React.lazy(() => import("./media/bannerText")),
  },
  {
    path: "/create-employee",
    component: React.lazy(() => import("./employee/createEmployee")),
  },
  {
    path: "/employee-list",
    component: React.lazy(() => import("./employee/employeeList.jsx")),
  },
  {
    path: "/employee-role/:employeeId",
    component: React.lazy(() => import("./employee/rolePermission")),
  },
  {
    path: "/profile",
    component: React.lazy(() => import("./general/profile")),
  },
  {
    path: "/password",
    component: React.lazy(() => import("./general/password")),
  },
  {
    path: "/product-report",
    component: React.lazy(() => import("./report/productReport")),
  },
  {
    path: "/account-report",
    component: React.lazy(() => import("./report/accountReport")),
  },

  {
    path: "/create-reSeller",
    component: React.lazy(() => import("./ReSeller/resellerCreate")),
  },
  {
    path: "/reseller-list",
    component: React.lazy(() => import("./ReSeller/resellerList")),
  },

  {
    path: "/reseller-application-list",
    component: React.lazy(() => import("./ReSeller/applicationList")),
  },
  {
    path: "/reseller-application-update/:appId",
    component: React.lazy(() => import("./ReSeller/updateReseller")),
  },
  {
    path: "/reseller-order-list-admin",
    component: React.lazy(() => import("./order/reSellerOrder/reSellerOrderList")),
  },
  {
    path: "/search-order/admin",
    component: React.lazy(() => import("./order/orderSearch/orderSearch")),
  },
  {
    path: "/pending-payment-list",
    component: React.lazy(() => import("./ReSeller/resellerPayment/pendingPaidList.jsx")),
  },
  {
    path: "/make-invoice",
    component: React.lazy(() => import("./ReSeller/resellerPayment/makeInvoice")),
  },
  {
    path: "/reseller-wise-order-list/:id/:name",
    component: React.lazy(() => import("./ReSeller/resellerPayment/resellerWiseOrderList")),
  },
  {
    path: "/reseller-invoice-list",
    component: React.lazy(() => import("./ReSeller/resellerPayment/resellerInvoiceList")),
  },
  {
    path: "/reseller-wise-order-list/:id",
    component: React.lazy(() => import("./ReSeller/resellerPayment/invoiceWiseOrderList")),
  },
  {
    path: "/print-payment-invoice/:id",
    component: React.lazy(() => import("./ReSeller/resellerPayment/resellerInvoicePrint")),
  },
  {
    path: "/category-commission",
    component: React.lazy(() => import("./category/addCommision")),
  },
  {
    path: "/add-courier",
    component: React.lazy(() => import("./addCourier/addAllCourier")),
  },
  {
    path: "/reseller-application-pdf-view/:appId",
    component: React.lazy(() => import("./ReSeller/resellerPdfView")),
  },
  {
    path: "/searchOrder-invoice",
    component: React.lazy(() => import("./order/orderSearch/searchOrderForInvoice")),
  },
  {
    path: "/searchOrder-deliver",
    component: React.lazy(() => import("./order/orderSearch/orderSearchForDeliver.jsx")),
  },
  {
    path: "/create-combo-product",
    component: React.lazy(() => import("./comboProduct/addComboProduct")),
  },
  {
    path: "/scan-to-return",
    component: React.lazy(() => import("./ReSeller/resellerPayment/scanToReturn")),
  },
  {
    path: "/manual-payment",
    component: React.lazy(() => import("./general/manualPayment")),
  },
  {
    path: "/manual-payment-list",
    component: React.lazy(() => import("./general/paymentList")),
  },
  {
    path: "/update-manual-pay/:payId",
    component: React.lazy(() => import("./general/updateManualPayment")),
  },
  {
    path: "/create-combo",
    component: React.lazy(() => import("./comboProduct/addComboProduct")),
  },
  {
    path: "/combo-list",
    component: React.lazy(() => import("./comboProduct/comboList")),
  },
  {
    path: "/update-comboProduct/:comId",
    component: React.lazy(() => import("./comboProduct/updateCombo")),
  },
  {
    path: "/create-showroom",
    component: React.lazy(() => import("./showroom/createShowroom")),
  },
  {
    path: "/showroom-list",
    component: React.lazy(() => import("./showroom/showroomList")),
  },
  {
    path: "/update-showroom/:showId",
    component: React.lazy(() => import("./showroom/updateShowroom")),
  },
  {
    path: "/log-history",
    component: React.lazy(() => import("./logHistory/LogHistory.jsx")),
  },
  {
    path: "/online-payment",
    component: React.lazy(() => import("./onlinePayment/onlinePayment")),
  },

];

export default pagesRoutes;
