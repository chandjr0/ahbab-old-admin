import React, { useState } from "react";
import {
  Button,
  Card,
  Grid,
  TextField,
  Box,
  Typography,
  CircularProgress,
  FormControlLabel,
  CardHeader,
} from "@material-ui/core";
import { notification } from "antd";
import { Breadcrumb } from "../../components/index";
import axios from "../../../axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import IOSSwitch from "../../Shared/Forms/iosSwitch";

const CreateAttribute = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisable] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("name is required")
      .min(3, "too small name, minimum 2 character")
      .max(60, "too big name, maximum 30 character "),
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
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const formSubmitHandler = async (data) => {
    try {
      setIsLoading(true);
      const createRes = await axios.post(`/attribute/create`, { name: data.name, isDisabled });
      if (createRes?.data?.success) {
        openNotificationWithIcon(createRes?.data?.message, "success");
        reset();
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "New Attribute" }]} />
      </div>

      <Grid container>
        <Grid item md={6} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Add New Attribute" />

            <form className="px-4 py-6" onSubmit={handleSubmit(formSubmitHandler)}>
              <Grid container spacing={3}>
                <Grid item sm={8} xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">
                      Name<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      className="mt-2"
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
                    <FormControlLabel
                      control={
                        <IOSSwitch
                          sx={{ m: 1 }}
                          checked={!isDisabled}
                          onClick={() => setIsDisable(!isDisabled)}
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
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Save Attribute"}
              </Button>
            </form>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default CreateAttribute;
