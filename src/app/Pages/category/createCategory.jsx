import React, { useEffect, useState } from "react";
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
import { getBase64 } from "../../util/getBase64";

const CategoryForm = () => {
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [fileList, setFileList] = useState([]);
  const [fileError, setFileError] = useState("");
  const [homePageFileList, setHomePageFileList] = useState([]);
  const [categoryProductFileList, setCategoryProductFileList] = useState([]);
  const [homePageError, setHomePageError] = useState("");
  const [categoryProductError, setCategoryProductError] = useState("");
  const [parentCatOption, setParentCatOption] = useState([]);
  const [parentId, setParentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("name is required")
      .min(3, "too small name, minimum 3 character")
      .max(40, "too big name, maximum 40 character "),
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

  useEffect(() => {
    let fetchData = async () => {
      let res = await axios.get("/category/fetch-all");
      let parentCategoryObj = [];
      for (let parent of res?.data?.data) {
        if (parent.parentId === null) {
          parentCategoryObj.push({
            _id: parent._id,
            name: parent.name,
          });
        }
      }
      setParentCatOption(parentCategoryObj);
    };

    fetchData();
  }, []);

  const formSubmitHandler = async (data) => {
    try {
      if (fileError || homePageError || categoryProductError) return;

      let baseImg = selectedFile ? await getBase64(selectedFile) : "";
      let homePageImg = homePageFileList[0]
        ? await getBase64(homePageFileList[0]?.originFileObj)
        : "";
      let categoryProductImg = categoryProductFileList[0]
        ? await getBase64(categoryProductFileList[0]?.originFileObj)
        : "";

      let obj = {
        parentId: parentId,
        name: data.name,
        image: baseImg,
        imageForHomePage: homePageImg,
        imageForCategoryProduct: categoryProductImg,
        isFeatured: isFeatured,
      };

      setIsLoading(true);
      const res = await axios.post(`category/create`, obj);
      if (res?.data?.success) {
        if (parentId === "") {
          setParentCatOption([
            ...parentCatOption,
            {
              _id: res?.data?.data?._id,
              name: data?.name,
            },
          ]);
        }

        setValue("name", "");
        setIsFeatured(false);
        setFileList([]);
        setHomePageFileList([]);
        setCategoryProductFileList([]);
        setSelectedFile();
        setFileError("");
        setHomePageError("");
        setCategoryProductError("");
        setParentId("");
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

  const imageHandler = ({ fileList: newFileList }, type) => {
    if (type === "main") {
      setFileList(newFileList);
      const file = newFileList[0]?.originFileObj;
      if (
        file?.type === "image/jpeg" ||
        file?.type === "image/jpg" ||
        file?.type === "image/png" ||
        file?.type === "image/webp"
      ) {
        setSelectedFile(file);
        setFileError("");
      } else {
        setFileError("Image must be (jpeg, jpg, png, or webp) format!");
      }
    } else if (type === "homePage") {
      setHomePageFileList(newFileList);
      if (
        newFileList[0]?.originFileObj.type === "image/jpeg" ||
        newFileList[0]?.originFileObj.type === "image/png"
      ) {
        setHomePageError("");
      } else {
        setHomePageError(
          "Image for Home Page must be (jpeg, jpg or png) format!"
        );
      }
    } else if (type === "categoryProduct") {
      setCategoryProductFileList(newFileList);
      if (
        newFileList[0]?.originFileObj.type === "image/jpeg" ||
        newFileList[0]?.originFileObj.type === "image/png"
      ) {
        setCategoryProductError("");
      } else {
        setCategoryProductError(
          "Image for Category Product must be (jpeg, jpg or png) format!"
        );
      }
    }
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "New Category" }]} />
      </div>

      <Grid container>
        <Grid item md={6} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Add New Category" />

            <form
              className="px-4 py-6"
              onSubmit={handleSubmit(formSubmitHandler)}
            >
              <Grid container spacing={3}>
                <Grid item sm={12} xs={12}>
                  {/* Parent Category */}
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

                  {/* Category Name */}
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
                    {/* Upload Image */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="label" className="mb-2">
                        Upload Image<span style={{ color: "red" }}>*</span>
                      </Typography>
                      <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onChange={(info) => imageHandler(info, "main")}
                      >
                        {fileList.length >= 1 ? null : (
                          <span>
                            <Icon style={{ color: "gray" }}>
                              photo_size_select_actual
                            </Icon>
                          </span>
                        )}
                      </Upload>
                      <p style={{ color: "red" }}>
                        <small>{fileError}</small>
                      </p>
                    </Box>

                    {/* Upload Image for Home Page */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="label" className="mb-2">
                        Image for Home Page
                      </Typography>
                      <Upload
                        listType="picture-card"
                        fileList={homePageFileList}
                        onChange={(info) => imageHandler(info, "homePage")}
                      >
                        {homePageFileList.length >= 1 ? null : (
                          <span>
                            <Icon style={{ color: "gray" }}>
                              photo_size_select_actual
                            </Icon>
                          </span>
                        )}
                      </Upload>
                      <p style={{ color: "red" }}>
                        <small>{homePageError}</small>
                      </p>
                    </Box>

                    {/* Upload Image for Category Product */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="label" className="mb-2">
                        Image for Category Product
                      </Typography>
                      <Upload
                        listType="picture-card"
                        fileList={categoryProductFileList}
                        onChange={(info) => imageHandler(info, "categoryProduct")}
                      >
                        {categoryProductFileList.length >= 1 ? null : (
                          <span>
                            <Icon style={{ color: "gray" }}>
                              photo_size_select_actual
                            </Icon>
                          </span>
                        )}
                      </Upload>
                      <p style={{ color: "red" }}>
                        <small>{categoryProductError}</small>
                      </p>
                    </Box>
                  </Box>


                  {/* Is Featured */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Featured
                    </Typography>
                    <FormControlLabel
                      control={
                        <IOSSwitch
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                        />
                      }
                      label=""
                    />
                  </Box>
                </Grid>

                <Grid item sm={12} xs={12}>
                  <Button
                    className="w-full"
                    variant="contained"
                    color="primary"
                    type="submit"
                  >
                    {isLoading ? <CircularProgress size={20} /> : "Save Category"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default CategoryForm;
