import React, { useState } from "react";
import { Box, Button, CircularProgress, Grid, TextField } from "@material-ui/core";
import { notification } from "antd";
import axios from "../../../../../../../axios";
import { useEffect } from "react";

const AddSteadfastPage = ({
  courierOrderData,
  courierData,
  closeModalHandler,
  dataList,
  setDataList,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cashCollection, setCashCollection] = useState("");
  const [instruction, setInstruction] = useState("");

  useEffect(() => {
    if (courierOrderData) {
      setName(courierOrderData?.deliveryAddress?.name);
      setPhone(courierOrderData?.deliveryAddress?.phone);
      setAddress(courierOrderData?.deliveryAddress?.address);
      setCashCollection(courierOrderData?.customerCharge?.remainingTkPay);
    }
  }, [courierOrderData]);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const formSubmitHandler = async () => {
    try {
      setIsLoading(true);
      let obj = {
        orderId: courierOrderData?._id,
        courierId: process.env.REACT_APP_STEADFAST_MONGO_ID,
        courierName: courierData.find((f) => f?._id === process.env.REACT_APP_STEADFAST_MONGO_ID)
          ?.name,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        merchantInvoiceId: courierOrderData?.serialId,
        cashCollectionAmount: cashCollection,
        instruction: instruction,
      };

      let res = await axios.post("/courier-track/steadfast/create-parcel", obj);
      if (res?.data?.success) {
        setDataList(
          dataList.map((data) =>
            data?._id === courierOrderData?._id
              ? {
                  ...data,
                  courierTrackId: res?.data?.data?.courierTrackId,
                  courierStatus: res?.data?.data?.courierStatus,
                  // courierId: res?.data?.data?.courierId,
                  courierData: res?.data?.data?.courierData,
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

  const cancelAddRedx = () => {
    setDataList(
      dataList.map((data) =>
        data?._id === courierOrderData?._id
          ? {
              ...data,
              courierTrackId: null,
              courierStatus: "",
              // courierId: res?.data?.data?.courierId,
              courierData: courierOrderData?.courierData
                ? courierOrderData?.courierData
                : {
                    _id: null,
                    name: "",
                  },
            }
          : data
      )
    );
    closeModalHandler();
    window.location.reload(false);
  };

  return (
    <div>
      <h4 className="text-center mb-2">Steadfast Courier</h4>
      <p>
        ID: <strong className="text-secondary">{courierOrderData?.serialId}</strong>
      </p>
      <Grid container spacing={2} className="border mb-2">
        <Grid item lg={12}>
          <TextField
            label="Name"
            placeholder=""
            name="name"
            size="small"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Grid>
        <Grid item lg={6}>
          <TextField
            label="Phone"
            placeholder=""
            name="name"
            size="small"
            variant="outlined"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Grid>
        <Grid item lg={6}>
          <TextField
            label="Cash Collection"
            placeholder=""
            name="name"
            size="small"
            variant="outlined"
            fullWidth
            value={cashCollection}
            onChange={(e) => setCashCollection(e.target.value)}
          />
        </Grid>
        <Grid item lg={12}>
          <TextField
            label="Address"
            placeholder=""
            name="name"
            size="small"
            variant="outlined"
            fullWidth
            multiline
            minRows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Grid>
        <Grid item sm={12}>
          <TextField
            label="Note"
            placeholder=""
            name="name"
            size="small"
            variant="outlined"
            fullWidth
            multiline
            minRows={2}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
          />
        </Grid>
        <Grid item sm={12}>
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
            <Button variant="outlined" onClick={cancelAddRedx}>
              Cancel
            </Button>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default AddSteadfastPage;
