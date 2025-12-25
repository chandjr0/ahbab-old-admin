import React, { useEffect, useState } from "react";
import {
  Table,
  Image,
  Select,
  Dropdown,
  Pagination,
  ConfigProvider,
  notification,
} from "antd";
import { MoreOutlined, CopyOutlined } from "@ant-design/icons";
import { formatDate } from "./utitls";
import SimpleModal from "../../Shared/SimpleModal/SimpleModal";
import axios from "../../../axios";
import IncompleteForm from "./IncompleteForm";
import {
  Avatar,
  Box,
  Button,
  CardHeader,
  Grid,
  TablePagination,
  Typography,
  makeStyles,
  TextField,
  Card,
} from "@material-ui/core";
import imageBasePath from "../../../config";
import Spinner from "../../Shared/Spinner/Spinner";
import { set } from "lodash";
import { BsFiletypeXls } from "react-icons/bs";
import { utils, writeFile } from "xlsx";
import moment from "moment";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import { useDebounce } from "../../hooks/useDebounce";

const useStyles = makeStyles((theme) => ({
  toggleContainer: {
    margin: theme.spacing(1),
  },
  toggleButton: {
    margin: theme.spacing(0.5),
    padding: theme.spacing(1, 3),
    borderRadius: "4px",
    fontWeight: "bold",
    "&.Mui-selected": {
      color: "white",
    },
  },
  pendingButton: {
    backgroundColor: "#f0f7ff",
    "&.Mui-selected": {
      backgroundColor: "#1976d2",
    },
    "&:hover": {
      backgroundColor: "#bbdefb",
    },
  },
  canceledButton: {
    backgroundColor: "#fff1f0",
    "&.Mui-selected": {
      backgroundColor: "#d32f2f",
    },
    "&:hover": {
      backgroundColor: "#ffcdd2",
    },
  },
}));

