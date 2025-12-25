import React, { useLayoutEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Icon,
  MenuItem,
  TextField,
  Typography,
} from "@material-ui/core";
import { Upload } from "antd";
import { notification } from "antd";
import imageBasePath from "../../../../../config";
import axios from "../../../../../axios";
import { convertImageToBase64 } from "../../../../util/convertImageToBase64";

const PaymentUpdate = ({ paymentUpdateData, closeModalHandler, dataList, setDataList }) => {
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentType, setPaymentType] = useState("");
  const [totalPayTk, setTotalPayTk] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useLayoutEffect(() => {
    if (paymentUpdateData) {
      setDeliveryCharge(paymentUpdateData?.customerCharge?.deliveryCharge);
      setDiscountAmount(paymentUpdateData?.customerCharge?.discountPrice);
      setPaymentType(paymentUpdateData?.paymentType);
      setTotalPayTk(paymentUpdateData?.amount);
      setPaymentDetails(paymentUpdateData?.details);
      if (paymentUpdateData?.documentImg) {
        setFileList([
          {
            url: imageBasePath + "/" + paymentUpdateData?.documentImg,
          },
        ]);
      }
    }
  }, [paymentUpdateData]);

  const imageHandler = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (
      newFileList[0]?.originFileObj.type === "image/jpeg" ||
      newFileList[0]?.originFileObj.type === "image/jpg" ||
      newFileList[0]?.originFileObj.type === "image/png" || 
      newFileList[0]?.originFileObj.type === "image/webp"
    ) {
      setSelectedFile(newFileList[0]?.originFileObj);
    } else {
      setSelectedFile(null);
    }
  };

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const formSubmitHandler = async () => {
    try {
      setIsLoading(true);
      let baseImg = "";
      if (selectedFile) {
        baseImg = await convertImageToBase64(selectedFile);
      } else if (fileList.length > 0) {
        baseImg = fileList[0].url.split(imageBasePath + "/")[1];
      }

      let obj = {
        deliveryCharge: deliveryCharge || 0,
        discountPrice: discountAmount || 0,
        paymentType: paymentType,
        amount: totalPayTk || 0,
        details: paymentDetails,
        documentImg: baseImg,
      };

      let res = await axios.patch(`/order/admin/update-payment-info/${paymentUpdateData?._id}`, obj);

      if (res) {
        setDataList(
          dataList.map((data) =>
            data?._id === paymentUpdateData?._id
              ? {
                  ...data,
                  payment: res?.data?.data?.payment,
                  customerCharge: res?.data?.data?.customerCharge,
                }
              : data
          )
        );

        closeModalHandler();
        openNotificationWithIcon(res?.data?.message, "success");
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  return (
    <div>
      <p className="m-0">
        ID: <strong className="text-secondary">{" " + paymentUpdateData?.serialId}</strong>
      </p>
      <Typography className="mb-4 text-center text-primary" variant="h6">
        Customer Payment
      </Typography>

      <Grid container spacing={1} alignItems="center">
        <Grid item xs={12} className="mb-2">
          <TextField
            label="Delivery Charge"
            placeholder=""
            type="number"
            size="small"
            variant="outlined"
            fullWidth
            value={deliveryCharge}
            onChange={(e) => setDeliveryCharge(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} className="mb-2">
          <TextField
            label="Discount Amount"
            placeholder=""
            type="number"
            size="small"
            variant="outlined"
            fullWidth
            value={discountAmount}
            onChange={(e) => setDiscountAmount(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} className="mb-2">
          <TextField
            label="Payment Type"
            placeholder=""
            size="small"
            variant="outlined"
            fullWidth
            select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
          >
            <MenuItem value="Bkash">Bkash</MenuItem>
            <MenuItem value="Nagad">Nagad</MenuItem>
            <MenuItem value="Rocket">Rocket</MenuItem>
            <MenuItem value="Cod">COD</MenuItem>
            <MenuItem value="Bank">Bank </MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} className="mb-2">
          <TextField
            label="Advance Payment"
            placeholder=""
            type="number"
            inputProps={{ min: 0 }}
            onKeyPress={(event) => {
              if (event?.key === "-" || event?.key === "+") {
                event.preventDefault();
              }
            }}
            size="small"
            variant="outlined"
            fullWidth
            value={totalPayTk}
            onChange={(e) => {
              if (
                e.target.value <=
                Number(
                  dataList.filter((d) => d?._id === paymentUpdateData?._id)[0]?.customerCharge
                    ?.TotalBill
                )
              ) {
                setTotalPayTk(e.target.value);
              }
            }}
          />
        </Grid>
        <Grid item xs={12} className="mb-2">
          <TextField
            label="Payment Details"
            placeholder=""
            size="small"
            variant="outlined"
            fullWidth
            value={paymentDetails}
            onChange={(e) => setPaymentDetails(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Upload listType="picture-card" fileList={fileList} onChange={imageHandler}>
            {fileList.length >= 1 ? null : (
              <span>
                <Icon style={{ color: "gray" }}>photo_size_select_actual</Icon>
              </span>
            )}
          </Upload>
        </Grid>
        <Box sx={{ display: "flex", mt: 2 }}>
          <Button
            className="mr-4"
            variant="contained"
            color="primary"
            disabled={isLoading}
            onClick={formSubmitHandler}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Update"}
          </Button>
          <Button variant="outlined" onClick={closeModalHandler}>
            Cancel
          </Button>
        </Box>
      </Grid>
    </div>
  );
};

export default PaymentUpdate;
