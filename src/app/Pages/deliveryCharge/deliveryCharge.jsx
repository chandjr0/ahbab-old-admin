import React, { useState } from "react";
import {
  Button,
  Card,
  Grid,
  TextField,
  Box,
  CircularProgress,
  CardHeader,
  InputLabel,
} from "@material-ui/core";
import { notification } from "antd";
import { Breadcrumb, RichTextEditor } from "../../components";
import axios from "../../../axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useEffect } from "react";
import Spinner from "../../Shared/Spinner/Spinner";

const DeliveryCharge = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [miniDetails, setMiniDetails] = useState("");
  const [midDescription, setMidDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    inside: Yup.number()
      .required("inside price is required")
      .typeError("inside price is required"),
    outside: Yup.number()
      .required("outside price is required")
      .typeError("outside price is required"),
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
    // reset,
    // control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPageLoading(true);
        let res = await axios.get("/setting/admin/view");
        if (res) {
          let data = res?.data?.data;
          setValue("inside", data?.deliveryCharge?.inside?.amount);
          setValue("outside", data?.deliveryCharge?.outside?.amount);
          setMiniDetails(data?.deliveryCharge?.miniDetails);
          setMidDescription(data?.deliveryCharge?.midDescription);
          setLongDescription(data?.deliveryCharge?.longDescription);
        }
        setIsPageLoading(false);
      } catch (err) {
        setIsPageLoading(false);
      }
    };
    fetchData();
  }, [setValue]);

  const formSubmitHandler = async (data) => {
    try {
      let obj = {
        inside: data?.inside,
        outside: data?.outside,
        miniDetails: miniDetails,
        midDescription: midDescription,
        longDescription: longDescription,
      };

      setIsLoading(true);
      const res = await axios.patch(`/setting/admin/update-delivery-charge`, obj);
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

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "deliver charge" }]} />
      </div>

      <Grid container>
        <Grid item md={8} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Delivery Charge" />

            {!isPageLoading ? (
              <form
                className="px-4 py-6"
                onSubmit={handleSubmit(formSubmitHandler)}
              >
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <InputLabel className="mb-2 text-black">Inside</InputLabel>
                    <TextField
                      type="number"
                      inputProps={{ min: 0 }}
                      
                      onKeyPress={(event) => {
                        if (event?.key === "-" || event?.key === "+") {
                          event.preventDefault();
                        }
                      }}
                      name="inside"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("inside")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.inside?.message}</small>
                    </p>
                  </Grid>
                  <Grid item md={4} xs={12}>
                    <InputLabel className="mb-2 text-black">Outside</InputLabel>
                    <TextField
                      type="number"
                      inputProps={{ min: 0 }}
                      onKeyPress={(event) => {
                        if (event?.key === "-" || event?.key === "+") {
                          event.preventDefault();
                        }
                      }}
                      name="outside"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("outside")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.outside?.message}</small>
                    </p>
                  </Grid>
                  <Grid item xs={12}>
                    <InputLabel className="mb-2 text-black">
                      Mini description
                    </InputLabel>
                    <TextField
                      label=""
                      variant="outlined"
                      size="small"
                      multiline
                      minRows={3}
                      fullWidth
                      value={miniDetails}
                      onChange={(e) => setMiniDetails(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <InputLabel className="mb-2 text-black">
                      Mid description
                    </InputLabel>
                    <RichTextEditor
                      className="mb-4 border-none"
                      content={midDescription}
                      handleContentChange={(content) =>
                        setMidDescription(content)
                      }
                      placeholder="write here..."
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.name?.message}</small>
                    </p>
                  </Grid>
                  <Grid item xs={12}>
                    <InputLabel className="mb-2 text-black">
                      Long description
                    </InputLabel>
                    <RichTextEditor
                      className="mb-4 border-none"
                      content={longDescription}
                      handleContentChange={(content) =>
                        setLongDescription(content)
                      }
                      placeholder="write here..."
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.name?.message}</small>
                    </p>
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
                    "Update"
                  )}
                </Button>
              </form>
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
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default DeliveryCharge;
