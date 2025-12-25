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
  Divider,
  InputLabel,
  MenuItem,
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
  const [supplierId, setSupplierId] = useState("");
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

  const priceHandler = (value, productId, variationId, isVariant) => {
    if (isVariant) {
      setDataList(
        dataList.map((data) => {
          if (data?._id === productId) {
            data.variations.map((variant) => {
              if (variant?._id === variationId) {
                if (Number(value) <= 0 || !value) {
                  variant.price = "";
                  // variant.qty = "";
                  variant.subTotal = "";
                } else {
                  variant.price = Number(value);
                  variant.qty = variant.qty || 1;
                  variant.subTotal = Number(value) * variant.qty;
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
            if (Number(value) <= 0 || !value) {
              data.nonVariation.price = "";
              data.nonVariation.subTotal = "";
            } else {
              data.nonVariation.price = Number(value);
              data.nonVariation.qty = data.nonVariation.qty || 1;
              data.nonVariation.subTotal = Number(value) * data.nonVariation.qty;
            }
          }
          return data;
        })
      );
    }
  };

  const qtyHandler = (value, productId, variationId, isVariant) => {
    if (isVariant) {
      setDataList(
        dataList.map((data) => {
          if (data?._id === productId) {
            data.variations.map((variant) => {
              if (variant?._id === variationId) {
                if (Number(value) < 0 || !value) {
                  // variant.price = "";
                  variant.qty = "";
                  // variant.subTotal = "";
                } else {
                  variant.price = variant.price || 0;
                  variant.qty = Number(value);
                  variant.subTotal = variant.price * Number(value);
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
              data.nonVariation.qty = "";
              // data.nonVariation.subTotal = "";
            } else {
              data.nonVariation.price = data.nonVariation.price || 0;
              data.nonVariation.qty = Number(value);
              data.nonVariation.subTotal = data.nonVariation.price * Number(value);
            }
          }
          return data;
        })
      );
    }
  };

  const subTotalHandler = (value, productId, variationId, isVariant) => {
    if (isVariant) {
      setDataList(
        dataList.map((data) => {
          if (data?._id === productId) {
            data.variations.map((variant) => {
              if (variant?._id === variationId) {
                if (Number(value) < 0 || !value) {
                  variant.price = "";
                  variant.subTotal = "";
                } else {
                  variant.price = (Number(value) / variant.qty).toFixed(2);
                  variant.qty = variant.qty || 1;
                  variant.subTotal = Number(value);
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
              data.nonVariation.price = "";
              data.nonVariation.subTotal = "";
            } else {
              data.nonVariation.price = (Number(value) / data.nonVariation.qty).toFixed(2);
              data.nonVariation.qty = data.nonVariation.qty || 1;
              data.nonVariation.subTotal = Number(value);
            }
          }
          return data;
        })
      );
    }
  };

  const removeProductHandler = (productId, variationId, isVariant) => {
    if (isVariant) {
      let storeDataList = [];

      dataList.forEach((data) => {
        if (data?._id === productId) {
          let storeVariants = data.variations.filter((variant) => variant?._id !== variationId);
          data.variations = storeVariants;

          if (storeVariants.length > 0) {
            storeDataList.push(data);
          }
        } else {
          storeDataList.push(data);
        }
      });
      setDataList(storeDataList);
    } else {
      setDataList(dataList.filter((data) => data?._id !== productId));
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
    let isFillComplete = true;
    let totalBill = 0;

    dataList.forEach((data) => {
      if (data.isVariant) {
        data.variations.forEach((variant) => {
          if (
            variant?.qty === undefined ||
            variant?.qty === "" ||
            variant?.price === undefined ||
            variant?.price === "" ||
            variant?.subTotal === undefined ||
            variant?.subTotal === ""
          ) {
            isFillComplete = false;
          }
          productList.push({
            productId: data?._id,
            isVariant: data?.isVariant,
            variationId: variant?._id,
            quantity: variant?.qty,
            price: variant?.price,
          });
          totalBill += Number(variant?.qty) * Number(variant?.price);
        });
      } else {
        if (
          data?.nonVariation?.qty === undefined ||
          data?.nonVariation?.qty === "" ||
          data?.nonVariation?.price === undefined ||
          data?.nonVariation?.price === "" ||
          data?.nonVariation?.subTotal === undefined ||
          data?.nonVariation?.subTotal === ""
        ) {
          isFillComplete = false;
        }
        productList.push({
          productId: data?._id,
          isVariant: data?.isVariant,
          variationId: null,
          quantity: data?.nonVariation?.qty,
          price: data?.nonVariation?.price,
        });
        totalBill += Number(data?.nonVariation?.qty) * Number(data?.nonVariation?.price);
      }
    });

    if (!supplierId) {
      openNotificationWithIcon("supplier must be select", "error");
      setIsLoading(false);
      return;
    }
    if (!isFillComplete) {
      openNotificationWithIcon("product field couldn't be empty", "error");
      setIsLoading(false);
      return;
    }
    if (dataList.length === 0) {
      openNotificationWithIcon("select minimum one product", "error");
      setIsLoading(false);
      return;
    }

    let obj = {
      supplierId: supplierId,
      totalBill: totalBill,
      adminNote: note,
      document: baseImg,
      products: productList,
    };

    try {
      let res = await axios.post("/purchase/create", obj);
      if (res?.data?.success) {
        setExistProductIds([]);
        setDataList([]);
        setSupplierId("");
        setNote("");
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
        <Breadcrumb routeSegments={[{ name: "Create Purchase" }]} />
      </div>

      <Grid container>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardHeader title="Add Purchase Details" />

            <form className="px-4 py-6" onSubmit={formSubmitHandler}>
              <Grid container spacing={3}>
                <Grid item sm={6} xs={12}>
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
                </Grid>

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
                              Stock
                            </TableCell>
                            <TableCell className="min-w-100" align="center">
                              Price
                            </TableCell>
                            <TableCell className="min-w-100" align="center">
                              Qty
                            </TableCell>
                            <TableCell className="min-w-100" align="center">
                              Subtotal
                            </TableCell>
                            <TableCell className="min-w-100" align="center">
                              Action
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
                                    <TableCell className="capitalize" align="center">
                                      {variant?.attributeOpts.map((i) => i?.name)?.join("-")}
                                    </TableCell>
                                    <TableCell className="capitalize" align="center">
                                      {variant?.stock > 0 ? (
                                        variant?.stock
                                      ) : (
                                        <small className="rounded bg-error text-white px-2 py-2">
                                          {variant?.stock}
                                        </small>
                                      )}
                                    </TableCell>
                                    <TableCell className="capitalize" align="center">
                                      <TextField
                                        type="number"
                                        inputProps={{ min: 0 }}
                                        onKeyPress={(event) => {
                                          if (event?.key === "-" || event?.key === "+") {
                                            event.preventDefault();
                                          }
                                        }}
                                        label=""
                                        variant="outlined"
                                        style={{ minWidth: "80px" }}
                                        size="small"
                                        value={variant?.price}
                                        onChange={(e) =>
                                          priceHandler(
                                            e.target.value,
                                            data?._id,
                                            variant?._id,
                                            true
                                          )
                                        }
                                      />
                                    </TableCell>
                                    <TableCell className="capitalize" align="center">
                                      <TextField
                                        type="number"
                                        inputProps={{ min: 1 }}
                                        onKeyPress={(event) => {
                                          if (event?.key === "-" || event?.key === "+") {
                                            event.preventDefault();
                                          }
                                        }}
                                        label=""
                                        variant="outlined"
                                        style={{ minWidth: "80px" }}
                                        size="small"
                                        value={variant?.qty}
                                        onChange={(e) =>
                                          qtyHandler(e.target.value, data?._id, variant?._id, true)
                                        }
                                      />
                                    </TableCell>
                                    <TableCell className="capitalize" align="center">
                                      <TextField
                                        type="number"
                                        inputProps={{ min: 0 }}
                                        onKeyPress={(event) => {
                                          if (event?.key === "-" || event?.key === "+") {
                                            event.preventDefault();
                                          }
                                        }}
                                        label=""
                                        variant="outlined"
                                        style={{ minWidth: "80px" }}
                                        size="small"
                                        value={variant?.subTotal}
                                        onChange={(e) =>
                                          subTotalHandler(
                                            e.target.value,
                                            data?._id,
                                            variant?._id,
                                            true
                                          )
                                        }
                                      />
                                    </TableCell>
                                    <TableCell className="capitalize" align="center">
                                      <IconButton
                                        onClick={() =>
                                          removeProductHandler(data?._id, variant?._id, true)
                                        }
                                        style={{ backgroundColor: "#ebedec", color: "red" }}
                                      >
                                        <RxCross2
                                          style={{
                                            fontSize: "16px",
                                            color: "red",
                                          }}
                                        />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell className="capitalize" align="center">
                                    {data?.sku}
                                  </TableCell>
                                  <TableCell className="capitalize" align="center">
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
                                  <TableCell className="capitalize" align="center">
                                    {data?.name}
                                  </TableCell>
                                  <TableCell className="capitalize" align="center">
                                    ---
                                  </TableCell>
                                  <TableCell className="capitalize" align="center">
                                    {data?.nonVariation?.stock > 0 ? (
                                      data?.nonVariation?.stock
                                    ) : (
                                      <small className="rounded bg-error text-white px-2 py-2">
                                        {data?.nonVariation?.stock}
                                      </small>
                                    )}
                                  </TableCell>
                                  <TableCell className="capitalize" align="center">
                                    <TextField
                                      type="number"
                                      inputProps={{ min: 0 }}
                                      onKeyPress={(event) => {
                                        if (event?.key === "-" || event?.key === "+") {
                                          event.preventDefault();
                                        }
                                      }}
                                      label=""
                                      variant="outlined"
                                      style={{ minWidth: "80px" }}
                                      size="small"
                                      value={data?.nonVariation?.price}
                                      onChange={(e) =>
                                        priceHandler(e.target.value, data?._id, null, false)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell className="capitalize" align="center">
                                    <TextField
                                      type="number"
                                      inputProps={{ min: 1 }}
                                      onKeyPress={(event) => {
                                        if (event?.key === "-" || event?.key === "+") {
                                          event.preventDefault();
                                        }
                                      }}
                                      label=""
                                      variant="outlined"
                                      style={{ minWidth: "80px" }}
                                      size="small"
                                      value={data?.nonVariation?.qty}
                                      onChange={(e) =>
                                        qtyHandler(e.target.value, data?._id, null, false)
                                      }
                                    />
                                  </TableCell>{" "}
                                  <TableCell className="capitalize" align="center">
                                    <TextField
                                      type="number"
                                      inputProps={{ min: 0 }}
                                      onKeyPress={(event) => {
                                        if (event?.key === "-" || event?.key === "+") {
                                          event.preventDefault();
                                        }
                                      }}
                                      label=""
                                      variant="outlined"
                                      style={{ minWidth: "80px" }}
                                      size="small"
                                      value={data?.nonVariation?.subTotal}
                                      onChange={(e) =>
                                        subTotalHandler(e.target.value, data?._id, null, false)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell className="capitalize" align="center">
                                    <IconButton
                                      onClick={() => removeProductHandler(data?._id, null, false)}
                                      style={{ backgroundColor: "#ebedec", color: "red" }}
                                    >
                                      <RxCross2
                                        style={{
                                          fontSize: "16px",
                                          color: "red",
                                        }}
                                      />
                                    </IconButton>
                                  </TableCell>
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
                    <Upload listType="picture-card" fileList={fileList} onChange={imageHandler}>
                      {fileList.length >= 1 ? null : (
                        <span>
                          <Icon style={{ color: "gray" }}>photo_size_select_actual</Icon>
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
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Add Purchased"}
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
