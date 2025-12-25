import React, { useLayoutEffect, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import {
  Grid,
  Box,
  Card,
  Button,
  TextField,
  CircularProgress,
  CardHeader,
  InputLabel,
} from "@material-ui/core";
import axios from "../../../../axios";
import { notification } from "antd";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import moment from "moment";
import { useParams } from "react-router-dom";

const CreateSticker = ({ dataList, setDataList, updateData, setUpdateData }) => {
  const { campaignId } = useParams();
  const [usdCost, setUsdCost] = useState(undefined);
  const [dollarRate, setDollarRate] = useState(undefined);
  const [payTime, setPayTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  useLayoutEffect(() => {
    if (updateData) {
      setUsdCost(updateData?.usdCost);
      setDollarRate(updateData?.dollarRate);
      setPayTime(moment(updateData?.payTime).format().split("+")[0]);
    }
  }, [updateData]);

  const formSubmitHandler = async (event) => {
    event.preventDefault();

    if (!usdCost || !dollarRate) {
      openNotificationWithIcon("Fill all field", "error");
      return;
    }

    if (usdCost <= 0 || dollarRate <= 0) {
      openNotificationWithIcon("Cost value can't be 0 or less", "error");
      return;
    }

    try {
      setIsLoading(true);
      let res = null;
      let obj = {
        usdCost,
        dollarRate,
        bdtCost: Number((usdCost * dollarRate).toFixed(2)),
        payTime: new Date(payTime),
      };

      if (updateData) {
        res = await axios.patch(`/campaign/cost/update/${updateData._id}`, obj);

        setDataList(
          dataList.map((list) => {
            if (list._id === updateData._id) {
              list.usdCost = usdCost;
              list.dollarRate = dollarRate;
              list.bdtCost = Number((usdCost * dollarRate).toFixed(2));
              list.payTime = new Date(payTime);
            }
            return list;
          })
        );
        setUpdateData(null);
      } else {
        res = await axios.post(`/campaign/cost/create`, {
          campaignId,
          ...obj,
        });
        if (res?.data?.success) {
          setDataList([
            {
              _id: res?.data?.data?._id,
              ...obj,
            },
            ...dataList,
          ]);
        }
      }
      setUsdCost(0);
      setDollarRate(0);
      setPayTime(new Date());
      openNotificationWithIcon(res?.data?.message, "success");
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
  };

  const cancelHandler = () => {
    setUpdateData(null);
  };

  return (
    <Card elevation={3}>
      <CardHeader title={updateData ? "Update Campaign Cost" : "Add Campaign Cost"} />

      <form className="px-6  py-6" onSubmit={formSubmitHandler}>
        <Grid container spacing={1} alignItems="center" className="mb-2">
          <Grid item sm={4} xs={12}>
            <InputLabel>Dollar Cost</InputLabel>
          </Grid>
          <Grid item sm={8} xs={12}>
            <TextField
              type="number"
              onKeyPress={(event) => {
                if (event?.key === "-" || event?.key === "+") {
                  event.preventDefault();
                }
              }}
              label=""
              placeholder="$"
              size="medium"
              variant="outlined"
              fullWidth
              value={usdCost}
              onChange={(e) => setUsdCost(e.target.value)}
            />
          </Grid>
        </Grid>
        <Grid container spacing={1} alignItems="center" className="mb-4">
          <Grid item sm={4} xs={12}>
            <InputLabel>Dollar Rate</InputLabel>
          </Grid>
          <Grid item sm={4} xs={12}>
            <TextField
              type="number"
              onKeyPress={(event) => {
                if (event?.key === "-" || event?.key === "+") {
                  event.preventDefault();
                }
              }}
              label=""
              placeholder="rate"
              size="medium"
              variant="outlined"
              fullWidth
              value={dollarRate}
              onChange={(e) => setDollarRate(e.target.value)}
            />
          </Grid>
          <Grid item sm={4} xs={12}>
            <TextField
              type="number"
              label="৳"
              size="medium"
              variant="outlined"
              fullWidth
              value={((usdCost || 0) * (dollarRate || 0)).toFixed(2)}
              disabled
            />
          </Grid>
        </Grid>
        <Grid container spacing={1} alignItems="center" className="mb-2">
          <Grid item sm={4} xs={12}>
            <InputLabel>Date</InputLabel>
          </Grid>
          {/* <Grid item sm={4} xs={12}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                inputVariant="outlined"
                type="text"
                autoOk={true}
                size="small"
                variant="outlined"
                fullWidth
                value={payTime}
                onChange={(t) => setPayTime(t)}
              />
            </MuiPickersUtilsProvider>
          </Grid> */}
          <Grid item sm={4} xs={12}>
            <TextField
              id="datetime-local"
              label=""
              type="datetime-local"
              value={payTime}
              onChange={(e) => setPayTime(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex" }}>
          <Box>
            <Button
              className="mt-4 px-12"
              variant="contained"
              disabled={isLoading}
              color="primary"
              type="submit"
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : updateData ? (
                "Update"
              ) : (
                "Add"
              )}
            </Button>
          </Box>
          {updateData ? (
            <Box>
              <Button
                className="ml-2 mb-4 mt-4 px-12"
                variant="contained"
                type="submit"
                onClick={cancelHandler}
              >
                cancel
              </Button>
            </Box>
          ) : (
            ""
          )}
        </Box>
      </form>
    </Card>
  );
};

export default CreateSticker;
