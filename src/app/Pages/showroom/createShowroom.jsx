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
      address: Yup.string().required("Address is required"),
    phone: Yup.string().required("phone is required"),
   
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
     
      let obj = {
        name: data.name,
        address: data.address,
        phones: data.phone,
        
      };

      setIsLoading(true);
      const res = await axios.post(`/setting/showroom/create`, obj);
      if (res?.data?.success) {
        openNotificationWithIcon(res?.data?.message, "success");
        reset()
      } else {
        openNotificationWithIcon(res?.data?.message, "error");
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };



  return (
    <div className="m-sm-30">
      <Grid container>
        <Grid item md={6} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Add New Showroom" />

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
