import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Grid,
  TextField,
  CircularProgress,
  CardHeader,
  InputLabel,
  FormControlLabel,
} from "@material-ui/core";
import { notification } from "antd";
import { Breadcrumb } from "../../components";
import axios from "../../../axios";
import IOSSwitch from "../../Shared/Forms/iosSwitch";

const DeliveryCharge = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [isCustomerNum, setIsCustomerNum] = useState(false);
  const [numberStr, setNumberStr] = useState("");
  const [message, setMessage] = useState("");

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      let res = await axios.get("/customer/all-numbers");
      if (res?.data?.success) {
        setDataList(res?.data?.data);
      }
    };
    fetchData();
  }, []);

  const formSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (message === "") {
        openNotificationWithIcon("Message couldn't be empty!", "error");
        return;
      }

      if (numberStr === "" && !isCustomerNum) {
        openNotificationWithIcon("numbers couldn't be empty", "error");
        return;
      }

      let numbers = [];
      if (numberStr) {
        numbers = numberStr.replace(/[\n\s]+/g, "").split(",");
        let isStop = false;
        numbers.forEach((num) => {
          const isValid = /^01\d{9}$/.test(num);

          if (num.length !== 11 || +num === "NaN" || !isValid) {
            openNotificationWithIcon("Phone must be 11 digit and number type", "error");
            isStop = true;
          }
        });

        if (isStop) {
          return;
        }
      }

      if (isCustomerNum) {
        dataList.forEach((data) => {
          numbers.push(data?.phone);
        });
      }

      let obj = {
        numbers: [...new Set(numbers)].slice(0, 2),
        message: message,
      };
      setIsLoading(true);
      const res = await axios.post(`/customer/promotional-bulk-msg`, obj);
      if (res?.data?.success) {
        openNotificationWithIcon(res?.data?.message, "success");
      } else {
        openNotificationWithIcon(res?.data?.message, "error");
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "send sms" }]} />
      </div>

      <Grid container>
        <Grid item md={8} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Direct SMS Send" />

            <form className="px-4 py-6" onSubmit={formSubmitHandler}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <InputLabel className="mb-2 text-black">Select All Customer Number</InputLabel>
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        sx={{ m: 1 }}
                        checked={isCustomerNum}
                        onClick={() => setIsCustomerNum(!isCustomerNum)}
                      />
                    }
                    label={isCustomerNum ? `${dataList.length} customer selected` : ""}
                  />
                </Grid>
                <Grid item xs={12}>
                  <InputLabel className="mb-2 text-black">
                    Numbers (ex-1: enter single number ex-2: use (,) comma separator for multiple
                    number)
                  </InputLabel>
                  <TextField
                    label=""
                    placeholder="01***********   or   01***********,01***********,01***********"
                    type="number"
                    variant="outlined"
                    size="small"
                    multiline
                    minRows={2}
                    fullWidth
                    value={numberStr}
                    onChange={(e) => setNumberStr(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <InputLabel className="mb-2 text-black">Message</InputLabel>
                  <TextField
                    label=""
                    placeholder="write a message"
                    type="number"
                    variant="outlined"
                    size="small"
                    multiline
                    minRows={4}
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Button
                className="mb-4 mt-2 px-12"
                variant="contained"
                color="primary"
                type="submit"
                style={{ marginRight: "20px" }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
              </Button>
            </form>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default DeliveryCharge;
