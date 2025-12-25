import {
  Card,
  Icon,
  IconButton,
  Box,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import axios from "../../../../axios";
import Spinner from "../../../Shared/Spinner/Spinner";
import OrderPrintComponent from "./OrderPrintComponent";

const OrderView = () => {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const serialIds = params.get("ids");

  const [orderData, setOrderData] = useState([]);
  const [settingsData, setSettingsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (serialIds !== "") {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const [res, settingD] = await Promise.all([
            axios.post(`/admin-order/multiple-orders`, {
              serialIds: serialIds.split(","),
            }),
            axios.get(`/setting/admin/view`),
          ]);

          if (res) {
            let sortedOrders = res?.data?.data?.sort((a, b) => {
              const numA = parseInt(a.serialId.match(/\d+$/)[0], 10);
              const numB = parseInt(b.serialId.match(/\d+$/)[0], 10);

              return numA - numB;
            });
            setOrderData(sortedOrders);
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
  }, [serialIds]);

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @page {
        size: 384px 576px;
        margin: 0;
      }
    `
  });

  return (
    <>
      {!isLoading ? (
        <>
          <Card elevation={6} className="m-sm-30">
            <div className="px-4 py-2 mb-0 flex justify-between items-center">
              <Typography variant="h6" color="primary">
                {`${orderData.length || 0} ORDERS`}{" "}
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
          <div style={{ maxWidth: "420px", margin: "0 auto", marginTop: "20px" }}>
            <OrderPrintComponent
              ref={componentRef}
              orderData={orderData}
              settingsData={settingsData}
              isMultiple={true}
            />
          </div>
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
