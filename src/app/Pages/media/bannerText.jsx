import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Grid,
  TextField,
  Box,
  CircularProgress,
  CardHeader,
  InputLabel,
  Typography,
} from "@material-ui/core";
import { notification } from "antd";
import { Breadcrumb } from "../../components";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";

const BannerText = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [bannerTextOne, setBannerTextOne] = useState("");
  const [bannerTextTwo, setBannerTextTwo] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPageLoading(true);
        let res = await axios.get("/setting/admin/view");
        if (res) {
          let data = res?.data?.data;
          setBannerTextOne(data?.bannerText?.bannerOne);
          setBannerTextTwo(data?.bannerText?.bannerTwo);
        }
        setIsPageLoading(false);
      } catch (err) {
        setIsPageLoading(false);
      }
    };
    fetchData();
  }, []);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const formSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      let obj = {
        bannerText: {
          bannerOne: bannerTextOne,
          bannerTwo: bannerTextTwo,
        },
      };

      setIsLoading(true);
      const res = await axios.patch(`/setting/admin/update-banner-text`, obj);
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
        <Breadcrumb routeSegments={[{ name: "Banner Text" }]} />
      </div>

      <Grid container>
        <Grid item md={6} xs={12} className="mb-4">
          <Card elevation={3}>
            <CardHeader title="Update Banner Text" />

            {!isPageLoading ? (
              <form className="px-4 py-6" onSubmit={formSubmitHandler}>
                <Grid container spacing={3}>
                  <Grid item sm={8} xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-2 text-black">Banner text one</InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={bannerTextOne}
                        onChange={(e) => setBannerTextOne(e.target.value)}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-2 text-black">Banner text two</InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={bannerTextTwo}
                        onChange={(e) => setBannerTextTwo(e.target.value)}
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
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : "Update"}
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

export default BannerText;
