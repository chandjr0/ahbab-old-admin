import React, { useEffect, useState } from "react";
import StatCards2 from "./shared/statCard2Custom";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import {
  Box,
  Button,
  Divider,
  Typography,
  TableCell,
  TableHead,
  TableBody,
  Card,
  CardHeader,
  Grid,
  TableRow,
  Table,
  TablePagination,
  Avatar
} from "@material-ui/core";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";
import { Autorenew } from "@material-ui/icons";
import { ThemeProvider } from "@material-ui/core";
import { createMuiTheme } from "@material-ui/core/styles";
import imageBasePath from "../../../config";

const theme = createMuiTheme({
  overrides: {
    MuiTableCell: {
      root: {
        padding: "2px 8px",
      },
    },
  },
});
const today = new Date();  
const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dataList, setDataList] = useState(null);
  const [startTime, setStartTime] = useState(
    new Date(today).setDate(today.getDate() - 29)
  );
  const [endTime, setEndTime] = useState(today);
  const [isReset, setIsReset] = useState(false);
  const [topAffiliateList, setTopAffiliateList] = useState([]);
  const [affiliateByValue, setAffiliateByValue] = useState([]);
  const [productReportList, setProductReportList] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let obj = {
          startTime: startTime ? setToMidnight(startTime).toISOString() : null,
          endTime: endTime ? setToEndOfDay(endTime).toISOString() : null,
        };
        let res = await axios.post(
          `/dashboard/admin/reseller-order-history`,
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
  }, [isReset, startTime, endTime, isFiltered]);

  useEffect(() => {
    const obj = {
      sortBy: "orderNum",
      startTime: startTime ? setToMidnight(startTime).toISOString() : null,
      endTime: endTime ? setToEndOfDay(endTime).toISOString() : null,
    };

    const obj2 = {
      sortBy: "orderAmount",
      startTime: startTime ? setToMidnight(startTime).toISOString() : null,
      endTime: endTime ? setToEndOfDay(endTime).toISOString() : null,
    };

    const getResellerData = async () => {
      try {
        let res = await axios.post(
          `/dashboard/admin/top-reseller?page=1&limit=100`,
          obj
        );
        if (res) {
          setTopAffiliateList(res?.data?.data);
        }
      } catch (error) {}
    };
    const getResellerDataByValue = async () => {
      try {
        let res = await axios.post(
          `/dashboard/admin/top-reseller?page=1&limit=100`,
          obj2
        );
        if (res) {
          setAffiliateByValue(res?.data?.data);
        }
      } catch (error) {}
    };

    getResellerDataByValue();
    getResellerData();
  }, [startTime, endTime]);

  useEffect(() => {
    const obj = {
      sortBy: "orderNum",
      startTime: startTime ? setToMidnight(startTime).toISOString() : null,
      endTime: endTime ? setToEndOfDay(endTime).toISOString() : null,
    };

    const getProductData = async () => {
      try {
        let res = await axios.post(
          `/dashboard/top-products/reseller-order?page=${
            page + 1
          }&limit=${rowsPerPage}`,
          obj
        );
        if (res) {
          setProductReportList(res?.data?.data);
          setTotalData(res?.data?.metaData?.totalData);
        }
      } catch (error) {}
    };

    getProductData();
  }, [startTime, endTime, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

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
              // flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Box sx={{ mr: 1 }}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  className="min-w-18 bg-white"
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
                  className="bg-white min-w-18"
                  label="End Date"
                  inputVariant="outlined"
                  type="text"
                  autoOk={true}
                  variant="outlined"
                  format="MM-dd-yy"
                  size="small"
                  value={endTime}
                  onChange={(t) => setEndTime(t)}
                />
              </MuiPickersUtilsProvider>
            </Box>
            <Box sx={{ my: 1, display: "flex", alignItems: "center" }}>
              <Button
                variant="contained"
                color="primary"
                className="mr-2 text-white"
                size="small"
                onClick={() => setIsFiltered(!isFiltered)}
              >
                Filter
              </Button>
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

      <div>
        <h5>Total Overview</h5>
      </div>
      <Divider className="my-4" />

      <StatCards2 dataList={dataList} />

      {!isLoading ? (
        <>
          <Grid container spacing={3}>
            <Grid item md={12} sm={12} xs={12}>
              <Card elevation={3} className="mt-5">
                <CardHeader title="Top Affiliate By Order Quantity" />

                {!isLoading ? (
                  <div className="w-full overflow-auto  px-6 py-8">
                    {topAffiliateList.length > 0 ? (
                      <div
                        style={{
                          // maxHeight: 800,
                          minWidth: 300,
                          overflow: "auto",
                        }}
                      >
                        <ThemeProvider theme={theme}>
                          <Table stickyHeader className="whitespace-pre">
                            <TableHead>
                              <TableRow>
                                <TableCell className="min-w-100">SL</TableCell>
                                <TableCell className="min-w-100">
                                  Name
                                </TableCell>
                                <TableCell className="min-w-100">
                                  Email
                                </TableCell>
                                <TableCell className="min-w-100">TO</TableCell>

                                <TableCell className="min-w-100">TC</TableCell>
                                <TableCell className="min-w-100">DO</TableCell>
                                <TableCell className="min-w-100">CO</TableCell>
                                <TableCell className="min-w-100">RO</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {topAffiliateList.map((data, index) => (
                                <TableRow
                                  key={index}
                                  style={{
                                    background:
                                      index % 2 == 0 ? "white" : "#FAFAFA",
                                  }}
                                >
                                  <TableCell
                                    className="capitalize"
                                    align="left"
                                  >
                                    {index + 1}
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="left"
                                  >
                                    {data?.reseller?.name?.slice(0, 10)}
                                  </TableCell>
                                  <TableCell align="left">
                                    {data?.reseller?.email}
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="left"
                                  >
                                    {data?.tOrder}
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="left"
                                  >
                                    {data?.tCommission}
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="left"
                                  >
                                    <span
                                      style={{
                                        color: "green",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {data?.orderCountByStatus?.find(
                                        (item) =>
                                          item?.status === "DELIVERED" &&
                                          item?.tOrder > 0
                                      )?.tOrder || 0}
                                    </span>
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="left"
                                  >
                                    <span
                                      style={{
                                        color: "red",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {data?.orderCountByStatus?.find(
                                        (item) =>
                                          item?.status === "CANCELED" &&
                                          item?.tOrder > 0
                                      )?.tOrder || 0}
                                    </span>
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="left"
                                  >
                                    <span
                                      style={{
                                        color: "purple",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {data?.orderCountByStatus?.find(
                                        (item) =>
                                          item?.status === "RETURNED" &&
                                          item?.tOrder > 0
                                      )?.tOrder || 0}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ThemeProvider>
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
            <Grid item md={12} sm={12} xs={12}>
              <Card elevation={3} className="mt-5">
                <CardHeader title="Product Report" />

                {!isLoading ? (
                  <div className="w-full overflow-auto  px-6 py-8">
                    {productReportList?.length > 0 ? (
                      <div
                        style={{
                          // maxHeight: 800,
                          minWidth: 300,
                          overflow: "auto",
                        }}
                      >
                        <ThemeProvider theme={theme}>
                          <Table stickyHeader className="whitespace-pre">
                            <TableHead>
                              <TableRow>
                                <TableCell className="min-w-100">SL</TableCell>
                                <TableCell className="min-w-100">
                                  Image
                                </TableCell>
                                <TableCell className="min-w-100">
                                  Name
                                </TableCell>

                                <TableCell className="min-w-100">TO</TableCell>

                                <TableCell className="min-w-100">DO</TableCell>
                                <TableCell className="min-w-100">CO</TableCell>
                                <TableCell className="min-w-100">RO</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {productReportList?.map((data, index) => (
                                <TableRow
                                  key={index}
                                  style={{
                                    background:
                                      index % 2 == 0 ? "white" : "#FAFAFA",
                                  }}
                                >
                                  <TableCell
                                    className="capitalize"
                                    align="left"
                                  >
                                    {index + 1}
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="left"
                                  >
                                    <Avatar
                                      className="border-radius-4"
                                      style={{
                                        cursor: "pointer",
                                        width: "38px",
                                        height: "20px",
                                      }}
                                      src={
                                        imageBasePath +
                                        "/" +
                                        data?.product?.galleryImage[0]
                                      }
                                      alt={data?.name}
                                      // onClick={() => openImgHandler(data)}
                                    />
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="left"
                                  >
                                    {data?.product?.name}
                                  </TableCell>

                                  <TableCell
                                    className="capitalize"
                                    align="left"
                                  >
                                    {data?.tQuantity}
                                  </TableCell>

                                  <TableCell
                                    className="capitalize"
                                    align="left"
                                  >
                                    <span
                                      style={{
                                        color: "green",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {data?.orderData?.find(
                                        (item) =>
                                          item?.status === "DELIVERED" &&
                                          item?.tQuantity > 0
                                      )?.tQuantity || 0}
                                    </span>
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="left"
                                  >
                                    <span
                                      style={{
                                        color: "red",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {data?.orderData?.find(
                                        (item) =>
                                          item?.status === "CANCELED" &&
                                          item?.tQuantity > 0
                                      )?.tQuantity || 0}
                                    </span>
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="left"
                                  >
                                    <span
                                      style={{
                                        color: "purple",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {data?.orderData?.find(
                                        (item) =>
                                          item?.status === "RETURNED" &&
                                          item?.tQuantity > 0
                                      )?.tQuantity || 0}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ThemeProvider>
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
