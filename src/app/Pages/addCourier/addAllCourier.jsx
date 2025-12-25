import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Grid,
  Icon,
  TextField,
  Box,
  CircularProgress,
  CardHeader,
  Typography,
  InputLabel,
  FormControlLabel,
  Switch,
  Collapse,
} from "@material-ui/core";
import { notification } from "antd";
import { Breadcrumb } from "../../components";
import axios from "../../../axios";
import { Upload } from "antd";
import imageBasePath from "../../../config";
import Spinner from "../../Shared/Spinner/Spinner";
// import { convertImageToBase64 } from "../../util/convertImageToBase64";
import { getBase64 } from "../../util/getBase64";
import { CompactPicker, SketchPicker } from "react-color";
import IOSSwitch from "../../Shared/Forms/iosSwitch";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import useCourierStatus from "../../hooks/Courier/useFetchAllCourier";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [pathaoId, setPathaoId] = useState("");
  const [steadfastId, setSteadFastId] = useState("");
  const validationSchema = Yup.object().shape({
    PATHAO_BASE: Yup.string().required("PATHAO BASE is Required"),
    PATHAO_CLIENT_ID: Yup.string().required("CLIENT ID is Required"),
    PATHAO_CLIENT_SECRET: Yup.string().required("CLIENT SECRET is Required"),
    PATHAO_USERNAME: Yup.string().required("USER NAME is Required"),
    PATHAO_PASSWORD: Yup.string().required("PASSWORD is Required"),
    PATHAO_GRANT_TYPE: Yup.string().required("GRANT TYPE is Required"),
    PATHAO_SENDER_NAME: Yup.string().required("SENDER NAME is Required"),
    PATHAO_SENDER_PHONE: Yup.string().required("SENDER PHONE is Required"),
    STEADFAST_API_KEY: Yup.string().required("STEADFAST API KEY is Required"),
    STEADFAST_SK: Yup.string().required("STEADFAST SECRET KEY is Required"),
    STEADFAST_CLIENT_ID: Yup.string().required(
      "STEADFAST CLIENT ID is Required"
    ),
  });

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
    const fetchData = async () => {
      try {
        setIsPageLoading(true);
        let res = await axios.get("/courier-service/api/fetch");
        if (res) {
          let data = res?.data?.data;

          setValue("PATHAO_BASE", data?.pathao?.PATHAO_BASE);
          setValue("PATHAO_CLIENT_ID", data?.pathao?.PATHAO_CLIENT_ID);
          setValue("PATHAO_CLIENT_SECRET", data?.pathao?.PATHAO_CLIENT_SECRET);
          setValue("PATHAO_USERNAME", data?.pathao?.PATHAO_USERNAME);
          setValue("PATHAO_PASSWORD", data?.pathao?.PATHAO_PASSWORD);
          setValue("PATHAO_GRANT_TYPE", data?.pathao?.PATHAO_GRANT_TYPE);
          setValue("PATHAO_SENDER_NAME", data?.pathao?.PATHAO_SENDER_NAME);
          setValue("PATHAO_SENDER_PHONE", data?.pathao?.PATHAO_SENDER_PHONE);
          setValue("PATHAO_WEBHOOK_KEY", data?.pathao?.PATHAO_WEBHOOK_KEY);
          setValue("STEADFAST_API_KEY", data?.steadfast?.STEADFAST_API_KEY);
          setValue("STEADFAST_SK", data?.steadfast?.STEADFAST_SK);
          setValue("STEADFAST_CLIENT_ID", data?.steadfast?.STEADFAST_CLIENT_ID);
        }
        setIsPageLoading(false);
      } catch (err) {
        setIsPageLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch couriers from API using useEffect
  useEffect(() => {
    const fetchCouriers = async () => {
      try {
        const response = await axios.get("/courier/fetch-all");
        const courierData = response?.data?.data || [];
        setPathaoId(courierData[0]?._id);
        setSteadFastId(courierData[1]?._id);
      } catch (error) {
        console.error("Error fetching couriers:", error);
      }
    };

    fetchCouriers();
  }, []); // Empty dependency array ensures the effect runs once when the component mounts

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const formSubmitHandler = async (data) => {
    // event.preventDefault();

    const obj = {
      steadfast: {
        steadfastId,
        STEADFAST_API_KEY: data.STEADFAST_API_KEY,
        STEADFAST_SK: data.STEADFAST_SK,
        STEADFAST_CLIENT_ID: data.STEADFAST_CLIENT_ID,
      },
      pathao: {
        pathaoId,
        PATHAO_BASE: data.PATHAO_BASE,
        PATHAO_CLIENT_ID: data.PATHAO_CLIENT_ID,
        PATHAO_CLIENT_SECRET: data.PATHAO_CLIENT_SECRET,
        PATHAO_USERNAME: data.PATHAO_USERNAME,
        PATHAO_PASSWORD: data.PATHAO_PASSWORD,
        PATHAO_GRANT_TYPE: data.PATHAO_GRANT_TYPE,
        PATHAO_SENDER_NAME: data.PATHAO_SENDER_NAME,
        PATHAO_SENDER_PHONE: data.PATHAO_SENDER_PHONE,
        PATHAO_WEBHOOK_KEY: data.PATHAO_WEBHOOK_KEY,
      },
    };

    try {
      setIsLoading(true);
      const res = await axios.patch(`/courier-service/api/update`, obj);
      if (res?.data?.success) {
        openNotificationWithIcon(res?.data?.message, "success");
        // window.location.reload();
      } else {
        openNotificationWithIcon(res?.data?.message, "error");
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  const {
    pathaoIsOn,
    steadfastIsOn,
    pathaoLoading,
    steadfastLoading,
    togglePathaoStatus,
    toggleSteadfastStatus,
  } = useCourierStatus(pathaoId, steadfastId);

  return (
    <div className="m-sm-30">
      <Grid>
        <Grid>
          <Box>
            {!isPageLoading ? (
              <form
                className="px-4 py-6"
                onSubmit={handleSubmit(formSubmitHandler)}
              >
                <Card fullWidth>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%", // Ensure full width of the card
                      padding: "16px", // Padding inside the card
                      gap: "16px", // Space between items (optional for better spacing)
                      "@media (min-width: 600px)": {
                        flexDirection: "row", // Change to row on larger screens
                      },
                    }}
                  >
                    <Box sx={{ width: "100%" }}>
                      <Box sx={{ mb: 3 }}>
                        <CardHeader
                          title="Add Pathao Courier"
                          action={
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <Typography>
                                {pathaoIsOn ? "ON" : "OFF"}
                              </Typography>
                              {pathaoLoading ? (
                                // Show loading spinner if loading state is true
                                <CircularProgress color="white" size={24} />
                              ) : (
                                <Switch
                                  checked={pathaoIsOn}
                                  onChange={(e) =>
                                    togglePathaoStatus(e.target.checked)
                                  }
                                  color="info"
                                />
                              )}
                            </div>
                          }
                        />
                      </Box>
                      {/* Smoothly show/hide the Box using Collapse */}
                      <Collapse in={pathaoIsOn} timeout="auto" unmountOnExit>
                        <Box>
                          <Box sx={{ mb: 2 }}>
                            <InputLabel className="mb-2 text-black">
                              PATHAO BASE{" "}
                              <span style={{ color: "red" }}>*</span>
                            </InputLabel>
                            <TextField
                              label=""
                              name="PATHAO_BASE"
                              variant="outlined"
                              size="small"
                              fullWidth
                              {...register("PATHAO_BASE")}
                            />
                          </Box>
                          <p style={{ color: "red" }}>
                            {errors.PATHAO_BASE?.message}
                          </p>

                          <Box sx={{ mb: 2 }}>
                            <InputLabel className="mb-2 text-black">
                              PATHAO CLIENT ID{" "}
                              <span style={{ color: "red" }}>*</span>
                            </InputLabel>
                            <TextField
                              label=""
                              name="PATHAO_CLIENT_ID"
                              variant="outlined"
                              size="small"
                              fullWidth
                              {...register("PATHAO_CLIENT_ID")}
                            />
                          </Box>
                          <p style={{ color: "red" }}>
                            {errors.PATHAO_CLIENT_ID?.message}
                          </p>

                          <Box sx={{ mb: 2 }}>
                            <InputLabel className="mb-2 text-black">
                              PATHAO CLIENT SECRET{" "}
                              <span style={{ color: "red" }}>*</span>
                            </InputLabel>
                            <TextField
                              name="name"
                              label=""
                              variant="outlined"
                              size="small"
                              fullWidth
                              {...register("PATHAO_CLIENT_SECRET")}
                            />
                          </Box>
                          <p style={{ color: "red" }}>
                            {errors.PATHAO_CLIENT_SECRET?.message}
                          </p>

                          <Box sx={{ mb: 2 }}>
                            <InputLabel className="mb-2 text-black">
                              PATHAO USERNAME{" "}
                              <span style={{ color: "red" }}>*</span>
                            </InputLabel>
                            <TextField
                              label=""
                              name="PATHAO_USERNAME"
                              variant="outlined"
                              size="small"
                              fullWidth
                              {...register("PATHAO_USERNAME")}
                            />
                          </Box>
                          <p style={{ color: "red" }}>
                            {errors.PATHAO_USERNAME?.message}
                          </p>

                          <Box sx={{ mb: 2 }}>
                            <InputLabel className="mb-2 text-black">
                              PATHAO PASSWORD{" "}
                              <span style={{ color: "red" }}>*</span>
                            </InputLabel>
                            <TextField
                              label=""
                              name="PATHAO_PASSWORD"
                              variant="outlined"
                              size="small"
                              fullWidth
                              {...register("PATHAO_PASSWORD")}
                            />
                          </Box>
                          <p style={{ color: "red" }}>
                            {errors.PATHAO_PASSWORD?.message}
                          </p>

                          <Box sx={{ mb: 2 }}>
                            <InputLabel className="mb-2 text-black">
                              PATHAO GRANT TYPE{" "}
                              <span style={{ color: "red" }}>*</span>
                            </InputLabel>
                            <TextField
                              label=""
                              name="PATHAO_GRANT_TYPE"
                              variant="outlined"
                              size="small"
                              fullWidth
                              {...register("PATHAO_GRANT_TYPE")}
                            />
                          </Box>
                          <p style={{ color: "red" }}>
                            {errors.PATHAO_GRANT_TYPE?.message}
                          </p>

                          <Box sx={{ mb: 2 }}>
                            <InputLabel className="mb-2 text-black">
                              PATHAO SENDER NAME{" "}
                              <span style={{ color: "red" }}>*</span>
                            </InputLabel>
                            <TextField
                              label=""
                              name="PATHAO_SENDER_NAME"
                              variant="outlined"
                              size="small"
                              fullWidth
                              {...register("PATHAO_SENDER_NAME")}
                            />
                          </Box>
                          <p style={{ color: "red" }}>
                            {errors.PATHAO_SENDER_NAME?.message}
                          </p>

                          <Box sx={{ mb: 2 }}>
                            <InputLabel className="mb-2 text-black">
                              PATHAO SENDER PHONE{" "}
                              <span style={{ color: "red" }}>*</span>
                            </InputLabel>
                            <TextField
                              label=""
                              name="PATHAO_SENDER_PHONE"
                              variant="outlined"
                              size="small"
                              fullWidth
                              {...register("PATHAO_SENDER_PHONE")}
                            />
                          </Box>
                          <p style={{ color: "red" }}>
                            {errors.PATHAO_SENDER_PHONE?.message}
                          </p>

                          <Box sx={{ mb: 2 }}>
                            <InputLabel className="mb-2 text-black">
                              PATHAO WEBHOOK KEY{" "}
                              <span style={{ color: "red" }}>*</span>
                            </InputLabel>
                            <TextField
                              label=""
                              name="PATHAO_WEBHOOK_KEY"
                              variant="outlined"
                              size="small"
                              fullWidth
                              {...register("PATHAO_WEBHOOK_KEY")}
                            />
                          </Box>
                          <p style={{ color: "red" }}>
                            {errors.PATHAO_WEBHOOK_KEY?.message}
                          </p>
                        </Box>
                      </Collapse>
                    </Box>
                    <Box sx={{ width: "100%" }}>
                      <Box sx={{ mb: 3 }}>
                        <CardHeader
                          title="Add Steadfast Courier"
                          action={
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <Typography>
                                {steadfastIsOn ? "ON" : "OFF"}
                              </Typography>
                              {steadfastLoading ? (
                                <CircularProgress color="info" size={24} />
                              ) : (
                                <Switch
                                  checked={steadfastIsOn}
                                  onChange={(e) =>
                                    toggleSteadfastStatus(e.target.checked)
                                  }
                                  color="info"
                                />
                              )}
                            </div>
                          }
                        />
                      </Box>

                      {/* Smoothly show/hide the Box using Collapse */}
                      <Collapse in={steadfastIsOn} timeout="auto" unmountOnExit>
                        <Box>
                          <Box sx={{ mb: 2 }}>
                            <InputLabel className="mb-2 text-black">
                              STEADFAST API KEY{" "}
                              <span style={{ color: "red" }}>*</span>
                            </InputLabel>
                            <TextField
                              label=""
                              name="STEADFAST_API_KEY"
                              variant="outlined"
                              size="small"
                              fullWidth
                              {...register("STEADFAST_API_KEY")}
                            />
                          </Box>
                          <p style={{ color: "red" }}>
                            {errors.STEADFAST_API_KEY?.message}
                          </p>

                          <Box sx={{ mb: 2 }}>
                            <InputLabel className="mb-2 text-black">
                              STEADFAST SECRET KEY{" "}
                              <span style={{ color: "red" }}>*</span>
                            </InputLabel>
                            <TextField
                              label=""
                              name="STEADFAST_SK"
                              variant="outlined"
                              size="small"
                              fullWidth
                              {...register("STEADFAST_SK")}
                            />
                          </Box>
                          <p style={{ color: "red" }}>
                            {errors.STEADFAST_SK?.message}
                          </p>

                          <Box sx={{ mb: 2 }}>
                            <InputLabel className="mb-2 text-black">
                              STEADFAST CLIENT ID{" "}
                              <span style={{ color: "red" }}>*</span>
                            </InputLabel>
                            <TextField
                              label=""
                              name="STEADFAST_CLIENT_ID"
                              variant="outlined"
                              size="small"
                              fullWidth
                              {...register("STEADFAST_CLIENT_ID")}
                            />
                          </Box>
                          <p style={{ color: "red" }}>
                            {errors.STEADFAST_CLIENT_ID?.message}
                          </p>
                        </Box>
                      </Collapse>
                    </Box>
                  </Box>
                </Card>
                {pathaoIsOn ? (
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Update"
                    )}
                  </Button>
                ) : steadfastIsOn ? (
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Update"
                    )}
                  </Button>
                ) : (
                  ""
                )}
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
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default Profile;
