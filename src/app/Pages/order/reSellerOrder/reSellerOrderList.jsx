import "dotenv/config";
import React, { useEffect, useState, useMemo } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import axios from "../../../../axios";
import imageBasePath from "../../../../config";
import SimpleModal from "../../../Shared/SimpleModal/SimpleModal";
import Spinner from "../../../Shared/Spinner/Spinner";
import { notification } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import moment from "moment";
import { FaEye, FaFilePdf, FaAmazonPay, FaRegEdit } from "react-icons/fa";
import { MdLabel, MdMoreVert, MdOutlineDriveFileMove } from "react-icons/md";
import { CopyToClipboard } from "react-copy-to-clipboard";
import MySnackbarContentWrapper from "../../../Shared/alert/alert";
import { FaRegCopy, FaExclamationTriangle } from "react-icons/fa";
import { BsFiletypeXls, BsFillSendFill } from "react-icons/bs";
import { Autorenew, Print } from "@material-ui/icons";
import { utils, writeFile } from "xlsx";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import AddressUpdate from "./components/addressUpdate";
import PaymentUpdate from "./components/paymentUpdate";
import ProductDetails from "./components/productDetails";
import Logs from "./components/logs";
import AddAdminNote from "./components/addAdminNote";
import AddPathaoCourierPage from "./components/courier/redx/AddRedxCourier";
import RedxCourierTrack from "./components/courier/redx/RedxCourierTrack";
import useAuth from "../../../hooks/useAuth";
import { isMobile } from "react-device-detect";
import { useDebounce } from "../../../hooks/useDebounce";
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

