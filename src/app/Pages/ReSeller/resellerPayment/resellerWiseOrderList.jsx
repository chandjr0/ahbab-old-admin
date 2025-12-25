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
import Spinner from "../../../Shared/Spinner/Spinner";
import { notification } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import { Breadcrumb } from "../../../components";
import moment from "moment";
import { FaEye } from "react-icons/fa";

import { CopyToClipboard } from "react-copy-to-clipboard";
import MySnackbarContentWrapper from "../../../Shared/alert/alert";
import { FaRegCopy } from "react-icons/fa";
import "date-fns";
import { Modal, Form, Input, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import { useDebounce } from "../../../hooks/useDebounce";
import { useParams } from "react-router-dom";

export default function OrderList() {
  const history = useHistory();
  const { id, name } = useParams();

  const rowperPage = localStorage.getItem("rowPerPage");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(
    rowperPage ? Number(rowperPage) : 10
  );

  const [searchValue, setSearchValue] = useState("");
  const searchQuery = useDebounce(searchValue, 1500);
  const [totalData, setTotalData] = useState(0);
  const [rows, setRows] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [productsData, setProductsData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState(null);
  const [allChecked, setAllChecked] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [copyValue, setCopyValue] = useState("");
  const [isCopy, setIsCopy] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    let fetchData = async () => {
      try {
        let res = null;
        setIsLoading(true);
        res = await axios.get(
          `/reseller-payment/admin/pending-resellers-orders/${id}?page=${page+1}&limit=${rowsPerPage}`
        );

        if (res) {
          setTotalData(res?.data?.metaData?.totalData);
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
  }, [page,rowsPerPage]);

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

  const handleClick = (event, value) => {
    // setActionValue(value);
    // setAnchorEl(event.currentTarget);
    window.open(`/reseller-order-view/${value?.serialId}`, "_blank");
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
        setIsReset(!isReset);
      }

      setIsOpenModal(false);
      setOrderStatusData(null);
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (err) {
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
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
                src={`${imageBasePath}/${value[0]?.isVariant? value[0]?.variation?.images?.length? value[0]?.variation?.images[0] :value[0]?.product?.galleryImage[0] : value[0]?.product?.galleryImage[0] || ""}`}
                alt={value[0]?.name}
                className="border-radius-4"
                style={{ cursor: "pointer", width: "58px" }}
                // onClick={() => showProductsDetails(value)}
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
              value={value?.status[value?.status.length - 1].status}
              onChange={(e) =>
                orderStatusChangeHandler(value?._id, e.target.value)
              }
            >
              <MenuItem value="PENDING"> Pending </MenuItem>
              <MenuItem value="HOLD"> Hold </MenuItem>
              <MenuItem value="CONFIRM"> Confirmed </MenuItem>
              <MenuItem value="PROCESSING"> Processing </MenuItem>
              <MenuItem value="PICKED"> Stock out </MenuItem>
              <MenuItem value="SHIPPED"> Shipped </MenuItem>
              <MenuItem value="DELIVERED"> Delivered</MenuItem>
              <MenuItem value="CANCELED"> Cancelled </MenuItem>
              <MenuItem value="RETURNED"> Returned </MenuItem>
            </TextField>
          );
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

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleUploadBeforeUpload = (file) => {
    return true;
  };

  const handleUploadCustomRequest = async ({ file, onSuccess, onError }) => {
    setTimeout(() => {
      onSuccess();
      message.success(`${file.name} uploaded successfully`);
    }, 1000);
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFinish = async (values) => {
    const base64ImagesArray = await Promise.all(
      fileList.map(async (file) => await getBase64(file.originFileObj))
    );

    const orderId = dataList.map(item=> item?._id)

    const data = {
      orderIds: orderId,
      files: base64ImagesArray ,
      details: values.description,
    };

    try {
      let res = await axios.post(`/reseller-payment/admin/make-pey-invoice/${id}`,data)
      if(res){
        openNotificationWithIcon(res.data?.message, "success");
        window.location.reload()
      }
    } catch (err) {
       openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  return (
    <div className="m-sm-30">
  
      <Card className="border-radius-0 ">
        <CardHeader
          className="text-center uppercase"
          title={`Order List Of ${name}`}
        />
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
      <Modal
        visible={isOpenModal}
        title="MAKE INVOICE"
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
}
