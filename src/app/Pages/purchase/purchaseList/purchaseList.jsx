import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Divider,
  Icon,
  IconButton,
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
import SimpleModal from "../../../Shared/SimpleModal/SimpleModal";
import Spinner from "../../../Shared/Spinner/Spinner";
import { notification } from "antd";
import { useHistory } from "react-router-dom";
import { Breadcrumb } from "../../../components";
import { IoMdAddCircle } from "react-icons/io";
import moment from "moment";
import { FaExclamationTriangle, FaEye } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import ProductDetails from "./components/productDetails";
import AddAdminNote from "./components/addAdminNote";
import { CopyToClipboard } from "react-copy-to-clipboard";
import MySnackbarContentWrapper from "../../../Shared/alert/alert";
import { FaRegCopy } from "react-icons/fa";
import { Print } from "@material-ui/icons";

export default function PurchaseList() {
  const history = useHistory();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [rows, setRows] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [openImgData, setOpenImgData] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [statusName, setStatusName] = useState("ALL");
  const [userType, setUserType] = useState("ALL");
  const [productsData, setProductsData] = useState([]);
  const [purchaseNoteData, setPurchaseNoteData] = useState(null);
  const [orderStatusData, setOrderStatusData] = useState(null);
  const [allChecked, setAllChecked] = useState(false);
  const [totalChecked, setTotalChecked] = useState(0);
  const [bulkselect, setBulkSelect] = useState("");
  const [bulkActionData, setBulkActionData] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [copyValue, setCopyValue] = useState("");
  const [isCopy, setIsCopy] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    let fetchData = async () => {
      try {
        let res = null;
        setIsLoading(true);

        if (searchValue !== "") {
          res = await axios.post(`/purchase/search-purchase?page=1&limit=10`, {
            value: searchValue,
          });
        } else {
          res = await axios.get(
            `/purchase/fetch-all?status=${statusName}&page=${page + 1}&limit=${rowsPerPage}`
          );
        }

        if (res) {
          setTotalData(res?.data?.metaData?.totalData);
          setDataList(
            res?.data?.data.map((i) => {
              let isAvoid = false;
              for (let st of i?.purchaseStatus) {
                if (["CANCELED", "RECEIVED"].includes(st?.status)) {
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
        setErrorMsg(err?.response?.data?.message);
      }
    };

    fetchData();
  }, [page, rowsPerPage, statusName, userType, searchValue]);

  useEffect(() => {
    console.log("dataList: ", dataList);
    if (dataList.length > 0) {
      let dataArray = [];
      let i = 0;
      for (let data of dataList) {
        if (data?.checkStatus) {
          i++;
        }
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
          supplier: data?.supplierId,
          totalBill: data?.totalBill,
          status: { status: data?.purchaseStatus, _id: data?._id },
          createdBy: data?.createdBy,
          adminNote: {
            notes: data?.adminNote,
            serialId: data?.serialId,
            _id: data?._id,
          },
          document: data?.document || "",
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

  const updateOrderStatus = async (id, status) => {
    try {
      let purchaseIds = [id];
      let res = await axios.patch(`/purchase/update-status`, {
        purchaseIds: purchaseIds,
        status: status,
        time: new Date(),
      });

      if (res?.data?.success) {
        setDataList(
          dataList.map((i) => {
            if (purchaseIds.includes(i?._id)) {
              let updatePurchaseStatus = [...i?.purchaseStatus, { status: status }];

              return {
                ...i,
                purchaseStatus: updatePurchaseStatus,
                checkStatus: false,
                isAvoid: true,
              };
            } else {
              return i;
            }
          })
        );
        openNotificationWithIcon(res?.data?.message, "success");
      }

      setIsOpenModal(false);
      setOrderStatusData(null);
    } catch (err) {
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  const openImgHandler = (data) => {
    setIsOpenModal(true);
    setOpenImgData(data);
  };


  
  const columns = [
    {
      id: "checkBox",
      label: (
        <Checkbox checked={allChecked} onChange={(e) => allCheckedHandler(e.target.checked)} />
      ),
      minWidth: 30,
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
      label: "Serial_Id",
      align: "left",
      minWidth: 140,
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
              {value?.sId}{" "}
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
              message={`Copy purchase Id: ${copyValue}`}
            />
          </Snackbar>

          <p style={{ color: "gray", margin: "0px" }}>
            <small>{moment(value?.time).format("lll")}</small>
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
                src={imageBasePath + "/" + value[0]?.productId?.galleryImage[0]}
                alt={value[0]?.name}
                className="border-radius-4"
                style={{ cursor: "pointer", width: "58px" }}
                onClick={() => showProductsDetails(value)}
              />
            </Box>
            <Box>
              <p style={{ margin: "0px" }}>{` X ${value.reduce(function (prev, cur) {
                return prev + cur.quantity;
              }, 0)}`}</p>
            </Box>
          </Box>
        );
      },
    },
    {
      id: "document",
      label: "Doc",
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
                src={imageBasePath + "/" + value}
                alt={value === "" ? "No Doc" : "purchase data"}
                className="border-radius-4"
                style={{ cursor: "pointer", width: "58px" }}
                disabled={!value}
                onClick={() => openImgHandler({ image: value })}
              />
            </Box>
          </Box>
        );
      },
    },
    {
      id: "supplier",
      label: "Supplier",
      align: "center",
      minWidth: 120,
      format: (value) => {
        return (
          <div>
            {value ? (
              <>
                <p style={{ margin: "0px" }}>{value?.name}</p>
                <p style={{ margin: "0px" }}>
                  <strong>{value?.phone}</strong>
                </p>
                <p style={{ margin: "0px" }}>{value?.address}</p>
              </>
            ) : (
              <p>- Initial - </p>
            )}
          </div>
        );
      },
    },
    {
      id: "totalBill",
      label: "Total Bill",
      align: "center",
      minWidth: 100,
    },
    {
      id: "status",
      label: "Status",
      align: "center",
      minWidth: 100,
      format: (value) => {
        const STATUS = value?.status[value?.status.length - 1].status;

        if (STATUS === "CANCELED") {
          return (
            <small className="rounded bg-error elevation-z3 text-white px-2 py-2px">
              Cancelled
            </small>
          );
        } else if (STATUS === "RECEIVED") {
          return (
            <small className="rounded bg-green elevation-z3 text-white px-2 py-2px">Received</small>
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
              value={value?.status[value?.status.length - 1].status}
              // onChange={(e) => orderStatusChangeHandler(value?._id, e.target.value)}
              onChange={(e) => {
                if (e.target.value === "RECEIVED" || e.target.value === "CANCELED") {
                  setOrderStatusData({ status: e.target.value, id: value?._id });
                  setIsOpenModal(true);
                }
              }}
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="RECEIVED"> Received</MenuItem>
              <MenuItem value="CANCELED"> Cancelled </MenuItem>
            </TextField>
          );
        }
      },
    },
    {
      id: "createdBy",
      label: "Created",
      align: "center",
      minWidth: 80,
    },
    {
      id: "adminNote",
      label: "Note",
      align: "center",
      minWidth: 90,
      format: (value) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box>
            <IconButton onClick={() => addOrderNote(value)}>
              <Icon className="text-primary" role="button" fontSize="small">
                assignment
              </Icon>
            </IconButton>
          </Box>
          <Box>
            <p className="m-0">
              <small>{`X ${value?.notes.length}`}</small>
            </p>
          </Box>
        </Box>
      ),
    },
    {
      id: "action",
      label: "Action",
      align: "center",
      minWidth: 140,
      format: (value) => {
        let isUsed = false;
        for (let data of value?.purchaseStatus) {
          if (data?.status === "CANCELED" || data?.status === "RECEIVED") {
            isUsed = true;
          }
        }

        return (
          <div>
            <IconButton
              onClick={() => {
                window.open(`/purchase-view/${value?.serialId}`, "_blank");
              }}
              style={{
                backgroundColor: "#ebedec",
                color: "#1976d2",
                marginRight: "8px",
              }}
            >
              <FaEye style={{ fontSize: "16px" }} />
            </IconButton>
            <IconButton
              onClick={() => {
                setIsOpenModal(true);
                setDeleteId(value?._id);
              }}
              style={{ backgroundColor: "#ebedec" }}
              disabled={isUsed}
            >
              {isUsed ? (
                <RiDeleteBin5Line style={{ fontSize: "16px", color: "gray" }} />
              ) : (
                <RiDeleteBin5Line style={{ fontSize: "16px", color: "red" }} />
              )}
            </IconButton>
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

  const selectBulkHandler = (value) => {
    setBulkSelect(value);
    setBulkActionData(dataList.filter((data) => data?.checkStatus));
    setIsOpenModal(true);
  };

  const bulkActionHandler = async () => {
    try {
      setBulkLoading(true);
      let purchaseIds = bulkActionData.map((i) => i?._id);

      let createRes = await axios.patch(`/purchase/update-status`, {
        purchaseIds: purchaseIds,
        status: bulkselect,
        time: new Date(),
      });

      if (createRes?.data?.success) {
        setDataList(
          dataList.map((i) => {
            if (purchaseIds.includes(i?._id)) {
              let updatePurchaseStatus = [...i?.purchaseStatus, { status: bulkselect }];

              return {
                ...i,
                purchaseStatus: updatePurchaseStatus,
                checkStatus: false,
                isAvoid: true,
              };
            } else {
              return i;
            }
          })
        );
        openNotificationWithIcon(createRes?.data?.message, "success");
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

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const closeModalHandler = () => {
    setIsOpenModal(false);
    setOpenImgData(null);
    setProductsData([]);
    setPurchaseNoteData(null);

    setBulkActionData(null);
    setBulkSelect("");
  };

  const addOrderNote = (data) => {
    setPurchaseNoteData(data);
    setIsOpenModal(true);
  };

  const showProductsDetails = (data) => {
    setProductsData(data);
    setIsOpenModal(true);
  };

  const gotoMultipleOderHandler = () => {
    let selectedOrderData = dataList.filter((data) => data?.checkStatus);
    let orderIds = selectedOrderData.map((i) => i?.serialId);

    history.push(`/multiple-order-view?ids=${orderIds.join(",")}`);
  };

  const deleteHandler = async () => {
    try {
      let res = await axios.delete(`/purchase/delete/${deleteId}`);
      setDataList(dataList.filter((i) => i?._id !== deleteId));
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
    setDeleteId(false);
    setIsOpenModal(false);
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Purchase List" }]} />
      </div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "28px",
          marginTop: "28px",
        }}
        className="mx-8"
      >
        <Button
          style={{
            backgroundColor: "#FF8E96",
            color: "white",
          }}
          variant="contained"
          size="large"
          startIcon={<IoMdAddCircle />}
          onClick={() => history.push("/create-purchase")}
        >
          Create Purchase
        </Button>
      </Box>
      <Card className="border-radius-0 mx-8">
        <CardHeader title="Purchase List" />
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
                <Box
                  sx={{
                    backgroundColor: "white",
                    mx: 1,
                  }}
                >
                  <TextField
                    label="Bulk Action"
                    size="small"
                    variant="outlined"
                    fullWidth
                    select
                    className="min-w-188"
                    onChange={(e) => {
                      // if (e.target.value.includes(["RECEIVED", "CANCELED"])) {
                      selectBulkHandler(e.target.value);
                      // }
                    }}
                    value={bulkselect}
                  >
                    <MenuItem value="" disabled>
                      --select--
                    </MenuItem>
                    <MenuItem value="PENDING"> Pending </MenuItem>
                    <MenuItem value="RECEIVED"> Received </MenuItem>
                    <MenuItem value="CANCELED"> Cancelled </MenuItem>
                  </TextField>
                </Box>

                <Typography
                  paragraph
                  className="ml-4 mt-2 min-w-188"
                  style={{ color: "green", fontWeight: "bold" }}
                >{`${totalChecked} product select from this page`}</Typography>
              </Box>
              <Box>
                <Button
                  color="secondary"
                  className="text-white"
                  variant="contained"
                  startIcon={<Print />}
                  onClick={gotoMultipleOderHandler}
                >
                  print all
                </Button>
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
                  // flexWrap: "wrap",
                }}
              >
                <TextField
                  label="Filter by Status"
                  size="small"
                  variant="outlined"
                  fullWidth
                  select
                  className="min-w-188"
                  onChange={(e) => {
                    setPage(0);
                    setSearchValue("");
                    setStatusName(e.target.value);
                  }}
                  value={statusName}
                >
                  <MenuItem value="ALL">ALL</MenuItem>
                  <MenuItem value="PENDING"> Pending </MenuItem>
                  <MenuItem value="RECEIVED"> Received </MenuItem>
                  <MenuItem value="CANCELED"> Cancelled </MenuItem>
                </TextField>
                <Typography
                  paragraph
                  className="ml-4 min-w-188"
                  style={{ color: "green", fontWeight: "bold" }}
                >{`Total Purchases: ${totalData || 0}`}</Typography>
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
                    setStatusName("ALL");
                    setUserType("ALL");
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
                          <TableRow hover role="checkbox" tabIndex={-1} key={idx1}>
                            {columns.map((column, idx2) => {
                              const value = row[column.id];
                              return (
                                <TableCell key={idx2} align={column.align}>
                                  {column.format ? column.format(value, row?.name) : value}
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
                    Are you sure<strong>{" " + bulkselect + " "}</strong>
                    selected products?
                  </p>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
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
              gap: "16px",
            }}
          >
            <Box>
              {orderStatusData?.status === "CANCELED" && (
                <Typography paragraph className="ml-2 text-16 text-error">
                  Do you want to cancel the purchase?
                </Typography>
              )}
              {orderStatusData?.status === "RECEIVED" && (
                <Typography paragraph className="ml-2 text-16 text-green">
                  Are you received the purchase?
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                variant="outlined"
                color="primary"
                className="mr-4"
                onClick={() => {
                  setIsOpenModal(false);
                  setOrderStatusData(null);
                  updateOrderStatus(orderStatusData?.id, orderStatusData?.status);
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

        {productsData.length > 0 && <ProductDetails productsData={productsData} />}

        {purchaseNoteData && (
          <AddAdminNote
            purchaseNoteData={purchaseNoteData}
            closeModalHandler={closeModalHandler}
            dataList={dataList}
            setDataList={setDataList}
          />
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
              <Button variant="outlined" color="primary" className="mr-4" onClick={deleteHandler}>
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
      </SimpleModal>
    </div>
  );
}
