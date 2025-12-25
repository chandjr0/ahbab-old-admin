import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Grid,
  TextField,
  CircularProgress,
  CardHeader,
  InputLabel,
  MenuItem,
  TableCell,
  Avatar,
  TableRow,
  TableHead,
  TableBody,
  Table,
  Checkbox,
  Box,
  FormControlLabel,
} from "@material-ui/core";
import { notification, Typography } from "antd";
import axios from "../../../axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { DatePicker } from "antd";
import { useHistory, useParams } from "react-router-dom";
import imageBasePath from "../../../config";
import { IoClose } from "react-icons/io5";
import IOSSwitch from "../../Shared/Forms/iosSwitch";
import moment from "moment";
const { RangePicker } = DatePicker;

const UpdatePromo = () => {
  const history = useHistory();
  const { promoId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [dateRangeError, setDateRangeError] = useState("");
  const [discountType, setDiscountType] = useState("FLAT");
  const [dateRange, setDateRange] = useState({});

  const [selectedType, setSelectedType] = useState("");
  const [dataList, setDataList] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [isAllSelect, setIsAllSelect] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [renderMe, setRenderMe] = useState(false);
  const [isLimit, setIsLimit] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [maxUserLimit, setMaxUserLimit] = useState(false);
  const [promoInfo, setPromoInfo] = useState({});

  const validationSchema = Yup.object().shape({
    promo: Yup.string().required("code is required"),
    minBuyingAmount: Yup.number()
      .required("minimum buying price is required")
      .typeError("minimum buying price is required"),
    discountPrice:
      selectedType == "free_delivery"
        ? ""
        : Yup.number()
            .required("discount price is required")
            .typeError("discount price is required"),
  });

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (
      Object.keys(errors).length !== 0 &&
      Object.keys(dateRange).length === 0
    ) {
      setDateRangeError("Date range must be select!");
    }
    if (Object.keys(dateRange).length !== 0) {
      setDateRangeError("");
    }
  }, [errors, dateRange]);

  useEffect(() => {
    const getData = async () => {
      try {
        let res = await axios.get(`/promo/fetch-single-promo/${promoId}`);
        if (res) {
          let data = res?.data?.data;
          setPromoInfo(data);
          setValue("promo", data?.promo);
          setSelectedType(data?.promoType);
          setDiscountType(data?.discount?.discountType);
          setValue("discountPrice", data?.discount?.discountPrice);
          setValue("minBuyingAmount", data?.minBuyingAmount);
          setIsLimit(data?.limitInfo?.haveLimit);
          setValue("maxUse", data?.limitInfo?.maxUsed);
          setMaxUserLimit(data?.userLimitInfo?.haveLimit);
          setValue("maxUseLimit", data?.userLimitInfo?.maxUsed);
          setIsDisabled(data?.isDisable);
          setDateRange({
            startDate: data?.startTime,
            endDate: data?.endTime,
          });
        }
      } catch (error) {}
    };
    getData();
  }, [promoId]);

  const formSubmitHandler = async (data) => {
    try {
      //   if (Object.keys(dateRange).length === 0) {
      //     setDateRangeError("Date range must be select!");
      //     return;
      //   }

      let obj = {
        minBuyingAmount: data?.minBuyingAmount,
        discount: {
          discountType: discountType,
          discountPrice: data?.discountPrice || 0,
        },
        limitInfo: {
          haveLimit: isLimit,
          maxUsed: isLimit? data?.maxUse : 0,
        },
        userLimitInfo: {
          haveLimit: maxUserLimit,
          maxUsed: maxUserLimit? data?.maxUseLimit : 0,
        },
        startTime: dateRange?.startDate,
        endTime: dateRange?.endDate,
        isDisable: isDisabled,
      };

      setIsLoading(true);

      const res = await axios.patch(`/promo/update/${promoId}`, obj);
      if (res?.data?.success) {
        reset();
        setDateRange({});
        setDiscountType("FLAT");
        setDateRangeError("");
        openNotificationWithIcon(res?.data?.message, "success");
        history.push("/promo-list");
      } else {
        openNotificationWithIcon(res?.data?.message, "error");
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  const getType = async (value) => {
    setSelectedType(value);
    if (value == "product") {
      getProductsToShow();
    } else if (value == "category") {
      getCategoryToShow();
    } else if (value == "combo") {
      getComboToShow();
    }
  };

  const getProductsToShow = async (searchValue) => {
    setSearchValue(searchValue);
    try {
      let res = null;
      setIsLoading(true);
      if (searchValue !== undefined) {
        res = await axios.post(
          `product/admin/search?page=${page + 1}&limit=${rowsPerPage}`,
          { value: searchValue }
        );
      } else {
        let obj = {
          categorySlug: "ALL",
          prodType: "PUBLISH",
          sort: "NEW_TO_OLD",
        };
        res = await axios.post(
          `/product/admin/all-products?page=${page + 1}&limit=${rowsPerPage}`,
          obj
        );
      }

      if (res?.data?.data) {
        setTotalData(res?.data?.metaData?.totalData);
        setDataList(res?.data?.data.map((i) => ({ ...i, checkStatus: false })));
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const getCategoryToShow = async () => {
    try {
      setIsLoading(true);
      let res = await axios.get("/category/fetch-all");

      let categoryObj = [];
      for (let parent of res?.data?.data) {
        categoryObj.push({
          _id: parent?._id,
          name: parent?.name,
          slug: parent?.slug,
          image: parent?.image,
          isFeatured: parent?.isFeatured,
          isDisabled: parent?.isDisabled,
          parentName: "",
          resellerDetails: parent?.resellerDetails,
        });

        for (let child of parent?.children) {
          categoryObj.push({
            _id: child?._id,
            name: child?.name,
            slug: child?.slug,
            image: child?.image,
            isFeatured: child?.isFeatured,
            isDisabled: child?.isDisabled,
            parentName: parent?.name,
            resellerDetails: child?.resellerDetails,
          });
        }
      }
      setDataList(categoryObj);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const getComboToShow = async (searchValue) => {
    setSearchValue(searchValue);
    try {
      let res = null;

      let obj = {
        value: searchValue || "",
        comboType: "",
        sort: "",
      };

      res = await axios.post(
        `/combo/admin/list?page=${page + 1}&limit=${rowsPerPage}`,
        obj
      );
      if (res) {
        setDataList(res?.data?.data);
      }
    } catch (err) {
      setIsLoading(false);
    }
  };

  const allCheckedHandler = (checkStatus) => {
    const newSelectedIds = [];
    setIsAllSelect(!isAllSelect);

    const updatedDataList = dataList.map((i) => {
      if (i?._id && isAllSelect == false) {
        newSelectedIds.push(i._id);
      }
      return {
        ...i,
        checkStatus: checkStatus,
      };
    });

    setDataList(updatedDataList);
    setSelectedProductIds(newSelectedIds);
  };

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
    const index = selectedProductIds.indexOf(data?._id);

    if (index > -1) {
      setSelectedProductIds(
        selectedProductIds.filter((id) => id !== data?._id)
      );
    } else {
      setSelectedProductIds([...selectedProductIds, data?._id]);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === " " && phoneNumber?.length == 11) {
      event.preventDefault();
      setPhoneNumbers([...phoneNumbers, phoneNumber]);
      setPhoneNumber("");
    }
  };

  const removeNumber = (index) => {
    let arr = phoneNumbers;
    arr.splice(index, 1);
    setPhoneNumbers(arr);
    setRenderMe(!renderMe);
  };

  return (
    <div className="m-sm-30">
      <Grid container>
        <Grid item md={6} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Update Promo Code" />
            <form
              className="px-4 py-6"
              onSubmit={handleSubmit(formSubmitHandler)}
            >
              <Grid container spacing={1} alignItems="center" className="mb-2">
                <Grid item sm={3} xs={12}>
                  <InputLabel>
                    Promo Code<span style={{ color: "red" }}>*</span>
                  </InputLabel>
                </Grid>
                <Grid item sm={8} xs={12}>
                  <TextField
                    label=""
                    placeholder="Promo code"
                    size="medium"
                    variant="outlined"
                    fullWidth
                    type="text"
                    disabled
                    InputProps={{ inputProps: { min: 0 } }}
                    name="promo"
                    {...register("promo")}
                  />
                  <Typography className="text-error" variant="caption">
                    {errors.promo?.message}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container spacing={1} alignItems="center" className="mb-2">
                <Grid item sm={3} xs={12}>
                  <InputLabel>
                    Promo Type<span style={{ color: "red" }}>*</span>
                  </InputLabel>
                </Grid>
                <Grid item sm={8} xs={12}>
                  <TextField
                    label="Select Type"
                    placeholder="Select Type"
                    name="type"
                    size="medium"
                    variant="outlined"
                    disabled
                    fullWidth
                    select
                    onChange={(e) => getType(e.target.value)}
                    value={selectedType}
                  >
                    <MenuItem value="">--select--</MenuItem>
                    <MenuItem value="regular">Regular</MenuItem>
                    <MenuItem value="free_delivery">Free Delivery</MenuItem>
                    <MenuItem value="product">Product</MenuItem>
                    <MenuItem value="combo">Combo</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                    <MenuItem value="phone">Phone</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Grid container spacing={1} alignItems="center" className="mb-2">
                <Grid item sm={3} xs={12}>
                  <InputLabel>
                    Min Amount<span style={{ color: "red" }}>*</span>
                  </InputLabel>
                </Grid>
                <Grid item sm={8} xs={12}>
                  <TextField
                    type="number"
                    inputProps={{ min: 0 }}
                    onKeyPress={(event) => {
                      if (event?.key === "-" || event?.key === "+") {
                        event.preventDefault();
                      }
                    }}
                    label=""
                    placeholder="minimum amount price"
                    size="medium"
                    variant="outlined"
                    fullWidth
                    name="minBuyingAmount"
                    {...register("minBuyingAmount")}
                  />
                  <Typography className="text-error" variant="caption">
                    {errors.minBuyingAmount?.message}
                  </Typography>
                </Grid>
              </Grid>

              {selectedType == "free_delivery" ? null : (
                <Grid
                  container
                  spacing={1}
                  alignItems="center"
                  className="mb-2"
                >
                  <Grid item sm={3} xs={12}>
                    <InputLabel>
                      Discount<span style={{ color: "red" }}>*</span>
                    </InputLabel>
                  </Grid>
                  <Grid item sm={2} xs={12}>
                    <TextField
                      label=""
                      placeholder="type"
                      size="medium"
                      variant="outlined"
                      fullWidth
                      select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                    >
                      <MenuItem value="FLAT">Flat</MenuItem>
                      <MenuItem value="PERCENT">Percentage</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item sm={1}></Grid>
                  <Grid item sm={5} xs={12}>
                    <TextField
                      label=""
                      placeholder="Discount Amount"
                      size="medium"
                      variant="outlined"
                      fullWidth
                      type="number"
                      InputProps={{ inputProps: { min: 0 } }}
                      name="discountPrice"
                      {...register("discountPrice")}
                    />
                    <Typography className="text-error" variant="caption">
                      {errors.discountPrice?.message}
                    </Typography>
                  </Grid>
                </Grid>
              )}

              {selectedType !== "phone" ? null : (
                <Grid
                  container
                  spacing={1}
                  alignItems="center"
                  className="mb-2 mt-5"
                >
                  <Grid item sm={3} xs={12}>
                    <InputLabel>
                      Phone Number<span style={{ color: "red" }}>*</span>
                    </InputLabel>
                  </Grid>
                  <Grid item sm={8} xs={12}>
                    <div className="mb-2 flex items-center justify-evenly flex-wrap">
                      {phoneNumbers?.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            background: "#1234",
                            maxWidth: "120px",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "5px",
                            marginBottom: "5px",
                            marginRight: "5px",
                          }}
                        >
                          <p className="p-1" style={{ margin: "0px" }}>
                            {item}
                          </p>
                          <IoClose
                            size={25}
                            style={{ cursor: "pointer", color: "red" }}
                            onClick={() => removeNumber(index)}
                          />
                        </div>
                      ))}
                    </div>
                    <TextField
                      label="Press Space Bar After Typing..."
                      placeholder="Phone Number"
                      size="medium"
                      variant="outlined"
                      fullWidth
                      type="text"
                      InputProps={{ inputProps: { min: 0 } }}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      onKeyDown={handleKeyDown}
                      value={phoneNumber}
                    />
                  </Grid>
                </Grid>
              )}

              <Grid container spacing={1} alignItems="center" className="mb-2">
                <Grid item sm={3} xs={12}>
                  <InputLabel>
                    Time Range<span style={{ color: "red" }}>*</span>
                  </InputLabel>
                </Grid>
                <Grid item sm={8} xs={12}>
                  <div className="flex items-center justify-around mt-3">
                    <p style={{ fontSize: "12px", margin: "0px" }}>
                      Start Time : {moment(promoInfo?.startTime).format('ll')}
                    </p>
                    <p style={{ fontSize: "12px" }}>
                      End Time : {moment(promoInfo?.endTime).format('ll')}
                    </p>
                  </div>
                  <RangePicker
                    style={{
                      width: "100%",
                      height: "50px",
                      borderRadius: "4px",
                    }}
                    defaultValue={dateRange}
                    onChange={(range) => {
                      const a = new Date(range[0].format());
                      const b = new Date(range[1].format());
                      setDateRange({
                        startDate: Math.min(a, b),
                        endDate: Math.max(a, b),
                      });
                    }}
                    showTime
                  />
                  <Typography className="text-error" variant="caption">
                    {dateRangeError}
                  </Typography>
                </Grid>
              </Grid>

              <Grid container spacing={1} alignItems="center" className="mb-2">
                <Grid item sm={3} xs={12}>
                  <InputLabel>Promo Limit</InputLabel>
                </Grid>
                <Grid item sm={8} xs={12}>
                  <TextField
                    label="Select Limit"
                    placeholder="Select Limit"
                    name="type"
                    size="medium"
                    variant="outlined"
                    fullWidth
                    select
                    onChange={(e) => setIsLimit(e.target.value)}
                    value={isLimit}
                  >
                    <MenuItem value="">--select--</MenuItem>
                    <MenuItem value={true}>YES</MenuItem>
                    <MenuItem value={false}>NO</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              {isLimit ? (
                <Grid
                  container
                  spacing={1}
                  alignItems="center"
                  className="mb-2"
                >
                  <Grid item sm={3} xs={12}>
                    <InputLabel>Max Use</InputLabel>
                  </Grid>
                  <Grid item sm={8} xs={12}>
                    <TextField
                      label=""
                      placeholder="Max Use"
                      size="medium"
                      variant="outlined"
                      fullWidth
                      type="number"
                      InputProps={{ inputProps: { min: 1 } }}
                      name="maxUse"
                      {...register("maxUse")}
                    />
                  </Grid>
                </Grid>
              ) : null}

              <Grid container spacing={1} alignItems="center" className="mb-2">
                <Grid item sm={3} xs={12}>
                  <InputLabel>User Limit</InputLabel>
                </Grid>
                <Grid item sm={8} xs={12}>
                  <TextField
                    label="Select Limit"
                    placeholder="Select Limit"
                    name="type"
                    size="medium"
                    variant="outlined"
                    fullWidth
                    select
                    onChange={(e) => setMaxUserLimit(e.target.value)}
                    value={maxUserLimit}
                  >
                    <MenuItem value="">--select--</MenuItem>
                    <MenuItem value={true}>YES</MenuItem>
                    <MenuItem value={false}>NO</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              {maxUserLimit ? (
                <Grid
                  container
                  spacing={1}
                  alignItems="center"
                  className="mb-2"
                >
                  <Grid item sm={3} xs={12}>
                    <InputLabel>Max Use</InputLabel>
                  </Grid>
                  <Grid item sm={8} xs={12}>
                    <TextField
                      label=""
                      placeholder="Max User Limit"
                      size="medium"
                      variant="outlined"
                      fullWidth
                      type="number"
                      InputProps={{ inputProps: { min: 1 } }}
                      name="maxUseLimit"
                      {...register("maxUseLimit")}
                    />
                  </Grid>
                </Grid>
              ) : null}

              <Grid container spacing={1} alignItems="center" className="mb-2">
                <Grid item sm={3} xs={12}>
                  <InputLabel>Disabled</InputLabel>
                </Grid>
                <Grid item sm={8} xs={12}>
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        sx={{
                          m: 1,
                        }}
                        checked={!isDisabled}
                        onChange={(event) =>
                          setIsDisabled(!isDisabled)
                        }
                        value={isDisabled}
                      />
                    }
                    label={`${!isDisabled ? "Enable" : "Disable"}`}
                  />
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
                  "Update Promo"
                )}
              </Button>
            </form>
          </Card>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item md={12} xs={12}>
          {selectedType == "category" ? (
            <Card elevation={3} className="mt-5">
              <CardHeader className="text-center" title="SELECT CATEGORY" />

              <div className="w-full overflow-auto  px-6 py-8">
                {dataList.length > 0 ? (
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
                          <TableCell className="min-w-100">
                            <Checkbox
                              checked={isAllSelect}
                              onChange={(e) =>
                                allCheckedHandler(e.target.checked)
                              }
                            />
                          </TableCell>
                          <TableCell className="min-w-100">Image</TableCell>
                          <TableCell className="min-w-100">Category</TableCell>
                          <TableCell className="min-w-100">Parent</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dataList.map((data, index) => (
                          <TableRow key={index}>
                            <TableCell className="capitalize" align="left">
                              <Checkbox
                                onClick={() =>
                                  singleCheckHandler({
                                    checkStatus: data?.checkStatus,
                                    _id: data?._id,
                                  })
                                }
                                checked={data?.checkStatus}
                              />
                            </TableCell>
                            <TableCell className="capitalize" align="left">
                              <Avatar
                                className="border-radius-4"
                                style={{ cursor: "pointer", width: "58px" }}
                                src={imageBasePath + "/" + data?.image}
                                alt={data?.name}
                              />
                            </TableCell>
                            <TableCell className="capitalize" align="left">
                              {data?.name}
                            </TableCell>

                            <TableCell className="capitalize" align="left">
                              {data?.parentName ? (
                                <strong>{data?.parentName}</strong>
                              ) : (
                                "---"
                              )}
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
            </Card>
          ) : null}
          {selectedType == "product" ? (
            <Card elevation={3} className="mt-5">
              <CardHeader className="text-center" title="SELECT PRODUCTS" />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px",
                }}
              >
                <TextField
                  label=""
                  placeholder="Search here.."
                  size="small"
                  variant="outlined"
                  fullWidth
                  style={{ width: "250px" }}
                  onChange={(e) => {
                    getProductsToShow(e.target.value);
                  }}
                  value={searchValue}
                />
              </Box>
              <div className="w-full overflow-auto  px-6 py-8">
                {dataList.length > 0 ? (
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
                          <TableCell className="min-w-100">
                            <Checkbox
                              checked={isAllSelect}
                              onChange={(e) =>
                                allCheckedHandler(e.target.checked)
                              }
                            />
                          </TableCell>
                          <TableCell className="min-w-100">Image</TableCell>
                          <TableCell className="min-w-100">SKU</TableCell>
                          <TableCell className="min-w-100">Name</TableCell>
                          <TableCell className="min-w-100">Price</TableCell>
                          <TableCell className="min-w-100">Publish</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dataList.map((data, index) => (
                          <TableRow key={index}>
                            <TableCell className="capitalize" align="left">
                              <Checkbox
                                onClick={() =>
                                  singleCheckHandler({
                                    checkStatus: data?.checkStatus,
                                    _id: data?._id,
                                  })
                                }
                                checked={data?.checkStatus}
                              />
                            </TableCell>
                            <TableCell className="capitalize" align="left">
                              {data?.galleryImage?.length > 0 ? (
                                <Avatar
                                  className="border-radius-4"
                                  style={{ cursor: "pointer", width: "58px" }}
                                  src={
                                    imageBasePath + "/" + data?.galleryImage[0]
                                  }
                                  alt={data?.name}
                                />
                              ) : null}
                            </TableCell>
                            <TableCell className="capitalize" align="left">
                              {data?.sku}
                            </TableCell>
                            <TableCell className="capitalize" align="left">
                              {data?.name}
                            </TableCell>
                            <TableCell className="capitalize" align="left">
                              {!data?.isVariant
                                ? data?.nonVariation?.sellingPrice
                                : data?.variations[0]?.sellingPrice}
                            </TableCell>
                            <TableCell className="capitalize" align="left">
                              {!data?.isOwnDisabled ? (
                                <small className="rounded bg-green text-white px-2 py-2">
                                  YES
                                </small>
                              ) : (
                                <small className="rounded bg-warning  text-white px-2 py-2">
                                  NO
                                </small>
                              )}
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
            </Card>
          ) : null}
          {selectedType == "combo" ? (
            <Card elevation={3} className="mt-5">
              <CardHeader className="text-center" title="SELECT COMBO" />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px",
                }}
              >
                <TextField
                  label=""
                  placeholder="Search here.."
                  size="small"
                  variant="outlined"
                  fullWidth
                  style={{ width: "250px" }}
                  onChange={(e) => {
                    getComboToShow(e.target.value);
                  }}
                  value={searchValue}
                />
              </Box>
              <div className="w-full overflow-auto  px-6 py-8">
                {dataList.length > 0 ? (
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
                          <TableCell className="min-w-100">
                            <Checkbox
                              checked={isAllSelect}
                              onChange={(e) =>
                                allCheckedHandler(e.target.checked)
                              }
                            />
                          </TableCell>
                          <TableCell className="min-w-100">SKU</TableCell>
                          <TableCell className="min-w-100">Name</TableCell>
                          <TableCell className="min-w-100">Price</TableCell>
                          <TableCell className="min-w-100">Publish</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dataList.map((data, index) => (
                          <TableRow key={index}>
                            <TableCell className="capitalize" align="left">
                              <Checkbox
                                onClick={() =>
                                  singleCheckHandler({
                                    checkStatus: data?.checkStatus,
                                    _id: data?._id,
                                  })
                                }
                                checked={data?.checkStatus}
                              />
                            </TableCell>
                            <TableCell className="capitalize" align="left">
                              {data?.sku}
                            </TableCell>
                            <TableCell className="capitalize" align="left">
                              {data?.name}
                            </TableCell>

                            <TableCell className="capitalize" align="left">
                              {data?.sellingPrice}
                            </TableCell>
                            <TableCell className="capitalize" align="left">
                              {!data?.isOwnDisabled ? (
                                <small className="rounded bg-green text-white px-2 py-2">
                                  YES
                                </small>
                              ) : (
                                <small className="rounded bg-warning  text-white px-2 py-2">
                                  NO
                                </small>
                              )}
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
            </Card>
          ) : null}
        </Grid>
      </Grid>
    </div>
  );
};

export default UpdatePromo;
