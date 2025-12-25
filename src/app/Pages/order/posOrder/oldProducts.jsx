import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import React from "react";
import moment from "moment";
import { useState } from "react";
import { useEffect } from "react";
import axios from "../../../../axios";
import CopyToClipboard from "react-copy-to-clipboard";
import { FaRegCopy } from "react-icons/fa";
import MySnackbarContentWrapper from "../../../Shared/alert/alert";
import imageBasePath from "../../../../config";
import SimpleModal from "../../../Shared/SimpleModal/SimpleModal";
import ProductDetails from "../orderList/components/productDetails";
import { Pagination } from "@mui/material";

const OldProducts = ({ customerId }) => {
  const [orderList, setOrderList] = useState([]);
  const [isCopy, setIsCopy] = useState(false);
  const [copyValue, setCopyValue] = useState("");
  // const [dataList, setDataList] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      let res = await axios.get(
        `/admin-order/fetch-all-customer-order/${customerId}?page=${page}&limit=3`
      );
      setTotalPage(res?.data?.metaData?.totalPage);
      setOrderList(res?.data?.data);
    };
    if (customerId) {
      fetchData();
    } else {
      setOrderList([]);
      setTotalPage(0);
      setPage(1);
    }
  }, [customerId, page]);

  const showProductsDetails = (data) => {
    setProductsData(data);
    setIsOpenModal(true);
  };

  const closeModalHandler = () => {
    setIsOpenModal(false);
    setProductsData([]);
  };

  const handleChange = (event, value) => {
    setPage(value);
  };

  return (
    <>
      <Card elevation={3}>
        <CardHeader title="Previous Order's" />
        <CardContent>
          {totalPage > 0 ? (
            <>
              {" "}
              <div
                style={{
                  overflow: "auto",
                }}
              >
                <Table stickyHeader className="whitespace-pre mt-4">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" className="min-w-120">
                        SerialId
                      </TableCell>
                      <TableCell align="center" className="min-w-100">
                        Products
                      </TableCell>
                      <TableCell align="center" className="min-w-120">
                        Customer
                      </TableCell>
                      <TableCell align="center" className="min-w-80">
                        TotalBill
                      </TableCell>
                      <TableCell align="center" className="min-w-80">
                        Due
                      </TableCell>
                      <TableCell align="center" className="min-w-100">
                        Status
                      </TableCell>
                      <TableCell align="center" className="min-w-80">
                        Created
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderList &&
                      orderList.map((data, idx) => (
                        <TableRow key={idx}>
                          <TableCell align="center">
                            <>
                              <CopyToClipboard
                                text={data?.serialId}
                                onCopy={() => {
                                  setCopyValue(data?.serialId);
                                  setIsCopy(true);
                                }}
                              >
                                <p style={{ margin: "0px" }}>
                                  {data?.serialId}
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
                                <small>{moment(data?.createdAt).format("lll")}</small>
                              </p>
                            </>
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Box>
                                <Avatar
                                  // src={imageBasePath + "/" + data?.products[0]?.product?.galleryImage[0]}
                                  src={`${imageBasePath}/${data?.products[0]?.isVariant? data?.products[0]?.variation?.images?.length? data?.products[0]?.variation?.images[0] :data?.products[0]?.product?.galleryImage[0] : data?.products[0]?.product?.galleryImage[0] || ""}`}

                                  alt={'image'}
                                  className="border-radius-4"
                                  style={{ cursor: "pointer", width: "58px" }}
                                  onClick={() => showProductsDetails(data?.products)}
                                />
                              </Box>
                              <Box>
                                <p style={{ margin: "0px" }}>{` X ${data?.products.reduce(function (
                                  prev,
                                  cur
                                ) {
                                  return prev + cur.quantity;
                                },
                                0)}`}</p>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <div>
                              <p style={{ margin: "0px" }}>{data?.deliveryAddress?.name}</p>
                              <p style={{ margin: "0px" }}>
                                <strong>{data?.deliveryAddress?.phone}</strong>
                              </p>
                              <p style={{ margin: "0px" }}>{data?.deliveryAddress?.address}</p>
                            </div>
                          </TableCell>
                          <TableCell align="center">{data?.customerCharge?.totalBill}</TableCell>
                          <TableCell align="center">
                            {data?.customerCharge?.remainingTkPay}
                          </TableCell>
                          <TableCell align="center">
                            <small className="rounded bg-secondary elevation-z3 text-primary px-2 py-2px">
                              {data?.orderStatus[data?.orderStatus.length - 1].status}
                            </small>
                          </TableCell>
                          <TableCell align="center">{data?.createdBy}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 2,
                }}
              >
                <Box>
                  <Pagination count={totalPage} size="small" page={page} onChange={handleChange} />
                </Box>
              </Box>
            </>
          ) : (
            <p className="text-gray text-center my-2">No Previous Order Found</p>
          )}
        </CardContent>
      </Card>
      <SimpleModal isShow={isOpenModal} closeModalHandler={closeModalHandler}>
        {productsData.length > 0 && (
          <ProductDetails productsData={productsData} closeModalHandler={closeModalHandler} />
        )}
      </SimpleModal>
    </>
  );
};

export default OldProducts;
