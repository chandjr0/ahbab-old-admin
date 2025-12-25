import { Card, Icon, IconButton, Box, Typography, Button } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";
import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import { Autorenew } from "@material-ui/icons";

const useStyles = makeStyles(({ palette, ...theme }) => ({
  parentBox: {
    marginTop: "24px",
    border: "1px solid black",
    // maxWidth: '70px'
  },
  header: {
    textAlign: "center",
    borderBottom: "1px solid black",
    padding: "8px",
    fontSize: "16px",
  },
  title: {
    display: "flex",
    borderBottom: "1px solid black",
  },
  leftTitle: {
    borderRight: "1px solid black",
    width: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "8px",
  },
  rightTitle: {
    width: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "8px",
  },
  upperBox: {
    borderBottom: "1px solid black",
  },
  leftBox: {
    borderRight: "1px solid black",
    width: "50%",
    padding: "16px",
  },
  rightBox: {
    width: "50%",
    padding: "16px",
  },
  leftTotal: {
    borderRight: "1px solid black",
    width: "50%",
    display: "flex",
    alignItems: "center",
    padding: "8px 16px",
  },
  rightTotal: {
    width: "50%",
    display: "flex",
    alignItems: "center",
    padding: "8px 16px",
  },
}));

const PrintComponent = React.forwardRef((props, ref) => {
  const classes = useStyles();

  const { accountData } = props;

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
            //   margin: 48px 28px;
              margin: 48px 16px;
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
                padding: 10px 6px !important; 
                font-size: 9px !important;
              }
  
            }
          
            `}
      </style>

      <div className="page">
        <h4 className="text-center underline">Account Report</h4>
        <div className="viewer__order-info px-4  flex justify-between">
          <div>
            {/* <h1 className="mb-1 p-0 text-error ">Lazma.com</h1> */}
            <p className="m-0 p-0">09613-100400, 01724-318582</p>
            <p className="m-0 p-0">89, Boundari Raod, Senpara, Mirpur-10</p>
          </div>
          <div className="text-right">
            <div className="text-left">
              <p className="mb-2">
                Date: <strong>{moment(new Date()).format("lll")}</strong>
              </p>
            </div>
          </div>
        </div>

        <hr />

        <div className={classes.parentBox}>
          <div className={classes.header}>
            <strong>{moment().format("l")}</strong>
            {" to "}
            <strong>{moment().format("l")}</strong>
          </div>
          <div className={classes.title}>
            <div className={classes.leftTitle}>
              <p className="text-center m-0 p-0">
                <strong>Revenue</strong>
              </p>
            </div>
            <div className={classes.rightTitle}>
              <p className="text-center m-0 p-0">
                <strong>Expense</strong>
              </p>
            </div>
          </div>
          <div className={classes.upperBox}>
            <div className="flex">
              <div className={classes.leftBox}>
                <p>
                  <strong>Delivery Order: </strong>
                  {accountData?.tDeliveryCharge.toLocaleString() + "/="}
                </p>
              </div>
              <div className={classes.rightBox}>
                <p>
                  <strong>Purchase: </strong>
                  {accountData?.tPurchaseMoney.toLocaleString() + "/="}
                </p>
                <p>
                  <strong>Expense: </strong>
                  {accountData?.tExpense + "/="}
                </p>
                <p>
                  <strong>Return Cost: </strong>
                  {accountData?.tReturnCost.toLocaleString() + "/="}
                </p>
                <p>
                  <strong>Refund Cost: </strong>
                  {accountData?.tRefundCost.toLocaleString() + "/="}
                </p>
                <p>
                  <strong>Campaign Cost: </strong>
                  {accountData?.tCampaignCost.toLocaleString() + "/="}
                </p>
              </div>
            </div>
          </div>
          <div className="flex">
            <div className={classes.leftTotal}>
              <p className="m-0 p-0">
                <strong>Total Revenue: </strong>
                {accountData?.totalRevenue.toLocaleString() + "/="}
              </p>
            </div>
            <div className={classes.rightTotal}>
              <p className="m-0 p-0">
                <strong>Total Expense: </strong>
                {accountData?.totalExpense.toLocaleString() + "/="}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const AccountReport = () => {
  const [accountData, setAccountData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isReset, setIsReset] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await axios.post(`/report/account`, {
          startTime: startTime ? setToMidnight(startTime).toISOString() : null,
          endTime: endTime ? setToEndOfDay(endTime).toISOString() : null,
        });
        if (res) {
          let result = res?.data?.data;
          let finalObj = { ...result };

          let totalRevenue = 0;
          let totalExpense = 0;
          for (let key in result) {
            if (key === "tDeliveryCharge") {
              totalRevenue += Number(result[key]);
            } else {
              totalExpense += Number(result[key]);
            }
          }
          finalObj = {
            ...finalObj,
            totalRevenue,
            totalExpense,
          };

          setAccountData(finalObj);
        }
        setIsLoading(false);
        setErrorMsg("");
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err.response.data.message);
      }
    };

    if ((startTime && endTime) || (!startTime && !endTime)) {
      fetchData();
    }
  }, [isReset, startTime, endTime]);

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

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <>
      <Card elevation={6} className="m-sm-30">
        <Box
          sx={{
            borderBottom: "1px solid #F6F6F6",
            backgroundColor: "white",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            py: 3,
            px: 2,
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
                    className="min-w-188"
                    label="Start Date"
                    inputVariant="outlined"
                    type="text"
                    format="MM-dd-yy"
                    autoOk={true}
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
                    className="min-w-188"
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
              <Box sx={{ my: 1 }}>
                <Button
                  className="text-white bg-error"
                  variant="contained"
                  size="small"
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
          <Box>
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
          </Box>
        </Box>
      </Card>
      {!isLoading ? (
        <>
          <PrintComponent ref={componentRef} accountData={accountData} />
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

export default AccountReport;
