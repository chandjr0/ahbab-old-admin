import React, { useState } from "react";
import {
  Button,
  Card,
  FormControlLabel,
  Grid,
  Icon,
  TextField,
  Box,
  CircularProgress,
  CardHeader,
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
import { convertImageToBase64 } from "../../util/convertImageToBase64";

const CreateEmployee = () => {
  const [isDisabled, setIsDisabled] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [fileList, setFileList] = useState([]);
  const [fileError, setFileError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("name is required")
      .min(2, "too small name, minimum 3 character")
      .max(60, "too big name, maximum 60 character "),
    email: Yup.string().required("email is required"),
    phone: Yup.string().required("phone is required"),
    password: Yup.string()
      .required("password is required")
      .min(4, "too small password, minimum 4 character"),
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
    // control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const formSubmitHandler = async (data) => {
    try {
      if (fileError) return;
      let baseImg = "";
      if (selectedFile) {
        baseImg = await convertImageToBase64(selectedFile);
      }

      let obj = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        image: baseImg,
        isDisabled: isDisabled,
      };

      setIsLoading(true);
      const res = await axios.post(`/employee/create`, obj);
      if (res?.data?.success) {
        reset();
        setIsDisabled(false);
        setFileList([]);
        setSelectedFile();
        setFileError("");
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
        <Breadcrumb routeSegments={[{ name: "New Employee" }]} />
      </div>

      <Grid container>
        <Grid item md={6} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Add New Employee" />

            <form className="px-4 py-6" onSubmit={handleSubmit(formSubmitHandler)}>
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
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Email<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      name="email"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("email")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.email?.message}</small>
                    </p>
                  </Box>
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
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Password<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      name="password"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("password")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.password?.message}</small>
                    </p>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Upload Image
                    </Typography>
                    <Upload listType="picture-card" fileList={fileList} onChange={imageHandler}>
                      {fileList.length >= 1 ? null : (
                        <span>
                          <Icon style={{ color: "gray" }}>photo_size_select_actual</Icon>
                        </span>
                      )}
                    </Upload>

                    <p style={{ color: "red" }}>
                      <small>{fileError}</small>
                    </p>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <IOSSwitch
                          sx={{ m: 1 }}
                          checked={!isDisabled}
                          onClick={() => setIsDisabled(!isDisabled)}
                        />
                      }
                      label={isDisabled ? "Disable" : "Enable"}
                    />
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
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Save"}
              </Button>
            </form>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default CreateEmployee;
