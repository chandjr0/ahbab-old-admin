import React, { useEffect, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import {
  TableCell,
  TableRow,
  Table,
  TableHead,
  TableBody,
  Typography,
  Box,
  Card,
  CardHeader,
  Grid,
  TextField,
  Button,
  Avatar,
  CircularProgress,
} from "@material-ui/core";
import axios from "../../../../axios";
import Spinner from "../../../Shared/Spinner/Spinner";
import { Breadcrumb } from "../../../components";
import { Divider, notification } from "antd";
import { AiOutlineSearch } from "react-icons/ai";
import imageBasePath from "../../../../config";
import moment from "moment";

const ReturnRefundPage = () => {
  const [orderData, setOrderData] = useState(null);
  const [dataList, setDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [serialId, setSerialId] = useState("");
  const [refundMoney, setRefundMoney] = useState(0);
  const [returnMoney, setReturnMoney] = useState(0);
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [isDeliveredOrder, setIsDeliveredOrder] = useState(true);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const searchOrderHandler = async () => {
    try {
      setIsLoading(true);
      let res = await axios.get(`/order/single-order/${serialId}`);
      if (res) {
        setOrderData(res?.data?.data);
        setRefundMoney(res?.data?.data?.refundMoney);
        setReturnMoney(res?.data?.data?.returnMoney);
        setDataList(res?.data?.data?.products);

        let isAllow = false;
        for (let st of res?.data?.data?.orderStatus) {
          // if (["DELIVERED", "RETURNED", "REFUND"].includes(st?.status)) {
          if (["DELIVERED"].includes(st?.status)) {
            isAllow = true;
          }
        }
        if (isAllow) {
          setIsDeliveredOrder(true);
        } else {
          setIsDeliveredOrder(false);
        }
      }

      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const submitHandler = async () => {
    try {
      setIsBtnLoading(true);
      let obj = {
        refundMoney: refundMoney,
        returnMoney: returnMoney,
        products: dataList.map((prod) => {
          return {
            productId: prod?.productId,
            variationId: prod?.variationId,
            returnQty: prod?.returnQty,
          };
        }),
      };
      let res = await axios.patch(`/order/return-refund/${orderData?._id}`, obj);
      setIsBtnLoading(false);
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (err) {
      setIsBtnLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Return & Refund" }]} />
      </div>{" "}
      <Grid container>
        <Grid item lg={8} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Return & Refund" />

            <div className="w-full overflow-auto  px-6 py-8">
              <Grid container spacing={2} className="border mb-8">
                <Grid item sm={4} xs={8}>
                  <TextField
                    label=""
                    placeholder="search order by serial id"
                    name="name"
                    size="small"
                    variant="outlined"
                    fullWidth
                    value={serialId}
                    onChange={(e) => setSerialId(e.target.value)}
                  />
                </Grid>
                <Grid item sm={2} xs={4}>
                  <Button
                    //   color="primary"
                    className="bg-light-primary"
                    variant="contained"
                    fullWidth
                    onClick={searchOrderHandler}
                    startIcon={<AiOutlineSearch />}
                  >
                    search
                  </Button>
                </Grid>
              </Grid>
              {!isLoading ? (
                <>
                  {!isDeliveredOrder && <p className="text-error">Order must must delivered!</p>}
                  {orderData?.products?.length > 0 && isDeliveredOrder && (
                    <>
                      <div className="mb-4 flex justify-between">
                        <div>
                          <h5 className="mb-2">Order Info</h5>
                          <p className="mb-0">
                            <strong>Order Number : </strong> {orderData?.serialId}
                          </p>
                          <p className="mb-0">
                            <strong>Order date :</strong>{" "}
                            {moment(orderData?.createdAt).format("lll")}
                          </p>
                          <p className="mb-0">
                            <strong>Order Status : </strong>{" "}
                            {orderData?.orderStatus[orderData?.orderStatus.length - 1].status}
                          </p>
                          <p className="mb-0">
                            <strong>Payment Type:</strong> {orderData?.payment?.paymentType}
                          </p>
                          <p className="mb-0">
                            <strong>Courier :</strong>{" "}
                            {orderData?.courierName ? orderData?.courierName : "N/A"}
                          </p>
                          <p className="mb-0 text-error">
                            <strong>Total Bill :</strong>{" "}
                            {orderData?.customerCharge?.TotalBill || 0}
                          </p>
                          <p className="mb-0 text-error">
                            <strong>Bill Paid :</strong>{" "}
                            {orderData?.customerCharge?.totalPayTk || 0}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-right w-full">
                            <h5 className="mb-2">Customer Info</h5>
                            <p className="m-0">{orderData?.deliveryAddress?.name}</p>
                            <p className="mb-0">{orderData?.deliveryAddress?.phone}</p>
                            <p className="mb-0 whitespace-pre-wrap">
                              {orderData?.deliveryAddress?.address}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Divider />

                      <Typography variant="h6" className="mb-2">
                        Return Products
                      </Typography>
                      <div
                        style={{
                          maxHeight: 800,
                          minWidth: 300,
                          overflow: "auto",
                        }}
                      >
                        <Table stickyHeader className="whitespace-pre">
                          <TableHead>
                            <TableRow>
                              <TableCell align="center" className="min-w-50">
                                <strong>#</strong>
                              </TableCell>
                              <TableCell align="center" className="min-w-100">
                                Image
                              </TableCell>
                              <TableCell align="center" className="min-w-100">
                                Name
                              </TableCell>
                              <TableCell align="center" className="min-w-120">
                                Unit Price
                              </TableCell>
                              <TableCell align="center" className="min-w-120">
                                Quantity
                              </TableCell>
                              <TableCell align="center" className="min-w-130">
                                Return
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {dataList.length > 0 &&
                              dataList.map((data, index) => (
                                <TableRow key={index}>
                                  <TableCell className="capitalize" align="center">
                                    {index + 1}
                                  </TableCell>

                                  <TableCell className="capitalize" align="center">
                                    <Avatar
                                      className="border-radius-4"
                                      src={imageBasePath + "/" + data?.galleryImage[0]}
                                      alt={data?.name}
                                    />
                                  </TableCell>

                                  <TableCell className="capitalize" align="center">
                                    {data?.name + " (" + data?.variationName + ")"}
                                  </TableCell>

                                  <TableCell className="capitalize" align="center">
                                    {data?.price}
                                  </TableCell>

                                  <TableCell className="capitalize" align="center">
                                    {data?.quantity}
                                  </TableCell>

                                  <TableCell className="capitalize" align="center">
                                    {/* <TextField
                                  type="number"
                                  inputProps={{ min: 0, max: data?.quantity }}
                                  onKeyPress={(event) => {
                                    if (
                                      event?.key === "-" ||
                                      event?.key === "+"
                                    ) {
                                      event.preventDefault();
                                    }
                                  }}
                                  name=""
                                  label=""
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  style={{ width: "120px" }}
                                /> */}
                                    <div
                                      className={"flex justify-between min-w-90 max-w-100 border"}
                                    >
                                      <Button
                                        className="p-1 min-w-20 bg-light-primary elevation-z0"
                                        variant="contained"
                                        size="small"
                                        onClick={() => {
                                          if (Number(data?.returnQty) > 0) {
                                            setDataList(
                                              dataList.map((prod) =>
                                                prod?.productId === data?.productId &&
                                                prod?.variationId === data?.variationId
                                                  ? {
                                                      ...prod,
                                                      returnQty: Number(prod?.returnQty) - 1,
                                                    }
                                                  : prod
                                              )
                                            );
                                          }
                                        }}
                                      >
                                        -
                                      </Button>
                                      <div className="flex-grow flex justify-center items-center bg-paper ml-1 mr-1">
                                        {data?.returnQty}
                                      </div>
                                      <Button
                                        className="p-1 min-w-20 bg-light-primary  elevation-z0"
                                        variant="contained"
                                        size="small"
                                        onClick={() => {
                                          if (Number(data?.quantity) > Number(data?.returnQty)) {
                                            setDataList(
                                              dataList.map((prod) =>
                                                prod?.productId === data?.productId &&
                                                prod?.variationId === data?.variationId
                                                  ? {
                                                      ...prod,
                                                      returnQty: Number(prod?.returnQty) + 1,
                                                    }
                                                  : prod
                                              )
                                            );
                                          }
                                        }}
                                      >
                                        +
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>

                      <Divider />
                      <Typography variant="h6" className="mb-2">
                        Refund Money
                      </Typography>
                      <Grid container spacing={2} className="border mb-3">
                        <Grid item sm={4} xs={8}>
                          <TextField
                            type="number"
                            inputProps={{
                              min: 0,
                              max: orderData?.customerCharge?.totalPayTk,
                            }}
                            onKeyPress={(event) => {
                              if (event?.key === "-" || event?.key === "+") {
                                event.preventDefault();
                              }
                            }}
                            label=""
                            placeholder="enter refund amount"
                            name="name"
                            size="small"
                            variant="outlined"
                            fullWidth
                            value={refundMoney}
                            onChange={(e) => setRefundMoney(e.target.value)}
                          />
                        </Grid>
                      </Grid>
                      <Typography variant="h6" className="mb-2">
                        Return Cost
                      </Typography>
                      <Grid container spacing={2} className="border mb-8">
                        <Grid item sm={4} xs={8}>
                          <TextField
                            type="number"
                            onKeyPress={(event) => {
                              if (event?.key === "-" || event?.key === "+") {
                                event.preventDefault();
                              }
                            }}
                            label=""
                            placeholder="enter refund amount"
                            name="name"
                            size="small"
                            variant="outlined"
                            fullWidth
                            value={returnMoney}
                            onChange={(e) => setReturnMoney(e.target.value)}
                          />
                        </Grid>
                      </Grid>

                      <Button
                        color="primary"
                        variant="contained"
                        className="mt-4"
                        onClick={submitHandler}
                        disabled={isLoading}
                      >
                        {isBtnLoading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          "Save change"
                        )}
                      </Button>
                    </>
                  )}
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
              )}{" "}
            </div>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default ReturnRefundPage;
