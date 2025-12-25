import React, { useState } from "react";
import {
  Button,
  Card,
  Grid,
  TextField,
  Box,
  CircularProgress,
  CardHeader,
  InputLabel,
  MenuItem,
} from "@material-ui/core";
import { notification } from "antd";
import { Breadcrumb } from "../../components";
import axios from "../../../axios";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import Spinner from "../../Shared/Spinner/Spinner";

const CreateExpense = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [expenseTypeOptions, setExpenseTypeOptions] = useState([]);
  const [date, setDate] = useState(new Date());
  const [expenseType, setExpenseType] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [amount, setAmount] = useState(0);
  const [details, setDetails] = useState("");

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  useState(() => {
    const fetchData = async () => {
      try {
        setIsPageLoading(true);
        let res = await axios.get("/expense/head-fetch-all");
        setExpenseTypeOptions(res?.data?.data);
        setIsPageLoading(false);
      } catch (err) {
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, []);

  const formSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      setIsLoading(true);

      let errorMsg = "";
      if (date === "Invalid Date" || !date) {
        errorMsg = "Select correct date";
      } else if (!expenseType) {
        errorMsg = "expense type is required";
      } else if (!paymentType) {
        errorMsg = "payment type is required";
      }

      if (errorMsg !== "") {
        openNotificationWithIcon(errorMsg, "error");
        setIsLoading(false);
        return;
      }

      let obj = {
        createDate: date,
        expenseType: expenseType,
        paymentType: paymentType,
        amount: amount || 0,
        details: details,
      };

      const res = await axios.post(`/expense/create`, obj);
      if (res?.data?.success) {
        setDate(new Date());
        setExpenseType("");
        setPaymentType("");
        setAmount(0);
        setDetails("");
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

  const handleDateChange = (date) => {
    setDate(date);
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "New Expense" }]} />
      </div>

      <Grid container>
        <Grid item md={6} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Add New Expense" />

            {!isPageLoading ? (
              <form className="px-4 py-6" onSubmit={formSubmitHandler}>
                <Grid container spacing={3}>
                  <Grid item sm={8} xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-1">
                        Date<span style={{ color: "red" }}>*</span>
                      </InputLabel>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          label=""
                          inputVariant="standard"
                          type="text"
                          format="MM-dd-yy"
                          autoOk={true}
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={date}
                          onChange={handleDateChange}
                        />
                      </MuiPickersUtilsProvider>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-1">
                        Expense Type<span style={{ color: "red" }}>*</span>
                      </InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        select
                        value={expenseType}
                        onChange={(e) => setExpenseType(e.target.value)}
                      >
                        <MenuItem value="" disabled>
                          --select--
                        </MenuItem>
                        {expenseTypeOptions.map((i, idx) => (
                          <MenuItem key={idx} value={i?.name}>
                            {i?.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-1">
                        Payment Type<span style={{ color: "red" }}>*</span>
                      </InputLabel>
                      <TextField
                        label=""
                        placeholder=""
                        size="small"
                        variant="outlined"
                        fullWidth
                        select
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                      >
                        <MenuItem value="" disabled>
                          --select--
                        </MenuItem>
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="mobile">Mobile</MenuItem>
                        <MenuItem value="bank">Bank</MenuItem>
                      </TextField>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-1">
                        Amount<span style={{ color: "red" }}>*</span>
                      </InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-1">Details</InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        multiline
                        minRows={3}
                        fullWidth
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                      />
                    </Box>
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
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : "Save Expense"}
                </Button>
              </form>
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
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default CreateExpense;
