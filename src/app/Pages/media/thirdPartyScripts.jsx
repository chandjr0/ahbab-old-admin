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
import moment from "moment";

const FbPixel = () => {
  const [pixelScriptH, setPixelScriptH] = useState("");
  const [pixelScriptF, setPixelScriptF] = useState("");

  const [pixelTime, setPixelTime] = useState();
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPageLoading(true);
        let res = await axios.get("/setting/admin/fetch-other-script");
        if (res) {
          let data = res?.data?.data;
          setPixelScriptH(data?.header);
          setPixelScriptF(data?.body);
          setPixelTime(data?.time);

          console.log("script: ", data?.script);
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
      setIsLoading(true);
      const res = await axios.patch(`/setting/admin/update-other-script`, {
        header: pixelScriptH,
        body: pixelScriptF,
      });
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
        <Breadcrumb routeSegments={[{ name: "Third Party Scripts" }]} />
      </div>

      <Grid container>
        <Grid item md={6} xs={12} className="mb-4">
          <Card elevation={3}>
            <CardHeader title="Third Party Scripts" />

            {!isPageLoading ? (
              <form className="px-4 py-6" onSubmit={formSubmitHandler}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <div className="flex items-center justify-between">
                      <InputLabel className="mb-2 text-black">Header Scripts</InputLabel>
                       <InputLabel className="mb-2 text-black">{`Last update: ${moment(
                        pixelTime
                      ).format("lll")}`}</InputLabel>
                      </div>
                     
                      <TextField
                        multiline
                        minRows={10}
                        label=""
                        placeholder="paste your pixel code here..."
                        variant="outlined"
                        fullWidth
                        value={pixelScriptH}
                        onChange={(e) => setPixelScriptH(e.target.value)}
                      />
                    </Box>
                  </Grid>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-2 text-black">{`Body Scripts`}</InputLabel>
                      <TextField
                        multiline
                        minRows={10}
                        label=""
                        placeholder="paste your pixel code here..."
                        variant="outlined"
                        fullWidth
                        value={pixelScriptF}
                        onChange={(e) => setPixelScriptF(e.target.value)}
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

export default FbPixel;
