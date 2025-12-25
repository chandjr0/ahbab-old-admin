import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import axios from "../../../axios";
import SimpleModal from "../../Shared/SimpleModal/SimpleModal";
import { notification } from "antd";
import Spinner from "../../Shared/Spinner/Spinner";
import { Breadcrumb } from "../../components";
import moment from "moment";
import { FaExclamationTriangle, FaRegEdit } from "react-icons/fa";
import { RiDeleteBin3Line } from "react-icons/ri";
import { useHistory } from "react-router-dom";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";

export default function ExpenseList() {
  const history = useHistory();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [rows, setRows] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [expenseOptions, setExpenseOptions] = useState([]);

  const [isFilter, setIsFilter] = useState(false);

  const [expenseType, setExpenseType] = useState("");
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [totalPrice, setTotalPrice] = useState(0);
  //   const [date, setDate] = useState(new Date());

  //   const handleDateChange = (date) => {
  //     setDate(date);
  //   };

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      let res = await axios.get("/expense/head-fetch-all");
      setExpenseOptions(res?.data?.data);
    };
    fetchData();
  }, []);

  const columns = [
    {
      id: "sl",
      label: "SL",
      minWidth: 100,
    },
    {
      id: "createDate",
      label: "Date",
      alignItems: "center",
      minWidth: 100,
    },
    {
      id: "expenseType",
      label: "Expense Type",
      alignItems: "center",
      minWidth: 120,
      format: (value) => (
        <small className="rounded bg-primary elevation-z3 text-white px-2 py-2px m-1">
          {value}
        </small>
      ),
    },
    {
      id: "paymentType",
      label: "Payment Type",
      alignItems: "center",
      minWidth: 120,
    },
    {
      id: "amount",
      label: "Amount",
      alignItems: "center",
      minWidth: 100,
    },
    {
      id: "details",
      label: "Details",
      alignItems: "center",
      minWidth: 150,
    },
    {
      id: "action",
      label: "Actions",
      alignItems: "center",
      minWidth: 150,
      format: (value) => {
        return (
          <>
            <IconButton
              onClick={() => {
                history.push(`/update-expense/${value}`);
              }}
              style={{
                backgroundColor: "#ebedec",
                color: "#1976d2",
                marginRight: "8px",
              }}
            >
              <FaRegEdit style={{ fontSize: "16px" }} />
            </IconButton>
            <IconButton
              onClick={() => {
                setIsOpenModal(true);
                setDeleteId(value);
              }}
              style={{
                backgroundColor: "#ebedec",
                color: "red",
              }}
            >
              <RiDeleteBin3Line style={{ fontSize: "16px" }} />
            </IconButton>
          </>
        );
      },
    },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    let fetchData = async () => {
      try {
        setIsLoading(true);

        let obj = {
          expenseType: expenseType,
          start: "",
          end: "",
        };

        let res = await axios.post(`/expense/fetch-all?page=${page + 1}&limit=${rowsPerPage}`, obj);

        if (res?.data?.data) {
          setTotalPrice(res?.data?.metaData?.totalPrice || 0);
          setTotalData(res?.data?.metaData?.totalData || 0);
          let dataArray = [];
          let i = 1;
          for (let data of res?.data?.data) {
            dataArray.push({
              _id: data?._id,
              sl: page * rowsPerPage + i++,
              createDate: moment(data?.createDate).format("ll"),
              expenseType: data?.expenseType,
              paymentType: data?.paymentType,
              amount: data?.amount,
              details: data?.details,
              action: data?._id,
            });
          }
          setRows(dataArray);
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err?.response?.data?.message);
      }
    };

    if (!isFilter) {
      fetchData();
    }
  }, [page, rowsPerPage, expenseType, isFilter]);

  const filterExpense = async () => {
    try {
      setIsLoading(true);
      let obj = {
        expenseType: expenseType,
        start: startTime,
        end: endTime,
      };

      let res = await axios.post(`/expense/fetch-all?page=${page + 1}&limit=${rowsPerPage}`, obj);

      if (res?.data?.data) {
        setTotalPrice(res?.data?.metaData?.totalPrice || 0);
        setTotalData(res?.data?.metaData?.totalData || 0);
        let dataArray = [];
        let i = 1;
        for (let data of res?.data?.data) {
          dataArray.push({
            _id: data?._id,
            sl: page * rowsPerPage + i++,
            createDate: moment(data?.createDate).format("ll"),
            expenseType: data?.expenseType,
            paymentType: data?.paymentType,
            amount: data?.amount,
            details: data?.details,
            action: data?._id,
          });
        }
        setRows(dataArray);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err?.response?.data?.message);
    }
  };

  const deleteHandler = async () => {
    try {
      let res = await axios.delete(`/expense/delete/${deleteId}`);
      setRows(rows.filter((i) => i._id !== deleteId));
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
    setDeleteId(false);
    setIsOpenModal(false);
  };

  const closeModalHandler = () => {
    setIsOpenModal(false);
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "expense List" }]} />
      </div>
      <Card className="border-radius-0 mx-8">
        <CardHeader title="Expense List" />
        <div className="w-full overflow-hidden px-2 mt-4">
          <Box
            sx={{
              borderBottom: "1px solid #F6F6F6",
              backgroundColor: "white",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              alignItems: "center",
              py: 1,
              px: 2,
            }}
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
                  flexDirection: "column",
                }}
              >
                <Box sx={{ mb: 1 }}>
                  <TextField
                    label="Expense Type"
                    size="small"
                    variant="outlined"
                    select
                    className="min-w-200 mb-2"
                    value={expenseType}
                    onChange={(e) => setExpenseType(e.target.value)}
                  >
                    <MenuItem value="">ALL</MenuItem>
                    {expenseOptions.map((i, idx) => (
                      <MenuItem key={idx} value={i?.name}>
                        {i?.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                {isFilter && (
                  <>
                    <Box sx={{ mb: 1 }}>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          className="min-w-188 mb-4"
                          label="Start Date"
                          inputVariant="standard"
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
                    <Box sx={{ mb: 1 }}>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          className="min-w-188 mb-4"
                          label="End Date"
                          inputVariant="standard"
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
                    <Box sx={{ display: "flex", mb: 4 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        className="mr-4"
                        onClick={filterExpense}
                      >
                        Filter
                      </Button>
                      <Button variant="outlined" onClick={() => setIsFilter(false)}>
                        Cancel
                      </Button>
                    </Box>
                    <Box>
                      <Typography
                        paragraph
                        className="min-w-188"
                        style={{ color: "green", fontWeight: "bold" }}
                      >{`${totalData} Items: ${totalPrice}Tk`}</Typography>
                    </Box>
                  </>
                )}
              </Box>

              {!isFilter && (
                <Typography
                  paragraph
                  className="ml-8 min-w-188"
                  style={{ color: "green", fontWeight: "bold" }}
                >{`${totalData} Items: ${totalPrice}Tk`}</Typography>
              )}
            </Box>
            <Box>
              {!isFilter && (
                <small
                  style={{ cursor: "pointer" }}
                  className="rounded bg-secondary elevation-z3 text-white px-4 py-3 m-1"
                  onClick={() => setIsFilter(true)}
                >
                  more filter
                </small>
              )}
            </Box>
          </Box>
        </div>
        <Divider />
      </Card>
      <Card className="border-radius-0 mx-8">
        {!isLoading ? (
          <div className="w-full overflow-hidden px-2">
            {rows.length > 0 && errorMsg === "" ? (
              <>
                <div
                  style={{
                    maxHeight: 800,
                    overflow: "auto",
                  }}
                >
                  <Table stickyHeader className="whitespace-pre">
                    <TableHead>
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            style={{ minWidth: column.minWidth }}
                          >
                            {column.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => {
                        return (
                          <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                            {columns.map((column) => {
                              const value = row[column.id];
                              return (
                                <TableCell key={column.id} align={column.align}>
                                  {column.format ? column.format(value, row?.name) : value}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 100]}
                  component="div"
                  count={totalData} // total data
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            ) : (
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
          </div>
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
      <SimpleModal isShow={isOpenModal} closeModalHandler={closeModalHandler}>
        {deleteId ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FaExclamationTriangle className="text-secondary text-32" />
              <Typography paragraph className="ml-2 text-16">
                Are you sure you want to delete these?
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button variant="outlined" color="primary" className="mr-4" onClick={deleteHandler}>
                Yes
              </Button>
              <Button variant="outlined" onClick={() => setIsOpenModal(false)}>
                No
              </Button>
            </Box>
          </Box>
        ) : (
          ""
        )}
      </SimpleModal>
    </div>
  );
}
