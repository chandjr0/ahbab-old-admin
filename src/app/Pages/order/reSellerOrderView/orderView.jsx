import {
  Card,
  Icon,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import moment from "moment";
import axios from "../../../../axios";
import Spinner from "../../../Shared/Spinner/Spinner";
import imageBasePath from "../../../../config";
import Barcode from "react-barcode";

const PrintComponent = React.forwardRef((props, ref) => {
  const { orderData, settingsData } = props;
  const steadfastClientId = localStorage.getItem("STEADFAST_CLIENT_ID");

  return (
    <div ref={ref} className="print-content">
    <style>
      {`
      .print-content {
        counter-reset: page;
      }
      .page {
      height: 576px;
      width: 384px;
        margin: 36px 28px;
        padding: 11px 28px;
        background-color: white;
        box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
        page-break-after: always;
      }
      .page:after {
        counter-increment: page;
      }
         .barcode svg{
             width: 130px !important; 
             height: 100% !important;
        }
      @page {
        
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
          page-break-after: always;
        }

        td, th, tr {
          
        }
      }
    `}
    </style>

    <div className="page" style={{ borderBottom: "8px solid #18443F" }}>
      <Box display="flex" justifyContent="center" alignItems="center">
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
          style={{ color: "#000", fontSize: "11px",  }}
        >
          Shop ID: <strong>{steadfastClientId}</strong>
        </h6>
      </div>
      <div className="flex  justify-between mt-2">
        <div className="text-right w-full sm:w-auto">
          <div className="text-left">
            <div className="my-2">
              <p
                style={{ fontSize: "11px", marginTop: "0px" }}
                className="m-0 font-medium "
              >
                <span className="text-black " >
                  Name:
                </span>{" "}
                <span style={{ color: "#000" }}>
                  {orderData?.deliveryAddress?.name}
                </span>
              </p>
              <p
                style={{ fontSize: "11px", marginTop: "0px" }}
                className="m-0 font-medium"
              >
                <span className="text-black" >
                  Phone:
                </span>{" "}
                <span style={{ color: "#000" }}>
                  {orderData?.deliveryAddress?.phone}
                </span>
              </p>
              <p
                style={{
                  fontSize: "11px",
                  marginTop: "0px",
                  maxWidth: "250px",
                }}
                className="m-0 font-medium"
              >
                <span className="text-black " >
                  Address:
                </span>{" "}
                <span style={{ color: "#000" }}>
                  {orderData?.deliveryAddress?.city?.city_name},
                  {orderData?.deliveryAddress?.zone?.zone_name},{" "}
                  {orderData?.deliveryAddress?.address}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-column items-end w-full sm:w-auto">
          <Box
           
            className=""
          >
             <p
                style={{ fontSize: "10px", width: "130px", letterSpacing: "1px", margin: "0 0 4px 0", textAlign: "center", fontWeight: "bold" }}
              >
                Hotline: {settingsData?.phone}
              </p>
          </Box>

          <div style={{ maxWidth: "138px", overflow: "hidden" }} className="barcode">
            <Barcode
              displayValue={false}
              fontSize={12}
              height={20}
              value={orderData?.serialId}
            />
          </div>

          <h6
            className="mb-0"
            style={{
              color: "#000",
              fontSize: "10px",
              letterSpacing: "2px", // Adjust the value as needed
            }}
          >
            <strong>{orderData?.serialId}</strong>
          </h6>
        </div>
      </div>

      <Card
        className="mb-4 mt-3"
        elevation={0}
        style={{ border: "1px solid #ddd" }}
      >
        <Table>
          {/* Table Header */}
          <TableRow className="px-4" >
            <TableCell
              style={{
                fontWeight: "bold",
                color: "#000",
                fontSize: "11px",
              }}
            >
              PRODUCT
            </TableCell>
            <TableCell
              style={{
                fontWeight: "bold",
                color: "#000",
                fontSize: "11px",
              }}
              align="center"
            >
              Qty
            </TableCell>
            <TableCell
              style={{
                fontWeight: "bold",
                color: "#000",
                fontSize: "11px",
              }}
              align="center"
            >
              Price
            </TableCell>
          </TableRow>

          {/* Table Body */}
          <TableBody>
            {orderData?.products?.map((data, idx) => (
              <TableRow key={idx}>
                <TableCell
                  style={{
                    padding: "0px",
                    alignItems: "center",
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    gap="10px"
                    style={{ maxWidth: "190px", overflow: "hidden" }}
                  >
                    <img
                      width={30}
                      height={30}
                      src={`${imageBasePath}/${data?.product?.galleryImage?.[0]}`}
                      alt="Logo"
                      style={{ borderRadius: "4px", marginRight: "8px" }}
                    />
                    <Typography
                      variant="body2"
                      style={{
                        fontSize: "10px",
                        margin: 0,
                        color: "#000",
                        display: "flex",
                        alignItems: "center",
                      }}
                      className="font-medium"
                    >
                      {data?.product?.name}{" "}
                      {data?.isVariant && `(${data?.variationName})`}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell
                  align="center"
                  style={{
                    padding: "0px",
                    fontSize: "12px",
                  }}
                  className="font-medium"
                >
                  {data?.quantity}
                </TableCell>
                <TableCell
                  align="center"
                  style={{
                    padding: "0px",
                    fontSize: "12px",
                  }}
                  className="font-medium"
                >
                  {data?.price * data?.quantity}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Total Summary */}
        <div className="flex justify-between p-4">
          <div></div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div>
              <p
                className="mb-1 text-black font-medium flex justify-between"
                style={{ gap: "30px", fontSize: "9px" }}
              >
                <span>Sub Total:</span>
                <span>৳ {orderData?.customerCharge?.totalProductPrice}</span>
              </p>

              <p
                className="mb-1 text-black font-medium flex justify-between"
                style={{ gap: "30px", fontSize: "9px" }}
              >
                <span>Delivery Charge:</span>
                <span>৳ {orderData?.customerCharge?.deliveryCharge}</span>
              </p>

              {orderData?.customerCharge?.discountPrice > 0 && (
                <p
                  className="mb-1 text-black font-medium flex justify-between"
                  style={{ gap: "30px", fontSize: "9px" }}
                >
                  <span>Discount:</span>
                  <span>৳ {orderData?.customerCharge?.discountPrice}</span>
                </p>
              )}


              {orderData?.customerCharge?.discountPrice > 0 && (
                <div>
                  <p
                    className="mb-1 text-black font-medium flex justify-between"
                    style={{ gap: "30px", fontSize: "9px" }}
                  >
                    <span>Total:</span>
                    <span>৳ {orderData?.customerCharge?.totalBill}</span>
                  </p>

                </div>
              )}

              {orderData?.customerCharge?.totalPayTk > 0 && (
                <p
                  className="mb-1 text-black font-medium flex justify-between"
                  style={{ gap: "30px", fontSize: "9px" }}
                >
                  <span>Advance Pay:</span>
                  <span>৳ {orderData?.customerCharge?.totalPayTk}</span>
                </p>
              )}

              <p
                className="mb-1 flex justify-between"
                style={{ gap: "30px", fontSize: "9px" }}
              >
                <span className="font-bold">Collectable Amount:</span>
                <span className="font-bold">
                  ৳ {orderData?.customerCharge?.remainingTkPay}
                </span>
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
  );
});

const OrderView = () => {
  const { serialId } = useParams();

  const [orderData, setOrderData] = useState(null);
  const [settingsData, setSettingsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (serialId) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const [res, settingD] = await Promise.all([
            axios.get(`/reseller-order/admin/single-order/${serialId}`),
            axios.get(`/setting/admin/view`),
          ]);

          if (res) {
            setOrderData(res?.data?.data);
            setSettingsData(settingD?.data?.data);
          }
          setIsLoading(false);
          setErrorMsg("");
        } catch (err) {
          setIsLoading(false);
          setErrorMsg(err.response.data.message);
        }
      };
      fetchData();
    }
  }, [serialId]);

  const componentRef = useRef();


  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <>
      {!isLoading ? (
        <>
          <Card elevation={6} className="m-sm-30">
            <div className="px-4 py-2 mb-0 flex justify-end items-center">
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
            orderData={orderData}
            settingsData={settingsData}
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

export default OrderView;
