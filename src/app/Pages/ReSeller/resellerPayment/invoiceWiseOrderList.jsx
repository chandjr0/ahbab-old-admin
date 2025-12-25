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
  const { id } = useParams();

  const rowperPage = localStorage.getItem("rowPerPage");

  const [page, setPage] = useState(null);
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
  const [invoiceInfo, setInvoiceInfo] = useState({});
  const [totalOrderQty, setTotalOrderQty] = useState(0);
  const [totalDeliveredOrder, setTotalDeliveredOrder] = useState(0);
  const [totalReturnedOrder, setTotalReturnedOrder] = useState(0);
  const [totalProductPrice, setTotalProductPrice] = useState();
  const [totalCommisionPrice, setTotalCommisionPrice] = useState();
  const [deliveredProductPrice, setDeliveredProductPrice] = useState();
  const [deliveredCommisionPrice, setDeliveredCommisionPrice] = useState();
  const [returnedProductPrice, setReturnedProductPrice] = useState();
  const [returnedCommisionPrice, setReturnedCommisionPrice] = useState();

  //Function for total product price
  const calculateProductPrice = (productList, setPrice) => {
    const totalPriceArry = productList.map(
      (data) => data.customerCharge.afterDiscountTotalPrice
    );
    const totalPriceValue = totalPriceArry.reduce(
      (total, price) => total + price,
      0
    );
    setPrice(totalPriceValue);
  };

  //Function for total commision price
  const calculateCommisionPrice = (productList, setPrice) => {
    const totalPriceArry = productList.map(
      (data) => data.resellerInfo.profitMoney
    );
    const totalPriceValue = totalPriceArry.reduce(
      (total, price) => total + price,
      0
    );
    setPrice(Math.round(totalPriceValue));
  };

  //Function for total courier price
  const calculateCourierPrice = (productList, setPrice) => {
    const totalCourierArry = productList.map(
      (data) => data.customerCharge.deliveryCharge
    );
    const totalCourierValue = totalCourierArry.reduce(
      (total, price) => total + price,
      0
    );
    setPrice(Math.round(totalCourierValue));
  };

  // Function for delivered product and commision price
  const countDeliveredProductAndCommisionPrice = () => {
    const deliveredProductList = dataList?.filter(
      (item) =>
        item.orderStatus[item.orderStatus.length - 1].status === "DELIVERED"
    );

    if (deliveredProductList) {
      calculateProductPrice(deliveredProductList, setDeliveredProductPrice);
      calculateCommisionPrice(deliveredProductList, setDeliveredCommisionPrice);
    }
  };

  // Function for returned product and commision price
  const countReturnedProductAndCommisionPrice = () => {
    const returnedProductList = dataList?.filter(
      (item) =>
        item.orderStatus[item.orderStatus.length - 1].status === "RETURNED"
    );

     if(returnedProductList) {
      calculateProductPrice(returnedProductList, setReturnedProductPrice);
      calculateCourierPrice(returnedProductList, setReturnedCommisionPrice);
    }
  };

  //Call on initial load
  useEffect(() => {
    dataList && calculateProductPrice(dataList, setTotalProductPrice);
    dataList && calculateCommisionPrice(dataList, setTotalCommisionPrice);
    countDeliveredProductAndCommisionPrice();
    countReturnedProductAndCommisionPrice();
  }, [dataList]);

  console.log(
    "totoal",
    totalProductPrice,
    deliveredCommisionPrice,
    deliveredProductPrice
  );

  useEffect(() => {
    let fetchData = async () => {
      try {
        let res = null;
        setIsLoading(true);
        res = await axios.post(`/reseller-payment/admin/invoice-view/${id}`, {
          value: "",
        });

        if (res) {
          setTotalData(res?.data?.metaData?.totalData);
          setDataList(
            res?.data?.data.orderData?.map((i) => {
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
          setInvoiceInfo(res?.data?.data);
          res.data.data.orderData.map((item, index) => {
            if (item?.orderStatus?.length) {
              if (
                item?.orderStatus[item?.orderStatus?.length - 1]?.status ==
                "DELIVERED"
              ) {
                setTotalDeliveredOrder((prev) => prev + 1);
              } else if (
                item?.orderStatus[item?.orderStatus?.length - 1]?.status ==
                "RETURNED"
              ) {
                setTotalReturnedOrder((prev) => prev + 1);
              }
            }
          });
          setTotalOrderQty(res?.data?.data?.orderData?.length);
        }

        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

      setRows(dataArray);
    } else {
      setRows([]);
    }
  }, [dataList]);

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

  return (
    <div className="m-sm-30">
      <div>
        <div className="flex item-center">
          <div className="mb-5" style={{ width: "550px" }}>
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
                Reseller Information
              </h5>
            </div>
            <div style={{ border: "1px solid #111930", borderRadius: "5px" }}>
              <div className="flex ml-3">
                <div
                  style={{ width: "550px", marginTop: "20px" }}
                  className="flex items-center justify-between "
                >
                  <div
                    style={{ width: "200px" }}
                    className="flex items-center justify-between"
                  >
                    <div className="text-right">
                      <p style={{ marginBottom: "2px" }}>SERIAL :</p>
                      <p style={{ marginBottom: "2px" }}>Name :</p>
                      <p style={{ marginBottom: "2px" }}>Phone :</p>
                      <p style={{ marginBottom: "2px" }}>Email : </p>
                      <p style={{ marginBottom: "2px" }}>Total Order Qty :</p>
                      <p style={{ marginBottom: "2px" }}>
                        Total Delivered Order :
                      </p>
                      <p style={{ marginBottom: "2px" }}>
                        Total Returned Order :
                      </p>
                      <p style={{ marginBottom: "2px" }}>Grand Profit :</p>
                    </div>
                  </div>
                  <div style={{ width: "320px" }}>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {id}
                    </p>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {invoiceInfo?.reseller?.name}
                    </p>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {invoiceInfo?.reseller?.phone}
                    </p>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {invoiceInfo?.reseller?.email}
                    </p>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {`${totalOrderQty} [ Value: ${totalProductPrice}, Profit: ${totalCommisionPrice} ]`}
                    </p>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {`${totalDeliveredOrder} [ Value: ${deliveredProductPrice}, Profit: ${deliveredCommisionPrice} ]`}
                    </p>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {`${totalReturnedOrder} [ Value: ${returnedProductPrice}, Deduct profit: ${returnedCommisionPrice} ]`}
                    </p>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {invoiceInfo?.paymentInfo?.totalGrandProfit} TK
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="mb-5 ml-5" style={{ width: "450px" }}>
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
              <h5 style={{ color: "#fff", padding: "5px" }}>Documents</h5>
            </div>
            <div style={{ border: "1px solid #111930", borderRadius: "5px" }}>
              <div className="flex ml-3">
                <div
                  style={{ width: "450px", marginTop: "20px" }}
                  className="flex items-center justify-between "
                >
                  <div
                    style={{ width: "100px" }}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p style={{ marginBottom: "2px" }}>DESCRIPTION</p>
                      <p style={{ marginBottom: "2px" }}>FILES</p>
                    </div>
                    <div>
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
                      {invoiceInfo?.details}
                    </p>
                    <div className="">
                      {invoiceInfo?.files?.length > 0 ? (
                        <div>
                           <p>Click To View</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      <Card className="border-radius-0 ">
        <CardHeader className="text-center uppercase" title={`Order List`} />

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
                {/* <TablePagination
                  rowsPerPageOptions={[10, 25, 100]}
                  component="div"
                  count={totalData} // total data
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                /> */}
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
      {/* <Modal
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
      </Modal> */}
    </div>
  );
}
