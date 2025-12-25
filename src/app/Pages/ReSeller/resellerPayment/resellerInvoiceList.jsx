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
  MenuItem,
  Avatar,
  CardHeader,
  TextField,
  TablePagination
} from "@material-ui/core";
import axios from "../../../../axios";
import Spinner from "../../../Shared/Spinner/Spinner";
import { useHistory } from "react-router-dom";
import { notification } from "antd";
import imageBasePath from "../../../../config";
import { FaEye } from "react-icons/fa";
import { Modal, Carousel } from "antd";
import {  AiFillPrinter } from "react-icons/ai";


const EmployeeList = () => {
  const history = useHistory();

  const [dataList, setDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [searchNow, setSearchNow] = useState(false);
  const [imagesFile, setImagesFile] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalData, setTotalData] = useState(0);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };


  useEffect(() => {
    fetchData();
    setPage(0)
  }, [selectedStatus, searchNow]);

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      let res = await axios.post(
        `/reseller-payment/admin/invoice-list?page=${page+1}&limit=${rowsPerPage}`,
        { value: searchValue, status: selectedStatus }
      );
      setDataList(res?.data?.data);
      setTotalData(res?.data?.metaData?.totalData)
      setIsLoading(false);
      setErrorMsg("");
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.response.data.message);
    }
  };

  const statusUpdateHandler = async (data, id) => {
    try {
      const createRes = await axios.post(
        `/reseller-payment/admin/update-invoice-status/${id}`,
        { status: data }
      );
      if (createRes?.data?.success) {
        openNotificationWithIcon(createRes?.data?.message, "success");
        setSelectedStatus(data);
      }
      setIsLoading(false);
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
      setIsLoading(false);
    }
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
        <Breadcrumb routeSegments={[{ name: "Affiliate Invoice List" }]} />
      </div>

      <Grid container>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardHeader title="Affiliate Invoices" />
            <div className="flex items-center">
              <Box className="mt-3 ml-3">
                <TextField
                  label="Status Wise Filter"
                  size="small"
                  variant="outlined"
                  style={{ width: "200px" }}
                  className="ml-2"
                  select
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                  }}
                  value={selectedStatus}
                >
                  <MenuItem value={"all"}>All</MenuItem>
                  <MenuItem value={"pending"}>Pending</MenuItem>
                  <MenuItem value={"confirm"}>Confirmed</MenuItem>
                  <MenuItem value={"cancel"}>Cancelled</MenuItem>
                </TextField>
              </Box>
              <Box className="ml-3 mt-3 flex items-center">
                <TextField
                  label=""
                  placeholder="Search here.."
                  size="small"
                  variant="outlined"
                  fullWidth
                  className="min-w-340"
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearchValue(e.target.value);
                      setSearchNow(!searchNow);
                    }
                  }}
                  value={searchValue}
                />
                <Button
                  onClick={() => setSearchNow(!searchNow)}
                  style={{
                    background: "green",
                    color: "#fff",
                    minWidth: "100px",
                    marginLeft: "10px",
                  }}
                >
                  SEARCH
                </Button>
              </Box>
            </div>

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
                    <Table stickyHeader className="whitespace-pre">
                      <TableHead>
                        <TableRow>
                          <TableCell className="min-w-50">
                            <strong>#</strong>
                          </TableCell>
                          <TableCell className="min-w-100">
                            Invoice ID
                          </TableCell>
                          <TableCell className="min-w-100">
                            Reseller Info
                          </TableCell>
                          <TableCell className="min-w-100">
                            Total Grand Profit
                          </TableCell>
                          <TableCell className="min-w-100">
                            No of Orders
                          </TableCell>
                          <TableCell className="min-w-100">
                            Description
                          </TableCell>
                          <TableCell className="min-w-160">Files</TableCell>
                          <TableCell className="min-w-160">Status</TableCell>
                          <TableCell className="min-w-100">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dataList.map((data, index) => (
                          <TableRow key={index}>
                            <TableCell className="capitalize" align="left">
                              {index + 1}
                            </TableCell>
                            <TableCell className="capitalize" align="left">
                              {data?.serialId}
                            </TableCell>
                            <TableCell  align="left">
                              <div>
                                <p style={{ margin: "0px" }}>
                                  Name : {data?.reseller?.name}
                                </p>
                                <p style={{ margin: "0px" }}>
                                  Phone : {data?.reseller?.phone}
                                </p>
                                <p style={{ margin: "0px" }}>
                                  Email : {data?.reseller?.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="capitalize" align="left">
                              {data?.paymentInfo?.totalGrandProfit}
                            </TableCell>
                            <TableCell className="capitalize" align="left">
                              {data?.orderIds?.length}
                            </TableCell>
                            <TableCell className="capitalize" align="left">
                              {data?.details}
                            </TableCell>
                            <TableCell className="capitalize" align="left">
                              <div>
                                {data?.files?.length > 0 ? (
                                  <p
                                    style={{ color: "blue", cursor: "pointer" }}
                                    onClick={() => {
                                      setImagesFile(data?.files);
                                      setIsOpenModal(true);
                                    }}
                                  >
                                    Click to View
                                  </p>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell className="capitalize" align="left">
                              <div>
                                <TextField
                                  label="Status Wise Filter"
                                  size="small"
                                  variant="outlined"
                                  style={{ width: "200px" }}
                                  className="ml-2"
                                  select
                                  onChange={(e) => {
                                    statusUpdateHandler(
                                      e.target.value,
                                      data?._id
                                    );
                                  }}
                                  value={data?.status}
                                  disabled={
                                    data?.status == "confirm"
                                      ? true
                                      : data?.status == "cancel"
                                      ? true
                                      : false
                                  }
                                >
                                  <MenuItem value={"pending"}>Pending</MenuItem>
                                  <MenuItem value={"confirm"}>
                                    Confirmed
                                  </MenuItem>
                                  <MenuItem value={"cancel"}>
                                    Cancelled
                                  </MenuItem>
                                </TextField>
                              </div>
                            </TableCell>

                            <TableCell>
                              <IconButton
                                onClick={() => {
                                  history.push(
                                    `/reseller-wise-order-list/${data.serialId}`
                                  );
                                }}
                                style={{
                                  backgroundColor: "#ebedec",
                                  color: "#1976d2",
                                  marginRight: "8px",
                                }}
                              >
                                <FaEye
                                  style={{ fontSize: "16px", color: "#1976d2" }}
                                />
                              </IconButton>

                              <IconButton
                                onClick={() => {
                                  history.push(
                                    `/print-payment-invoice/${data.serialId}`
                                  );
                                }}
                                style={{
                                  backgroundColor: "#ebedec",
                                  color: "red",
                                }}
                              >
                                <AiFillPrinter />
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
      <Modal
        visible={isOpenModal}
        title="File Viewer"
        onCancel={() => setIsOpenModal(false)}
        footer={null}
        width={800}
      >
        <Carousel arrows={true} dots={true} infinite={false} initialSlide={0}>
          {imagesFile.map((imageUrl, index) => (
            <div key={index}>
              <img
                src={`${imageBasePath}/${imageUrl}`}
                alt={"img"}
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          ))}
        </Carousel>
      </Modal>
    </div>
  );
};

export default EmployeeList;
