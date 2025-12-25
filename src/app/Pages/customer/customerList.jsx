import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardHeader,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Button,
} from "@material-ui/core";
import axios from "../../../axios";
import imageBasePath from "../../../config";
import SimpleModal from "../../Shared/SimpleModal/SimpleModal";
import Spinner from "../../Shared/Spinner/Spinner";
import { Breadcrumb } from "../../components";
import CustomerOrder from "./customerOrder";
import { FaShoppingCart } from "react-icons/fa";
import { BsFiletypeXls } from "react-icons/bs";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import { Autorenew } from "@material-ui/icons";

export default function CustomerList() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [rows, setRows] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [openImgData, setOpenImgData] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [customerData, setCustomerData] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isReset, setIsReset] = useState(false);

  const columns = [
    {
      id: "image",
      label: "Image",
      minWidth: 100,
      format: (value) => (
        <Avatar
          src={imageBasePath + "/" + value?.image}
          alt={value?.name}
          className="border-radius-4"
          style={{ cursor: "pointer", width: "58px" }}
          onClick={() =>
            openImgHandler({ image: value?.image, name: value?.name })
          }
        />
      ),
    },
    {
      id: "name",
      label: "Name",
      minWidth: 100,
    },
    {
      id: "phone",
      label: "Phone",
      minWidth: 120,
    },
    // {
    //   id: "totalBuy",
    //   label: "Total Buy",
    //   minWidth: 100,
    // },
    {
      id: "address",
      label: "Address",
      minWidth: 150,
    },
    {
      id: "orderQty",
      label: "Order Qty",
      minWidth: 100,
      format: (value) => <>{value || 0}</>,
    },
    {
      id: "orderValue",
      label: "Order Value",
      minWidth: 100,
      format: (value) => <>{value || 0}</>,
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
        let res = null;
        setIsLoading(true);

        res = await axios.post(
          `/customer/admin/list?page=${page + 1}&limit=${rowsPerPage}`,
          {
            value: searchValue,
            sortBy: "orderNum",
            startTime: startTime ? setToMidnight(startTime).toISOString() : null,
            endTime: endTime  ? setToEndOfDay(endTime).toISOString() : null,
          }
        );

        if (res?.data?.data) {
          setTotalData(res?.data?.metaData?.totalData);
          let dataArray = [];
          for (let data of res?.data?.data) {
            dataArray.push({
              _id: data?._id,
              image: {
                name: data?.customerData?.name,
                image: data?.customerData?.image,
              },
              orderQty: data?.tOrder,
              orderValue: data?.tPrice,
              name: data?.customerData?.name,
              phone: data?.customerData?.phone,
              totalBuy: data?.totalBuy || 0,
              address: data?.customerData?.address || "",
              action: data,
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

    fetchData();
  }, [page, rowsPerPage, searchValue,startTime,endTime]);

  const closeModalHandler = () => {
    setIsOpenModal(false);
    setOpenImgData(null);
    setCustomerData(null);
  };

  const openImgHandler = (data) => {
    setIsOpenModal(true);
    setOpenImgData(data);
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

  const downloadCsv = () => {
    const csvHeaders = ["Name", "Phone", "Address", "Order Value", "Order Qty"];

    const csvRows = rows?.map((item) => [
      `"${item?.name}"`,
      `"${item?.phone.replace(/\D/g, "")}"`,
      `"${item?.address.replace(/#/g, "-")}"`,
      `"${item?.orderQty}"`,
      `"${item?.orderValue}"`,
    ]);

    const bom = "\uFEFF";
    const csvArray = [csvHeaders, ...csvRows];
    const csvContent = bom + csvArray.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customerList.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="m-sm-30">

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "28px",
          marginTop: "28px",
        }}
        className="mx-8"
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
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
        <Box>
          <Button
            color="primary"
            className="text-white"
            variant="contained"
            startIcon={<BsFiletypeXls />}
            onClick={() => {
              downloadCsv();
            }}
          >
            Excel
          </Button>
        </Box>
      </Box>
      <Card className="border-radius-0 mx-8">
        <CardHeader title="Customer List" />
        <div className="w-full overflow-hidden px-2 mt-4">
          <Box
            sx={{
              borderBottom: "1px solid #F6F6F6",
              backgroundColor: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1,
            }}
          >
            <Box>
              <Typography paragraph>{`Registered customer: ${
                totalData || 0
              } `}</Typography>
            </Box>
            <Box>
              <TextField
                label=""
                placeholder="Search by phone"
                size="small"
                variant="outlined"
                fullWidth
                className="min-w-240"
                onChange={(e) => {
                  setPage(0);
                  setSearchValue(e.target.value);
                }}
                value={searchValue}
              />
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
                          <TableRow
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            key={row._id}
                          >
                            {columns.map((column) => {
                              const value = row[column.id];
                              return (
                                <TableCell key={column.id} align={column.align}>
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
        {openImgData && (
          <Avatar
            className="border-radius-4"
            style={{ width: "100%", height: "100%" }}
            src={imageBasePath + "/" + openImgData?.image}
            alt={openImgData?.name}
          />
        )}

        {customerData && <CustomerOrder customerData={customerData} />}
      </SimpleModal>
    </div>
  );
}