let user = [];
export default function OrderList() {
  const history = useHistory();
  const today = new Date();

  const rowperPage = localStorage.getItem("rowPerPage");
  const { user } = useAuth();

  const [page, setPage] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(
    rowperPage ? Number(rowperPage) : 10
  );
  const [statusName, setStatusName] = useState("");
  const [userType, setUserType] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const searchQuery = useDebounce(searchValue, 1500);
  const [courierValue, setCourierValue] = useState("");
  const [totalData, setTotalData] = useState(0);
  const [rows, setRows] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isMoveOpenModal, setIsMoveOpenModal] = useState(false);
  const [openImgData, setOpenImgData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [courierData, setCourierData] = useState([]);
  const [paymentUpdateData, setPaymentUpdateData] = useState(null);
  const [productsData, setProductsData] = useState([]);
  const [orderNoteData, setOrderNoteData] = useState(null);
  const [orderStatusData, setOrderStatusData] = useState(null);
  const [orderAddressData, setOrderAddressData] = useState(null);
  const [allChecked, setAllChecked] = useState(false);
  const [totalChecked, setTotalChecked] = useState(0);
  const [bulkselect, setBulkSelect] = useState("");
  const [bulkActionData, setBulkActionData] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [actionValue, setActionValue] = useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [copyValue, setCopyValue] = useState("");
  const [isCopy, setIsCopy] = useState(false);
  const [startTime, setStartTime] = useState(
    new Date(today).setDate(today.getDate() - 29)
  );
  const [endTime, setEndTime] = useState(today);
  const [isReset, setIsReset] = useState(false);
  const [countByOrderStatus, setCountByOrderStatus] = useState([]);
  const [logsData, setLogsData] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);
  const [employeeName, setEmployeeName] = useState("");
  const [returnMoney, setReturnMoney] = useState(0);
  const [courierOrderData, setCourierOrderData] = useState(null);
  const [modalWidth, setModalWidth] = useState(400);
  const [courierTrackId, setCourierTackId] = useState("");
  const [selectedCourier, setSelectedCourier] = useState("");
  const [couriers, setCouriers] = useState([]);
  const [bulkCourierModal, setBulkCourierModal] = useState(false);
  const [storeList, setStoreList] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [productList, setProductList] = useState([]);
  const [inputKey, setInputKey] = useState(0);
  const [selectedReseller, setSelectedReseller] = useState({});
  const [bulkOrderIdModal, setBulkOrderIdModal] = useState(null);
  const [shippingIds, setShippingIds] = useState([]);
  const [courierId, setCourierId] = useState(""); // Separate state to hold selected courier's ID

  function useQuery() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
  }
  let query = useQuery();

  useEffect(() => {
    if (query.size > 0) {
      setStatusName(query.get("sts"));
      setUserType(query.get("by"));
      setPage(Number(query.get("pg")) - 1);
      setCourierValue(query.get("cr"));
      setEmployeeName(query.get("emp"));
    } else {
      setPage(0);
      setStatusName("PENDING");
      setUserType("ALL");
      setCourierValue("ALL");
      setEmployeeName("ALL");
    }
  }, [query]);

  useEffect(() => {
    const fetchData = async () => {
      const [courierRes, employeeRes] = await Promise.all([
        axios.get("/courier/fetch-all"),
        axios.get("/employee/fetch-all"),
      ]);
      setCourierData(courierRes?.data?.data);
      setEmployeeList(employeeRes?.data?.data);
    };
    fetchData();

    const getStores = async () => {
      try {
        let res = await axios.get(`/courier-service/pathao/get-stores`);
        if (res?.data?.success) {
          setStoreList(res?.data?.data);
        }
      } catch (error) {
        console.log("err in getDistrict");
      }
    };
    getStores();
  }, []);

  useEffect(() => {
    setIsLoading(true);

    if (
      page !== null &&
      statusName !== "" &&
      userType !== "" &&
      courierValue !== "" &&
      employeeName !== ""
    ) {
      fetchData();
    }
  }, [
    page,
    rowsPerPage,
    statusName,
    userType,
    courierValue,
    employeeName,
    employeeList,
    searchQuery,
    isReset,
    courierData,
  ]);

  const fetchData = async (reseller) => {
    try {
      let res = null;

      if (searchQuery !== "") {
        res = await axios.post(
          `/reseller-order/admin/search-order?page=${
            page + 1
          }&limit=${rowsPerPage}`,
          {
            value: searchQuery,
            resellerId: reseller?._id || selectedReseller?._id || "",
          }
        );
      } else {
        let obj = {
          resellerId: reseller?._id || selectedReseller?._id || "",
          status: statusName,
          createdBy: userType,
          courier:
            courierValue === "ALL"
              ? ""
              : courierData.find((i) => i?.name === courierValue)?._id || "",
          employee:
            employeeName === "ALL"
              ? ""
              : employeeList.find((i) => i?.name === employeeName)?._id,
          startTime: startTime ? setToMidnight(startTime).toISOString() : null,
          endTime: endTime ? setToEndOfDay(endTime).toISOString() : null,
        };

        res = await axios.post(
          `/reseller-order/admin/all-order-by-admin?page=${
            page + 1
          }&limit=${rowsPerPage}`,
          obj
        );
      }

      if (res) {
        setCountByOrderStatus(res?.data?.statusCount);
        setTotalData(res?.data?.metaData?.totalData);
        setDataList(
          res?.data?.data.map((i) => {
            let isAvoid = false;

            if (
              ["CANCELED", "DELIVERED", "RETURNED", "REFUND"].includes(
                i?.orderStatus[i?.orderStatus.length - 1]?.status
              )
            ) {
              //isAvoid value was true, It's make to false to able to check the data table.
              isAvoid = false;
            }
            return { ...i, checkStatus: false, isAvoid };
          })
        );
      }

      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err?.response?.data?.message);
    }
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

  const filterHandler = async () => {
    try {
      setSearchValue("");
      setIsLoading(true);
      let obj = {
        status: statusName,
        createdBy: userType,
        courier:
          courierValue === "ALL"
            ? ""
            : courierData.find((i) => i?.name === courierValue)?._id,
        employee:
          employeeName === "ALL"
            ? ""
            : employeeList.find((i) => i?.name === employeeName)?._id,
        startTime: startTime ? setToMidnight(startTime).toISOString() : null,
        endTime: endTime ? setToEndOfDay(endTime).toISOString() : null,
        resellerId: selectedReseller?._id || "",
      };
      let res = await axios.post(
        `/reseller-order/admin/all-order-by-admin?page=${
          page + 1
        }&limit=${rowsPerPage}`,
        obj
      );
      if (res) {
        setCountByOrderStatus(res?.data?.statusCount);

        setTotalData(res?.data?.metaData?.totalData);
        setDataList(
          res?.data?.data.map((i) => {
            let isAvoid = false;
            for (let st of i?.orderStatus) {
              if (
                ["CANCELED", "DELIVERED", "RETURNED", "REFUND"].includes(
                  st?.status
                )
              ) {
                isAvoid = true;
              }
            }
            return { ...i, checkStatus: false, isAvoid };
          })
        );
      }

      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dataList.length > 0) {
      let dataArray = [];
      let i = 0;
      for (let data of dataList) {
        if (data?.checkStatus) {
          i++;
        }

        let confirmBy = data?.orderStatus.filter(
          (f) => f?.status === "CONFIRM"
        )[0]?.changeBy;

        const STATUS = data?.orderStatus?.[data?.orderStatus.length - 1].status;
        let isOrderComplete = [
          "CANCELED",
          "DELIVERED",
          "RETURNED",
          "REFUND",
        ].includes(STATUS);

        dataArray.push({
          _id: data?._id,
          checkBox: {
            checkStatus: data?.checkStatus,
            _id: data?._id,
            isAvoid: data?.isAvoid,
          },
          serialId: {
            sId: data?.serialId,
            time: data?.createdAt,
          },
          products: data,
          customer: data?.deliveryAddress,
          customerCharge: data?.customerCharge,
          payment: data?.payment,
          prove: data?.payment,
          dedupe: data?.duplicateNumber,
          reseller: data?.resellerInfo,
          status: {
            status: data?.orderStatus,
            _id: data?._id,
            courierTrackId: data?.courierInfo?.courierTrackId,
            courierStatus: data?.courierInfo?.courierStatus,
            isOrderComplete: isOrderComplete,
          },
          courier: {
            courierData: data?.courierInfo,
            oId: data?._id,
            courierTrackId: data?.courierInfo?.courierTrackId,
            courierStatus: data?.courierInfo?.courierStatus,
            isOrderComplete: isOrderComplete,
          },
          createdBy: !["customer", "visitor"].includes(data?.createdBy)
            ? data?.createdBy
            : `${data?.createdBy}${confirmBy ? `\n(${confirmBy})` : ""}`,
          adminNote: {
            notes: data?.adminNote,
            serialId: data?.serialId,
            _id: data?._id,
          },
          action: data,
        });
      }
      let count = 0;
      dataList.forEach((d) => {
        if (!d?.isAvoid) {
          count++;
        }
      });
      if (i === count) {
        setTotalChecked(i);
        setAllChecked(true);
      } else {
        setTotalChecked(i);
        setAllChecked(false);
      }
      setRows(dataArray);
    } else {
      setRows([]);
    }
  }, [dataList]);

  const handleClick = (event, value) => {
    setActionValue(value);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (data) => {
    let isCancel = false;
    for (let st of actionValue?.orderStatus) {
      if (
        ["CANCELED", "DELIVERED", "RETURNED", "REFUND"].includes(st?.status)
      ) {
        isCancel = true;
      }
    }

    if (data?.name === "view") {
      window.open(`/reseller-order-view/${actionValue?.serialId}`, "_blank");
    } else if (data?.name === "pdf") {
      downloadInvoice(actionValue?._id);
    } else if (data?.name === "payment") {
      if (isCancel) {
        openNotificationWithIcon("Payment couldn't be update!", "error");
      } else {
        customerPaymentUpdate({
          ...actionValue?.payment,
          _id: actionValue?._id,
          serialId: actionValue?.serialId,
          customerCharge: actionValue?.customerCharge,
        });
      }
    } else if (data?.name === "address") {
      setOrderAddressData({
        address: actionValue?.deliveryAddress?.address,
        _id: actionValue?._id,
        serialId: actionValue?.serialId,
        districtId: actionValue?.deliveryAddress?.district?._id,
        areaId: actionValue?.deliveryAddress?.area?._id,
        districtName: actionValue?.deliveryAddress?.district?.name,
        areaName: actionValue?.deliveryAddress?.area?.name,
      });
      setIsOpenModal(true);
      setLogsData(null);
    } else if (data?.name === "update") {
      if (isCancel) {
        openNotificationWithIcon("This order couldn't be update!", "error");
      } else {
        history.push(
          "/update-affiliate-order/" + actionValue?.serialId + "/reseller"
        );
      }
    } else if (data?.name === "logs") {
      setLogsData({
        serialId: actionValue?.serialId,
        orderStatus: actionValue?.orderStatus,
        updateHistory: actionValue?.updateHistory,
      });
      setIsOpenModal(true);
    }

    setAnchorEl(null);
    setActionValue(null);
  };

  const downloadInvoice = async (orderId) => {
    try {
      const res = await axios.get(`/order/admin/order-invoice/${orderId}`);
      if (res?.data?.success) {
        window.open(imageBasePath + "/" + res?.data?.data, "_blank").focus();
      }
    } catch (err) {
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  const orderStatusChangeHandler = async (id, value) => {
    if (value === "CANCELED" || value === "DELIVERED" || value === "RETURNED") {
      setOrderStatusData({ status: value, id: id });
      setIsOpenModal(true);
    } else {
      updateOrderStatus(id, value);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      let obj = {
        status,
      };
      let res = await axios.patch(
        `/reseller-order/admin/update-order-status/${id}`,
        obj
      );

      if (res) {
        // setIsReset(!isReset);
        fetchData();
      }

      setIsOpenModal(false);
      setOrderStatusData(null);
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (err) {
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  const formatToBDTime = (dateString) => {
    if (!dateString) return "N/A";

    const options = {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // For 12-hour format with AM/PM
    };

    const date = new Date(dateString);
    return date.toLocaleString("en-BD", options);
  };

  const columns = [
    {
      id: "checkBox",
      label: (
        <Checkbox
          checked={allChecked}
          onChange={(e) => allCheckedHandler(e.target.checked)}
        />
      ),
      // minWidth: 10,
      format: (value) => (
        <Checkbox
          onClick={() => singleCheckHandler(value)}
          checked={value?.checkStatus}
          disabled={value?.isAvoid}
        />
      ),
    },
    {
      id: "serialId",
      label: "Order Data",
      align: "left",
      minWidth: 125,
      format: (value) => (
        <>
          <CopyToClipboard
            text={value?.sId}
            onCopy={() => {
              setCopyValue(value?.sId);
              setIsCopy(true);
            }}
          >
            <p style={{ margin: "0px" }}>
              {value?.sId}
              <span style={{ cursor: "pointer" }}>
                <FaRegCopy />
              </span>
            </p>
          </CopyToClipboard>
          <Snackbar
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            open={isCopy}
            autoHideDuration={1500}
            onClose={() => setIsCopy(false)}
          >
            <MySnackbarContentWrapper
              onClose={() => setIsCopy(false)}
              variant="success"
              message={`Copy order Id: ${copyValue}`}
            />
          </Snackbar>
          <p style={{ color: "black", margin: "0px", fontSize: "16px" }}>
            <small>{moment(value?.time).format("MMM DD hh:mm a")}</small>
          </p>
        </>
      ),
    },

    {
      id: "products",
      label: "Products",
      align: "center",
      minWidth: 100,
      format: (value) => {
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box>
              <Avatar
                src={`${imageBasePath}/${
                  value?.products[0]?.isVariant
                    ? value?.products[0]?.variation?.images?.length
                      ? value?.products[0]?.variation?.images[0]
                      : value?.products[0]?.product?.galleryImage[0]
                    : value?.products[0]?.product?.galleryImage[0] || ""
                }`}
                alt={value?.products[0]?.name}
                className="border-radius-4"
                style={{ cursor: "pointer", width: "58px" }}
                onClick={() => showProductsDetails(value)}
              />
            </Box>
            <Box>
              <p style={{ margin: "0px" }}>{` X ${value?.totalQty}`}</p>
            </Box>
          </Box>
        );
      },
    },
    {
      id: "reseller",
      label: "Affiliate",
      align: "center",
      minWidth: 120,
      format: (value) => {
        return (
          <div>
            <p style={{ margin: "0px", textAlign: "left" }}>
              {value?.reseller?.email}
            </p>
            <p style={{ margin: "0px", textAlign: "left" }}>
              Commission: {value?.grandProfit}
            </p>
          </div>
        );
      },
    },

    {
      id: "customer",
      label: "Customer",
      align: "left",
      minWidth: 120,
      format: (value) => {
        return (
          <div>
            <p style={{ margin: "0px" }}>{value?.name}</p>
            <p style={{ margin: "0px" }}>
              <strong>{value?.phone}</strong>
            </p>
          </div>
        );
      },
    },

    {
      id: "customerCharge",
      label: "Total Bill",
      align: "center",
      minWidth: 80,
      format: (value) => {
        return (
          <p style={{ margin: "0px", color: "green" }}>
            <strong>{`${value?.totalBill} ৳`}</strong>
          </p>
        );
      },
    },

    {
      id: "action",
      label: "Courier Details",
      align: "center",
      minWidth: 80,
      format: (value) => {
        // Assuming courierId is a unique identifier for each row
        const uniqueId = value?._id;
        return (
          value?.courierInfo?.liveCourier != "" && (
            <>
              {/* Button to trigger modal */}
              <Button
                size="small"
                variant="contained"
                color={`${
                  value?.courierInfo?.liveCourier === "steadfast"
                    ? "primary"
                    : value?.courierInfo?.liveCourier === "pathao"
                    ? "success"
                    : ""
                }`}
                onClick={() => setBulkOrderIdModal(uniqueId)} // Show modal for specific row
              >
                {`${value?.courierInfo?.liveCourier}`} {/* Button label */}
              </Button>

              {/* Conditionally render modal only for the clicked row */}
              <SimpleModal
                width={650}
                isShow={bulkOrderIdModal === uniqueId} // Only show if modal state matches uniqueId
                closeModalHandler={() => setBulkOrderIdModal(null)} // Close modal
              >
                {/* Modal content */}
                <p className="mb-2">
                  Consignment ID:{" "}
                  <strong style={{ color: "yellow" }}>
                    {value?.courierInfo?.consignmentId}
                  </strong>
                </p>
                <p className="mb-2">
                  Status:{" "}
                  <strong>
                    {value?.orderStatus[value?.orderStatus?.length - 1]?.status}
                  </strong>
                </p>
                <p className="mb-2" style={{ fontSize: "17px" }}>
                  Customer Information
                </p>
                <div
                  className="mb-2"
                  style={{
                    border: "1px solid blue",
                    borderRadius: "6px",
                    padding: "5px",
                    marginBottom: "10px",
                  }}
                >
                  <TableContainer
                    component={Paper}
                    sx={{ border: 2, borderColor: "primary.main" }}
                  >
                    <Table sx={{ minWidth: 750 }} aria-label="simple table">
                      <TableBody>
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            Track Id:
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {value?.courierInfo?.courierTrackId}
                          </TableCell>
                        </TableRow>
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            Name:
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {capitalizeFirstLetter(
                              value?.deliveryAddress?.name
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            Phone:
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {value?.deliveryAddress?.phone}
                          </TableCell>
                        </TableRow>
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            Address:
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {capitalizeFirstLetter(value?.deliveryAddress?.address.length > 40
                              ? `${value?.deliveryAddress?.address?.slice(
                                  0,
                                  40
                                )}...`
                              : value?.deliveryAddress?.address)}
                          </TableCell>
                        </TableRow>
                        {/* <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            Weight
                          </TableCell>
                          <TableCell component="th" scope="row">
                            col 2
                          </TableCell>
                        </TableRow> */}
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            Collection:
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {value?.customerCharge?.remainingTkPay} TK
                          </TableCell>
                        </TableRow>
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            Created Time:
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {formatToBDTime(value?.createdAt)}
                          </TableCell>
                        </TableRow>
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            Created By:
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {capitalizeFirstLetter(value?.createdBy)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
                <div style={{ paddingBottom: "20px" }}>
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell align="center">Time</TableCell>
                          <TableCell align="center">Log</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell align="center">
                            {formatToBDTime(value?.createdAt)}
                          </TableCell>
                          <TableCell align="center">
                            Courier Order Created by{" "}
                            {capitalizeFirstLetter(value?.createdBy)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </SimpleModal>
            </>
          )
        );
      },
    },

    {
      id: "status",
      label: "Status",
      align: "center",
      minWidth: 100,
      format: (value) => {
        if (value?.courierTrackId && !value?.isOrderComplete) {
          return (
            <small className="rounded bg-light-gray elevation-z3 px-2 py-2 text-primary text-12 ">
              {value?.courierStatus}
            </small>
          );
        }

        const STATUS = value?.status[value?.status.length - 1].status;

        if (STATUS === "CANCELED") {
          return (
            <small className="rounded bg-error elevation-z3 text-white px-2 py-2px">
              cancelled
            </small>
          );
        } else if (STATUS === "DELIVERED") {
          return (
            <small className="rounded bg-green elevation-z3 text-white px-2 py-2px">
              delivered
            </small>
          );
        } else if (STATUS === "RETURNED") {
          let hasRefund = false;
          for (let st of value?.status) {
            if (st?.status === "REFUND") {
              hasRefund = true;
            }
          }

          return (
            <>
              <small className="rounded bg-light-error elevation-z3 text-black px-2 py-2px">
                returned
              </small>
              {hasRefund && (
                <>
                  <br />
                  <small className="rounded bg-secondary elevation-z3 text-black px-2 py-2px">
                    refund
                  </small>
                </>
              )}
            </>
          );
        } else if (STATUS === "REFUND") {
          let hasReturn = false;
          for (let st of value?.status) {
            if (st?.status === "RETURNED") {
              hasReturn = true;
            }
          }
          return (
            <>
              <small className="rounded bg-secondary elevation-z3 text-black px-2 py-2px">
                refund
              </small>
              {hasReturn && (
                <>
                  <br />
                  <small className="rounded bg-light-error elevation-z3 text-black px-2 py-2px">
                    returned
                  </small>
                </>
              )}
            </>
          );
        } else {
          return (
            <TextField
              name=""
              label=""
              variant="outlined"
              size="small"
              fullWidth
              select
              disabled={
                user?.role == "admin"
                  ? false
                  : user?.role == "employee" && user?.orderStatusUpdate
                  ? false
                  : true
              }
              value={value?.status[value?.status.length - 1].status}
              onChange={(e) =>
                orderStatusChangeHandler(value?._id, e.target.value)
              }
            >
              <MenuItem value="PENDING"> Processing </MenuItem>
              <MenuItem value="HOLD"> Hold </MenuItem>
              <MenuItem value="INVOICED"> Invoiced </MenuItem>
              <MenuItem value="CONFIRM"> Ready to Ship </MenuItem>
              <MenuItem value="SHIPPED"> Shipping </MenuItem>
              <MenuItem value="DELIVERED"> Delivered</MenuItem>
              <MenuItem value="CANCELED"> Cancelled </MenuItem>
            </TextField>
          );
        }
      },
    },

    {
      id: "action",
      label: "Action",
      align: "center",
      minWidth: 140,
      format: (value) => {
        return (
          <div>
            <IconButton
              onClick={(e) => handleClick(e, value)}
              style={{
                backgroundColor: "#ebedec",
                color: "black",
                fontWeight: "bold",
                marginRight: "8px",
              }}
            >
              <MdMoreVert style={{ fontSize: "16px" }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              PaperProps={{
                style: {
                  width: "20ch",
                },
              }}
            >
              <MenuItem onClick={() => handleClose({ name: "view" })}>
                <ListItemIcon>
                  <FaEye style={{ fontSize: "16px", color: "#1976d2" }} />
                </ListItemIcon>
                <ListItemText>View</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleClose({ name: "update" })}>
                <ListItemIcon>
                  <FaRegEdit style={{ fontSize: "16px", color: "#1976d2" }} />
                </ListItemIcon>
                <ListItemText>update</ListItemText>
              </MenuItem>
            </Menu>
          </div>
        );
      },
    },
  ];

  const singleCheckHandler = (data) => {
    setDataList(
      dataList.map((i) => {
        return i?._id === data?._id
          ? {
              ...i,
              checkStatus: !data?.checkStatus,
            }
          : i;
      })
    );
  };

  const allCheckedHandler = (checkStatus) => {
    setAllChecked(checkStatus);
    setDataList(
      dataList.map((i) => {
        return i?.isAvoid
          ? {
              ...i,
              checkStatus: false,
            }
          : {
              ...i,
              checkStatus: checkStatus,
            };
      })
    );
  };

  const bulkActionHandler = async () => {
    try {
      setBulkLoading(true);
      let orders = dataList
        .filter((data) => data?.checkStatus)
        .map((data) => data._id);
      let createRes = await axios.patch(
        `/reseller-order/admin/update-multiple-order-status`,
        {
          orders: orders,
          status: "INVOICED",
        }
      );

      if (createRes?.data?.success) {
        openNotificationWithIcon(createRes?.data?.message, "success");
        setPage(0);
        setStatusName(bulkselect);
      }

      closeModalHandler();
      setBulkLoading(false);
    } catch (error) {
      console.log("error");
      openNotificationWithIcon(error?.response?.data?.message, "error");
      setBulkLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    localStorage.setItem("rowPerPage", +event.target.value);
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const closeModalHandler = () => {
    setIsMoveOpenModal(false);
    setIsOpenModal(false);
    setOpenImgData(null);
    setPaymentUpdateData(null);
    setProductsData([]);
    setOrderNoteData(null);
    setOrderAddressData(null);
    setBulkActionData(null);
    setBulkSelect("");
    setLogsData(null);
    setModalWidth(400);
    setCourierOrderData(null);
    setCourierTackId("");
  };

  const customerPaymentUpdate = (data) => {
    setPaymentUpdateData(data);
    setIsOpenModal(true);
  };

  const showProductsDetails = (data) => {
    setProductsData(data);
    setIsOpenModal(true);
  };

  const gotoMultipleOderHandler = () => {
    if (statusName !== "INVOICED") {
      bulkActionHandler();
    }
    let selectedOrderData = dataList.filter((data) => data?.checkStatus);
    let orderIds = selectedOrderData.map((i) => i?.serialId);

    // Open the URL in a new tab
    let url = `/reseller-multiple-order-view?ids=${orderIds.join(",")}`;
    window.open(url, "_blank", "noopener,noreferrer");
    window.location.reload();
  };

  const downloadCSVHandler = () => {
    let makeCsvArray = [];
    dataList
      .filter((data) => data?.checkStatus)
      .forEach((item) => {
        let obj = {
          Create: moment(item?.createdAt).format("lll"),
          Serial_Id: item?.serialId,
          Products_SKU: item?.products.map((prod) => prod?.sku).join(", "),
          Status: item?.orderStatus[item?.orderStatus.length - 1].status,
          Name: item?.deliveryAddress?.name,
          Phone: item?.deliveryAddress?.phone,
          Address: item?.deliveryAddress?.address,
          city: item?.deliveryAddress?.city?.city_name,
          zone: item?.deliveryAddress?.zone?.zone_name,
          TotalBill: item?.customerCharge?.totalBill,
          Paid: item?.customerCharge?.totalPayTk,
          Due: item?.customerCharge?.remainingTkPay,
          Courier: item?.courierData?.name,
          Created_By: item?.createdBy,
        };
        makeCsvArray.push(obj);
      });

    const ws = utils.json_to_sheet(makeCsvArray);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    writeFile(
      wb,
      `${moment().format("L").replace(/\//g, "-")}-Reseller-orders-list.xlsx`
    );
  };

  const sentToCourier = async () => {
    const checkedIds = dataList
      .filter((item) => item.checkStatus === true)
      .map((item) => item._id);

    const obj = {
      orderType: "reseller",
      store_id: selectedStore,
      orderIds: checkedIds,
    };

    try {
      let res = await axios.post(
        `/courier-service/pathao/create-bulk-parcel`,
        obj
      );
      if (res) {
        openNotificationWithIcon(res?.data?.message, "success");
        window.location.reload();
        setBulkCourierModal(false);
      }
    } catch (error) {}
  };

  const searchProductHandler = async (value) => {
    if (value?.length > 0) {
      let res = await axios.post(`/reseller/list?page=1&limit=10`, {
        value: value,
        status: "all",
      });
      if (res) {
        setProductList(res?.data?.data);
        user = res?.data?.data;
        setInputKey((prevKey) => prevKey + 1);
      }
    } else {
      setProductList([]);
      setInputKey((prevKey) => prevKey + 1);
    }
  };

  const selectedResellerF = async (value) => {
    setSelectedReseller(value);
    fetchData(value);
    setProductList([]);
  };

  // Define state to hold the IDs of the filtered data
  const handleMoveShipping = async () => {
    setIsMoveOpenModal(false);
    // Filter the dataList and extract only the IDs where checkStatus is
    const filteredIds = dataList
      .filter((data) => data?.checkStatus) // Filter by checkStatus
      .map((data) => data?._id); // Extract only the '_id'

    setShippingIds(filteredIds); // Store filtered ids in state (optional)

    try {
      // Make a PUT request with the filtered IDs in the request body
      const response = await axios.put(
        `/reseller-order/admin/order-status-update-shipping`,
        { courierId, orders: filteredIds } // Sending orders array with IDs
      );

      // Check the response and handle success or error
      if (response?.data?.success) {
        // Show a success message using your notification function
        openNotificationWithIcon(response?.data?.message, "success");
        fetchData();
        // Close the modal after successful operation
        setIsOpenModal(false);
      } else {
        // Optionally handle the case where success is false
        openNotificationWithIcon("Failed to move orders to SHIPPED.", "error");
      }

      console.log("Response from server:", response?.data);
    } catch (error) {
      // Handle errors (for example, show an error message)
      console.error("Error updating orders:", error);
      openNotificationWithIcon(
        "An error occurred while updating orders.",
        "error"
      );
    }
  };

  // useEffect to fetch courier data from the API
  const [loading, setLoading] = useState(true);
  // Helper function to capitalize the first letter
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Fetch couriers from API on component mount
  useEffect(() => {
    const fetchCouriers = async () => {
      try {
        const response = await axios.get("/courier/fetch-all");
        const courierData = response?.data?.data || [];
        setCouriers(courierData);
        if (courierData?.length > 0) {
          setSelectedCourier(courierData[1]?.name);
          setCourierId(courierData[1]?._id);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching couriers:", error);
        setLoading(false);
      }
    };
    fetchCouriers();
  }, []);

  return (
    <div className="m-sm-30">
      <Box>
        <Card className="mb-2">
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
                  // flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Box sx={{ mr: 1 }}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      className="min-w-18"
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
                      className="min-w-18"
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
                <Box sx={{ my: 1, display: isMobile ? "flex" : "" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    className="mr-2 text-white"
                    size="small"
                    onClick={filterHandler}
                  >
                    Filter
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      setIsReset(!isReset);
                      setStartTime(null);
                      setEndTime(null);
                      setSearchValue("");
                    }}
                    className="text-white bg-error"
                    // startIcon={<Autorenew />}
                  >
                    Reset
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Card>
      </Box>
      <Grid container spacing={3} className="mb-2">
        {[
          "ALL",
          "PENDING",
          "HOLD",
          "INVOICED",
          "CONFIRM",
          "SHIPPED",
          "DELIVERED",
          "RETURNED",
          "CANCELED",
        ].map((data, idx) => (
          <Grid key={idx} item xs={12} sm={6} md={4} lg={3} xl={1}>
            <Card
              elevation={3}
              className={`py-4 cursor-pointer ${
                data === statusName && "bg-light-green"
              }`}
              onClick={() => {
                setPage(0);
                setSearchValue("");
                setStatusName(data);
              }}
            >
              <h5 className="mb-2 text-20 text-center text-green">
                {(data === "ALL"
                  ? countByOrderStatus.reduce(
                      (total, obj) => obj?.count + total,
                      0
                    )
                  : countByOrderStatus.find((f) => f?._id === data)?.count) ||
                  0}
              </h5>
              <h5 className="text-center text-12">
                {data === "PENDING"
                  ? "PROCESSING"
                  : data === "CONFIRM"
                  ? "READY TO SHIP"
                  : data === "SHIPPED"
                  ? "SHIPPING"
                  : data}
              </h5>
            </Card>
          </Grid>
        ))}
      </Grid>

      <div className="flex items-center py-3">
        <div style={{ position: "relative", minWidth: "320px" }}>
          <TextField
            onChange={(e) => {
              searchProductHandler(e.target.value);
            }}
            fullWidth
            label="Search Reseller..."
            variant="outlined"
          />
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              maxHeight: "300px",
              position: "absolute",
              zIndex: 9999,
              overflowY: "scroll",
            }}
          >
            <div style={{ background: "#fff" }}>
              {productList.map((item, index) => (
                <div
                  key={item._id}
                  onClick={() => selectedResellerF(item)}
                  style={{
                    background: "#ffff",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    borderRadius: "8px",
                    margin: "8px",
                    padding: "12px",
                    cursor: "pointer",
                  }}
                  className="text-green flex items-center p-2 border"
                >
                  <Avatar
                    variant="square"
                    loading="lazy"
                    width="20"
                    src={imageBasePath + "/" + item.image}
                    alt=""
                    className="mr-2"
                  />
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>
        {Object.keys(selectedReseller)?.length ? (
          <div>
            <h5 className="ml-3">
              Selected Affiliate : {selectedReseller?.name}
            </h5>
          </div>
        ) : null}
      </div>
      <Card className="border-radius-0 ">
        <CardHeader title="Reseller Order List" />
        <div className="w-full overflow-hidden px-2 mt-4">
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
              >
                <Typography
                  paragraph
                  className="ml-4 mt-2 min-w-188"
                  style={{ color: "green", fontWeight: "bold" }}
                >
                  {`${totalChecked} product select from this page`}
                </Typography>
              </Box>

              <Box>
                {statusName === "CONFIRM" && (
                  <Button
                    color="primary"
                    className="text-white mr-3"
                    variant="contained"
                    startIcon={<MdOutlineDriveFileMove />}
                    onClick={() => setIsMoveOpenModal(true)}
                  >
                    Move Shipping
                  </Button>
                )}
                <SimpleModal
                  isShow={isMoveOpenModal}
                  closeModalHandler={closeModalHandler}
                >
                  {isMoveOpenModal ? (
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
                          Are you sure move this order
                          {totalChecked > 1 ? "s" : ""} to shipping?
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mt: 1,
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="primary"
                          className="mr-4"
                          onClick={handleMoveShipping}
                        >
                          Yes
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => setIsMoveOpenModal(false)}
                        >
                          No
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    ""
                  )}
                </SimpleModal>
                <Button
                  color="primary"
                  className="text-white mr-3"
                  variant="contained"
                  startIcon={<BsFiletypeXls />}
                  onClick={downloadCSVHandler}
                >
                  Excel
                </Button>
                {statusName == "PENDING" ||
                statusName == "CONFIRM" ||
                statusName == "INVOICED" ? (
                  <Button
                    color="secondary"
                    className="text-white"
                    variant="contained"
                    startIcon={<Print />}
                    onClick={gotoMultipleOderHandler}
                  >
                    {statusName == "INVOICED" ? "Re-Print" : "Print All"}
                  </Button>
                ) : null}
              </Box>
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
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: isMobile ? "wrap" : "",
                }}
              >
                <div
                  container
                  spacing={3}
                  className="mb-2 flex items-center flex-wrap"
                >
                  {[
                    "ALL",
                    "PENDING",
                    "HOLD",
                    "INVOICED",
                    "CONFIRM",
                    "SHIPPED",
                    "DELIVERED",
                    "RETURNED",
                    "CANCELED",
                  ].map((data, idx) => (
                    <div key={idx} item md={2} sm={3} xs={3}>
                      <div
                        elevation={3}
                        className={`py-1 ${data === statusName}`}
                        onClick={() => {
                          setPage(0);
                          setSearchValue("");
                          setStatusName(data);
                        }}
                      >
                        <Button
                          style={{
                            border: "1px solid #1234",
                            background: data === statusName ? "#007BFF" : "",
                            color: data === statusName ? "#fff" : "",
                          }}
                          className="text-center text-12  mr-2 "
                        >
                          {data === "PENDING"
                            ? "PROCESSING"
                            : data === "CONFIRM"
                            ? "READY TO SHIP"
                            : data === "SHIPPED"
                            ? "SHIPPING"
                            : data}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Typography
                  paragraph
                  className="ml-4 min-w-188"
                  style={{ color: "green", fontWeight: "bold" }}
                >{`Total Orders: ${totalData || 0}`}</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex", // Flexbox layout
                  flexDirection: { xs: "column", sm: "row" }, 
                  gap: 5, // Add space between elements (responsive)
                  width: "70%", // Full width of container
                }}
              >
                {/* Conditionally render the courier select dropdown */}
                {statusName === "CONFIRM" && (
                  <div style={{ marginRight: "10px", width: "70%" }}>
                    <TextField
                      label="Filter by Courier"
                      size="small"
                      variant="outlined"
                      fullWidth
                      select
                      sx={{ minWidth: { xs: "100%", sm: "200px" } }} // Responsive min-width (full on small screens, 200px on larger)
                      onChange={(e) => {
                        setSelectedCourier(e.target.value); // Update courierId state with the selected courier _id
                      }}
                      value={selectedCourier || couriers[1]?.name || ""} // Bind the value to the selectedCourier state or default to couriers[0]?.name
                      disabled={loading || couriers?.length === 0} // Disable if still loading or no couriers
                    >
                      {loading ? (
                        <MenuItem disabled>Loading...</MenuItem>
                      ) : (
                        couriers?.map((courier) => (
                          <MenuItem
                            key={courier._id}
                            onClick={() => setCourierId(courier._id)}
                            value={courier.name}
                          >
                            {courier?.status &&
                              capitalizeFirstLetter(courier?.name)}{" "}
                          </MenuItem>
                        ))
                      )}
                    </TextField>
                  </div>
                )}

                {/* Search input */}

                <TextField
                  label=""
                  placeholder="Search here.."
                  size="small"
                  variant="outlined"
                  fullWidth
                  onChange={(e) => {
                    setPage(0);
                    setStatusName("ALL");
                    setUserType("ALL");
                    setCourierValue("ALL");
                    setEmployeeName("ALL");
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
      <Card className="border-radius-0">
        {!isLoading ? (
          <div className="w-full overflow-hidden px-2">
            {rows.length > 0 && errorMsg === "" ? (
              <>
                <div
                  style={{
                    // maxHeight: 800,9
                    overflow: "auto",
                  }}
                >
                  <ThemeProvider theme={theme}>
                    <Table stickyHeader className="whitespace-pre">
                      <TableHead>
                        <TableRow>
                          {columns.map((column, idx) => (
                            <TableCell
                              key={idx}
                              align={column.align}
                              style={{ minWidth: column.minWidth }}
                            >
                              {column.label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row, idx1) => {
                          return (
                            <TableRow
                              hover
                              role="checkbox"
                              tabIndex={-1}
                              key={idx1}
                              style={{
                                background: idx1 % 2 == 0 ? "white" : "#FAFAFA",
                              }}
                            >
                              {columns.map((column, idx2) => {
                                const value = row[column.id];
                                return (
                                  <TableCell key={idx2} align={column.align}>
                                    {column.format
                                      ? column.format(value, row?.name)
                                      : value}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })}
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
        isShow={isOpenModal}
        closeModalHandler={closeModalHandler}
        width={modalWidth}
      >
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

        {bulkselect && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {!bulkLoading ? (
              <>
                <Box>
                  <p>
                    <strong>{totalChecked} </strong>products are selected.
                  </p>
                  <p>
                    Are you sure ?{" "}
                    <strong>
                      {bulkselect == "PENDING"
                        ? "PROCESSING"
                        : bulkselect == "CONFIRM"
                        ? "INVOICED"
                        : "" + " "}{" "}
                    </strong>
                    selected products?
                  </p>
                </Box>

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    className="mr-4"
                    onClick={bulkActionHandler}
                  >
                    Yes
                  </Button>
                  <Button variant="outlined" onClick={closeModalHandler}>
                    No
                  </Button>
                </Box>
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
          </Box>
        )}

        {orderStatusData && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <Box>
              {orderStatusData?.status === "CANCELED" && (
                <Typography paragraph className="text-16 text-error">
                  Do you want to cancel the order?
                </Typography>
              )}
              {orderStatusData?.status === "DELIVERED" && (
                <Typography paragraph className="text-16 text-green">
                  Are you delivered the order?
                </Typography>
              )}
              {orderStatusData?.status === "RETURNED" && (
                <Typography paragraph className="text-16 text-green">
                  Are you sure to return all the products in stock?
                </Typography>
              )}
            </Box>
            {orderStatusData?.status === "RETURNED" && (
              <Box>
                <h6 variant="h6" className="mb-2">
                  Return Cost
                </h6>
                <Grid container spacing={2} className="border mb-8">
                  <Grid item xs={8}>
                    <TextField
                      type="number"
                      onKeyPress={(event) => {
                        if (event?.key === "-" || event?.key === "+") {
                          event.preventDefault();
                        }
                      }}
                      label=""
                      placeholder="enter refund amount"
                      name="name"
                      size="small"
                      variant="outlined"
                      fullWidth
                      value={returnMoney}
                      onChange={(e) => setReturnMoney(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                variant="outlined"
                color="primary"
                className="mr-4"
                onClick={() => {
                  setIsOpenModal(false);
                  setOrderStatusData(null);
                  updateOrderStatus(
                    orderStatusData?.id,
                    orderStatusData?.status
                  );
                }}
              >
                Yes
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsOpenModal(false);
                  setOrderStatusData(null);
                }}
              >
                No
              </Button>
            </Box>
          </Box>
        )}

        {productsData?.products?.length > 0 ||
        productsData?.combos?.length > 0 ? (
          <ProductDetails
            productsData={productsData}
            closeModalHandler={closeModalHandler}
          />
        ) : null}

        {orderNoteData && (
          <AddAdminNote
            orderNoteData={orderNoteData}
            closeModalHandler={closeModalHandler}
            dataList={dataList}
            setDataList={setDataList}
          />
        )}

        {logsData && <Logs logsData={logsData} />}

        {paymentUpdateData && (
          <PaymentUpdate
            paymentUpdateData={paymentUpdateData}
            closeModalHandler={closeModalHandler}
            dataList={dataList}
            setDataList={setDataList}
          />
        )}

        {orderAddressData && (
          <AddressUpdate
            orderAddressData={orderAddressData}
            closeModalHandler={closeModalHandler}
            dataList={dataList}
            setDataList={setDataList}
          />
        )}

        {selectedCourier == "pathao" ? (
          <AddPathaoCourierPage
            courierData={courierData}
            courierOrderData={courierOrderData}
            closeModalHandler={closeModalHandler}
            dataList={dataList}
            setDataList={setDataList}
            courierTrackId={courierTrackId}
          />
        ) : null}

        {courierTrackId?.name === "pathao" && (
          <RedxCourierTrack
            courierTrackId={courierTrackId}
            closeModalHandler={closeModalHandler}
            dataList={dataList}
            setDataList={setDataList}
          />
        )}

        {/* {courierOrderData &&
          process.env.REACT_APP_STEADFAST_MONGO_ID ===
            courierOrderData?.selectedCourierId && (
            <AddSteadfastPage
              courierData={courierData}
              courierOrderData={courierOrderData}
              closeModalHandler={closeModalHandler}
              dataList={dataList}
              setDataList={setDataList}
            />
          )}

        {courierTrackId?.name === "steadfast" && (
          <SteadfastTrack
            courierTrackId={courierTrackId?.courierTrackId}
            closeModalHandler={closeModalHandler}
            dataList={dataList}
            setDataList={setDataList}
          />
        )} */}
      </SimpleModal>

      <SimpleModal
        isShow={bulkCourierModal}
        closeModalHandler={() => setBulkCourierModal(false)}
        width={modalWidth}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <h5 className="text-center">Send To Pathao Courier</h5>
          <Box>
            <h6 variant="h6" className="mb-5">
              SELECT STORE
            </h6>
            <Grid container spacing={2} className="border mb-8">
              <TextField
                label="Stores"
                placeholder=""
                name=""
                size="small"
                variant="outlined"
                fullWidth
                select
                onChange={(e) => setSelectedStore(e.target.value)}
                value={selectedStore}
              >
                <MenuItem value="">--select--</MenuItem>
                {storeList.map((val, index) => (
                  <MenuItem key={index} value={val?.store_id}>
                    {val?.store_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button
              onClick={() => {
                sentToCourier();
              }}
              variant="outlined"
              color="primary"
              className="mr-4"
            >
              Submit
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setBulkCourierModal(false);
              }}
            >
              No
            </Button>
          </Box>
        </Box>
      </SimpleModal>
    </div>
  );
}
