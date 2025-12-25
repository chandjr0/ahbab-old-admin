import React, { useEffect, useState } from "react";
import StatCard3 from "./shared/starCard3Custom";
import StatCards2 from "./shared/statCard2Custom";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import { Box, Button, Divider } from "@material-ui/core";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";
import Charts from "./charts/charts";
import { Autorenew } from "@material-ui/icons";
import { useParams, useHistory } from "react-router-dom";

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dataList, setDataList] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isReset, setIsReset] = useState(false);
  const { id, name } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let obj = {
          startTime: startTime ? setToMidnight(startTime).toISOString() : null,
          endTime: endTime ? setToEndOfDay(endTime).toISOString() : null,
        };
        let res = await axios.post(
          `/dashboard/admin/reseller-order-history/${id}`,
          obj
        );
        if (res?.data?.success) {
          setDataList(res?.data?.data);
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };
    if ((startTime && endTime) || (!startTime && !endTime)) {
      fetchData();
    }
  }, [isReset, startTime, endTime, id]);

  function setToMidnight(date) {
    const midnightDate = new Date(date);
    midnightDate.setHours(0, 0, 0, 0);
    return midnightDate;
  }

  function setToEndOfDay(date) {
    const endOfDayDate = new Date(date);
    endOfDayDate.setHours(23, 59, 59, 999);
    return endOfDayDate;
  }

  return (
    <div className="analytics m-sm-30">
      <div className="mt-5 mb-5">
        <h5>
          Activity Overview of{" "}
          <strong style={{ textTransform: "capitalize" }}>{name}</strong>{" "}
        </h5>
      </div>
      <Divider className="my-4" />

      <Box
        sx={{
          borderBottom: "1px solid #F6F6F6",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          py: 3,
          // px: 2,
        }}
        elevation={3}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Box sx={{ mr: 1 }}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  className="min-w-188 bg-white"
                  label="Start Date"
                  inputVariant="outlined"
                  type="text"
                  autoOk={true}
                  format="MM-dd-yy"
                  variant="outlined"
                  size="small"
                  value={startTime}
                  onChange={(t) => setStartTime(t)}
                />
              </MuiPickersUtilsProvider>
            </Box>
            <Box sx={{ mr: 1 }}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  className="bg-white min-w-188"
                  label="End Date"
                  inputVariant="outlined"
                  type="text"
                  format="MM-dd-yy"
                  autoOk={true}
                  variant="outlined"
                  size="small"
                  value={endTime}
                  onChange={(t) => setEndTime(t)}
                />
              </MuiPickersUtilsProvider>
            </Box>
            <Box sx={{ my: 1, display: "flex", alignItems: "center" }}>
              <Button
                variant="contained"
                size="small"
                className="text-white bg-error"
                onClick={() => {
                  setIsReset(!isReset);
                  setStartTime(null);
                  setEndTime(null);
                }}
                startIcon={<Autorenew />}
              >
                Reset
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
      <StatCards2 dataList={dataList} />

      {!isLoading ? (
        <>
          <div>
            <h5>Graph Overview</h5>
          </div>
          <Divider className="my-4" />
          <Charts
            orderDataList={dataList?.orderData.filter(
              (f) => f?.status !== "ALL"
            )}
          />
          <div>
            <h5>Status Wise Overview</h5>
          </div>
          <Divider className="my-4" />
          <StatCard3 orderDataList={dataList?.orderData} />
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
    </div>
  );
};

export default DashboardPage;
