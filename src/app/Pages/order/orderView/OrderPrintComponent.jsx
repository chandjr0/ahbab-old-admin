import React, { useEffect, useState } from "react";
import { Box } from "@material-ui/core";
import imageBasePath from "../../../../config";
import axios from "../../../../axios";
import Barcode from "react-barcode";
import useCourierStatus from "../../../hooks/Courier/useFetchAllCourier";

const OrderPrintComponent = React.forwardRef((props, ref) => {
  const { orderData, settingsData, isMultiple = false } = props;
  const [steadfastClientID, setSteadfastClientId] = useState("");
  const { couriers } = useCourierStatus();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let res = await axios.get("/courier-service/api/fetch");
        if (res) {
          let data = res?.data?.data;
          setSteadfastClientId(data?.steadfast?.STEADFAST_CLIENT_ID);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  const steadfastClientId = localStorage.getItem("STEADFAST_CLIENT_ID");

  return (
    <div ref={ref} className="print-content">
      <style>
        {`
          .print-content {
            counter-reset: page;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-sizing: border-box;
          }

          .page {
            width: 384px;
            min-height: 576px;
            margin: 20px auto;
            padding: 16px 24px;
            background-color: white;
            box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
            page-break-after: always;
            page-break-inside: avoid;
          }

          .page:after {
            counter-increment: page;
          }
          
          .page-border {
            border-bottom: 8px solid #18443F;
            padding-bottom: 8px;
          }

          .barcode svg {
            width: 130px !important; 
            height: 40px !important;
          }
          
          .table-container {
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .table-header {
            background-color: #f5f5f5;
          }
          
          .product-cell {
            padding: 5px 0;
          }
          
          .product-row {
            page-break-inside: avoid;
          }
          
          .price-summary {
            font-size: 9px;
            margin: 0;
            padding: 2px 0;
            color: #000;
            display: flex;
            justify-content: space-between;
          }

          @page {
            size: 384px 576px;
            margin: 0;
          }

          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            
            .print-content {
              width: 100%;
              height: 100%;
            }
            
            .page {
              width: 384px;
              height: 576px;
              margin: 0 auto;
              padding: 16px 24px;
              box-shadow: none;
              page-break-after: always;
              page-break-inside: avoid;
            }
            
            .page-border {
              border-bottom: 8px solid #18443F;
              padding-bottom: 8px;
            }
            
            .table-container {
              display: flex;
              flex-direction: column;
              overflow: hidden;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
            }
            
            .product-row {
              page-break-inside: avoid;
            }
            
            .product-row td {
              padding: 4px 2px;
              font-size: 10px;
            }
            
            tbody {
              page-break-inside: auto;
            }
            
            thead {
              display: table-header-group;
            }
          }
        `}
      </style>

      {isMultiple ? (
        orderData.length > 0 &&
        orderData?.map((data, index) => (
          <div key={index} className="page-container">
            {renderOrder(data, settingsData, steadfastClientId, couriers, isMultiple)}
          </div>
        ))
      ) : (
        orderData && renderOrder(orderData, settingsData, steadfastClientId, couriers, isMultiple)
      )}
    </div>
  );
});

const renderOrder = (data, settingsData, steadfastClientId, couriers, isMultiple = false) => {
  // Conservative and safe calculation
  const PRODUCTS_PER_FIRST_PAGE = 9; // More conservative for single order
  const PRODUCTS_PER_CONTINUATION_PAGE = 13; // Conservative for continuation pages
  
  const products = data?.products || [];
  const pages = [];
  

  
  if (products.length <= PRODUCTS_PER_FIRST_PAGE) {
    // Single page order
    pages.push({
      isFirstPage: true,
      products: products,
      showSummary: true,
      startIndex: 0,
      endIndex: products.length - 1
    });
  } else {
    // Multi-page order
    let currentIndex = 0;
    
    // First page
    const firstPageProducts = products.slice(0, PRODUCTS_PER_FIRST_PAGE);
    pages.push({
      isFirstPage: true,
      products: firstPageProducts,
      showSummary: false,
      startIndex: 0,
      endIndex: PRODUCTS_PER_FIRST_PAGE - 1
    });
    currentIndex = PRODUCTS_PER_FIRST_PAGE;
    
    // Continuation pages
    while (currentIndex < products.length) {
      const remainingProducts = products.length - currentIndex;
      const productsForThisPage = Math.min(PRODUCTS_PER_CONTINUATION_PAGE, remainingProducts);
      const isLastPage = currentIndex + productsForThisPage >= products.length;
      
      const pageProducts = products.slice(currentIndex, currentIndex + productsForThisPage);
      pages.push({
        isFirstPage: false,
        products: pageProducts,
        showSummary: isLastPage,
        startIndex: currentIndex,
        endIndex: currentIndex + productsForThisPage - 1
      });
      
      currentIndex += productsForThisPage;
    }
  }
  
  // Debug: Log page breakdown
  pages.forEach((page, index) => {
    console.log(`Page ${index + 1}: Products ${page.startIndex + 1}-${page.endIndex + 1} (${page.products.length} items)`);
  });
  
  return pages.map((page, pageIndex) => (
    <div key={pageIndex} className="page">
      <div className="page-border">
        {page.isFirstPage && (
          <>
            <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
              <img
                width={106}
                height={31}
                src={`${imageBasePath}/${settingsData?.logoImg}`}
                alt="Logo"
              />
            </Box>
            <div className="text-center">
              <h6
                className="mb-0 mt-1"
                style={{ color: "#000", fontSize: "11px", fontWeight: "normal" }}
              >
                Shop ID: <strong>{steadfastClientId}</strong>
              </h6>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
              <div style={{ maxWidth: "55%", flex: "1", marginRight: "8px" }}>
                <div>
                  <p
                    style={{ fontSize: "11px", margin: "2px 0", wordWrap: "break-word", lineHeight: "1.3" }}
                    className="font-medium"
                  >
                    <span style={{ color: "#000" }}>
                      Name: {data?.deliveryAddress?.name}
                    </span>
                  </p>
                  <p
                    style={{ fontSize: "11px", margin: "2px 0", wordWrap: "break-word", lineHeight: "1.3" }}
                    className="font-medium"
                  >
                    <span style={{ color: "#000" }}>
                      Phone: {data?.deliveryAddress?.phone}
                    </span>
                  </p>
                  <p
                    style={{ fontSize: "11px", margin: "2px 0", wordWrap: "break-word", lineHeight: "1.3", overflow: "hidden" }}
                    className="font-medium"
                  >
                    <span style={{ color: "#000" }}>
                      Address: {data?.deliveryAddress?.city?.city_name},
                      {data?.deliveryAddress?.zone?.zone_name},{" "}
                      {data?.deliveryAddress?.address}
                    </span>
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", maxWidth: "45%", flexShrink: 0 }}>
                <p
                  style={{ fontSize: "10px", width: "130px", letterSpacing: "1px", margin: "0 0 4px 0", textAlign: "center", fontWeight: "bold" }}
                >
                  Hotline: {settingsData?.phone}
                </p>

                <div style={{ maxWidth: "138px", overflow: "hidden" }} className="barcode">
                  <Barcode
                    displayValue={false}
                    fontSize={12}
                    height={20}
                    value={data?.serialId || ""}
                  />
                </div>
                
                <h6
                  style={{
                    color: "#000",
                    fontSize: "10px",
                    letterSpacing: "2px",
                    margin: "4px 0 0 0",
                    fontWeight: "bold"
                  }}
                >
                  {data?.serialId}
                </h6>
              </div>
            </div>
          </>
        )}
        
        {!page.isFirstPage && (
          <div style={{ textAlign: "left", marginBottom: isMultiple ? "8px" : "8px", }}>
            {isMultiple ? (
              <>
              <span style={{ color: "#666", fontSize: "9px", margin: "2px 0 0 0" }}>
                  ID: {data?.serialId} - Page {pageIndex + 1}
                </span>
                {/* <h6 style={{ color: "#000", fontSize: "11px", margin: "0", fontWeight: "bold" }}>
                  ID: {data?.serialId} - Page {pageIndex + 1} 
                  || {" "}
                  <span style={{ color: "#666", fontSize: "9px", margin: "2px 0 0 0" }}>
                  Items {page.startIndex + 1}-{page.endIndex + 1} of {products.length}
                </span>
                </h6> */}
                
              </>
            ) : (
              <h6 style={{ color: "#000", fontSize: "9px", margin: "0", fontWeight: "bold" }}>
                #{data?.serialId} | Pg {pageIndex + 1} | {page.startIndex + 1}–{page.endIndex + 1} of {products.length}
              </h6>
            )}
          </div>
        )}

        <div style={{ marginTop: page.isFirstPage ? "12px" : "8px", border: "1px solid #ddd" }} className="table-container">
          <table style={{ width: "100%" }}>
            <thead>
              <tr className="table-header">
                <th style={{ textAlign: "left", padding: "4px 8px", fontSize: "11px", fontWeight: "bold" }}>
                  PRODUCT
                </th>
                <th style={{ textAlign: "center", padding: "4px 8px", fontSize: "11px", fontWeight: "bold" }}>
                  Qty
                </th>
                <th style={{ textAlign: "right", padding: "4px 8px", fontSize: "11px", fontWeight: "bold" }}>
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {page.products.map((product, idx) => (
                <tr key={idx} className="product-row">
                  <td style={{ padding: "4px 8px", fontSize: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", maxWidth: "190px" }}>
                      <img
                        width={25}
                        height={25}
                        src={`${imageBasePath}/${product?.product?.galleryImage?.[0]}`}
                        alt="Product"
                        style={{ borderRadius: "4px", marginRight: "8px" }}
                      />
                      <span style={{ fontSize: "10px" }}>
                        {product?.product?.name}{" "}
                        {product?.isVariant && `(${product?.variationName})`}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: "center", padding: "4px 8px", fontSize: "10px" }}>
                    {product?.quantity}
                  </td>
                  <td style={{ textAlign: "right", padding: "4px 8px", fontSize: "10px" }}>
                    {product?.price * product?.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {page.showSummary && (
            <div style={{ padding: "8px 16px", borderTop: "1px solid #ddd" }}>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: "150px" }}>
                  <p className="price-summary">
                    <span>Sub Total:</span>
                    <span>৳ {data?.customerCharge?.totalProductPrice}</span>
                  </p>

                  <p className="price-summary">
                    <span>Delivery Charge:</span>
                    <span>৳ {data?.customerCharge?.deliveryCharge}</span>
                  </p>

                  {data?.customerCharge?.discountPrice > 0 && (
                    <p className="price-summary">
                      <span>Discount:</span>
                      <span>৳ {data?.customerCharge?.discountPrice}</span>
                    </p>
                  )}

                  {data?.customerCharge?.discountPrice > 0 && (
                    <p className="price-summary">
                      <span>Total:</span>
                      <span>৳ {data?.customerCharge?.totalBill}</span>
                    </p>
                  )}

                  {data?.customerCharge?.totalPayTk > 0 && (
                    <p className="price-summary">
                      <span>Advance Pay:</span>
                      <span>৳ {data?.customerCharge?.totalPayTk}</span>
                    </p>
                  )}

                  <p className="price-summary" style={{ fontWeight: "bold" }}>
                    <span>Collectable Amount:</span>
                    <span>৳ {data?.customerCharge?.remainingTkPay}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ));
};

export default OrderPrintComponent; 