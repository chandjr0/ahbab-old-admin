import React, { useEffect, useState } from "react";
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
  FormControlLabel,
  Icon,
  CardContent,
} from "@material-ui/core";
import axios from "../../../axios";
import { Upload } from "antd";
import { useHistory, useParams } from "react-router-dom";
import SimpleModal from "../../Shared/SimpleModal/SimpleModal";
import { notification } from "antd";
import imageBasePath from "../../../config";
import { FaExclamationTriangle } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";
import ProductList from "../../Shared/productList/productList";
import { RxCross2 } from "react-icons/rx";
import IOSSwitch from "../../Shared/Forms/iosSwitch";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { RichTextEditor } from "../../components";
import { convertImageToBase64 } from "../../util/convertImageToBase64";

const UpdateCombo = () => {
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Combo name is required")
      .min(3, "too small name, minimum 3 character")
      .max(120, "too big name, maximum 120 character "),
    videoUrl: Yup.string().nullable(),
    regularPrice: Yup.number().required("Regular Price is Required"),
  });
  const {
    register,
    handleSubmit,
    // reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const history = useHistory();
  const { comId } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openImgData, setOpenImgData] = useState(null);
  const [isReseller, setReseller] = useState(false);
  const [existProductIds, setExistProductIds] = useState([]);
  const [comboPrice, setComboPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [guideline, setGuideline] = useState("");
  const [dataList, setDataList] = useState([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isOwnDisabled, setIsOwnDisabled] = useState(false);
  const [isPosSuggest, setIsPosSuggest] = useState(false);
  const [galleryFileList, setGalleryFileList] = useState([]);
  const [isResellerCommission, setIsResellerCommission] = useState(false);
  const [resellerCommission, setResellerCommission] = useState(0);
  const [comboId, setComboId] = useState('')
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

  useEffect(() => {
    const getData = async () => {
      try {
        let res = await axios.get(`/combo/admin/view/${comId}`);
        if (res) {
          let data = res?.data?.data;
          setDataList(
            data?.comboProduct.map((data) => {
              return (data.comboPrice = data?.price);
            })
          );

          setDataList(data?.comboProduct);
          setValue("name", data?.name);
          setValue("videoUrl", data?.videoUrl);
          setDescription(data?.description);
          setGuideline(data?.guideline);
          setValue("regularPrice", data?.regularPrice);
          setComboPrice(Number(data?.sellingPrice));
          setIsFeatured(data?.isFeatured);
          setIsOwnDisabled(data?.isOwnDisabled);
          setIsPosSuggest(data?.isPosSuggest);
          setIsResellerCommission(data?.resellerDetails?.isCommissionOn);
          setResellerCommission(data?.resellerDetails?.commission);
          setReseller(data?.isReseller);
          setComboId(data?._id)

          let galleryImgArray = [];
          galleryImgArray = data?.galleryImage.map((img) => ({
            url: imageBasePath + "/" + img,
          }));
          setGalleryFileList(galleryImgArray);
        }
      } catch (error) {}
    };
    getData();
  }, [comId]);

  const addSelectedProducts = (products) => {
    let modifyProducts = products.map((product) => {
      let storeProduct = { ...product };
      storeProduct = {
        id: product?._id,
        sku: product?.sku,
        name: product?.name,
        galleryImage: product?.galleryImage,
        comboPrice: 0,
        price: product?.isVariant
          ? product?.variations[0]?.sellingPrice
          : product?.nonVariation?.sellingPrice,
      };

      return storeProduct;
    });
    setDataList([...modifyProducts, ...dataList]);
  };

  useEffect(() => {
    setExistProductIds(dataList.map((data) => data?._id));
  }, [dataList]);

  const priceHandler = (value, productId) => {
    setDataList(
      dataList.map((data) => {
        if (data?._id === productId) {
          if (Number(value) <= 0 || !value) {
            data.comboPrice = "";
          } else {
            data.comboPrice = Number(value);
          }
        }
        return data;
      })
    );
  };

  useEffect(() => {
    const totalPrice = dataList.reduce(
      (total, product) => total + parseFloat(product.comboPrice),
      0
    );

    setComboPrice(totalPrice);
  }, [dataList]);

  const removeProductHandler = (productId) => {
    setDataList(dataList.filter((data) => data?.id !== productId));
  };

  const formSubmitHandler = async (event) => {

    // let galleryBaseUrl = [];
    // for (let list of galleryFileList) {
    //   let baseUrl = await convertImageToBase64(list.originFileObj);
    //   galleryBaseUrl.push(baseUrl);
    // }
    let galleryBaseUrl = [];
    for (let list of galleryFileList) {
      let baseUrl = null;
      if (list?.originFileObj) {
        baseUrl = await convertImageToBase64(list?.originFileObj);
      } else {
        baseUrl = list?.url.split(imageBasePath + "/")[1];
      }
      if (baseUrl) {
        galleryBaseUrl.push(baseUrl);
      }
    }
    setIsLoading(true);

    let productList = [];

    dataList.map((item, index) => {
      productList.push({
        productId: item?._id,
        price: item?.comboPrice,
      });
    });

    let obj = {
      name: event.name,
      description: description,
      guideline: guideline,
      galleryImage: galleryBaseUrl,
      videoUrl: event.videoUrl,
      regularPrice: event.regularPrice,
      sellingPrice: comboPrice,
      comboProducts: productList,
      resellerDetails: {
        isCommissionOn: isResellerCommission,
        commission: resellerCommission,
      },
      isReseller: isReseller,
      isFeatured: isFeatured,
      isOwnDisabled: isFeatured,
      isPosSuggest: isPosSuggest,
    };

    try {
      let res = await axios.patch(`/combo/admin/update/${comboId}`, obj);
      if (res?.data?.success) {
        openNotificationWithIcon(res?.data?.message, "success");
        window.location.reload();
      } else {
        openNotificationWithIcon(res?.data?.message, "error");
      }

      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  const gallaryImageHandler = async ({ fileList: newFileList }) => {
    setGalleryFileList(newFileList);
  };

  return (
    <div className="m-sm-30">
      <Grid container>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardHeader title="Select Combo Products" />
            <form className="px-4 py-6" onSubmit={formSubmitHandler}>
              <Grid container spacing={3}>

                {/* <Grid item xs={12} className="mb-4">
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
                    
                      Add Products
                    </Button>
                  )}
                  {isShowProductList ? (
                    <ProductList
                      addSelectedProducts={addSelectedProducts}
                      existProductIds={existProductIds}
                    />
                  ) : null}
                </Grid> */}

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
                              Product Price
                            </TableCell>

                            <TableCell className="min-w-100" align="center">
                              Price
                            </TableCell>

                            <TableCell className="min-w-100" align="center">
                              Action
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {dataList.map((data) => (
                            <React.Fragment key={data?._id}>
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
                                      src={
                                        data?.galleryImage?.length
                                          ? `${imageBasePath}/${data?.galleryImage[0]}`
                                          : ""
                                      }
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
                                  {data?.isVariant
                                    ? data?.variations[0]?.sellingPrice
                                    : data?.nonVariation?.sellingPrice}
                                </TableCell>

                                <TableCell
                                  className="capitalize"
                                  align="center"
                                >
                                  <TextField
                                    type="number"
                                    inputProps={{ min: 0 }}
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
                                    value={data?.comboPrice || data?.price}
                                    onChange={(e) =>
                                      priceHandler(e.target.value, data?._id)
                                    }
                                  />
                                </TableCell>

                                <TableCell
                                  className="capitalize"
                                  align="center"
                                >
                                  <IconButton
                                    onClick={() =>
                                      removeProductHandler(data?._id)
                                    }
                                    style={{
                                      backgroundColor: "#ebedec",
                                      color: "red",
                                    }}
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
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </Grid>
              </Grid>
            </form>
          </Card>
        </Grid>
      </Grid>
      <Grid container className="my-6">
        {/* <Grid item md={1} sx={0}></Grid> */}
        <Grid item xs={12}>
          <form onSubmit={handleSubmit(formSubmitHandler)}>
            {/* basic */}
            <Card className="elevation-z4 mb-6">
              <CardHeader title="Combo Information " />
              <CardContent>
                <Grid
                  container
                  spacing={1}
                  alignItems="center"
                  className="mb-2"
                >
                  <Grid item sm={3} xs={12}>
                    <InputLabel>
                      Combo Name<span style={{ color: "red" }}>*</span>
                    </InputLabel>
                  </Grid>
                  <Grid item sm={8} xs={12}>
                    <TextField
                      label=""
                      placeholder=""
                      name="name"
                      size="medium"
                      variant="outlined"
                      fullWidth
                      {...register("name")}
                    />
                    <Typography className="text-error" variant="caption">
                      {errors.name?.message}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container spacing={1} alignItems="center">
                  <Grid item sm={3} xs={12}>
                    <InputLabel>
                      Combo Price <span style={{ color: "red" }}>*</span>
                    </InputLabel>
                  </Grid>
                  <Grid item sm={8} xs={12}>
                    <TextField
                      label=""
                      name="unit"
                      size="medium"
                      variant="outlined"
                      fullWidth
                      disabled
                      value={comboPrice}
                      onChange={(e) => setComboPrice(e.target.value)}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={1} alignItems="center">
                  <Grid item sm={3} xs={12}>
                    <InputLabel>Regular Price</InputLabel>
                  </Grid>
                  <Grid item sm={8} xs={12}>
                    <TextField
                      label=""
                      placeholder=""
                      name="regularPrice"
                      size="medium"
                      type="number"
                      variant="outlined"
                      fullWidth
                      // inputProps={{ min: 10, max: 10000 }}
                      {...register("regularPrice")}
                    />
                    <Typography className="text-error" variant="caption">
                      {errors.regularPrice?.message}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* media */}
            <Card className="elevation-z4 mb-6">
              <CardHeader title="Media" />
              <CardContent>
                <Grid
                  container
                  spacing={1}
                  alignItems="center"
                  className="mb-2"
                >
                  <Grid item sm={3} xs={12}>
                    <InputLabel>Product Image (600*600)</InputLabel>
                  </Grid>
                  <Grid item sm={8} xs={12}>
                    <Upload
                      listType="picture-card"
                      fileList={galleryFileList}
                      onChange={gallaryImageHandler}
                    >
                      {galleryFileList.length >= 15 ? null : (
                        <span>
                          <Icon style={{ color: "gray" }}>
                            photo_size_select_actual
                          </Icon>
                        </span>
                      )}
                    </Upload>
                  </Grid>
                </Grid>
                <Grid
                  container
                  spacing={1}
                  alignItems="center"
                  className="mb-2"
                >
                  <Grid item sm={3} xs={12}>
                    <InputLabel>Video URL</InputLabel>
                  </Grid>
                  <Grid item sm={8} xs={12}>
                    <TextField
                      label=""
                      placeholder=""
                      size="medium"
                      variant="outlined"
                      fullWidth
                      name="videoUrl"
                      {...register("videoUrl")}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* description */}
            <Card className="elevation-z4 mb-6">
              <CardHeader title="Description" />
              <CardContent>
                <RichTextEditor
                  className="mb-4 border-none"
                  content={description}
                  handleContentChange={(content) => setDescription(content)}
                  placeholder="write here..."
                />
              </CardContent>
            </Card>

            {/* guideline */}
            <Card className="elevation-z4 mb-6">
              <CardHeader title="Guide Line" />
              <CardContent>
                <RichTextEditor
                  className="mb-4 border-none"
                  content={guideline}
                  handleContentChange={(content) => setGuideline(content)}
                  placeholder="write here..."
                />
              </CardContent>
            </Card>

            {/* others */}
            <Card className="elevation-z4 mb-6">
              <CardHeader title="Others" />
              <CardContent>
                <Grid container>
                  <Grid item sm={6}>
                    <Box>
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            sx={{
                              m: 1,
                            }}
                            checked={isReseller}
                            onChange={(event) =>
                              setReseller(event.target.checked)
                            }
                            value={isReseller}
                          />
                        }
                        label={`Reseller Product (${
                          isReseller ? "Enable" : "Disable"
                        })`}
                      />
                    </Box>
                    <Box>
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            sx={{
                              m: 1,
                            }}
                            checked={isResellerCommission}
                            onChange={(event) =>
                              setIsResellerCommission(event.target.checked)
                            }
                            value={isResellerCommission}
                          />
                        }
                        label={`Combo base commission (${
                          isResellerCommission ? "Enable" : "Disable"
                        })`}
                      />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        type="number"
                        inputProps={{ min: 0 }}
                        onKeyPress={(event) => {
                          if (event?.key === "-" || event?.key === "+") {
                            event.preventDefault();
                          }
                        }}
                        label="Commission (%)"
                        size="small"
                        variant="outlined"
                        value={resellerCommission}
                        onChange={(e) => setResellerCommission(e.target.value)}
                      />
                    </Box>
                  </Grid>
                  <Grid item sm={6}>
                    <Box>
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            sx={{
                              m: 1,
                            }}
                            checked={!isOwnDisabled}
                            onChange={(event) =>
                              setIsOwnDisabled(!event.target.checked)
                            }
                          />
                        }
                        label={`Product Status (${
                          !isOwnDisabled ? "Enable" : "Disable"
                        })`}
                      />
                    </Box>
                    <Box>
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            sx={{
                              m: 1,
                            }}
                            checked={isPosSuggest}
                            onChange={(event) =>
                              setIsPosSuggest(event.target.checked)
                            }
                            value={isPosSuggest}
                          />
                        }
                        label={`Pos Suggestion (${
                          isPosSuggest ? "Enable" : "Disable"
                        })`}
                      />
                    </Box>
                    <Box>
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            sx={{
                              m: 1,
                            }}
                            checked={isFeatured}
                            onChange={(event) =>
                              setIsFeatured(event.target.checked)
                            }
                            value={isFeatured}
                          />
                        }
                        label={`Featured (${
                          isFeatured ? "Enable" : "Disable"
                        })`}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Button
              type="submit"
              size="large"
              disabled={isLoading}
              className="bg-secondary text-white"
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Update"
              )}
            </Button>
          </form>
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

export default UpdateCombo;
