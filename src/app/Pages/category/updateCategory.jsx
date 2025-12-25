import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Button,
  Card,
  FormControlLabel,
  Grid,
  Icon,
  TextField,
  Box,
  CardHeader,
  MenuItem,
  CircularProgress,
} from "@material-ui/core";
import { notification, Typography } from "antd";
import { Breadcrumb } from "../../components";
import axios from "../../../axios";
import { Upload } from "antd";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import IOSSwitch from "../../Shared/Forms/iosSwitch";
import { useParams } from "react-router-dom";
import imageBasePath from "../../../config";
import { getBase64 } from "../../util/getBase64";

const CategoryForm = () => {
  const { categoryId } = useParams();

  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({ image: null, imageForHomePage: null, imageForCategoryProduct: null });   
  const [fileList, setFileList] = useState({ image: [], imageForHomePage: [], imageForCategoryProduct: [] });
  const [fileErrors, setFileErrors] = useState({ image: "", imageForHomePage: "", imageForCategoryProduct: "" });
  const [parentCatOption, setParentCatOption] = useState([]);
  const [parentId, setParentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [categoryData, setCategoryData] = useState(null);

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Name is required")
      .min(3, "Too small name, minimum 3 characters")
      .max(40, "Too big name, maximum 40 characters"),
  });

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  useLayoutEffect(() => {
    const fetchCategoryData = async () => {
      const res = await axios.get(`/category/single-fetch/${categoryId}`);
      setValue("name", res?.data?.data?.name);
      setIsFeatured(res?.data?.data?.isFeatured);
      setParentId(res?.data?.data?.parentId || "");
      setCategoryData(res?.data?.data);

      const imageArray = res?.data?.data?.image ? [{
        url: imageBasePath + "/" + res?.data?.data?.image,
      }] : [];
      const imageForHomePage = res?.data?.data?.imageForHomePage ? [{
        url: imageBasePath + "/" + res?.data?.data?.imageForHomePage,
      }] : [];
      const imageForCategoryProduct = res?.data?.data?.imageForCategoryProduct ? [{
        url: imageBasePath + "/" + res?.data?.data?.imageForCategoryProduct,
      }] : [];
      
      setFileList({ ...fileList, image: imageArray,imageForHomePage, imageForCategoryProduct });
    };

    fetchCategoryData();
  }, [categoryId, setValue]);

  useEffect(() => {
    if (categoryData) {
      const fetchData = async () => {
        const res = await axios.get("/category/fetch-all");
        const parentCategoryObj = res?.data?.data.filter(
          (parent) => parent.parentId === null && categoryData?._id !== parent?._id
        ).map((parent) => ({ _id: parent._id, name: parent.name }));

        setParentCatOption(parentCategoryObj);
      };

      fetchData();
    }
  }, [categoryData]);

  const formSubmitHandler = async (data) => {
    try {
      for (const key in fileErrors) {
        if (fileErrors[key]) return; // Prevent submission if there's an error
      }

      const baseImages = await Promise.all(Object.keys(selectedFiles).map(async (key) => {
        if (selectedFiles[key]) {
          return await getBase64(selectedFiles[key]);
        } else if (fileList[key].length > 0) {
          return fileList[key][0].url.split(imageBasePath + "/")[1];
        }
        return "";
      }));

      const obj = {
        parentId,
        name: data.name,
        image: baseImages[0] || "",
        imageForHomePage: baseImages[1] || "",
        imageForCategoryProduct: baseImages[2] || "",
        isFeatured,
      };

      setIsLoading(true);
      const res = await axios.patch(`/category/update/${categoryId}`, obj);
      if (res?.data?.success) {
        if (!parentId) {
          setParentCatOption([
            ...parentCatOption,
            { _id: res?.data?.data?._id, name: data?.name },
          ]);
        }

        openNotificationWithIcon(res?.data?.message, "success");
      } else {
        openNotificationWithIcon(res?.data?.message, "error");
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  const imageHandler = (type) => ({ fileList: newFileList }) => {
    setFileList((prev) => ({ ...prev, [type]: newFileList }));
    if (newFileList.length === 0) {
      setFileErrors((prev) => ({ ...prev, [type]: "" }));
    } else if (["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(newFileList[0]?.originFileObj.type)) {
      setSelectedFiles((prev) => ({ ...prev, [type]: newFileList[0]?.originFileObj }));
      setFileErrors((prev) => ({ ...prev, [type]: "" }));
    } else {
      setFileErrors((prev) => ({ ...prev, [type]: "Image must be (jpeg, jpg, png, or webp) format!" }));
    }
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb
          routeSegments={[
            { name: "Category List", path: "/category-list" },
            { name: "Update Category" },
          ]}
        />
      </div>

      <Grid container>
        <Grid item md={6} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Update Category" />

            <form className="px-4 py-6" onSubmit={handleSubmit(formSubmitHandler)}>
              <Grid container spacing={3}>
                <Grid item sm={12} xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Parent Category<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      select
                      name="parentId"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      onChange={(e) => setParentId(e.target.value)}
                      value={parentId}
                    >
                      <MenuItem value="">--select one--</MenuItem>
                      {parentCatOption.map((p) => (
                        <MenuItem key={p._id} value={p._id}>
                          {p.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      {parentId ? "Sub Category Name" : "Category Name"}
                      <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      name="name"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("name")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.name?.message}</small>
                    </p>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: {
                        xs: "column", // stack items vertically on small screens
                        sm: "row",    // arrange items horizontally on medium and larger screens
                      },
                      justifyContent: {
                        xs: "space-between",     // center items on extra small screens
                        sm: "space-between", // space items on small and larger screens
                      },
                      gap: {
                        xs: 2,  // smaller gap between items on small screens
                        sm: 4,  // larger gap between items on medium and larger screens
                      },
                    }}
                  >
                  {/* Main Image Upload */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                       Main Image<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Upload listType="picture-card" fileList={fileList.image} onChange={imageHandler("image")}>
                      {fileList.image.length >= 1 ? null : (
                        <span>
                          <Icon style={{ color: "gray" }}>photo_size_select_actual</Icon>
                        </span>
                      )}
                    </Upload>
                    <p style={{ color: "red" }}>
                      <small>{fileErrors.image}</small>
                    </p>
                  </Box>

                  {/* Homepage Image Upload */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                       Homepage Image<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Upload listType="picture-card" fileList={fileList.imageForHomePage} onChange={imageHandler("imageForHomePage")}>
                      {fileList.imageForHomePage.length >= 1 ? null : (
                        <span>
                          <Icon style={{ color: "gray" }}>photo_size_select_actual</Icon>
                        </span>
                      )}
                    </Upload>
                    <p style={{ color: "red" }}>
                      <small>{fileErrors.imageForHomePage}</small>
                    </p>
                  </Box>

                  {/* Category Product Image Upload */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                       Category Product Image<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Upload listType="picture-card" fileList={fileList.imageForCategoryProduct} onChange={imageHandler("imageForCategoryProduct")}>
                      {fileList.imageForCategoryProduct.length >= 1 ? null : (
                        <span>
                          <Icon style={{ color: "gray" }}>photo_size_select_actual</Icon>
                        </span>
                      )}
                    </Upload>
                    <p style={{ color: "red" }}>
                      <small>{fileErrors.imageForCategoryProduct}</small>
                    </p>
                  </Box>
                  </Box>

                  <FormControlLabel
                    control={
                      <IOSSwitch
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                      />
                    }
                    label="Featured Category"
                  />
                </Grid>

                <Button
                className="w-full"
                variant="contained"
                color="primary"
                type="submit"
                style={{ marginRight: "20px" }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Update Category"}
              </Button>
              </Grid>
            </form>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default CategoryForm;
