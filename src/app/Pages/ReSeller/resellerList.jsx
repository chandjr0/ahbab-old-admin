import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
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
import { useHistory, useLocation } from "react-router-dom";
import {
  FaExclamationTriangle,
  FaRegEdit,
  FaEye,
  FaPrint,
} from "react-icons/fa";
import SimpleModal from "../../Shared/SimpleModal/SimpleModal";
import Spinner from "../../Shared/Spinner/Spinner";
import { notification } from "antd";
import { ThemeProvider } from "@material-ui/core";
import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  overrides: {
    MuiTableCell: {
      root: {
        padding: "2px 8px",
      },
    },
  },
});

const prodTypeOptions = [
  {
    label: "ALL",
    value: "all",
  },
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Inactive",
    value: "inactive",
  },
];

export default function ProductListPage() {
  const history = useHistory();

  const rowperPage = localStorage.getItem("rowPerPage");
  const Pages = localStorage.getItem("resellerListPageNo");
  const currentStatus = localStorage.getItem("currentStatus");

  const [page, setPage] = useState(Pages ? Number(Pages) : null);
  const [rowsPerPage, setRowsPerPage] = useState(
    rowperPage ? Number(rowperPage) : 20
  );
  const [totalData, setTotalData] = useState(0);
  const [rows, setRows] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openImgData, setOpenImgData] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [totalChecked, setTotalChecked] = useState(0);
  const [bulkselect, setBulkSelect] = useState("");
  const [bulkActionData, setBulkActionData] = useState(null);
  const [sectionId, setSectionId] = useState("");
  const [prodTypeValue, setProdTypeValue] = useState(
    currentStatus ? currentStatus : "all"
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const handleChangeRowsPerPage = (event) => {
    localStorage.setItem("rowPerPage", +event.target.value);
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    fetchData();
    localStorage.setItem("resellerListPageNo", page);
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchData();
    localStorage.setItem("resellerListPageNo", page);
  }, [searchValue, prodTypeValue]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      let res = await axios.post(
        `/reseller/list?page=${page + 1}&limit=${rowsPerPage}`,
        { value: searchValue, status: prodTypeValue }
      );
      if (res?.data?.data) {
        setTotalData(res?.data?.metaData?.totalData);
        setDataList(res?.data?.data.map((i) => ({ ...i, checkStatus: false })));
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err?.response?.data?.message);
    }
  };

  useEffect(() => {
    // console.log("dataList: ", dataList);
    if (dataList.length > 0) {
      let dataArray = [];
      let i = 0;
      for (let data of dataList) {
        if (data?.checkStatus) {
          i++;
        }
        dataArray.push({ ...data });
      }

      setRows(dataArray);
    } else {
      setRows([]);
    }
  }, [dataList]);

  const closeModalHandler = () => {
    setDataList(dataList.map((i) => ({ ...i, checkStatus: false })));
    setIsOpenModal(false);
    setDeleteId(false);
    setOpenImgData(null);

    setBulkActionData(null);
    setBulkSelect("");
    setSectionId("");
  };

  const statusUpdateHandler = async (data, value) => {
    if (value == "pending") {
      openNotificationWithIcon("Pending Status can't change", "error");
      return;
    }
    try {
      const createRes = await axios.patch(
        `/reseller/update-status/${data?._id}`,
        {
          status: value,
        }
      );

      if (createRes?.data?.success) {
        fetchData();
        openNotificationWithIcon(createRes?.data?.message, "success");
      }
      setIsLoading(false);
    } catch (error) {
      console.log("error");
      openNotificationWithIcon(error?.response?.data?.message, "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="m-sm-30">
      <Card className="border-radius-0">
        <CardHeader title="Affiliate List" />
        <div className="w-full overflow-hidden mt-4">
          {totalChecked > 0 ? (
            <Box
              sx={{
                borderBottom: "1px solid #F6F6F6",
                backgroundColor: "#FCF4F2",
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
              ></Box>
            </Box>
          ) : (
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
                {/* <TextField
                  label="Type"
                  size="small"
                  variant="outlined"
                  fullWidth
                  select
                  className="ml-2 min-w-188"
                  onChange={(e) => {
                    setPage(0);
                    setSearchValue("");
                    setProdTypeValue(e.target.value);
                  }}
                  value={prodTypeValue}
                >
                  {prodTypeOptions.map((item) => (
                    <MenuItem key={item?.value} value={item?.value}>
                      {item?.label}
                    </MenuItem>
                  ))}
                </TextField> */}
                <div container spacing={3} className="mb-2 flex items-center">
                  {prodTypeOptions?.map((data, idx) => (
                    <div key={idx} item md={2} sm={3} xs={6}>
                      <div
                        elevation={3}
                        className={`py-1 ${data?.value === prodTypeValue}`}
                        onClick={() => {
                          setPage(0);
                          setSearchValue("");
                          setProdTypeValue(data?.value);
                          localStorage.setItem("currentStatus", data?.value);
                        }}
                      >
                        <Button
                          style={{
                            border: "1px solid #1234",
                            background:
                              data?.value === prodTypeValue ? "#BDBDBD" : "",
                            color: data?.value === prodTypeValue ? "#fff" : "",
                          }}
                          className="text-center text-12  mr-2 "
                        >
                          {data.label}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Typography
                  paragraph
                  className="ml-4 min-w-188"
                  style={{ color: "green", fontWeight: "bold" }}
                >{`Total Reseller: ${totalData || 0}`}</Typography>
              </Box>
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
                    // setProdTypeValue("all");
                    setSearchValue(e.target.value);
                  }}
                  value={searchValue}
                />
              </Box>
            </Box>
          )}
        </div>
        <Divider />
      </Card>
      <Card className="border-radius-0 ">
        {!isLoading ? (
          <div className="w-full overflow-hidden px-2">
            {rows.length > 0 && errorMsg === "" ? (
              <>
                <div
                  style={{
                    // maxHeight: 800,
                    overflow: "auto",
                  }}
                >
                  <ThemeProvider theme={theme}>
                    <Table stickyHeader className="whitespace-pre">
                      <TableHead>
                        <TableRow>
                         
                          <TableCell className="min-w-100" align="center">
                            Name
                          </TableCell>
                          <TableCell className="min-w-150" align="center">
                            Phone
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Email
                          </TableCell>

                          <TableCell className="min-w-100" align="center">
                            Address
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Key
                          </TableCell>
                          <TableCell className="min-w-100" align="center">
                            Status
                          </TableCell>
                          <TableCell className="min-w-200" align="center">
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.length > 0 &&
                          rows.map((data, index) => (
                            <React.Fragment
                              key={data?._id}
                            
                            >
                              <>
                                <TableRow   style={{
                                background: index % 2 == 0 ? "white" : "#FAFAFA",
                              }}>
                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    {data?.name}
                                  </TableCell>

                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    {data?.phone}
                                  </TableCell>

                                  <TableCell className="" align="center">
                                    {data?.email}
                                  </TableCell>

                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    {`${data?.address?.present}`}
                                  </TableCell>
                                  <TableCell align="center">
                                    {`${data?.apiKey}`}
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    <TextField
                                      label=""
                                      size="small"
                                      variant="outlined"
                                      fullWidth
                                      select
                                      className="min-w-80"
                                      onChange={(e) =>
                                        statusUpdateHandler(
                                          data,
                                          e.target.value
                                        )
                                      }
                                      value={data?.status}
                                    >
                                      <MenuItem value="pending">
                                        Pending
                                      </MenuItem>
                                      <MenuItem value="active">Active</MenuItem>
                                      <MenuItem value="inactive">
                                        Inactive
                                      </MenuItem>
                                    </TextField>
                                  </TableCell>

                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    <IconButton
                                      onClick={() => {
                                        history.push(
                                          `/dashboard-reseller-wise/${data?._id}/${data?.name}`
                                        );
                                      }}
                                      style={{
                                        backgroundColor: "#ebedec",
                                        color: "red",
                                        marginRight: "2px",
                                      }}
                                    >
                                      <FaEye style={{ fontSize: "12px" }} />
                                    </IconButton>
                                    <IconButton
                                      onClick={() => {
                                        history.push(
                                          `/reseller-application-pdf-view/${data?.serialId}`
                                        );
                                      }}
                                      style={{
                                        backgroundColor: "#ebedec",
                                        color: "red",
                                        marginRight: "2px",
                                      }}
                                    >
                                      <FaPrint style={{ fontSize: "12px" }} />
                                    </IconButton>
                                    {data?.status == "confirm" ? null : (
                                      <IconButton
                                        onClick={() => {
                                          history.push(
                                            `/reseller-application-update/${data?.serialId}`
                                          );
                                        }}
                                        style={{
                                          backgroundColor: "#ebedec",
                                          color: "#1976d2",
                                        }}
                                      >
                                        <FaRegEdit
                                          style={{ fontSize: "12px" }}
                                        />
                                      </IconButton>
                                    )}
                                  </TableCell>
                                </TableRow>
                              </>
                            </React.Fragment>
                          ))}
                      </TableBody>
                    </Table>
                  </ThemeProvider>
                </div>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, 100, 250, 500]}
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
      <SimpleModal
        width={900}
        isShow={isOpenModal}
        closeModalHandler={closeModalHandler}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Reseller Details
          </Typography>
          <div className="flex items-center justify-between">
            <div className="mb-5" style={{ width: "350px" }}>
              <div
                style={{
                  background: "#111930",
                  width: "250px",
                  textAlign: "center",
                  borderRadius: "10px",
                  marginBottom: "-20px",
                  marginLeft: "10px",
                }}
              >
                <h5 style={{ color: "#fff", padding: "5px" }}>
                  Personal Information
                </h5>
              </div>
              <div style={{ border: "1px solid #111930", borderRadius: "5px" }}>
                <div className="flex ml-3">
                  <div
                    style={{ width: "330px", marginTop: "20px" }}
                    className="flex items-center justify-between "
                  >
                    <div
                      style={{ width: "100px" }}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p style={{ marginBottom: "2px" }}>NAME</p>
                        <p style={{ marginBottom: "2px" }}>Phone</p>
                        <p style={{ marginBottom: "2px" }}>Whatsapp</p>
                        <p style={{ marginBottom: "2px" }}>Email</p>
                        <p style={{ marginBottom: "2px" }}>NID</p>
                      </div>
                      <div>
                        <p style={{ marginBottom: "2px" }}> :</p>
                        <p style={{ marginBottom: "2px" }}> :</p>
                        <p style={{ marginBottom: "2px" }}> :</p>
                        <p style={{ marginBottom: "2px" }}> :</p>
                        <p style={{ marginBottom: "2px" }}> :</p>
                      </div>
                    </div>
                    <div style={{ width: "300px" }}>
                      <p
                        style={{
                          marginBottom: "2px",
                          borderBottom: "1px solid #1234",
                        }}
                      >
                        i
                      </p>
                      <p
                        style={{
                          marginBottom: "2px",
                          borderBottom: "1px solid #1234",
                        }}
                      >
                        i
                      </p>
                      <p
                        style={{
                          marginBottom: "2px",
                          borderBottom: "1px solid #1234",
                        }}
                      >
                        i
                      </p>
                      <p
                        style={{
                          marginBottom: "2px",
                          borderBottom: "1px solid #1234",
                        }}
                      >
                        i
                      </p>
                      <p
                        style={{
                          marginBottom: "2px",
                          borderBottom: "1px solid #1234",
                        }}
                      >
                        TK
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-5" style={{ width: "400px" }}>
              <div
                style={{
                  background: "#111930",
                  width: "250px",
                  textAlign: "center",
                  borderRadius: "10px",
                  marginBottom: "-20px",
                  marginLeft: "10px",
                }}
              >
                <h5 style={{ color: "#fff", padding: "5px" }}>Addresses</h5>
              </div>
              <div style={{ border: "1px solid #111930", borderRadius: "5px" }}>
                <div className="flex ml-3">
                  <div
                    style={{ width: "400px", marginTop: "20px" }}
                    className="flex items-center justify-between "
                  >
                    <div
                      style={{ width: "200px" }}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p style={{ marginBottom: "2px" }}>Present Address</p>
                        <p style={{ marginBottom: "2px" }}>Permanent Address</p>
                        <p style={{ marginBottom: "2px" }}>Office Address</p>
                      </div>
                      <div>
                        <p style={{ marginBottom: "2px" }}> :</p>
                        <p style={{ marginBottom: "2px" }}> :</p>
                        <p style={{ marginBottom: "2px" }}> :</p>
                      </div>
                    </div>
                    <div style={{ width: "300px" }}>
                      <p
                        style={{
                          marginBottom: "2px",
                          borderBottom: "1px solid #1234",
                        }}
                      >
                        i
                      </p>
                      <p
                        style={{
                          marginBottom: "2px",
                          borderBottom: "1px solid #1234",
                        }}
                      >
                        i
                      </p>
                      <p
                        style={{
                          marginBottom: "2px",
                          borderBottom: "1px solid #1234",
                        }}
                      >
                        i
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              // src={reseller.nidImageUrl}
              alt="NID Document"
              style={{
                maxWidth: "100px",
                maxHeight: "100px",
                marginRight: "10px",
              }}
            />
          </Box>
        </Box>
      </SimpleModal>
    </div>
  );
}
