import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Grid,
  CircularProgress,
  CardHeader,
  InputLabel,
  InputAdornment,
  IconButton,
  FormControl,
  OutlinedInput,
  TextField,
  Box,
} from "@material-ui/core";
import { notification } from "antd";
import { Breadcrumb } from "../../components";
import axios from "../../../axios";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

const Profile = () => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    oldPassword: Yup.string()
      .required("old password required")
      .min(4, "too small, minimum 4 character"),
    newPassword: Yup.string()
      .required("new password is required")
      .min(4, "New Password at least 4 character"),
    confirmPassword: Yup.string().oneOf(
      [Yup.ref("newPassword"), null],
      "Confirm password doesn't match to new password"
    ),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const formSubmitHandler = async (data) => {
    try {
      let obj = {
        oldPassword: data?.oldPassword,
        newPassword: data?.newPassword,
      };

      setIsLoading(true);
      const res = await axios.post(`/admin/password-update`, obj);
      if (res) {
        reset();
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
        <Breadcrumb routeSegments={[{ name: "Profile" }]} />
      </div>

      <Grid container>
        <Grid item md={6} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Update Admin Password" />

            <form className="px-4 py-6" onSubmit={handleSubmit(formSubmitHandler)}>
              <Grid container spacing={3}>
                <Grid item sm={8} xs={12}>
                  <Box sx={{ mb: 3 }}>
                    <InputLabel className="mb-2 text-black">Old Password</InputLabel>
                    <FormControl size="small" fullWidth variant="filled">
                      <OutlinedInput
                        type={showOldPassword ? "text" : "password"}
                        name="oldPassword"
                        {...register("oldPassword")}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              onClick={() => setShowOldPassword(!showOldPassword)}
                            >
                              {showOldPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                    <p style={{ color: "red" }}>{errors.oldPassword?.message}</p>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <InputLabel className="mb-2 text-black">New Password</InputLabel>
                    <FormControl size="small" fullWidth variant="filled">
                      <OutlinedInput
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        {...register("newPassword")}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                    <p style={{ color: "red" }}>{errors.newPassword?.message}</p>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <InputLabel className="mb-2 text-black">Confirm Password</InputLabel>
                    <FormControl size="small" fullWidth variant="filled">
                      <OutlinedInput
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        {...register("confirmPassword")}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                    <p style={{ color: "red" }}>{errors.confirmPassword?.message}</p>
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
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Update"}
              </Button>
            </form>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Profile;
