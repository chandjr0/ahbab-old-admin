import React, { useEffect, useState } from "react";
import { Breadcrumb } from "../../components/index";
import "react-loading-skeleton/dist/skeleton.css";
import {
  IconButton,
  TableCell,
  TableRow,
  Table,
  TableHead,
  TableBody,
  Grid,
  Typography,
  Box,
  Card,
  Button,
  CardHeader,
  TablePagination,
  TextField,
} from "@material-ui/core";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";
import { useHistory } from "react-router-dom";
import SimpleModal from "../../Shared/SimpleModal/SimpleModal";
import { notification } from "antd";
import { FaExclamationTriangle, FaEye, FaRegEdit } from "react-icons/fa";
import { RiDeleteBin3Line } from "react-icons/ri";
import { IoMdAddCircle } from "react-icons/io";
import moment from "moment";
import { Autorenew } from "@material-ui/icons";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";

const BrandList = () => {
  const history = useHistory();

  const [dataList, setDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isReset, setIsReset] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let obj = {
          value: searchValue,
          startTime: startTime ? setToMidnight(startTime).toISOString() : null,
          endTime: endTime ? setToEndOfDay(endTime).toISOString() : null,
        };
        let res = await axios.post(
          `/campaign/fetch-all?page=${page + 1}&limit=${rowsPerPage}`,
          obj
        );
        let result = res?.data?.data;
        // console.log("result: ", result);

        let updateDataList = [];
        result.forEach((resultData) => {
          let pendingItems = 0;
          let deliveryItems = 0;
          let returnItem = 0;
          let returnCost = 0;
          let refundItem = 0;
          let refundCost = 0;
          let sellAmount = 0;

          resultData.saleDetails.forEach((d) => {
            if (["DELIVERED", "RETURNED", "REFUND"].includes(d?.status)) {
              if (d?.status === "DELIVERED") {
                sellAmount += d?.salePrice;
                deliveryItems += d?.saleQty;
              } else if (d?.status === "RETURNED") {
                returnItem += d?.saleQty;
                returnCost += d?.returnMoney || 0;
              } else if (d?.status === "REFUND") {
                sellAmount += d?.salePrice;
                deliveryItems += d?.saleQty;
                refundItem += d?.saleQty;
                refundCost += d?.refundMoney || 0;
              }
            } else {
              pendingItems += d?.saleQty;
              sellAmount += d?.salePrice;
            }
          });

          let avgPurchase =
            resultData?.purchaseCost?.purchasePrice / resultData?.purchaseCost?.totalQty || 0;
          let purchaseCost = avgPurchase * (deliveryItems + pendingItems) || 0;

          let fbCosting = resultData?.campaignCost?.totalCost || 0;
          let totalItems = deliveryItems + pendingItems;
          let perFbCosting = totalItems === 0 ? 0 : fbCosting / totalItems;
          let estimateProfit = sellAmount - fbCosting - purchaseCost || 0;

          updateDataList.push({
            _id: resultData?._id,
            startDate: resultData?.startDate,
            lastPayTime: resultData?.lastPayTime,
            name: resultData?.name,
            items: resultData?.products?.length,
            pendingItems,
            deliveryItems,
            returnItem,
            returnCost,
            refundItem,
            refundCost,
            purchaseCost,
            sellAmount,
            fbCosting,
            perFbCosting,
            estimateProfit,
          });
        });

        // console.log("updateDataList: ", updateDataList);
        setDataList(updateDataList);
        setTotalData(res?.data?.metaData?.totalData);
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
  }, [page, rowsPerPage, startTime, endTime, searchValue]);

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

  const closeModalHandler = () => {
    setDeleteId(false);
    setIsOpenModal(false);
  };

  const deleteHandler = async () => {
    try {
      let res = await axios.delete(`/campaign/delete/${deleteId}`);
      setDataList(dataList.filter((i) => i?._id !== deleteId));
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
    setDeleteId(false);
    setIsOpenModal(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Campaign List" }]} />
      </div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "28px",
          marginTop: "28px",
        }}
      >
        <Button
          style={{
            backgroundColor: "#FF8E96",
            color: "white",
          }}
          variant="contained"
          size="large"
          startIcon={<IoMdAddCircle />}
          onClick={() => history.push("/create-campaign")}
        >
          Add Campaign
        </Button>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          py: 2,
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
                  variant="outlined"
                  format="MM-dd-yy"
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
            <Box sx={{ my: 1 }}>
              {/* <Button
                variant="contained"
                color="primary"
                className="mr-4 text-white"
                size="small"
                // onClick={filterHandler}
              >
                Filter
              </Button> */}
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setIsReset(!isReset);
                  setStartTime("");
                  setEndTime("");
                  setSearchValue("");
                }}
                className="text-white bg-error"
                startIcon={<Autorenew />}
              >
                Reset
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
      <Grid container>
        <Grid item xs={12}>
          <Card className="border-radius-0 ">
            <CardHeader title="Campaign List" />

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
                }}
              >
                <Box></Box>
                <Box>
                  <TextField
                    label=""
                    placeholder="Search here.."
                    size="small"
                    variant="outlined"
                    fullWidth
                    className="min-w-240"
                    onChange={(e) => {
                      setPage(0);
                      setStartTime("");
                      setEndTime("");
                      setSearchValue(e.target.value);
                    }}
                    value={searchValue}
                  />
                </Box>
              </Box>
            </div>
          </Card>

          <Card className="border-radius-0">
            {!isLoading ? (
              <div className="w-full overflow-auto">
                {dataList.length > 0 && errorMsg === "" ? (
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
                          <TableCell className="min-w-50" align="center">
                            Created/LastPay
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Name
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Items
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Pending
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Delivered
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Returned/cost
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Refunded/cost
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Purchase
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Sell Amount
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Costing
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Cost Per.Order
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Estimate profit
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dataList.map((data, index) => (
                          <TableRow key={index}>
                            <TableCell className="capitalize" align="center">
                              <small>
                                <strong>{moment(data?.startDate).format("lll")}</strong>
                              </small>
                              <br />
                              <small>{moment(data?.lastPayTime).format("lll")}</small>
                            </TableCell>
                            <TableCell className="capitalize" align="center">
                              {data?.name}
                            </TableCell>
                            <TableCell className="capitalize" align="center">
                              {data?.items}
                            </TableCell>{" "}
                            <TableCell className="capitalize" align="center">
                              {data?.pendingItems}
                            </TableCell>{" "}
                            <TableCell className="capitalize" align="center">
                              {data?.deliveryItems}
                            </TableCell>{" "}
                            <TableCell className="capitalize" align="center">
                              {data?.returnItem + "\n" + Math.ceil(data?.returnCost || 0) + " tk"}
                            </TableCell>{" "}
                            <TableCell className="capitalize" align="center">
                              {data?.refundItem + "\n" + Math.ceil(data?.refundCost || 0) + " tk"}
                            </TableCell>{" "}
                            <TableCell className="capitalize" align="center">
                              {Math.ceil(data?.purchaseCost || 0) + " tk"}
                            </TableCell>{" "}
                            <TableCell className="capitalize" align="center">
                              {Math.ceil(data?.sellAmount || 0) + " tk"}
                            </TableCell>{" "}
                            <TableCell className="capitalize" align="center">
                              {Math.ceil(data?.fbCosting || 0) + " tk"}
                            </TableCell>
                            <TableCell className="capitalize" align="center">
                              {Math.ceil(data?.perFbCosting || 0) + " tk"}
                            </TableCell>
                            <TableCell className="capitalize" align="center">
                              {Math.ceil(data?.estimateProfit || 0) + " tk"}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                onClick={() => {
                                  history.push(`/view-campaign/${data._id}`);
                                }}
                                style={{
                                  backgroundColor: "#ebedec",
                                  color: "#1976d2",
                                  marginRight: "8px",
                                }}
                              >
                                <FaEye style={{ fontSize: "16px" }} />
                              </IconButton>
                              <IconButton
                                onClick={() => {
                                  history.push(`/update-campaign/${data._id}`);
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
                                  setDeleteId(data._id);
                                }}
                                style={{
                                  backgroundColor: "#ebedec",
                                  color: "red",
                                }}
                              >
                                <RiDeleteBin3Line style={{ fontSize: "16px" }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <TablePagination
                      rowsPerPageOptions={[10, 25, 100]}
                      component="div"
                      count={totalData} // total data
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </div>
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
        </Grid>
      </Grid>
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
};

export default BrandList;
