import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  CircularProgress,
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
import { Breadcrumb } from "../../../components";

export default function ProductListPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [rows, setRows] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [openImgData, setOpenImgData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [updateProductId, setUpdateProductId] = useState("");

  const columns = [
    {
      id: "sku",
      label: "SKU",
      minWidth: 80,
      align: "left",
    },
    {
      id: "image",
      label: "Image",
      minWidth: 100,
      format: (value, name) => (
        <Avatar
          src={imageBasePath + "/" + value}
          alt={name}
          className="border-radius-4"
          style={{ cursor: "pointer", width: "58px" }}
          onClick={() => openImgHandler({ image: value, name: name })}
        />
      ),
    },
    {
      id: "name",
      label: "Title",
      minWidth: 100,
      align: "center",
    },
    { id: "totalSell", align: "center", label: "Total Sale", minWidth: 80 },
    {
      id: "sale",
      label: "Sale",
      minWidth: 80,
      align: "center",
    },
    { id: "stockAlert", align: "center", label: "Stock Alert", minWidth: 80 },
    {
      id: "stock",
      label: "Stock",
      minWidth: 220,
      format: (value) => {
        if (value?.isVariant) {
          return value?.variations.map((variant, idx) => {
            return (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <p style={{ margin: 0 }}>{`${variant?.attributeOpts
                    .map((i) => i?.name)
                    .join("-")} (${variant?.stock})`}</p>
                </Box>
                <Box>
                  <TextField
                    type="number"
                    inputProps={{ min: 0 }}
                    onKeyPress={(event) => {
                      if (event?.key === "-" || event?.key === "+") {
                        event.preventDefault();
                      }
                    }}
                    variant="outlined"
                    style={{ width: "80px" }}
                    className="my-1"
                    size="small"
                    value={variant?.stock}
                    onChange={(e) => {
                      setDataList(
                        dataList.map((i) => {
                          if (i?._id === value?._id) {
                            let storeVariation = [...i?.variations];
                            storeVariation[idx].stock = e.target.value;
                            return {
                              ...i,
                              variations: storeVariation,
                            };
                          } else {
                            return i;
                          }
                        })
                      );
                    }}
                  />
                </Box>
              </Box>
            );
          });
        } else {
          return (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <p style={{ margin: 0 }}>{value?.nonVariation?.stock || 0}</p>
              </Box>
              <Box>
                <TextField
                  type="number"
                  inputProps={{ min: 0 }}
                  onKeyPress={(event) => {
                    if (event?.key === "-" || event?.key === "+") {
                      event.preventDefault();
                    }
                  }}
                  variant="outlined"
                  style={{ width: "80px" }}
                  size="small"
                  value={value?.nonVariation?.stock}
                  onChange={(e) => {
                    setDataList(
                      dataList.map((i) => {
                        return i?._id === value?._id
                          ? {
                              ...i,
                              nonVariation: {
                                stock: e.target.value,
                              },
                            }
                          : i;
                      })
                    );
                  }}
                />
              </Box>
            </Box>
          );
        }
      },
    },
    {
      id: "action",
      label: "Action",
      align: "center",
      minWidth: 140,
      format: (value) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => updateProductStockHandler(value?._id)}
          disabled={isLoading}
        >
          {isBtnLoading && value?._id === updateProductId ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Update"
          )}
        </Button>
      ),
    },
  ];

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

  useEffect(() => {
    let fetchData = async () => {
      try {
        setIsLoading(true);
        let res = await axios.get(
          `/product/stock-alert-products?page=${page + 1}&limit=${rowsPerPage}`
        );

        if (res?.data?.data) {
          setTotalData(res?.data?.metaData?.totalData);
          setDataList(res?.data?.data.map((i) => ({ ...i, checkStatus: false })));
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(err?.response?.data?.message);
      }
    };

    fetchData();
  }, [page, rowsPerPage]);

  useEffect(() => {
    if (dataList.length > 0) {
      let dataArray = [];
      for (let data of dataList) {
        dataArray.push({
          _id: data?._id,
          sku: data?.sku,
          image: data?.galleryImage[0],
          name: data?.name,
          category: data?.categories,
          totalSell: data?.totalSell || 0,
          sale: data?.sellingPrice,
          stockAlert: data?.stockAlert,
          stock: {
            _id: data?._id,
            isVariant: data?.isVariant,
            variations: data?.variations,
            nonVariation: data?.nonVariation,
          },
          action: {
            slug: data?.slug,
            _id: data?._id,
          },
        });
      }
      setRows(dataArray);
    } else {
      setRows([]);
    }
  }, [dataList]);

  const closeModalHandler = () => {
    setIsOpenModal(false);
    setOpenImgData(null);
  };

  const openImgHandler = (data) => {
    setIsOpenModal(true);
    setOpenImgData(data);
  };

  const updateProductStockHandler = async (productId) => {
    setUpdateProductId(productId);
    setIsBtnLoading(true);
    let productData = dataList.filter((i) => i?._id === productId)[0];
    let obj = {
      isVariant: productData?.isVariant,
      nonVariationStock: productData?.nonVariation?.stock,
      variations: productData?.variations.map((data) => ({
        variantId: data?._id,
        stock: data?.stock,
      })),
    };
    try {
      let res = await axios.patch(`/product/single-product-stock-update/${productId}`, obj);
      console.log("res: ", res);
      setUpdateProductId("");
      setIsBtnLoading(false);
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (err) {
      setUpdateProductId("");
      setIsBtnLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Stock Alert Products" }]} />
      </div>
      <Card className="border-radius-0 mx-8">
        <CardHeader title="Update Stock Alert Products" />
      </Card>
      <Card className="border-radius-0 mx-8">
        {!isLoading ? (
          <div className="w-full overflow-hidden px-2">
            {rows.length > 0 && errorMsg === "" ? (
              <>
                {" "}
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
                          <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                            {columns.map((column) => {
                              const value = row[column.id];
                              return (
                                <TableCell key={column.id} align={column.align}>
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
      </SimpleModal>
    </div>
  );
}
