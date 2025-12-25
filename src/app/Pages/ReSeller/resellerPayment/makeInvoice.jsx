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
  Avatar,
  CardHeader,
  TextField,
  TablePagination,
  Checkbox,
  Snackbar,
} from "@material-ui/core";
import axios from "../../../../axios";
import Spinner from "../../../Shared/Spinner/Spinner";
import { useHistory } from "react-router-dom";
import { notification } from "antd";
import imageBasePath from "../../../../config";
import { FaEye } from "react-icons/fa";
import moment from "moment";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FaRegCopy } from "react-icons/fa";
import MySnackbarContentWrapper from "../../../Shared/alert/alert";
import { Modal, Form, Input, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { Autorenew } from "@material-ui/icons";

const EmployeeList = () => {
  const history = useHistory();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [rows, setRows] = useState([]);

  const [dataList, setDataList] = useState([]);
  const [affiliateList, setAffiliateList] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [searchNow, setSearchNow] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState({});
  const [copyValue, setCopyValue] = useState("");
  const [isCopy, setIsCopy] = useState(false);
  const [allChecked, setAllChecked] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isReset, setIsReset] = useState(false);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    localStorage.setItem("rowPerPage", +event.target.value);
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleClick = (event, value) => {
    window.open(`/reseller-order-view/${value?.serialId}`, "_blank");
  };

  const fetchData = async (val) => {
    try {
      setIsLoading(true);
      let res = await axios.post("/reseller/search?page=1&limit=50", {
        value: val,
      });
      setAffiliateList(res?.data?.data);
      setIsLoading(false);
      setErrorMsg("");
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.response.data.message);
    }
  };

  useEffect(() => {
    let fetchData = async () => {
      try {
        let res = null;
        setIsLoading(true);
        res = await axios.post(
          `/reseller-payment/admin/pending-reseller-orders?page=${
            page + 1
          }&limit=${rowsPerPage}`,
          {
            resellerId: selectedAffiliate?._id,
            startTime: startTime,
            endTime: endTime,
          }
        );

        if (res) {
          setTotalData(res?.data?.metaData?.totalData);
          setStartTime(null);
          setEndTime(null);
          setDataList(
            res?.data?.data.map((i) => {
              let isAvoid = false;

              if (
                ["CANCELED", "DELIVERED", "RETURNED", "REFUND"].includes(
                  i?.orderStatus[i?.orderStatus.length - 1]?.status
                )
              ) {
                isAvoid = true;
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

    fetchData();
  }, [page, rowsPerPage, selectedAffiliate, isReset]);

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

          action: data,
        });
      }
      let count = 0;
      dataList.forEach((d) => {
        if (!d?.isAvoid) {
          count++;
        }
      });
      //   if (i === count) {
      //     setTotalChecked(i);
      //     setAllChecked(true);
      //   } else {
      //     setTotalChecked(i);
      //     setAllChecked(false);
      //   }
      setRows(dataArray);
    } else {
      setRows([]);
    }
  }, [dataList]);

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
        return {
          ...i,
          checkStatus: checkStatus,
        };
      })
    );
  };

  const handleFinish = async (values) => {
    const base64ImagesArray = await Promise.all(
      fileList.map(async (file) => await getBase64(file.originFileObj))
    );

    const orderId = dataList
      .filter((item) => item?.checkStatus === true)
      .map((item) => item?._id);

    const data = {
      orderIds: orderId,
      files: base64ImagesArray,
      details: values.description,
    };


    try {
      let res = await axios.post(
        `/reseller-payment/admin/make-pey-invoice/${selectedAffiliate?._id}`,
        data
      );
      if (res) {
        openNotificationWithIcon(res.data?.message, "success");
        window.location.reload();
      }
    } catch (err) {
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUploadCustomRequest = async ({ file, onSuccess, onError }) => {
    setTimeout(() => {
      onSuccess();
      message.success(`${file.name} uploaded successfully`);
    }, 1000);
  };

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleUploadBeforeUpload = (file) => {
    return true;
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
        />
      ),
    },
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
    // {
    //   id: "products",
    //   label: "Products",
    //   align: "center",
    //   minWidth: 100,
    //   format: (value) => {
    //     return (
    //       <Box
    //         sx={{
    //           display: "flex",
    //           alignItems: "center",
    //           justifyContent: "center",
    //         }}
    //       >
    //         <Box>
    //           <Avatar
    //             src={`${imageBasePath}/${
    //               value[0]?.isVariant
    //                 ? value[0]?.variation?.images?.length
    //                   ? value[0]?.variation?.images[0]
    //                   : value[0]?.product?.galleryImage[0]
    //                 : value[0]?.product?.galleryImage[0] || ""
    //             }`}
    //             alt={value[0]?.name}
    //             className="border-radius-4"
    //             style={{ cursor: "pointer", width: "58px" }}
    //             // onClick={() => showProductsDetails(value)}
    //           />
    //         </Box>
    //         <Box>
    //           <p style={{ margin: "0px" }}>{` X ${value.reduce(function (
    //             prev,
    //             cur
    //           ) {
    //             return prev + cur.quantity;
    //           },
    //           0)}`}</p>
    //         </Box>
    //       </Box>
    //     );
    //   },
    // },
    {
      id: "reseller",
      label: "Reseller",
      align: "center",
      minWidth: 120,
      format: (value) => {
        return (
          <div>
            <p style={{ margin: "0px" }}>Name: {value?.reseller?.name}</p>
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
      id: "reseller",
      label: "Reseller Profit",
      align: "center",
      minWidth: 120,
      format: (value) => {
        return (
          <div>
            <p style={{ margin: "0px" }}>Profit: {value?.grandProfit}TK</p>
          </div>
        );
      },
    },
    {
      id: "customerCharge",
      label: "Total Product Price",
      align: "center",
      minWidth: 80,
      format: (value) => {
        return (
          <p style={{ margin: "0px", color: "green" }}>
            <strong>{`${value?.totalProductPrice} ৳`}</strong>
          </p>
        );
      },
    },

    // {
    //   id: "payment",
    //   label: "Customer Payment",
    //   minWidth: 200,
    //   align: "center",
    //   format: (value) => {
    //     return (
    //       <div>
    //         <p style={{ margin: "0px", color: "green" }}>
    //           <strong>{`Paid: ${value?.amount} ৳`}</strong>
    //         </p>
    //         <p style={{ color: "gray", margin: "0px" }}>{value?.paymentType}</p>
    //         <p style={{ margin: "0px" }}>{value?.details}</p>
    //       </div>
    //     );
    //   },
    // },

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
        }
      },
    },

    // {
    //   id: "createdBy",
    //   label: "Created",
    //   align: "center",
    //   minWidth: 80,
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
              onClick={(e) => handleClick(e, value)}
              style={{
                backgroundColor: "#ebedec",
                color: "black",
                fontWeight: "bold",
                marginRight: "8px",
              }}
            >
              <FaEye style={{ fontSize: "16px", color: "#1976d2" }} />
            </IconButton>
            {/* <Menu
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
              
            </Menu> */}
          </div>
        );
      },
    },
  ];

  return (
    <div className="m-sm-30">
      <Grid container>
        <Grid item xs={12}>
          <Box className="my-3 flex items-center justify-between">
            <Box className="my-3 flex items-center">
              <TextField
                label=""
                placeholder="Search For Affiliate"
                size="small"
                variant="outlined"
                fullWidth
                className="max-w-240"
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  setSearchValue(e.target.value);
                  fetchData(e.target.value);
                }}
                value={searchValue}
              />
              <Box sx={{ m: 1, display: "flex", alignItems: "center" }}>
                <Button
                  variant="contained"
                  size="small"
                  className="text-white bg-error"
                  onClick={() => {
                    setSearchValue("");
                    setSelectedAffiliate({});
                  }}
                >
                  CLEAR
                </Button>
              </Box>
            </Box>

            {Object.keys(selectedAffiliate).length ? (
              <Box
                sx={{
                  borderBottom: "1px solid #F6F6F6",
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
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
                        }}
                        startIcon={<Autorenew />}
                      >
                        Reset
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ) : null}

            <Card className="border-radius-0 ">
              {dataList?.find((e) => e.checkStatus == true) ? (
                <div>
                  <Box className="m-3 text-right">
                    <Button
                      onClick={() => setIsOpenModal(true)}
                      style={{
                        background: "green",
                        color: "#fff",
                        minWidth: "150px",
                      }}
                    >
                      MAKE INVOICE
                    </Button>
                  </Box>
                </div>
              ) : null}
            </Card>
          </Box>

          {Object.keys(selectedAffiliate).length ? null : (
            <Card elevation={3}>
              <CardHeader title="Affiliate list" />

              {!isLoading ? (
                <div className="w-full overflow-auto  px-6 py-8">
                  {affiliateList.length > 0 && errorMsg === "" ? (
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
                            <TableCell className="min-w-100">Image</TableCell>
                            <TableCell className="min-w-100">
                              Affiliate Name
                            </TableCell>
                            <TableCell className="min-w-100">Phone</TableCell>
                            <TableCell className="min-w-100">Email</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {affiliateList.map((data, index) => (
                            <TableRow
                              onClick={() => setSelectedAffiliate(data)}
                              key={index}
                            >
                              <TableCell className="capitalize" align="left">
                                {index + 1}
                              </TableCell>
                              <TableCell className="capitalize" align="left">
                                <div>
                                  <img
                                    style={{ width: "50px", height: "50px" }}
                                    src={`${imageBasePath}/${data?.image}`}
                                    alt="image"
                                  />
                                </div>
                              </TableCell>

                              <TableCell className="capitalize" align="left">
                                {data?.name}
                              </TableCell>
                              <TableCell className="capitalize" align="left">
                                {data?.phone}
                              </TableCell>
                              <TableCell className="capitalize" align="left">
                                {data?.email}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
          )}

          {Object.keys(selectedAffiliate).length ? (
            <Card className="border-radius-0">
              <CardHeader title={`Order list of ${selectedAffiliate?.name}`} />
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
                                      <TableCell
                                        key={idx2}
                                        align={column.align}
                                      >
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
                        rowsPerPageOptions={[10, 25, 100, 250, 500]}
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
          ) : null}
        </Grid>
      </Grid>

      <Modal
        visible={isOpenModal}
        title={`MAKE INVOICE`}
        onCancel={() => setIsOpenModal(false)}
        footer={[
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            Submit
          </Button>,
        ]}
      >
        <Form form={form} onFinish={handleFinish}>
          <p>
            Description <span style={{ color: "red" }}>*</span>
          </p>
          <Form.Item
            name="description"
            // label="Description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter a description" />
          </Form.Item>
          <p>Upload Doc </p>
          <Form.Item
            name="images"
            // label="Images"
            valuePropName="fileList"
            getValueFromEvent={handleUploadChange}
            rules={[
              { required: false, message: "Please upload at least one image" },
            ]}
          >
            <Upload
              beforeUpload={handleUploadBeforeUpload}
              customRequest={handleUploadCustomRequest}
              fileList={fileList}
              listType="picture-card"
            >
              {fileList?.length < 5 ? (
                <Button icon={<UploadOutlined />}>Upload Images</Button>
              ) : null}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeList;
