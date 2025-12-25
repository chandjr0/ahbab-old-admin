import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  FormControlLabel,
  Grid,
  Icon,
  TextField,
  Box,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import { notification } from "antd";
import { Breadcrumb } from "../../components";
import axios from "../../../axios";
import { Upload } from "antd";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import IOSSwitch from "../../Shared/Forms/iosSwitch";
import { useParams } from "react-router-dom";
import imageBasePath from "../../../config";
import { convertImageToBase64 } from "../../util/convertImageToBase64";

const UpdateBrand = () => {
  const { showId } = useParams();

  const [selectedFile, setSelectedFile] = useState();
  const [fileList, setFileList] = useState([]);
  const [fileError, setFileError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("name is required")
      .min(2, "too small name, minimum 2 character")
      .max(60, "too big name, maximum 60 character "),
    phone: Yup.string().required("name is required"),
    address: Yup.string().required("name is required"),
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
    let fetchData = async () => {
      let res = await axios.get("/setting/showroom/view/" + showId);
      setValue("name", res?.data?.data?.name);
      setValue("address", res?.data?.data?.address);
      setValue("phone", res?.data?.data?.phones);
    };
    fetchData();
  }, [showId, setValue]);

  const formSubmitHandler = async (data) => {
    try {
      setIsLoading(true);
 

      let obj = {
        name: data.name,
        address : data?.address,
        phones : data?.phone
      };

      const res = await axios.patch(`/setting/showroom/update/${showId}`, obj);
      if (res?.data?.success) {
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

  const imageHandler = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length === 0) {
      setFileError("");
    } else if (
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

  useEffect(() => {
    console.log("fileList: ", fileList);
  }, [fileList]);

  return (
    <div className="m-sm-30">
      <Grid container>
        <Grid item md={6} xs={12}>
          <Card elevation={3}>
            <CardHeader className="text-center" title="Update Showroom" />

            <form className="p-4" onSubmit={handleSubmit(formSubmitHandler)}>
              <Grid container spacing={3}>
                <Grid item sm={8} xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Name<span style={{ color: "red" }}>*</span>
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
                </Grid>
              </Grid>
              <Grid container spacing={3}>
                <Grid item sm={8} xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Address<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      name="address"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("address")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.address?.message}</small>
                    </p>
                  </Box>
                </Grid>
              </Grid>
              <Grid container spacing={3}>
                <Grid item sm={8} xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Phone<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      name="phone"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("phone")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.phone?.message}</small>
                    </p>
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
                  "Update Showroom"
                )}
              </Button>
            </form>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default UpdateBrand;
