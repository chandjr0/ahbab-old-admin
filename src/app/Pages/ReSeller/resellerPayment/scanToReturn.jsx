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
  Icon,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
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
import { useHistory, useLocation } from "react-router-dom";

import moment from "moment";
import { CopyToClipboard } from "react-copy-to-clipboard";
import MySnackbarContentWrapper from "../../../Shared/alert/alert";
import { FaRegCopy } from "react-icons/fa";
import "date-fns";
import { useDebounce } from "../../../hooks/useDebounce";

export default function OrderList() {
  const history = useHistory();

  const rowperPage = localStorage.getItem("rowPerPage");

  const [page, setPage] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(
    rowperPage ? Number(rowperPage) : 10
  );

  const [searchValue, setSearchValue] = useState("");
  const searchQuery = useDebounce(searchValue, 1500);

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
        res = await axios.get(`/admin-order/search-for-return/${val}`);
        const isExits = dataList.find((e) => e._id == res?.data?.data?._id);
        if (isExits) {
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
        fetchData(searchValue)
    }, 200);

    return () => {
        clearTimeout(timer);
    };
}, [searchValue]);


  const handleInputChange = (event) => {
    setSearchValue(event.target.value);
};



  useEffect(() => {
    let localData = localStorage.getItem("returnOrders")
      ? JSON.parse(localStorage.getItem("returnOrders"))
      : [];
    if (dataList.length > 0) {
      localStorage.setItem("returnOrders", JSON.stringify(dataList));
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
          return: data?.returnDetails,
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
    localStorage.setItem("returnOrders", JSON.stringify(updatedList));
    setRenderMe(!renderMe);
  };

  const columns = [
    // {
    //   id: "checkBox",
    //   label: (
    //     <Checkbox
    //       checked={allChecked}
    //       onChange={(e) => allCheckedHandler(e.target.checked)}
    //     />
    //   ),
    //   // minWidth: 10,
    //   format: (value) => (
    //     <Checkbox
    //       onClick={() => singleCheckHandler(value)}
    //       checked={value?.checkStatus}
    //       disabled={value?.isAvoid}
    //     />
    //   ),
    // },
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
        id: "customerCharge",
        label: "Delivery Charge",
        minWidth: 200,
        align: "center",
        format: (value) => {
          return (
            <div>
              <p style={{ margin: "0px", color: "green" }}>
                <strong>{`${value?.deliveryCharge} ৳`}</strong>
              </p>
             
            </div>
          );
        },
      },

    {
      id: "return",
      label: "Reseller Claim",
      align: "center",
      minWidth: 80,
      format: (value) => {
        return (
          <div>
            <p style={{ margin: "0px" }}>
              <strong style={{ color: "Salmon" }}>
                {value?.isResellerReturnClaim?'Yes':'No'}
              </strong>
            </p>
          </div>
        );
      },
    },
    // {
    //   id: "status",
    //   label: "Status",
    //   align: "center",
    //   minWidth: 100,
    //   format: (value) => {
    //     if (value?.courierTrackId && !value?.isOrderComplete) {
    //       return (
    //         <small className="rounded bg-light-gray elevation-z3 px-2 py-2 text-primary text-12 ">
    //           {value?.courierStatus}
    //         </small>
    //       );
    //     }

    //     const STATUS = value?.status[value?.status.length - 1].status;

    //     if (STATUS === "CANCELED") {
    //       return (
    //         <small className="rounded bg-error elevation-z3 text-white px-2 py-2px">
    //           cancelled
    //         </small>
    //       );
    //     } else if (STATUS === "DELIVERED") {
    //       return (
    //         <small className="rounded bg-green elevation-z3 text-white px-2 py-2px">
    //           delivered
    //         </small>
    //       );
    //     } else if (STATUS === "RETURNED") {
    //       let hasRefund = false;
    //       for (let st of value?.status) {
    //         if (st?.status === "REFUND") {
    //           hasRefund = true;
    //         }
    //       }

    //       return (
    //         <>
    //           <small className="rounded bg-light-error elevation-z3 text-black px-2 py-2px">
    //             returned
    //           </small>
    //           {hasRefund && (
    //             <>
    //               <br />
    //               <small className="rounded bg-secondary elevation-z3 text-black px-2 py-2px">
    //                 refund
    //               </small>
    //             </>
    //           )}
    //         </>
    //       );
    //     } else if (STATUS === "REFUND") {
    //       let hasReturn = false;
    //       for (let st of value?.status) {
    //         if (st?.status === "RETURNED") {
    //           hasReturn = true;
    //         }
    //       }
    //       return (
    //         <>
    //           <small className="rounded bg-secondary elevation-z3 text-black px-2 py-2px">
    //             refund
    //           </small>
    //           {hasReturn && (
    //             <>
    //               <br />
    //               <small className="rounded bg-light-error elevation-z3 text-black px-2 py-2px">
    //                 returned
    //               </small>
    //             </>
    //           )}
    //         </>
    //       );
    //     } else {
    //       return (
    //         <TextField
    //           name=""
    //           label=""
    //           variant="outlined"
    //           size="small"
    //           fullWidth
    //           select
    //           value={value?.status[value?.status.length - 1].status}
    //         >
    //           <MenuItem value="PENDING"> Pending </MenuItem>
    //           <MenuItem value="HOLD"> Hold </MenuItem>
    //           <MenuItem value="CONFIRM"> Confirmed </MenuItem>
    //           <MenuItem value="PROCESSING"> Processing </MenuItem>
    //           <MenuItem value="PICKED"> Stock out </MenuItem>
    //           <MenuItem value="SHIPPED"> Shipped </MenuItem>
    //           <MenuItem value="DELIVERED"> Delivered</MenuItem>
    //           <MenuItem value="CANCELED"> Cancelled </MenuItem>
    //           <MenuItem value="RETURNED"> Returned </MenuItem>
    //         </TextField>
    //       );
    //     }
    //   },
    // },
    // {
    //   id: "courier",
    //   label: "Courier",
    //   align: "center",
    //   minWidth: 100,
    //   format: (value) => {
    //     if (value?.courierTrackId) {
    //       return (
    //         <Button
    //           variant="contained"
    //           size="small"
    //           className="bg-secondary text-white"
    //           onClick={() => {
    //             setModalWidth(600);
    //             setCourierTackId({
    //               courierTrackId: value?.courierTrackId,
    //               name:
    //                 (process.env.REACT_APP_STEADFAST_MONGO_ID ===
    //                   value?.courierData?._id &&
    //                   "steadfast") ||
    //                 (process.env.REACT_APP_REDX_MONGO_ID ===
    //                   value?.courierData?._id &&
    //                   "redx"),
    //             });
    //             setIsOpenModal(true);
    //           }}
    //         >
    //           {value?.courierData?.name}
    //         </Button>
    //       );
    //     } else if (!value?.courierTrackId && value?.isOrderComplete) {
    //       return (
    //         <p className=" bg-light-gray elevation-z3 px-1 py-1">
    //           {value?.courierData?.name ? value?.courierData?.name : "---"}
    //         </p>
    //       );
    //     }

    //     return (
    //       <TextField
    //         name=""
    //         label=""
    //         variant="outlined"
    //         size="small"
    //         fullWidth
    //         select
    //         defaultValue={value?.courierData?._id}
    //         onChange={(e) => courierChangedHandler(e.target.value, value?.oId)}
    //       >
    //         <MenuItem value={null}>-- select --</MenuItem>
    //         {courierData.length > 0 &&
    //           courierData.map((data, idx) => (
    //             <MenuItem key={idx} value={data?._id}>
    //               {data?.name.toLowerCase()}
    //             </MenuItem>
    //           ))}
    //       </TextField>
    //     );
    //   },
    // },
    // {
    //   id: "createdBy",
    //   label: "Created",
    //   align: "center",
    //   minWidth: 80,
    // },
    // {
    //   id: "adminNote",
    //   label: "Note",
    //   align: "center",
    //   minWidth: 90,
    //   format: (value) => (
    //     <Box
    //       sx={{
    //         display: "flex",
    //         justifyContent: "center",
    //         alignItems: "center",
    //       }}
    //     >
    //       <Box>
    //         <IconButton onClick={() => addOrderNote(value)}>
    //           <Icon className="text-primary" role="button" fontSize="small">
    //             assignment
    //           </Icon>
    //         </IconButton>
    //       </Box>
    //       <Box>
    //         <p className="m-0">
    //           <small>{`X ${value?.notes.length}`}</small>
    //         </p>
    //       </Box>
    //     </Box>
    //   ),
    // },
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

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const showProductsDetails = (data) => {
    setProductsData(data);
    setIsOpenModal(true);
  };

  const submitCancel = async () => {
    const ids = dataList.map((item) => {
      return item?._id;
    });

    try {
      let res = await axios.post(`/admin-order/add-return-calc`, {
        orderIds: ids,
      });

      if (res) {
        setDataList([]);
        setSearchValue("");
        localStorage.setItem("returnOrders", []);
        window.location.reload();
      }

      openNotificationWithIcon(res?.data?.message, "success");
    } catch (err) {
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  return (
    <div className="m-sm-30">
      {/* <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Search Order" }]} />
      </div> */}

      <Card className="border-radius-0 ">
        <CardHeader title="SCAN TO RETURN" />
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
                  onClick={() => submitCancel()}
                  style={{
                    background: "green",
                    color: "#fff",
                    minWidth: "150px",
                  }}
                >
                 Make Return
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
