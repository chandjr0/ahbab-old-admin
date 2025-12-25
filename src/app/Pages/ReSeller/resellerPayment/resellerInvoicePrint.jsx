import { Box, Card, Icon, IconButton, Typography } from "@material-ui/core";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import axios from "../../../../axios";
import Spinner from "../../../Shared/Spinner/Spinner";
import { useParams } from "react-router-dom";
import Barcode from "react-barcode";

const PrintComponent = React.forwardRef((props, ref) => {
  const { id } = useParams();

  const { detailsInfo, orderData } = props;

  return (
    <div ref={ref} className="print-content">
      <style>
        {`
              .print-content {
                counter-reset: page;
              }
              
              .page {
                margin: 36px 28px;
                padding: 36px 28px;
                background-color: white;
                box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
                page-break-after: always;
              }
              
              .page:after {
                counter-increment: page;
              }
              
              
              @page {
                margin: 48px 28px;
                @bottom-left {
                  content: none;
                }
              
                @bottom-right {
                  content: counter(page);
                }
              }
  
              @media print {
                .page {
                  margin: 0;
                  padding: 0;
                  box-shadow: none;
                }
  
                td, th, tr{
                  padding: 13px 8px !important; 
                }
  
              }
            
              `}
      </style>
      <div className="page">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div>
            <h5 style={{ marginBottom: "2px" }}>Ahbab</h5>
            <p style={{ marginBottom: "2px" }}>House# 10, Road#3C, DHaka-122</p>
            <p style={{ marginBottom: "2px" }}>Date : {moment(detailsInfo?.createdAt).format("MMM DD YYYY")}</p>
            <p style={{ marginBottom: "2px" ,textTransform:'capitalize'}}>Created By : {detailsInfo?.createdBy}</p>


          </div>
          <div className="mr-10">
            {/* <img src="/Logo.png" style={{ width: "120px", height: "50px" }} /> */}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              padding: "5px 10px",
              fontSize: "24px",
              backgroundColor: "#1234",
              color: "#fff",
            }}
          >
            INVOICE
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginTop: "20px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div>
              <div
                style={{
                  padding: " 2px 0px 2px 0px",
                  textAlign: "start",
                }}
              >
                Reseller
              </div>
              <div
                style={{
                  padding: " 2px 0px 2px 0px",
                  textAlign: "start",
                }}
              >
                Name:{" "}
                <span
                  style={{ fontWeight: "bold", textTransform: "capitalize" }}
                >
                  {detailsInfo?.reseller?.name}
                </span>
              </div>

              <div
                style={{
                  padding: " 2px 0px 2px 0px",
                  textAlign: "start",
                }}
              >
                Phone:{" "}
                <span style={{ fontWeight: "bold" }}>
                  {detailsInfo?.reseller?.phone}
                </span>
              </div>
            </div>
          </div>
          <div>
            <div>
              {/* <div
                style={{
                  padding: " 2px 0px 2px 0px",
                  textAlign: "start",
                }}
              >
                DATE : {moment(detailsInfo?.createdAt).format("MMM DD YYYY")}
              </div>
              <div
                style={{
                  padding: " 2px 0px 2px 0px",
                  textAlign: "start",
                }}
              >
                BY : {detailsInfo?.createdBy}
              </div> */}

              <div style={{ padding: " 2px 0px 2px 0px", textAlign: "start" }}>
                Invoice ID : {detailsInfo?.serialId}
              </div>
            </div>
            {/* <div
              style={{
                marginLeft: "5px",
                minWidth: "200px",
              }}
            >
              <div
                style={{
                  textAlign: "start",
                  padding: " 2px 0px 2px 0px",
                }}
              >
                {moment(detailsInfo?.createdAt).format("MMM DD YYYY")}
              </div>
              <div
                style={{
                  textAlign: "start",
                  padding: " 2px 0px 2px 0px",
                  textTransform: "uppercase",
                }}
              >
                {detailsInfo?.createdBy}
              </div>

              <div
                style={{
                  textAlign: "start",
                  padding: " 2px 0px 2px 0px",
                }}
              >
                {" "}
                {detailsInfo?.serialId}
              </div>
             
                <Barcode
                  value={detailsInfo?.serialId}
                  background="#F8F8F8"
                  height={30}
                  width={1.4}
                  textAlign="center"
                  fontSize={12}
                />
            </div> */}
             <Barcode
                  value={detailsInfo?.serialId}
                  background="#F8F8F8"
                  height={30}
                  width={1.4}
                  textAlign="center"
                  fontSize={12}
                  displayValue={false}
                />
          </div>
         
        </div>

        <div>
          <div style={{ border: "1px solid #000", marginTop: "20px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                borderBottom: "1px solid #000",
              }}
            >
              <div
                style={{
                  padding: "5px",
                  width: "5%",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                SL
              </div>
              <div
                style={{
                  padding: "5px",
                  width: "17%",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                ORDER ID
              </div>
              <div
                style={{
                  padding: "5px",
                  width: "18%",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                PRODUCTS
              </div>
              <div
                style={{
                  padding: "5px",
                  width: "18%",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                CUSTOMER 
              </div>
              {/* <div
                style={{
                  padding: "5px",
                  width: "18%",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                CUSTOMER PHONE
              </div> */}
              <div
                style={{
                  padding: "5px",
                  width: "18%",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                TOTAL PRODUCT PRICE
              </div>
              <div
                style={{
                  padding: "5px",
                  width: "18%",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                DELIVERY CHARGE
              </div>
              <div
                style={{
                  padding: "5px",
                  width: "18%",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                PROFIT
              </div>
              <div
                style={{
                  padding: "5px",
                  width: "18%",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                TOTAL BILL
              </div>
            </div>
            {orderData?.map((item, index) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  borderBottom:
                    detailsInfo?.parcels?.length == index + 1
                      ? ""
                      : "1px solid black",
                }}
              >
                <div
                  style={{ padding: "5px", width: "5%", textAlign: "center" }}
                >
                  {index + 1}
                </div>
                <div
                  style={{ padding: "5px", width: "17%", textAlign: "center" }}
                >
                  {item?.serialId}
                </div>
                <div
                  style={{ padding: "5px", width: "17%", textAlign: "center" }}
                >
                  {item?.products?.length}
                </div>
                <div
                  style={{ padding: "5px", width: "18%", textAlign: "center" }}
                >
                  <p style={{margin:'0px'}}> Name : {item?.deliveryAddress?.name}</p> 
                  <p style={{margin:'0px'}}> Phone : {item?.deliveryAddress?.phone}</p> 
                </div>
               
                <div
                  style={{ padding: "5px", width: "18%", textAlign: "center" }}
                >
                  {item?.customerCharge?.totalProductPrice} TK
                </div>
                <div
                  style={{ padding: "5px", width: "18%", textAlign: "center" }}
                >
                  {item?.customerCharge?.deliveryCharge} TK
                </div>
                <div
                  style={{ padding: "5px", width: "18%", textAlign: "center" }}
                >
                  {item?.resellerInfo?.grandProfit} TK
                </div>
                <div
                  style={{ padding: "5px", width: "18%", textAlign: "center" }}
                >
                  {item?.customerCharge?.totalBill} TK
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              // alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginTop: "30px",
            }}
          >
            <div style={{ fontWeight: "bold" }}></div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div>
                <div
                  style={{
                    padding: " 2px 0px 2px 0px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  TOTAL PROFIT:
                </div>
                <div
                  style={{
                    padding: " 2px 0px 2px 0px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  TOTAL GRAND PROFIT:{" "}
                </div>
              </div>
              <div
                style={{
                  border: "1px solid #000",
                  marginLeft: "5px",
                  minWidth: "100px",
                }}
              >
                <div
                  style={{
                    borderBottom: "1px solid #000",
                    padding: " 2px 0px 2px 0px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {detailsInfo?.paymentInfo?.totalProfitMoney}TK
                </div>
                <div
                  style={{
                    padding: " 2px 0px 2px 0px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {detailsInfo?.paymentInfo?.totalGrandProfit}TK
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: "80px",
            }}
          >
            <div>
              <p
                style={{ marginBottom: "2px", borderBottom: "1px solid black" }}
              >
                AUTHORIZED SIGNATURE
              </p>
              {/* <p style={{ marginBottom: "2px" }}>Contact No:</p>
            <p style={{ marginBottom: "2px" }}>Name: </p>
            <p style={{ marginBottom: "2px" }}>Company Seal: </p> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const InvoicePrinting = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { id } = useParams();
  const [dataList, setDataList] = useState([]);
  const [detailsInfo, setDetailsInfo] = useState({});
  const [invoiceInfo, setInvoiceInfo] = useState({});

  useEffect(() => {
    let fetchData = async () => {
      try {
        let res = null;
        res = await axios.post(`/reseller-payment/admin/invoice-view/${id}`, {
          value: "",
        });

        if (res) {
          setDataList(res?.data?.data.orderData);
          setInvoiceInfo(res?.data?.data);
        }
      } catch (err) {}
    };

    fetchData();
  }, []);

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <>
      {!isLoading ? (
        <>
          <Card elevation={6} className="m-sm-30">
            <div className="px-4 py-2 mb-0 flex justify-between items-center">
              <Typography variant="h6" color="primary">
                {`${dataList?.length || 0} ORDERS`}{" "}
              </Typography>
              <IconButton
                onClick={handlePrint}
                style={{
                  backgroundColor: "#ebedec",
                  color: "#1976d2",
                  borderRadius: "4px",
                  marginRight: "8px",
                }}
              >
                <Icon>local_printshop</Icon>
              </IconButton>
            </div>
          </Card>
          <PrintComponent
            ref={componentRef}
            detailsInfo={invoiceInfo}
            orderData={dataList}
          />
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            height: "auto",
            width: "auto",
            marginY: "58px",
          }}
        >
          <Spinner />
        </Box>
      )}
      {errorMsg !== "" && (
        <Typography
          variant="body2"
          style={{
            textAlign: "center",
            color: "gray",
            paddingY: "14px",
            padding: "8px",
          }}
        >
          No Data Found
        </Typography>
      )}
    </>
  );
};

export default InvoicePrinting;
