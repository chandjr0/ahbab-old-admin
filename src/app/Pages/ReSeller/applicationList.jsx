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
  FormControlLabel,
  Avatar,
  CardHeader,
  MenuItem,
  TextField,
  TablePagination,
} from "@material-ui/core";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";
import { useHistory,useParams } from "react-router-dom";
import SimpleModal from "../../Shared/SimpleModal/SimpleModal";
import { notification } from "antd";
import { FaRegEdit } from "react-icons/fa";


const EmployeeList = () => {
  const history = useHistory();


  const [dataList, setDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  useEffect(() => {
    fetchData();
    setPage(0);
  }, [selectedStatus]);

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      let res = await axios.post(
        `/reseller-applicant/list?page=${page + 1}&limit=${rowsPerPage}`,
        {
          status: selectedStatus,
        }
      );
      setDataList(res?.data?.data);
      setTotalData(res?.data?.metaData?.totalData);
      setIsLoading(false);
      setErrorMsg("");
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.response.data.message);
    }
  };

  const statusUpdateHandler = async (val, id) => {
    try {
      const createRes = await axios.patch(
        `/reseller-applicant/update-status/${id}`,
        { status: val }
      );
      if (createRes?.data?.success) {
        openNotificationWithIcon(createRes?.data?.message, "success");
        fetchData();
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
      {/* <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Application List" }]} />
      </div> */}
      {/* <Box
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
          onClick={() => history.push("/create-employee")}
        >
          Add Employee
        </Button>
      </Box> */}
      <Grid container>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardHeader title="Application List" />
            <Box
              sx={{
                backgroundColor: "white",
                mx: 1,
                marginTop: "20px",
              }}
            >
              <TextField
                label="Select Status"
                size="small"
                variant="outlined"
                width={"250px"}
                select
                className="min-w-188"
                onChange={(e) => setSelectedStatus(e.target.value)}
                value={selectedStatus}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="hold">Hold</MenuItem>
                <MenuItem value="confirm">Confirm</MenuItem>
                <MenuItem value="reject">Reject</MenuItem>
              </TextField>
            </Box>

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
                          {/* <TableCell className="min-w-100">Image</TableCell> */}
                          <TableCell className="min-w-100">Name</TableCell>
                          <TableCell className="min-w-100">Email</TableCell>
                          <TableCell className="min-w-100">Phone</TableCell>
                          <TableCell className="min-w-100">Address</TableCell>
                          <TableCell className="min-w-100">
                            Description
                          </TableCell>
                          <TableCell className="min-w-100">FB Url</TableCell>
                          <TableCell className="min-w-100">Status</TableCell>
                          <TableCell className="min-w-100">Change Status</TableCell>
                          <TableCell className="min-w-100">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dataList.map((data, index) => (
                          <TableRow key={index}>
                            <TableCell className="capitalize" align="left">
                              {index + 1}
                            </TableCell>
                            {/* <TableCell className="capitalize" align="left">
                              <Avatar
                                className="border-radius-4"
                                style={{ cursor: "pointer", width: "58px" }}
                                src={imageBasePath + "/" + data?.image}
                                alt={data?.name}
                                onClick={() => openImgHandler(data)}
                              />
                            </TableCell> */}
                            <TableCell className="capitalize" align="left">
                              {data?.name}
                            </TableCell>
                            <TableCell className="" align="left">
                              {data?.email}
                            </TableCell>{" "}
                            <TableCell className="capitalize" align="left">
                              {data?.phone}
                            </TableCell>
                            <TableCell className="capitalize" align="left">
                              {data?.address}
                            </TableCell>
                            <TableCell
                              style={{ maxWidth: "250px" }}
                              className="capitalize"
                              align="left"
                            >
                              {data?.description}
                            </TableCell>
                            <TableCell
                              style={{ maxWidth: "250px" }}
                              className="capitalize"
                              align="left"
                            >
                              {data?.fbPageUrl}
                            </TableCell>
                            <TableCell className="capitalize" align="left">
                              {/* <small className="rounded bg-warning elevation-z3 text-white px-2 py-2px mr-4">
                                {data.status}
                              </small> */}
                              <small
                                className={`rounded  elevation-z3 text-white px-2 py-2px mr-4`}
                                style={{
                                  background:
                                    data.status == "pending"
                                      ? "orange"
                                      : data.status == "confirm"
                                      ? "green"
                                      : data.status == "hold"
                                      ? "blue"
                                      : data.status == "reject"
                                      ? "red"
                                      : "gray",
                                }}
                              >
                                {data?.status}
                              </small>
                            </TableCell>
                            <TableCell>
                              <TextField
                                select
                                name="parentId"
                                label=""
                                variant="outlined"
                                size="small"
                                fullWidth
                                onChange={(e) =>
                                  statusUpdateHandler(e.target.value, data?._id)
                                }
                              >
                                <MenuItem value="confirm">Confirm</MenuItem>
                                <MenuItem value="hold">Hold</MenuItem>
                                <MenuItem value="reject">Reject</MenuItem>
                              </TextField>
                            </TableCell>
                            <TableCell>
                              {data?.status == 'confirm'?null:
                              <IconButton
                                onClick={() => {
                                  history.push(`/reseller-application-update/${data?._id}`);
                                }}
                                style={{
                                  backgroundColor: "#ebedec",
                                  color: "#1976d2",
                                  marginRight: "8px",
                                }}
                              >
                                <FaRegEdit style={{ fontSize: "16px" }} />
                              </IconButton>}
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
      {/* <SimpleModal isShow={isOpenModal} closeModalHandler={closeModalHandler}>
        {openImgData ? (
          <Avatar
            className="border-radius-4"
            style={{ width: "100%", height: "100%" }}
            src={imageBasePath + "/" + openImgData?.image}
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
      </SimpleModal> */}
    </div>
  );
};

export default EmployeeList;
