import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  FormControlLabel,
  Grid,
  Icon,
  InputLabel,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Upload } from "antd";
import { Breadcrumb, RichTextEditor } from "../../../components";
import IOSSwitch from "../../../Shared/Forms/iosSwitch";
import { Autocomplete, Chip } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axios from "../../../../axios";
import { v4 as uuidv4 } from "uuid";
import Variation from "./variation";
import { notification } from "antd";
import { useHistory, useParams } from "react-router-dom";
import imageBasePath from "../../../../config";
import Spinner from "../../../Shared/Spinner/Spinner";
import { convertImageToBase64 } from "../../../util/convertImageToBase64";
import OldVariation from "./oldVariation";

function getCombinations(lst, index = 0, current = []) {
  if (index === lst.length) {
    return [current];
  }

  let result = [];
  for (let i = 0; i < lst[index].length; i++) {
    let item = lst[index][i];
    result.push(...getCombinations(lst, index + 1, [...current, item]));
  }

  return result;
}

const UpdateProduct = () => {
  const history = useHistory();
  const { productSlug } = useParams();

  const [productData, setProductData] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategoryOptions, setSelectedCategoryOptions] = useState([]);
  const [categoryIds, setCategoryIds] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [brandId, setBrandId] = useState("");
  const [stickerOptions, setStickerOptions] = useState([]);
  const [stickerId, setStickerId] = useState("");
  const [attributeSetOptions, setAttributeSetOptions] = useState([]);
  const [isVariant, setIsVariant] = useState(false);
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [guideline, setGuideline] = useState("");
  const [stockAlert, setStockAlert] = useState(5);
  const [regularPrice, setRegularPrice] = useState(0);
  const [discountType, setDiscountType] = useState("FLAT");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [galleryFileList, setGalleryFileList] = useState([]);
  const [isFreeDelivery, setIsFreeDelivery] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isOwnDisabled, setIsOwnDisabled] = useState(false);
  const [isPosSuggest, setIsPosSuggest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [selectedAttributeSet, setSelectedAttributeSet] = useState([]);
  const [selectedAttributeOptions, setSelectedAttributeOptions] = useState([]);
  const [variationList, setVariationList] = useState([]);
  const [selAttributeOptions, setSelAttributeOptions] = useState([]);
  const [chartTitle, setChartTitle] = useState("");
  const [chartList, setChartList] = useState([[""]]);
  const [oldVariationList, setOldVariationList] = useState([]);
  const [isReseller, setReseller] = useState(false);
  const [isResellerCommission, setIsResellerCommission] = useState(false);
  const [resellerCommission, setResellerCommission] = useState(0);
  const [tags, setTags] = useState([]);
  const [tagInputValue, setTagInputValue] = useState("");

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Product name is required")
      .min(3, "too small name, minimum 3 character")
      .max(120, "too big name, maximum 120 character "),
    unit: Yup.string().nullable(),
    videoUrl: Yup.string().nullable(),
    unitPrice: Yup.number()
      .transform((value) => (isNaN(value) ? 0 : value))
      .nullable(),
    weight: Yup.number()
      .min(10, "Weight must be greater than or equal to 10")
      .max(10000, "Weight must be less than or equal to 10000")
      .nullable(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [categoryData, brandData, attributeData, stickerData, res] =
          await Promise.all([
            axios.get("/category/fetch-all"),
            axios.get("/brand/fetch-all"),
            axios.get("/attribute/fetch-all"),
            axios.get("/sticker/fetch-all"),
            axios.get(`/product/admin/view/${productSlug}`),
          ]);

        setBrandOptions(brandData?.data?.data);

        let filteredVariationOptions = attributeData?.data?.data?.filter(
          (item2) =>
            res?.data?.data?.variations[0]?.attributeOpts?.some(
              (item1) => item1.attributeName === item2.name
            )
        );

        setAttributeSetOptions(
          res?.data?.data?.variations?.length
            ? filteredVariationOptions
            : attributeData?.data?.data
        );

        let categoryList = [];
        for (let category of categoryData?.data?.data) {
          categoryList.push({
            _id: category?._id,
            name: category?.name,
          });
          for (let subCategory of category?.children) {
            categoryList.push({
              _id: subCategory?._id,
              name: "➤ " + subCategory?.name,
            });
          }
        }
        setCategoryOptions(categoryList);
        setStickerOptions(stickerData?.data?.data);

        let data = res?.data?.data;
        setProductData(data);
        setValue("name", data?.name);
        setValue("unit", data?.unit);
        setValue("videoUrl", data?.videoUrl);
        setValue("weight", data?.weight);
        setValue(
          "unitPrice",
          Number(
            data?.nonVariation?.totalPrice / data?.nonVariation?.totalQuantity
          ) || 0
        );
        setShortDescription(data?.shortDescription);
        setDescription(data?.description);
        setGuideline(data?.guideline);
        setCategoryIds(data?.categories.map((val) => val._id));
        setBrandId(data?.brandId);
        setStickerId(data?.stickerId);
        setIsVariant(data?.isVariant);
        setStockAlert(data?.stockAlert);
        setRegularPrice(data?.nonVariation?.regularPrice);
        setDiscountType(data?.nonVariation?.discount?.discountType);
        setDiscountAmount(data?.nonVariation?.discount?.amount);
        setSalePrice(data?.nonVariation?.sellingPrice);
        setIsFreeDelivery(data?.isFreeDelivery);
        setIsFeatured(data?.isFeatured);
        setIsOwnDisabled(data?.isOwnDisabled);
        setIsPosSuggest(data?.isPosSuggest);
        setChartTitle(data?.chartTitle || "");
        setChartList(data?.chartList);
        setReseller(data?.isReseller);
        setIsResellerCommission(data?.resellerDetails?.isCommissionOn);
        setResellerCommission(data?.resellerDetails?.commission);
        setTags(data?.tags || []);

        let gallaryImgArray = [];
        gallaryImgArray = res?.data?.data?.galleryImage.map((img) => ({
          url: imageBasePath + "/" + img,
        }));
        setGalleryFileList(gallaryImgArray);

        setOldVariationList(data?.variations);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [productSlug, setValue]);

  useEffect(() => {
    if (categoryIds && categoryOptions.length > 0) {
      setSelectedCategoryOptions(
        categoryOptions.filter(
          (cat) =>
            categoryIds.includes(cat?._id) && {
              _id: cat?._id,
              name: cat?.name,
            }
        )
      );
    }
  }, [categoryIds, categoryOptions]);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  useEffect(() => {
    if (discountType === "FLAT") {
      setSalePrice(+regularPrice - +discountAmount);
    } else {
      let calcPrice = Math.ceil(
        +regularPrice - (+regularPrice * +discountAmount) / 100
      );
      setSalePrice(calcPrice);
    }
  }, [regularPrice, discountAmount, discountType]);

  const formSubmitHandler = async (data) => {
    try {
      let updateVariationList = [];
      variationList.forEach((data) => {
        let ids = data?.variants.map((i) => i._id);
        updateVariationList.push({
          attributeOpts: ids,
          images: data?.images,
          regularPrice: data?.regularPrice || 0,
          discount: {
            discountType: data?.discountType || "FLAT",
            amount: data?.discountAmount || 0,
          },
        });
      });

      let oldVariations = [];
      if (isVariant && productData?.isVariant) {
        oldVariations = oldVariationList.map((data) => ({
          _id: data?._id,
          images: data?.images,
          regularPrice: data?.regularPrice || 0,
          discount: {
            discountType: data?.discount?.discountType || "FLAT",
            amount: data?.discount?.amount || 0,
          },
        }));
      }

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

      let obj = {
        name: data?.name,
        shortDescription: shortDescription || "",
        description: description || "",
        guideline: guideline || "",
        categories: categoryIds || [],
        brandId: brandId || "",
        stickerId: stickerId || "",
        unit: data?.unit || "",
        galleryImage: galleryBaseUrl,
        videoUrl: data?.videoUrl,
        chartTitle: chartTitle || "",
        chartList: chartList,
        isVariant: isVariant,
        weight: data.weight,
        variations: isVariant ? updateVariationList : [],
        oldVariations: oldVariations,
        nonVariation: {
          regularPrice: isVariant ? 0 : regularPrice || 0,
          discount: {
            discountType: isVariant ? "FLAT" : discountType || "FLAT",
            amount: isVariant ? 0 : discountAmount || 0,
          },
        },
        stockAlert: stockAlert || 0,
        resellerDetails: {
          isCommissionOn: isResellerCommission,
          commission: resellerCommission || 0,
        },
        isReseller: isReseller,
        isFeatured: isFeatured,
        isOwnDisabled: isOwnDisabled,
        isPosSuggest: isPosSuggest,
        tags: tags
      };

      setBtnLoading(true);
      let res = await axios.patch(
        `/product/admin/update/${productData?._id}`,
        obj
      );
      if (res?.data?.success) {
        setSelectedAttributeSet([]);
        setSelAttributeOptions([]);
        setVariationList([]);
        openNotificationWithIcon(res?.data?.message, "success");
        // history.push(`/update-product/${res?.data?.data?.slug}`);
      }
      setBtnLoading(false);
    } catch (err) {
      openNotificationWithIcon(err?.response?.data?.message, "error");
      setBtnLoading(false);
    }
  };

  const attributeSelectHandler = (event, value) => {
    setSelAttributeOptions(value);
    let attributeSetArray = [];

    for (let attr of value) {
      let attributeOptArray = [];
      for (let opt of attr.options) {
        attributeOptArray.push({
          _id: opt._id,
          name: opt.name,
          attributeId: attr._id,
          attributeName: attr.name,
        });
      }
      attributeSetArray.push(attributeOptArray);
    }
    setSelectedAttributeSet(attributeSetArray);
    setSelectedAttributeOptions([]);
    setVariationList([]);
  };

  const updateNestedAttributeSelete = (event, value, attrId) => {
    let updateAttributeOptions = [];

    let flag = true;
    for (let data of selectedAttributeOptions) {
      if (data.attributeId === attrId) {
        data.options = value;
        flag = false;
      }
      if (data.options.length > 0) {
        updateAttributeOptions.push(data);
      }
    }
    if (flag) {
      updateAttributeOptions.push({
        attributeId: attrId,
        options: value,
      });
    }

    let filterAttributeList = updateAttributeOptions.filter(
      (f) => f?.options.length !== 0
    );

    let makeVarations = [];

    if (filterAttributeList.length > 0) {
      let combinationResult = getCombinations(
        filterAttributeList.map((u) => u.options)
      );
      for (let combination of combinationResult) {
        let name = "";
        combination.forEach((c, idx) => {
          name += c.name + (combination.length - 1 === idx ? "" : "-");
        });
        let obj = {
          uid: uuidv4(),
          name: name,
          variants: combination,
          images: [],
          stock: 0,
          unitPrice: null,
          regularPrice: null,
          sellingPrice: null,
          discountType: "FLAT",
          discountAmount: null,
        };
        makeVarations.push(obj);
      }
    }

    setVariationList(makeVarations);
    setSelectedAttributeOptions(filterAttributeList);
  };

  const gallaryImageHandler = async ({ fileList: newFileList }) => {
    setGalleryFileList(newFileList);
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Update Product" }]} />
      </div>
      <div className="flex p-4">
        <h2 className="m-0">Update Product</h2>
      </div>

      {!isLoading ? (
        <Grid container className="mb-6">
          <Grid item lg={2} md={1} sx={0}></Grid>
          <Grid item lg={8} md={10} xs={12}>
            <form onSubmit={handleSubmit(formSubmitHandler)}>
              {/* basic */}
              <Card className="elevation-z4 mb-6">
                <CardHeader title="Product Information " />
                <CardContent>
                  <Grid
                    container
                    spacing={1}
                    alignItems="center"
                    className="mb-2"
                  >
                    <Grid item sm={3} xs={12}>
                      <InputLabel>
                        Product Name<span style={{ color: "red" }}>*</span>
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

                  <Grid
                    container
                    spacing={1}
                    alignItems="center"
                    className="mb-2"
                  >
                    <Grid item sm={3} xs={12}>
                      <InputLabel>Category</InputLabel>
                    </Grid>
                    <Grid item sm={8} xs={12}>
                      <Autocomplete
                        multiple
                        options={categoryOptions}
                        getOptionLabel={(option) => option?.name}
                        value={selectedCategoryOptions}
                        isOptionEqualToValue={(option, value) =>
                          option._id === value._id
                        }
                        onChange={(e, val) => {
                          setSelectedCategoryOptions(val);
                          setCategoryIds(val.map((v) => v._id));
                        }}
                        size="medium"
                        name="category"
                        filterSelectedOptions
                        renderInput={(params) => (
                          <TextField {...params} variant="outlined" />
                        )}
                        fullWidth
                      />
                    </Grid>
                  </Grid>

                  <Grid
                    container
                    spacing={1}
                    alignItems="center"
                    className="mb-2"
                  >
                    <Grid item sm={3} xs={12}>
                      <InputLabel>Brand</InputLabel>
                    </Grid>
                    <Grid item sm={8} xs={12}>
                      <TextField
                        label=""
                        placeholder=""
                        name="brand"
                        size="medium"
                        variant="outlined"
                        fullWidth
                        select
                        onChange={(e) => setBrandId(e.target.value)}
                        value={brandId}
                      >
                        {brandOptions.map((brand) => (
                          <MenuItem key={brand._id} value={brand._id}>
                            {brand.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>

                  <Grid
                    container
                    spacing={1}
                    alignItems="center"
                    className="mb-2"
                  >
                    <Grid item sm={3} xs={12}>
                      <InputLabel>Sticker</InputLabel>
                    </Grid>
                    <Grid item sm={8} xs={12}>
                      <TextField
                        label=""
                        placeholder=""
                        size="medium"
                        variant="outlined"
                        fullWidth
                        select
                        onChange={(e) => setStickerId(e.target.value)}
                        value={stickerId}
                      >
                        {stickerOptions.map((val) => (
                          <MenuItem key={val._id} value={val._id}>
                            {val.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>

                  <Grid container spacing={1} alignItems="center">
                    <Grid item sm={3} xs={12}>
                      <InputLabel>Unit</InputLabel>
                    </Grid>
                    <Grid item sm={8} xs={12}>
                      <TextField
                        label=""
                        placeholder="Unit(kg, pc etc)"
                        name="unit"
                        size="medium"
                        variant="outlined"
                        fullWidth
                        {...register("unit")}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={1} alignItems="center" className="mt-2">
                    <Grid item sm={3} xs={12}>
                      <InputLabel>Weight</InputLabel>
                    </Grid>
                    <Grid item sm={8} xs={12}>
                      <TextField
                        label=""
                        placeholder="Weight in Gm"
                        name="weight"
                        size="medium"
                        type="number"
                        variant="outlined"
                        fullWidth
                        // inputProps={{ min: 10, max: 10000 }}
                        {...register("weight")}
                      />
                      <Typography className="text-error" variant="caption">
                        {errors.weight?.message}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Grid container spacing={1} alignItems="center" className="mt-2">
                    <Grid item sm={3} xs={12}>
                      <InputLabel>Tags</InputLabel>
                    </Grid>
                    <Grid item sm={8} xs={12}>
                      <Autocomplete
                        multiple
                        freeSolo
                        options={[]}
                        value={tags}
                        inputValue={tagInputValue}
                        onInputChange={(event, newInputValue) => {
                          setTagInputValue(newInputValue);
                        }}
                        onChange={(event, newValue) => {
                          setTags(newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            placeholder="Add tags and press enter"
                            helperText="Type a tag and press enter to add it"
                            size="medium"
                            fullWidth
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              key={index}
                              label={option}
                              {...getTagProps({ index })}
                              color="primary"
                              size="small"
                            />
                          ))
                        }
                      />
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

              {/* variants */}
              <Card className="elevation-z4 mb-6">
                <CardHeader
                  title={isVariant ? "Variants" : "No Variants"}
                  action={
                    !productData?.isUsed && (
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            sx={{ m: 1 }}
                            checked={isVariant}
                            onClick={() => setIsVariant(!isVariant)}
                          />
                        }
                        label=""
                      />
                    )
                  }
                />
                <CardContent>
                  <Grid
                    container
                    spacing={1}
                    alignItems="center"
                    className="mb-2"
                  >
                    <Grid item sm={3} xs={12}>
                      <InputLabel>Stock Alert</InputLabel>
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
                        placeholder=""
                        size="medium"
                        variant="outlined"
                        fullWidth
                        value={stockAlert}
                        onChange={(e) => setStockAlert(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                  {isVariant ? (
                    <>
                      {oldVariationList.length > 0 && (
                        <div className="mb-6">
                          <Typography
                            variant="h6"
                            className="text-center text-green mt-8 mb-6"
                          >
                            Your Selected Variations
                          </Typography>
                          <Table className="whitespace-pre">
                            <TableHead>
                              <TableRow>
                                <TableCell className="min-w-150">
                                  Name
                                </TableCell>
                                <TableCell className="min-w-100">
                                  Regular P.
                                </TableCell>
                                <TableCell className="min-w-100">
                                  Discount T.
                                </TableCell>
                                <TableCell className="min-w-100">
                                  Discount A.
                                </TableCell>
                                <TableCell className="min-w-100">
                                  Sale P.
                                </TableCell>
                                <TableCell className="min-w-100">
                                  Image (600*600)
                                </TableCell>
                                <TableCell className="min-w-100">
                                  Action
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {oldVariationList?.map((variation) => (
                                <OldVariation
                                  key={variation.uid}
                                  variationData={variation}
                                  oldVariationList={oldVariationList}
                                  setOldVariationList={setOldVariationList}
                                  productData={productData}
                                />
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                      <>
                        <Typography
                          variant="h6"
                          className="text-center text-secondary mt-8 mb-6"
                        >
                          Add More Variations
                        </Typography>
                        <Grid
                          container
                          spacing={1}
                          alignItems="center"
                          className="mb-8"
                        >
                          <Grid item sm={3} xs={12}>
                            <InputLabel>Attribute Set</InputLabel>
                          </Grid>
                          <Grid item sm={8} xs={12}>
                            <Autocomplete
                              multiple
                              options={attributeSetOptions}
                              getOptionLabel={(option) => option.name}
                              value={selAttributeOptions}
                              isOptionEqualToValue={(option, value) =>
                                option._id === value._id
                              }
                              onChange={attributeSelectHandler}
                              size="small"
                              filterSelectedOptions
                              renderInput={(params) => (
                                <TextField {...params} variant="outlined" />
                              )}
                              fullWidth
                            />
                            <Typography
                              variant="body2"
                              className="text-primary"
                              style={{ fontSize: "12px", marginTop: "4px" }}
                            >
                              N.B: Select Attribute sets of this product to add
                              attribute values
                            </Typography>
                          </Grid>
                        </Grid>

                        {selectedAttributeSet.map((attr, idx) => (
                          <Grid
                            key={idx}
                            container
                            spacing={1}
                            alignItems="center"
                            className="mb-2"
                          >
                            <Grid item sm={3} xs={12}>
                              <InputLabel>{attr[0]?.attributeName}</InputLabel>
                            </Grid>
                            <Grid item sm={8} xs={12}>
                              <Autocomplete
                                multiple
                                options={attr}
                                getOptionLabel={(option) => option.name}
                                isOptionEqualToValue={(option, value) =>
                                  option._id === value._id
                                }
                                onChange={(e, val) =>
                                  updateNestedAttributeSelete(
                                    e,
                                    val,
                                    attr[0].attributeId
                                  )
                                }
                                value={
                                  selectedAttributeOptions.filter(
                                    (f) =>
                                      f?.attributeId === attr[0]?.attributeId
                                  )[0]?.options || []
                                }
                                size="small"
                                name="category"
                                filterSelectedOptions
                                renderInput={(params) => (
                                  <TextField {...params} variant="outlined" />
                                )}
                                fullWidth
                              />
                            </Grid>
                          </Grid>
                        ))}

                        {variationList.length > 0 && (
                          <>
                            <Table className="whitespace-pre">
                              <TableHead>
                                <TableRow>
                                  <TableCell className="min-w-150">
                                    Name
                                  </TableCell>
                                  <TableCell className="min-w-100">
                                    Regular P.
                                  </TableCell>
                                  <TableCell className="min-w-100">
                                    Discount T.
                                  </TableCell>
                                  <TableCell className="min-w-100">
                                    Discount A.
                                  </TableCell>
                                  <TableCell className="min-w-100">
                                    Sale P.
                                  </TableCell>
                                  <TableCell className="min-w-100">
                                    Image
                                  </TableCell>
                                  <TableCell>Action</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {variationList.map((variation) => (
                                  <Variation
                                    key={variation.uid}
                                    variationData={variation}
                                    variationList={variationList}
                                    setVariationList={setVariationList}
                                    productData={productData}
                                  />
                                ))}
                              </TableBody>
                            </Table>
                          </>
                        )}
                      </>
                    </>
                  ) : (
                    <>
                      <Grid
                        container
                        spacing={1}
                        alignItems="center"
                        className="mb-2"
                      >
                        <Grid item sm={3} xs={12}>
                          <InputLabel>
                            Regular Price<span style={{ color: "red" }}>*</span>
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
                            placeholder="regular Price"
                            size="medium"
                            variant="outlined"
                            fullWidth
                            value={regularPrice}
                            onChange={(e) => {
                              if (e.target.value >= 0) {
                                setRegularPrice(e.target.value);
                              }
                            }}
                          />
                          <Typography className="text-error" variant="caption">
                            {errors.regularPrice?.message}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Grid
                        container
                        spacing={1}
                        alignItems="center"
                        className="mb-2"
                      >
                        <Grid item sm={3} xs={12}>
                          <InputLabel>Discount</InputLabel>
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
                            onChange={(e) => {
                              setDiscountType(e.target.value);
                              if (
                                e.target.value === "FLAT" &&
                                regularPrice < discountAmount
                              ) {
                                setDiscountAmount(0);
                              }
                            }}
                          >
                            <MenuItem value="FLAT">Flat</MenuItem>
                            <MenuItem value="PERCENT">Percentage</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item sm={1}></Grid>
                        <Grid item sm={5} xs={12}>
                          <TextField
                            type="number"
                            inputProps={{ min: 0 }}
                            onKeyPress={(event) => {
                              if (event?.key === "-" || event?.key === "+") {
                                event.preventDefault();
                              }
                            }}
                            label=""
                            placeholder="Discount Amount"
                            size="medium"
                            variant="outlined"
                            fullWidth
                            value={discountAmount}
                            onChange={(e) => {
                              if (+e.target.value >= 0) {
                                if (discountType === "FLAT") {
                                  if (+e.target.value <= +regularPrice) {
                                    setDiscountAmount(e.target.value);
                                  }
                                } else {
                                  if (e.target.value <= 100) {
                                    setDiscountAmount(e.target.value);
                                  }
                                }
                              }
                            }}
                          />
                        </Grid>
                      </Grid>

                      <Grid
                        container
                        spacing={1}
                        alignItems="center"
                        className="mb-2"
                      >
                        <Grid item sm={3} xs={12}>
                          <InputLabel>
                            Sale Price<span style={{ color: "red" }}>*</span>
                          </InputLabel>
                        </Grid>
                        <Grid item sm={8} xs={12}>
                          <TextField
                            type="number"
                            onKeyPress={(event) => {
                              if (event?.key === "-" || event?.key === "+") {
                                event.preventDefault();
                              }
                            }}
                            label=""
                            placeholder="Sale Price"
                            size="medium"
                            variant="outlined"
                            fullWidth
                            value={salePrice}
                            InputProps={{
                              readOnly: true,
                              min: 0,
                            }}
                          />
                          <Typography className="text-error" variant="caption">
                            {errors.regularPrice?.message}
                          </Typography>
                        </Grid>
                      </Grid>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* chart */}
              {/* <Card className="elevation-z4 mb-6">
                <CardHeader title="Chart" />
                <CardContent>
                  <Grid
                    container
                    spacing={1}
                    alignItems="center"
                    className="mb-2"
                  >
                    <Grid item sm={3} xs={12}>
                      <InputLabel>Chart Title</InputLabel>
                    </Grid>
                    <Grid item sm={8} xs={12}>
                      <TextField
                        label=""
                        placeholder="enter title"
                        size="medium"
                        variant="outlined"
                        fullWidth
                        value={chartTitle}
                        onChange={(e) => setChartTitle(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                  <Divider className="my-4" />
                  <ChartPage
                    chartList={chartList}
                    setChartList={setChartList}
                  />
                </CardContent>
              </Card> */}

              {/* Short description */}
              <Card className="elevation-z4 mb-6">
                <CardHeader title="Short Description" />
                <CardContent>
                  <RichTextEditor
                    className="mb-4 border-none"
                    content={shortDescription || ""}
                    handleContentChange={(content) =>
                      setShortDescription(content)
                    }
                    placeholder="write here..."
                  />
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
                    {/* <Grid item sm={6}>
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
                          label={`Product base commission (${
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
                          placeholder="stock alert number"
                          size="small"
                          variant="outlined"
                          value={resellerCommission}
                          onChange={(e) =>
                            setResellerCommission(e.target.value)
                          }
                        />
                      </Box>
                    </Grid> */}
                    <Grid item sm={6}>
                      {/* <Box>
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
                          label={`Feature Product (${
                            isFeatured ? "Enable" : "Disable"
                          })`}
                        />
                      </Box> */}
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
                {btnLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Update Product"
                )}
              </Button>
            </form>
          </Grid>
        </Grid>
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
    </div>
  );
};

export default UpdateProduct;
