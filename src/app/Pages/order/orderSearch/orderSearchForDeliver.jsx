import "dotenv/config";
import { BsFiletypeXls } from "react-icons/bs";
import { utils, writeFile } from "xlsx";
import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  Icon,
  IconButton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import axios from "../../../../axios";
import imageBasePath from "../../../../config";
import Spinner from "../../../Shared/Spinner/Spinner";
import { notification } from "antd";
import { useHistory } from "react-router-dom";
import moment from "moment";
import { CopyToClipboard } from "react-copy-to-clipboard";
import MySnackbarContentWrapper from "../../../Shared/alert/alert";
import { FaRegCopy } from "react-icons/fa";
import "date-fns";

export default function OrderList() {
  const rowperPage = localStorage.getItem("rowPerPage");

  const [page, setPage] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(
    rowperPage ? Number(rowperPage) : 10
  );
  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };
  const [searchValue, setSearchValue] = useState("");

  const [rows, setRows] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [productsData, setProductsData] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [totalChecked, setTotalChecked] = useState(0);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [copyValue, setCopyValue] = useState("");
  const [isCopy, setIsCopy] = useState(false);

  const [renderMe, setRenderMe] = useState(false);

  let fetchData = async (val) => {
    setSearchValue(val);

    if (val.length >= 10) {
      try {
        let res = null;
        setIsLoading(true);
        res = await axios.get(`/admin-order/search-for-deliver/${val}`);
        const isExits = dataList.find((e) => e._id == res?.data?.data?._id);

        if (isExits) {
          openNotificationWithIcon("Duplicate Entry Detected", "warning");
        } else {
          if (res?.data) {
            setDataList((prevDataList) => [...prevDataList, res?.data?.data]);
          }
        }

        setSearchValue("");
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(searchValue);
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [searchValue]);

  const handleInputChange = (event) => {
    setSearchValue(event.target.value);
  };

  useEffect(() => {
    let localData = localStorage.getItem("orders")
      ? JSON.parse(localStorage.getItem("orders"))
      : [];
    if (dataList.length > 0) {
      localStorage.setItem("orders", JSON.stringify(dataList));
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
          products: data?.products,
          customer: data?.deliveryAddress,
          customerCharge: data?.customerCharge,
          payment: data?.payment,
          prove: data?.payment,
          reseller: data?.resellerInfo,
          status: {
            status: data?.orderStatus,
            _id: data?._id,
            courierTrackId: data?.courierTrackId,
            courierStatus: data?.courierStatus,
            isOrderComplete: isOrderComplete,
          },
          courier: {
            courierData: data?.courierData,
            oId: data?._id,
            courierTrackId: data?.courierTrackId,
            courierStatus: data?.courierStatus,
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
      if (localData?.length > 0) {
        setDataList(localData);
      }
      setRows([]);
    }
  }, [dataList]);

  const removeItem = async (val) => {
    const updatedList = dataList.filter((e) => e._id !== val?._id);
    setDataList(updatedList);
    localStorage.setItem("orders", JSON.stringify(updatedList));
    setRenderMe(!renderMe);
  };

  const columns = [
    {
      id: "serialId",
      label: "Serial_Id",
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
              {value?.sId} {/* {value?.sId}{" "} */}
              <span>
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

          <p style={{ color: "gray", margin: "0px" }}>
            <small>{moment(value?.time).format("ll")}</small>
            <br />
            <small>{moment(value?.time).format("LT")}</small>
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
                src={
                  imageBasePath + "/" + value[0]?.product?.galleryImage[0] || ""
                }
                alt={value[0]?.name}
                className="border-radius-4"
                style={{ cursor: "pointer", width: "58px" }}
                onClick={() => showProductsDetails(value)}
              />
            </Box>
            <Box>
              <p style={{ margin: "0px" }}>{` X ${value.reduce(function (
                prev,
                cur
              ) {
                return prev + cur.quantity;
              },
              0)}`}</p>
            </Box>
          </Box>
        );
      },
    },
    {
      id: "reseller",
      label: "Reseller",
      align: "center",
      minWidth: 120,
      format: (value) => {
        return (
          <div>
            <p style={{ margin: "0px" }}>Name: {value?.reseller?.name}</p>
            <p style={{ margin: "0px" }}>Profit: {value?.grandProfit}TK</p>
          </div>
        );
      },
    },
    {
      id: "customer",
      label: "Customer",
      align: "center",
      minWidth: 120,
      format: (value) => {
        return (
          <div>
            <p style={{ margin: "0px" }}>{value?.name}</p>
            <p style={{ margin: "0px" }}>
              <strong>{value?.phone}</strong>
            </p>
            <p style={{ margin: "0px" }}>{value?.address}</p>
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
      id: "payment",
      label: "Customer Payment",
      minWidth: 200,
      align: "center",
      format: (value) => {
        return (
          <div>
            <p style={{ margin: "0px", color: "green" }}>
              <strong>{`Paid: ${value?.amount} ৳`}</strong>
            </p>
            <p style={{ color: "gray", margin: "0px" }}>{value?.paymentType}</p>
            <p style={{ margin: "0px" }}>{value?.details}</p>
          </div>
        );
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
              onClick={(e) => removeItem(value)}
              style={{
                backgroundColor: "#ebedec",
                color: "black",
                fontWeight: "bold",
                marginRight: "8px",
              }}
            >
              <Icon>delete</Icon>
            </IconButton>
          </div>
        );
      },
    },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    localStorage.setItem("rowPerPage", +event.target.value);
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const showProductsDetails = (data) => {
    setProductsData(data);
    setIsOpenModal(true);
  };

  const submitPayment = async () => {
    const ids = dataList.map((item) => {
      return item?._id;
    });

    try {
      let res = await axios.post(`/admin-order/update-orders-deliver`, {
        orderIds: ids,
      });

      if (res) {
        setDataList([]);
        setSearchValue("");
        localStorage.setItem("orders", []);
        window.location.reload();
      }

      openNotificationWithIcon(res?.data?.message, "success");
    } catch (err) {
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  const downloadCSVHandler = () => {
    let makeCsvArray = [];
    dataList.forEach((item) => {
      let obj = {
        Create: moment(item?.createdAt).format("lll"),
        Serial_Id: item?.serialId,
        Products: item?.products?.length,
        Status: item?.orderStatus[item?.orderStatus.length - 1].status,
        Name: item?.deliveryAddress?.name,
        Phone: item?.deliveryAddress?.phone,
        Address: item?.deliveryAddress?.address,
        City: item?.deliveryAddress?.city?.city_name,
        Zone: item?.deliveryAddress?.zone?.zone_name,
        TotalBill: item?.customerCharge?.totalBill,
        AdvancePay: item?.customerCharge?.totalPayTk,
        CollectableAmount: item?.customerCharge?.remainingTkPay,
        // Created_By: item?.createdBy,
      };
      makeCsvArray.push(obj);
    });

    const ws = utils.json_to_sheet(makeCsvArray);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    writeFile(wb, `${moment().format("L").replace(/\//g, "-")}-Make-delivered-list.xlsx`);
  };

  return (
    <div className="m-sm-30">
      <Card className="border-radius-0 ">
        <CardHeader title="READY TO DELIVER" />
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
            <Box>
              <TextField
                label="SCAN HERE ...."
                size="medium"
                variant="outlined"
                style={{ width: "400px" }}
                onChange={handleInputChange}
                value={searchValue}
              ></TextField>
            </Box>
            {dataList?.length > 0 ? (
              <Box className="ml-3">
                <Button
                  color="primary"
                  className="text-white mr-3"
                  variant="contained"
                  startIcon={<BsFiletypeXls />}
                  onClick={downloadCSVHandler}
                >
                  Excel
                </Button>
                <Button
                  onClick={() => submitPayment()}
                  style={{
                    background: "green",
                    color: "#fff",
                    minWidth: "150px",
                  }}
                >
                  Make Delivered
                </Button>
              </Box>
            ) : null}
          </Box>
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
                    maxHeight: 800,
                    overflow: "auto",
                  }}
                >
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
                </div>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 100]}
                  component="div"
                  count={dataList?.length} // total data
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
    </div>
  );
}