export default function IncompleteOrder() {
  const classes = useStyles();
  const today = new Date();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [totalChecked, setTotalChecked] = useState(0);
  const [inCompleteData, setInCompleteData] = useState([]);
  const [page, setPage] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [allDistrictList, setAllDistrictList] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [zonesList, setZonesList] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [details, setDetails] = useState("");
  const [value, setValue] = useState("");
  const [orderId, setOrderId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [startTime, setStartTime] = useState(today);
  const [endTime, setEndTime] = useState(today);
  const [isReset, setIsReset] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchQuery = useDebounce(searchValue, 1500);
  const [selectedDistrictData, setSelectedDistrictData] = useState(null);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const handleStatusChange = (value, record) => {
    setPhone(record?.deliveryAddress?.phone);
    setValue(value);
    setOrderId(record?._id);
    if (value === "CONFIRM") {
      setIsConfirmModalOpen(true);
    } else {
      setIsCancelModalOpen(true);
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

  const fetchData = async (page, rowsPerPage, status) => {
    setIsLoading(true);
    try {
      let url = `/admin-order/all-incomplete-order-by-admin?page=${
        page !== null ? page + 1 : 1
      }&limit=${rowsPerPage}&status=${status}`;

      // Add date filters if not reset
      if (!isReset) {
        if (startTime && endTime) {
          // Format dates as YYYY-MM-DD
          const formattedStartDate = moment(startTime).format('YYYY-MM-DD');
          const formattedEndDate = moment(endTime).format('YYYY-MM-DD');
          url += `&startTime=${formattedStartDate}&endTime=${formattedEndDate}`;
        }
      }

      const response = await axios.get(url);
      setIsLoading(false);
      setInCompleteData(response?.data);
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching incomplete orders:", error);
      openNotificationWithIcon("Error fetching orders", "error");
    }
  };

  // Search function
  const searchData = async () => {
    if (!searchQuery) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post("/admin-order/search-incomplete-order", {
        value: searchQuery
      });
      setIsLoading(false);
      setInCompleteData(response?.data);
    } catch (error) {
      setIsLoading(false);
      console.error("Error searching incomplete orders:", error);
      openNotificationWithIcon("Error searching orders", "error");
    }
  };

  useEffect(() => {
    if (searchQuery) {
      searchData();
    } else {
      fetchData(page, rowsPerPage, filterStatus);
    }
  }, [page, rowsPerPage, filterStatus, searchQuery]);

  useEffect(() => {
    const getDistricts = async () => {
      try {
        let res = await axios.get(`/courier-service/pathao/get-areas`);
        if (res?.data) {
          setAllDistrictList(res?.data?.data);
        }
      } catch (err) {
        console.error("Error fetching districts:", err);
      }
    };
    getDistricts();
  }, []);

  const fetchZones = async (cityId) => {
    if (!cityId) return;
    try {
      const response = await axios.get(`/courier-service/pathao/get-zones/${cityId}`);
      if (response?.data?.data) {
        setZonesList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching zones:", error);
      openNotificationWithIcon("Error fetching zones", "error");
    }
  };

  // Update effect to use city_id
  useEffect(() => {
    if (selectedDistrictData?.city_id) {
      fetchZones(selectedDistrictData.city_id);
    } else {
      setZonesList([]);
      setSelectedZone("");
    }
  }, [selectedDistrictData]);

  console.log("selectedDistrict",selectedDistrict)

  const { data, metaData } = inCompleteData;

  const columns = [
    {
      title: "Order Id & Date",
      dataIndex: "serialId",
      key: "serialId",
      render: (text, record) => (
        <div>
          <div className="flex items-center">
            <span className="font-medium">{record?.sequenceNumber}</span>
          </div>
          <div className="text-gray-500 text-sm">
            {formatDate(record.createdAt)}
          </div>
        </div>
      ),
    },
    {
      title: "Products",
      dataIndex: "products",
      key: "products",
      render: (products) => {
        return (
          <div className="flex items-center">
            {products.map((product) => (
              <div key={product._id} className="flex items-center">
                <Box>
                  <Avatar
                    src={`${imageBasePath}/${
                      product?.isVariant
                        ? product?.variation?.images?.length
                          ? product?.variation?.images[0]
                          : product?.product?.galleryImage[0]
                        : product?.product?.galleryImage[0] || ""
                    }`}
                    alt={product?.name}
                    className="border-radius-4"
                    style={{ cursor: "pointer", width: "58px" }}
                  />
                </Box>
                <span className="ml-2">X {product.quantity}</span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: "Customer",
      dataIndex: "deliveryAddress",
      key: "customer",
      render: (deliveryAddress) => (
        <div>
          <div className="font-medium">{deliveryAddress.name}</div>
          <div className="text-gray-500">{deliveryAddress.phone} (0)</div>
        </div>
      ),
    },
    {
      title: "Total Bill",
      dataIndex: ["customerCharge", "totalBill"],
      key: "totalBill",
      render: (totalBill) => (
        <div>
          <div className="font-medium text-green-600">{totalBill} ৳</div>
          <div className="text-xs text-gray-500">Web Order</div>
        </div>
      ),
    },
    {
        title: "Status",
        key: "status",
        render: (_, record) => {
          return filterStatus === "PENDING" ? (
            <Select
              defaultValue={record.orderStatus[0]?.status || "CONFIRM"}
              style={{ width: 180 }}
              onChange={(value) => {
                handleStatusChange(value, record);
              }}
              options={[
                { value: "CONFIRM", label: "Confirm" },
                { value: "CANCELED", label: "Cancelled" },
              ]}
            />
          ) : (
            <Typography color="error">Cancel</Typography>
          );
        },
      }
      
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    console.log("event.target.value", event.target.value);

    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const updateOrder = async (formData) => {
    setIsLoading(true);
    try {
      const response = await axios.put(
        "/admin-order/incomplete-order-update",
        {
          ...formData,
          zoneId: formData.zoneId // Add zoneId to the request
        }
      );
      fetchData(page, rowsPerPage, filterStatus);
      setIsLoading(false);
      openNotificationWithIcon("Order updated successfully", "success");
      setIsConfirmModalOpen(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error updating order:", error);
      openNotificationWithIcon("Error updating order", "error");
    }
  };

  const updateCancelOrder = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put("/admin-order/incomplete-order-update", {
        status: value,
        orderId: orderId,
      });
      fetchData(page, rowsPerPage, filterStatus);
      setIsLoading(false);
      openNotificationWithIcon("Order Cancelled successfully", "success");
      setIsCancelModalOpen(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error canceling order:", error);
      openNotificationWithIcon("Error canceling order", "error");
    }
  };

  // Add rowSelection to the Table
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      // Handles select all checkboxes
      setSelectedRowKeys(selected ? data.map((row) => row._id) : []);
    },
  };

  const downloadCSVHandler = () => {
    let makeCsvArray = [];

    // Use the data from inCompleteData and filter based on selectedRowKeys
    (data || [])
      .filter((item) => selectedRowKeys.includes(item._id))
      .forEach((item) => {
        let rawAddress = item?.deliveryAddress?.address || "";
        let address = rawAddress.split("\t").pop().trim(); // Extract last part after \t

        let obj = {
          Create: moment(item?.createdAt).format("lll"),
          Serial_Id: item?.serialId || item?.sequenceNumber,
          Products: item?.products?.length,
          Status:
            item?.orderStatus[item?.orderStatus.length - 1]?.status || "N/A",
          Name: item?.deliveryAddress?.name,
          Phone: item?.deliveryAddress?.phone,
          Address: address, // Use cleaned address here
          City: item?.deliveryAddress?.city?.city_name || "N/A",
          Zone: item?.deliveryAddress?.zone?.zone_name || "N/A",
          TotalBill: item?.customerCharge?.totalBill,
          AdvancePay: item?.customerCharge?.totalPayTk || 0,
          CollectableAmount:
            item?.customerCharge?.remainingTkPay ||
            item?.customerCharge?.totalBill,
        };
        makeCsvArray.push(obj);
      });

    // Only proceed if there are items to export
    if (makeCsvArray.length === 0) {
      openNotificationWithIcon("No items selected for export", "warning");
      return;
    }

    const ws = utils.json_to_sheet(makeCsvArray);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    writeFile(
      wb,
      `${moment().format("L").replace(/\//g, "-")}-Incomplete-orders-list.xlsx`
    );

    openNotificationWithIcon(
      `${makeCsvArray.length} orders exported successfully`,
      "success"
    );
  };

  const handleStatusFilterChange = (event, newStatus) => {
    if (newStatus !== null) {
      setFilterStatus(newStatus);
      setPage(0); // Reset to first page when filter changes
      setSelectedRowKeys([]); // Clear selections when filter changes
    }
  };

  // Handle filter button click
  const filterHandler = () => {
    setSearchValue("");
    setIsReset(false);
    setPage(0);
    console.log("Filtering with dates:", moment(startTime).format('YYYY-MM-DD'), "to", moment(endTime).format('YYYY-MM-DD'));
    fetchData(0, rowsPerPage, filterStatus);
  };

  // Handle reset button click
  const resetHandler = () => {
    const currentDate = new Date();
    setStartTime(currentDate);
    setEndTime(currentDate);
    setSearchValue("");
    setIsReset(true);
    setPage(0);
    setFilterStatus("ALL");
    
    // Fetch data without date filters
    setTimeout(() => {
      fetchData(0, rowsPerPage, "ALL");
      // Reset the isReset flag after data is fetched
      setTimeout(() => setIsReset(false), 100);
    }, 100);
  };

  return (
    <div className="m-sm-30">
      <CardHeader title="Incomplete Order List" />

      {/* Date Range Filtering Section */}
      <Box className="mb-4">
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
                <Box sx={{ my: 1, display: "flex", gap: "15px" }}>
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
                    className="mr-2 text-white bg-error"
                    onClick={resetHandler}
                  >
                    Reset
                  </Button>
                </Box>
              </Box>
            </Box>
            <Box>
              <TextField
                label=""
                placeholder="Search by Name or Phone"
                size="small"
                variant="outlined"
                fullWidth
                className="min-w-240"
                onChange={(e) => {
                  setPage(0);
                  setFilterStatus("ALL");
                  setSearchValue(e.target.value);
                }}
                value={searchValue}
              />
            </Box>
          </Box>
        </Card>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          backgroundColor: "#f5f5f5",
          borderRadius: "4px",
        }}
      >
        <div className={classes.toggleContainer}>
          <ToggleButtonGroup
            value={filterStatus}
            exclusive
            onChange={handleStatusFilterChange}
            aria-label="order status filter"
          >
            <ToggleButton
              value="ALL"
              aria-label="all orders"
              className={`${classes.toggleButton} ${classes.allButton}`}
              style={{
                backgroundColor: filterStatus === "ALL" ? "#1F2D57" : "", // Apply background color when selected
                color: filterStatus === "ALL" ? "white" : "", // Change text color if selected
              }}
            >
              All
            </ToggleButton>
            <ToggleButton
              value="PENDING"
              aria-label="pending orders"
              className={`${classes.toggleButton} ${classes.pendingButton}`}
              style={{
                backgroundColor: filterStatus === "PENDING" ? "#1F2D57" : "", // Apply background color when selected
                color: filterStatus === "PENDING" ? "white" : "", // Change text color if selected
              }}
            >
              Pending
            </ToggleButton>
            <ToggleButton
              value="CANCELED"
              aria-label="canceled orders"
              className={`${classes.toggleButton} ${classes.canceledButton}`}
              style={{
                backgroundColor: filterStatus === "CANCELED" ? "#1F2D57" : "", // Apply background color when selected
                color: filterStatus === "CANCELED" ? "white" : "", // Change text color if selected
              }}
            >
              Canceled
            </ToggleButton>
          </ToggleButtonGroup>
        </div>

        {selectedRowKeys?.length > 0 && (
          <Button
            color="primary"
            className="text-white"
            variant="contained"
            startIcon={<BsFiletypeXls />}
            onClick={downloadCSVHandler}
          >
            Export to Excel ({selectedRowKeys.length})
          </Button>
        )}
      </Box>

      <div className="p-6">
        <Table
          rowSelection={rowSelection} // Add row selection here
          columns={columns}
          dataSource={data}
          pagination={false}
          rowKey="_id"
        />
        <div className="flex justify-end mt-4">
          <TablePagination
            rowsPerPageOptions={[20, 50, 100]}
            component="div"
            count={metaData?.totalData}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      </div>

      <SimpleModal
        isShow={isConfirmModalOpen}
        closeModalHandler={() => setIsConfirmModalOpen(false)}
        width={800}
      >
        <IncompleteForm
          allDistrictList={allDistrictList}
          setSelectedDistrict={setSelectedDistrict}
          selectedDistrict={selectedDistrict}
          selectedDistrictData={selectedDistrictData}
          setSelectedDistrictData={setSelectedDistrictData}
          zonesList={zonesList}
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
          phone={phone}
          setPhone={setPhone}
          name={name}
          setName={setName}
          details={details}
          setDetails={setDetails}
          updateOrder={updateOrder}
          value={value}
          orderId={orderId}
        />
      </SimpleModal>

      <SimpleModal
        isShow={isCancelModalOpen}
        closeModalHandler={() => setIsCancelModalOpen(false)}
        width={500} // Adjusted width for better layout
      >
        <div className="p-6 text-center">
          <h1 className="text-lg font-semibold text-gray-800">
            Are you sure you want to cancel the order?
          </h1>

          <Grid container spacing={2} justifyContent="center" className="mt-6">
            <Grid item>
              <Button
                variant="contained"
                style={{
                  minWidth: "100px",
                  backgroundColor: "#E0E0E0", // Light gray for cancel
                  color: "#424242", // Darker gray text
                }}
                onClick={() => setIsCancelModalOpen(false)}
              >
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                style={{
                  minWidth: "100px",
                  backgroundColor: "#D32F2F", // Red color
                  color: "white",
                }}
                onClick={() => updateCancelOrder()}
              >
                Confirm
              </Button>
            </Grid>
          </Grid>
        </div>
      </SimpleModal>

      {isLoading && (
        <Box
          sx={{
            position: "fixed", // Fixed position to overlay on the screen
            top: 0, // Align to top of the screen
            left: 0, // Align to left of the screen
            width: "100vw", // Full width of the viewport
            height: "100vh", // Full height of the viewport
            display: "flex",
            justifyContent: "center", // Center horizontally
            alignItems: "center", // Center vertically
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
            zIndex: 9999, // Ensure it's on top of other elements
          }}
        >
          <Spinner />
        </Box>
      )}
    </div>
  );
}