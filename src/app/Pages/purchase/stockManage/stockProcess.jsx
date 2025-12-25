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
  CircularProgress,
  InputLabel,
  Icon,
} from "@material-ui/core";
import axios from "../../../../axios";
import { Upload } from "antd";
import { useHistory } from "react-router-dom";
import SimpleModal from "../../../Shared/SimpleModal/SimpleModal";
import { notification } from "antd";
import imageBasePath from "../../../../config";
import { FaExclamationTriangle } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";
import ProductList from "../../../Shared/productList/productList";
import { RxCross2 } from "react-icons/rx";
import { getBase64 } from "../../../util/getBase64";

const PurchaseCreate = () => {
    
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openImgData, setOpenImgData] = useState(null);
  const [selectedFile, setSelectedFile] = useState();
  const [fileList, setFileList] = useState([]);
  const [fileError, setFileError] = useState("");
  const [isShowProductList, setIsShowProductList] = useState(false);
  const [existProductIds, setExistProductIds] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    let fetchData = async () => {
      let res = await axios.get("/supplier/fetch-all");
      setSupplierOptions(res?.data?.data);
    };
    fetchData();
  }, []);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const closeModalHandler = () => {
    setDeleteId(false);
    setIsOpenModal(false);
    setOpenImgData(null);
  };

  const openImgHandler = (data) => {
    setIsOpenModal(true);
    setOpenImgData(data);
  };

  const addSelectedProducts = (products) => {
    let modifyProducts = products.map((product) => {
      let storeProduct = { ...product };

      if (storeProduct?.isVariant) {
        let storeVariation = storeProduct?.variations.map((data) => {
          return {
            ...data,
            qty: undefined,
            price: undefined,
            subTotal: undefined,
          };
        });

        storeProduct.variations = storeVariation;
      } else {
        storeProduct.nonVariation = {
          ...storeProduct?.nonVariation,
          qty: undefined,
          price: undefined,
          subTotal: undefined,
        };
      }

      return storeProduct;
    });
    setDataList([...modifyProducts, ...dataList]);
  };

  useEffect(() => {
    setExistProductIds(dataList.map((data) => data?._id));
  }, [dataList]);

  const qtyHandler = (value, productId, variationId, isVariant) => {
    if (isVariant) {
      setDataList(
        dataList.map((data) => {
          if (data?._id === productId) {
            data.variations.map((variant) => {
              if (variant?._id === variationId) {
                if (Number(value) < 0 || !value) {
                  //   // variant.price = "";
                  //   variant.stock = 0;
                  //   // variant.subTotal = "";
                  variant["decreaseQty"] = 0;
                } else {
                  //   variant.stock = (variant.stock - Number(value)) ;
                  variant["decreaseQty"] = Number(value);
                }
              }
              return variant;
            });
          }
          return data;
        })
      );
    } else {
      setDataList(
        dataList.map((data) => {
          if (data?._id === productId) {
            if (Number(value) < 0 || !value) {
              // data.nonVariation.price = "";
              data.nonVariation["decreaseQty"] = 0;
              // data.nonVariation.subTotal = "";
            } else {
              data.nonVariation["decreaseQty"] = Number(value);
            }
          }
          return data;
        })
      );
    }
  };

  const formSubmitHandler = async (event) => {
    event.preventDefault();
    if (fileError) return;
    let baseImg = "";
    if (selectedFile) {
      baseImg = await getBase64(selectedFile);
    }

    setIsLoading(true);

    let productList = [];

    dataList.forEach((data) => {
      if (data.isVariant) {
        data.variations.forEach((variant) => {
          if (variant.decreaseQty > 0) {
            productList.push({
              productId: data?._id,
              isVariant: data?.isVariant,
              variationId: variant?._id,
              quantity: variant?.decreaseQty,
              variationName: variant?.attributeOpts
                .map((i) => i?.name)
                ?.join("-"),
            });
          }
        });
      } else {
        productList.push({
          productId: data?._id,
          isVariant: data?.isVariant,
          variationId: null,
          quantity: data?.nonVariation?.decreaseQty,
          variationName: "",
        });
      }
    });

    let obj = {
      note: note,
      document: baseImg,
      products: productList,
    };

    try {
      let res = await axios.post("/stock-adjust/create", obj);
      if (res?.data?.success) {
        window.location.reload()
        openNotificationWithIcon(res?.data?.message, "success");
      } else {
        openNotificationWithIcon(res?.data?.message, "error");
      }

      setFileList([]);
      setSelectedFile();
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  const imageHandler = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (
      newFileList[0]?.originFileObj.type === "image/jpeg" ||
      newFileList[0]?.originFileObj.type === "image/jpg" ||
      newFileList[0]?.originFileObj.type === "image/png" ||
      newFileList[0]?.originFileObj.type === "image/webp"
    ) {
      setSelectedFile(newFileList[0]?.originFileObj);
      setFileError("");
    } else {
      setFileError("Image must be (jpeg, jpg or png) format!");
    }
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Manage Stock" }]} />
      </div>

      <Grid container>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardHeader title="Stock Manage" />
            <form className="px-4 py-6" onSubmit={formSubmitHandler}>
              <Grid container spacing={3}>
                {/* <Grid item sm={6} xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <InputLabel className="mb-2 text-black">Supplier</InputLabel>
                    <TextField
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      select
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                    >
                      <MenuItem value="" disabled>
                        --select--
                      </MenuItem>
                      {supplierOptions.map((data) => (
                        <MenuItem
                          value={data?._id}
                          key={data?._id}
                        >{`${data?.name} (${data?.phone})`}</MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Grid> */}

                <Grid item xs={12} className="mb-4">
                  {isShowProductList ? (
                    <Button
                      variant="contained"
                      className="bg-error"
                      onClick={() => setIsShowProductList(false)}
                      startIcon={<RxCross2 />}
                    >
                      Close Product List
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="secondary"
                      className="text-white"
                      onClick={() => setIsShowProductList(true)}
                      startIcon={<IoMdAddCircle />}
                    >
                      Add More Products
                    </Button>
                  )}
                  {isShowProductList ? (
                    <ProductList
                      addSelectedProducts={addSelectedProducts}
                      existProductIds={existProductIds}
                    />
                  ) : null}
                </Grid>

                <Grid item xs={12}>
                  <div className="w-full overflow-auto py-2">
                    {dataList.length > 0 && (
                      <Table stickyHeader className="whitespace-pre">
                        <TableHead>
                          <TableRow>
                            <TableCell className="min-w-50" align="center">
                              Sku
                            </TableCell>
                            <TableCell className="min-w-100" align="center">
                              Image
                            </TableCell>
                            <TableCell className="min-w-100" align="center">
                              Name
                            </TableCell>
                            <TableCell className="min-w-100" align="center">
                              Variation
                            </TableCell>
                            <TableCell className="min-w-100" align="center">
                              Current Stock
                            </TableCell>
                            {/* <TableCell className="min-w-100" align="center">
                              New Stock
                            </TableCell> */}
                            <TableCell className="min-w-100" align="center">
                              Price
                            </TableCell>
                            <TableCell className="min-w-100" align="center">
                              Stock Decrease
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dataList.map((data) => (
                            <React.Fragment key={data?._id}>
                              {data?.isVariant ? (
                                data?.variations.length > 0 &&
                                data?.variations.map((variant, idx) => (
                                  <TableRow key={idx}>
                                    {idx === 0 && (
                                      <>
                                        <TableCell
                                          className="capitalize"
                                          align="center"
                                          rowSpan={data?.variations.length}
                                        >
                                          {data?.sku}
                                        </TableCell>
                                        <TableCell
                                          className="capitalize"
                                          align="center"
                                          rowSpan={data?.variations.length}
                                        >
                                          <Box
                                            sx={{
                                              display: "flex",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <Avatar
                                              className="border-radius-4"
                                              style={{
                                                cursor: "pointer",
                                                width: "58px",
                                              }}
                                              src=""
                                              alt="im"
                                            />
                                          </Box>
                                        </TableCell>
                                        <TableCell
                                          className="capitalize"
                                          align="center"
                                          rowSpan={data?.variations.length}
                                        >
                                          {data?.name}
                                        </TableCell>
                                      </>
                                    )}
                                    <TableCell
                                      className="capitalize"
                                      align="center"
                                    >
                                      {variant?.attributeOpts
                                        .map((i) => i?.name)
                                        ?.join("-")}
                                    </TableCell>
                                    <TableCell
                                      className="capitalize"
                                      align="center"
                                    >
                                      {variant?.stock > 0 ? (
                                        variant?.stock
                                      ) : (
                                        <small className="rounded bg-error text-white px-2 py-2">
                                          {variant?.stock}
                                        </small>
                                      )}
                                    </TableCell>

                                    <TableCell
                                      className="capitalize"
                                      align="center"
                                    >
                                      {variant?.sellingPrice}
                                    </TableCell>
                                    <TableCell
                                      className="capitalize"
                                      align="center"
                                    >
                                      <TextField
                                        type="number"
                                        inputProps={{
                                          min: 1,
                                          max: variant?.stock,
                                        }}
                                        // onKeyPress={(event) => {
                                        //   if (event?.key === "-" || event?.key === "+") {
                                        //     event.preventDefault();
                                        //   }
                                        // }}
                                        label=""
                                        variant="outlined"
                                        style={{ width: "150px" }}
                                        size="small"
                                        value={variant?.qty}
                                        onChange={(e) =>
                                          qtyHandler(
                                            e.target.value,
                                            data?._id,
                                            variant?._id,
                                            true
                                          )
                                        }
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    {data?.sku}
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <Avatar
                                        className="border-radius-4"
                                        style={{
                                          cursor: "pointer",
                                          width: "58px",
                                        }}
                                        src=""
                                        alt="im"
                                      />
                                    </Box>
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    {data?.name}
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    ---
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    {data?.nonVariation?.stock > 0 ? (
                                      data?.nonVariation?.stock
                                    ) : (
                                      <small className="rounded bg-error text-white px-2 py-2">
                                        {data?.nonVariation?.stock}
                                      </small>
                                    )}
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    {data?.nonVariation?.sellingPrice}
                                  </TableCell>
                                  <TableCell
                                    className="capitalize"
                                    align="center"
                                  >
                                    <TextField
                                      type="number"
                                      inputProps={{ min: 1 }}
                                      onKeyPress={(event) => {
                                        if (
                                          event?.key === "-" ||
                                          event?.key === "+"
                                        ) {
                                          event.preventDefault();
                                        }
                                      }}
                                      label=""
                                      variant="outlined"
                                      style={{ minWidth: "80px" }}
                                      size="small"
                                      value={data?.nonVariation?.qty}
                                      onChange={(e) =>
                                        qtyHandler(
                                          e.target.value,
                                          data?._id,
                                          null,
                                          false
                                        )
                                      }
                                    />
                                  </TableCell>{" "}
                                </TableRow>
                              )}
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </Grid>

                <Grid item sm={6} xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <InputLabel className="mb-2 text-black">Note</InputLabel>
                    <TextField
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      multiline
                      minRows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <InputLabel className="mb-2 text-black">
                      {" "}
                      Upload Image<span style={{ color: "red" }}>*</span>
                    </InputLabel>
                    <Upload
                      listType="picture-card"
                      fileList={fileList}
                      onChange={imageHandler}
                    >
                      {fileList.length >= 1 ? null : (
                        <span>
                          <Icon style={{ color: "gray" }}>
                            photo_size_select_actual
                          </Icon>
                        </span>
                      )}
                    </Upload>
                  </Box>
                </Grid>
              </Grid>

              <Button
                className="mb-4 mt-2 px-12"
                variant="contained"
                color="primary"
                type="submit"
                style={{ marginRight: "20px" }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Update"
                )}
              </Button>
            </form>
          </Card>
        </Grid>
      </Grid>
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
              <Button
                variant="outlined"
                color="primary"
                className="mr-4"
                //    onClick={deleteHandler}
              >
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
};

export default PurchaseCreate;
