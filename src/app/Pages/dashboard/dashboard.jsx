import React, { useEffect, useState } from "react";
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
  TableCell,
  TableRow,
  TableHead,
  Table,
  Typography,
  CardHeader,
  Card,
  TableBody,
  Grid,
  TablePagination,
  Avatar,
} from "@material-ui/core";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";
import { Autorenew } from "@material-ui/icons";
import jwtDecode from "jwt-decode";
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
  const token = localStorage.getItem("accessToken");
  const decode = jwtDecode(token);

  const [menuItems, setMenuItems] = useState(
    JSON.parse(localStorage.getItem("menuList"))
  );
  const [userRole, setUserRole] = useState(decode.data?.role);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page2, setPage2] = useState(0);
  const [rowsPerPage2, setRowsPerPage2] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [totalData2, setTotalData2] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState(
    new Date(today).setDate(today.getDate() - 29)
  );
  const [endTime, setEndTime] = useState(today);
  const [isReset, setIsReset] = useState(false);
  const [topProducts, setTopProducts] = useState([]);
  const [districtWiseProduct, setDistrictWiseProduct] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleChangePage2 = (event, newPage) => {
    setPage2(newPage);
  };

  const handleChangeRowsPerPage2 = (event) => {
    setRowsPerPage2(+event.target.value);
    setPage2(0);
  };

  useEffect(() => {
    const fetchCourier = async () => {
      try {
        let res = await axios.get("/courier-service/api/fetch");
        if (res) {
          let data = res?.data?.data;
          // Save STEADFAST_CLIENT_ID to localStorage
          if (data?.steadfast?.STEADFAST_CLIENT_ID) {
            localStorage.setItem(
              "STEADFAST_CLIENT_ID",
              data.steadfast.STEADFAST_CLIENT_ID
            );
          }
        }
      } catch (err) {
      }
    };

    fetchCourier();
  }, []);

  useEffect(() => {
    const fetchDistrictData = async () => {
      try {
        let obj = {
          startTime: startTime ? setToMidnight(startTime).toISOString() : null,
          endTime: endTime ? setToEndOfDay(endTime).toISOString() : null,
          sortBy: "orderNum",
          orderType: "all",
        };

        let res = await axios.post(
          `/dashboard/district-report?page=${page2 + 1}&limit=${rowsPerPage2}`,
          obj
        );
        if (res?.data?.success) {
          setIsLoading(true);
          setDistrictWiseProduct(res?.data?.data);
          setTotalData2(res?.data?.metaData?.totalData);
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };
    if ((startTime && endTime) || (!startTime && !endTime)) {
      fetchDistrictData();
    }
  }, [isReset, startTime, endTime, rowsPerPage2, page2, isFiltered]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let obj = {
          startTime: startTime ? setToMidnight(startTime).toISOString() : null,
          endTime: endTime ? setToEndOfDay(endTime).toISOString() : null,
          sortBy: "quantity",
        };

        let res = await axios.post(
          `/dashboard/top-products/all-order?page=${
            page + 1
          }&limit=${rowsPerPage}`,
          obj
        );
        if (res?.data?.success) {
          setIsLoading(true);
          setTopProducts(res?.data?.data);
          setTotalData(res?.data?.metaData?.totalData);
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };

    if ((startTime && endTime) || (!startTime && !endTime)) {
      fetchData();
    }
  }, [isReset, startTime, endTime, rowsPerPage, page, isFiltered]);

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
      {(userRole == "employee" &&
        menuItems?.some((item) => item.name.includes("Dashboard"))) ||
      userRole == "admin" ? (
        <>
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
                      format="MM-dd-yy"
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

          {!isLoading ? (
            <>
              <Grid container spacing={2}>
                <Grid item md={6} sm={6} xs={12}>
                  <Card elevation={6} className="mt-5">
                    <CardHeader title="Product Report" />

                    {!isLoading ? (
                      <div className="w-full overflow-auto  px-6 py-8">
                        {topProducts?.length > 0 ? (
                          <div
                            style={{
                              minWidth: 300,
                              overflow: "auto",
                            }}
                          >
                            <ThemeProvider theme={theme}>
                              <Table stickyHeader className="whitespace-pre">
                                <TableHead>
                                  <TableRow>
                                    <TableCell className="min-w-50">
                                      SL
                                    </TableCell>
                                    <TableCell className="min-w-50">
                                      Image
                                    </TableCell>
                                    <TableCell className="min-w-100">
                                      Name
                                    </TableCell>

                                    <TableCell className="min-w-50">
                                      TO
                                    </TableCell>

                                    <TableCell className="min-w-50">
                                      DO
                                    </TableCell>
                                    <TableCell className="min-w-50">
                                      CO
                                    </TableCell>
                                    <TableCell className="min-w-50">
                                      RO
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {topProducts?.map((data, index) => (
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
                                        {data?.product?.name?.slice(0, 24)}
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
                <Grid item md={6} sm={6} xs={12}>
                  <Card elevation={6} className="mt-5">
                    <CardHeader title="District Report" />

                    {!isLoading ? (
                      <div className="w-full overflow-auto  px-6 py-8">
                        {districtWiseProduct?.length > 0 ? (
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
                                    <TableCell className="min-w-50">
                                      SL
                                    </TableCell>
                                    <TableCell className="min-w-100">
                                      Name
                                    </TableCell>

                                    <TableCell className="min-w-100">
                                      Total Order
                                    </TableCell>

                                    <TableCell className="min-w-50">
                                      DO
                                    </TableCell>
                                    <TableCell className="min-w-50">
                                      CO
                                    </TableCell>
                                    <TableCell className="min-w-50">
                                      RO
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {districtWiseProduct?.map((data, index) => (
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
                                        {data?.cityData?.city_name}
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
                                        <span
                                          style={{
                                            color: "green",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {data?.ordersByStatus?.find(
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
                                          {data?.ordersByStatus?.find(
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
                                          {data?.ordersByStatus?.find(
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
                            <TablePagination
                              rowsPerPageOptions={[10, 25, 100]}
                              component="div"
                              count={totalData2} // total data
                              rowsPerPage={rowsPerPage2}
                              page={page2}
                              onPageChange={handleChangePage2}
                              onRowsPerPageChange={handleChangeRowsPerPage2}
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
        </>
      ) : (
        <div className="text-center pt-10">
          <h2>Nothing to Show</h2>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
