import React, { useEffect, useState } from "react";
import { Breadcrumb } from "../../../components/index";
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
  FormControlLabel,
  Avatar,
  CardHeader,
} from "@material-ui/core";
import axios from "../../../../axios";
import Spinner from "../../../Shared/Spinner/Spinner";
import { useHistory } from "react-router-dom";
import SimpleModal from "../../../Shared/SimpleModal/SimpleModal";
import { notification } from "antd";
import imageBasePath from "../../../../config";
import ProductDetails from "./productDetails";
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
  } from "@material-ui/pickers";
  import "date-fns";
  import DateFnsUtils from "@date-io/date-fns";
import { FaExclamationTriangle } from "react-icons/fa";
import { Autorenew } from "@material-ui/icons";



const EmployeeList = () => {
  const history = useHistory();

  const [dataList, setDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openImgData, setOpenImgData] = useState(null);
  const [productsData, setProductsData] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isReset, setIsReset] = useState(false);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
        let obj = {
            startTime: startTime ? setToMidnight(startTime).toISOString() : '',
            endTime: endTime ? setToEndOfDay(endTime).toISOString() : '',
          };
      try {
        setIsLoading(true);
        let res = await axios.post("/stock-adjust/fetch-all?page=1&limit=20", obj);
        setDataList(res?.data?.data);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };
    fetchData();
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

  const closeModalHandler = () => {
    setDeleteId(false);
    setIsOpenModal(false);
    setOpenImgData(null);
  };

  const deleteHandler = async () => {
    try {
      let res = await axios.delete(`/employee/delete/${deleteId}`);
      setDataList(dataList.filter((i) => i._id !== deleteId));
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
    setDeleteId(false);
    setIsOpenModal(false);
  };

  const openImgHandler = (data) => {
    setIsOpenModal(true);
    setOpenImgData(data);
  };

  const showProductsDetails = (data) => {
    setProductsData(data);
    setIsOpenModal(true);
  };

  return (
    <div className="m-sm-30">
      <Grid container>
        <Grid item xs={12}>
          <Card elevation={3}>
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

            <CardHeader title="Stock Process List" />

            {!isLoading ? (
              <div className="w-full overflow-auto  px-6 py-8">
                {dataList.length > 0 && errorMsg === "" ? (
                  <div
                    style={{
                      maxHeight: 800,
                      minWidth: 300,
                      overflow: "auto",
                    }}
                  >
                    <Grid item xs={12}>
                      <div className="w-full overflow-auto py-2">
                        {dataList.length > 0 && (
                          <Table stickyHeader className="whitespace-pre">
                            <TableHead>
                              <TableRow>
                                <TableCell className="min-w-50" align="center">
                                  Serial
                                </TableCell>

                                <TableCell className="min-w-100" align="center">
                                  Note
                                </TableCell>
                                <TableCell className="min-w-100" align="center">
                                  Document
                                </TableCell>

                                <TableCell className="min-w-100" align="center">
                                  Product Info
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {dataList.map((data, idx) => (
                                <React.Fragment key={data?._id}>
                                  <TableRow key={idx}>
                                    <TableCell
                                      className="capitalize"
                                      align="center"
                                    >
                                      {data?.serialId}
                                    </TableCell>
                                    <TableCell
                                      className="capitalize"
                                      align="center"
                                    >
                                      {data?.note}
                                    </TableCell>
                                    <TableCell
                                      className="capitalize"
                                      align="center"
                                    >
                                      <img
                                        className="border-radius-4"
                                        style={{
                                          cursor: "pointer",
                                          width: "58px",
                                        }}
                                        src={
                                          imageBasePath + "/" + data?.document
                                        }
                                        alt={"image"}
                                        onClick={() => openImgHandler(data)}
                                      />
                                    </TableCell>
                                    <TableCell
                                      className="capitalize"
                                      align="center"
                                    >
                                      <img
                                        className="border-radius-4"
                                        style={{
                                          cursor: "pointer",
                                          width: "70px",
                                        }}
                                        src={
                                          imageBasePath +
                                          "/" +
                                          data?.products[0]?.product
                                            ?.galleryImage[0]
                                        }
                                        alt={"image"}
                                        onClick={() =>
                                          showProductsDetails(data?.products)
                                        }
                                      />
                                    </TableCell>
                                  </TableRow>
                                </React.Fragment>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </Grid>
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
        {openImgData ? (
          <Avatar
            className="border-radius-4"
            style={{ width: "100%", height: "100%" }}
            src={imageBasePath + "/" + openImgData?.document}
            alt={openImgData?.name}
          />
        ) : (
          ""
        )}

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
              <Button
                variant="outlined"
                color="primary"
                className="mr-4"
                onClick={deleteHandler}
              >
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

        {productsData.length > 0 && (
          <ProductDetails
            productsData={productsData}
            closeModalHandler={closeModalHandler}
          />
        )}
      </SimpleModal>
    </div>
  );
};

export default EmployeeList;
