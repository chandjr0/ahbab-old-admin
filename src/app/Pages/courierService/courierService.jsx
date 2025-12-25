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
} from "@material-ui/core";
import { notification } from "antd";
import { Breadcrumb } from "../../components";
import axios from "../../../axios";
import Spinner from "../../Shared/Spinner/Spinner";

const CourierService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [stdApiKey, setStdApiKey] = useState("");
  const [stdSkKey, setStdSkKey] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPageLoading(true);
        let res = await axios.get("/courier-service/fetch");
        if (res) {
          let data = res?.data?.data;
          setStdApiKey(data?.steadfast?.STEADFAST_API_KEY);
          setStdSkKey(data?.steadfast?.STEADFAST_SK);
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
        steadfast: {
          STEADFAST_API_KEY: stdApiKey.replace(/ +/g, ""),
          STEADFAST_SK: stdSkKey.replace(/ +/g, ""),
        },
      };

      setIsLoading(true);
      const res = await axios.patch(`/courier-service/update`, obj);
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
        <Breadcrumb routeSegments={[{ name: "CourierService" }]} />
      </div>

      <Grid container>
        <Grid item md={6} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Update Courier API Keys" />

            {!isPageLoading ? (
              <form className="px-4 py-6" onSubmit={formSubmitHandler}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <h3 className="mb-6 text-primary">Steadfast API</h3>
                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-1 text-black">Api Key</InputLabel>
                      <TextField
                        label=""
                        placeholder="enter steadfast api key"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={stdApiKey}
                        onChange={(e) => setStdApiKey(e.target.value)}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-1 text-black">Secret Key</InputLabel>
                      <TextField
                        label=""
                        placeholder="enter steadfast sk key"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={stdSkKey}
                        onChange={(e) => setStdSkKey(e.target.value)}
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

export default CourierService;
