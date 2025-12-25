import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Grid,
  Icon,
  Box,
  CircularProgress,
  CardHeader,
  Typography,
} from "@material-ui/core";
import { notification } from "antd";
import { Breadcrumb } from "../../components";
import axios from "../../../axios";
import { Upload } from "antd";
import imageBasePath from "../../../config";
import Spinner from "../../Shared/Spinner/Spinner";
import { getBase64 } from "../../util/getBase64";

const PopupImage = () => {
  const [leftSelectedFile, setLeftSelectedFile] = useState();
  const [leftFileList, setLeftFileList] = useState([]);
  const [leftFileError, setLeftFileError] = useState("");

  const [rightSelectedFile, setRightSelectedFile] = useState();
  const [rightFileList, setRightFileList] = useState([]);
  const [rightFileError, setRightFileError] = useState("");

  const [featureSelectedFile, setFeatureSelectedFile] = useState();
  const [featureFileList, setFeatureFileList] = useState([]);
  const [featureFileError, setFeatureFileError] = useState("");

  const [url, setUrl] = useState("");

  // const [webFileError, setWebFileError] = useState("");
  // const [mobileFileError, setMobileFileError] = useState("");

  const [isOfferLoading, setIsOfferLoading] = useState(false);
  const [isFeatureLoading, setFeatureLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPageLoading(true);
        let res = await axios.get("/setting/admin/view");
        if (res) {
          let data = res?.data?.data;

          console.log("data: ", data);

          if (data?.offerBanner?.left) {
            setLeftFileList([
              {
                url: imageBasePath + "/" + data?.offerBanner?.left,
              },
            ]);
          }

          if (data?.offerBanner?.right) {
            setRightFileList([
              {
                url: imageBasePath + "/" + data?.offerBanner?.right,
              },
            ]);
          }

          if (data?.featureBanner?.one) {
            setFeatureFileList([
              {
                url: imageBasePath + "/" + data?.featureBanner?.one,
              },
            ]);
          }
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

  const offerFormSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      let leftBaseImg = "";
      if (leftSelectedFile) {
        leftBaseImg = await getBase64(leftSelectedFile);
      } else if (leftFileList.length > 0) {
        leftBaseImg = leftFileList[0].url.split(imageBasePath + "/")[1];
      }

      let rightBaseImg = "";
      if (rightSelectedFile) {
        rightBaseImg = await getBase64(rightSelectedFile);
      } else if (rightFileList.length > 0) {
        rightBaseImg = rightFileList[0].url.split(imageBasePath + "/")[1];
      }

      let obj = {
        left: leftBaseImg,
        right: rightBaseImg,
      };

      setIsOfferLoading(true);
      const res = await axios.patch(`/setting/update-offer-banner-img`, obj);
      if (res?.data?.success) {
        setLeftFileError("");
        setRightFileError("");
        openNotificationWithIcon(res?.data?.message, "success");
      } else {
        openNotificationWithIcon(res?.data?.message, "error");
      }
      setIsOfferLoading(false);
    } catch (err) {
      setIsOfferLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  const featureFormSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      let featureBaseImg = "";
      if (featureSelectedFile) {
        featureBaseImg = await getBase64(featureSelectedFile);
      } else if (featureFileList.length > 0) {
        featureBaseImg = featureFileList[0].url.split(imageBasePath + "/")[1];
      }

      let obj = {
        one: featureBaseImg,
      };

      setIsOfferLoading(true);
      const res = await axios.patch(`/setting/update-feature-banner-img`, obj);
      if (res?.data?.success) {
        setFeatureFileError("");
        openNotificationWithIcon(res?.data?.message, "success");
      } else {
        openNotificationWithIcon(res?.data?.message, "error");
      }
      setIsOfferLoading(false);
    } catch (err) {
      setIsOfferLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  const leftImageHandler = ({ fileList: newFileList }) => {
    setLeftFileList(newFileList);
    if (
      newFileList[0]?.originFileObj.type === "image/jpeg" ||
      newFileList[0]?.originFileObj.type === "image/jpg" ||
      newFileList[0]?.originFileObj.type === "image/png" || 
      newFileList[0]?.originFileObj.type === "image/webp"
    ) {
      setLeftSelectedFile(newFileList[0]?.originFileObj);
      setLeftFileError("");
    } else {
      setLeftFileError("Image must be (jpeg, jpg or png) format!");
    }
  };

  const rightImageHandler = ({ fileList: newFileList }) => {
    setRightFileList(newFileList);
    if (
      newFileList[0]?.originFileObj.type === "image/jpeg" ||
      newFileList[0]?.originFileObj.type === "image/jpg" ||
      newFileList[0]?.originFileObj.type === "image/png" || 
      newFileList[0]?.originFileObj.type === "image/webp"
    ) {
      setRightSelectedFile(newFileList[0]?.originFileObj);
      setRightFileError("");
    } else {
      setRightFileError("Image must be (jpeg, jpg or png) format!");
    }
  };

  const featureImageHandler = ({ fileList: newFileList }) => {
    setFeatureFileList(newFileList);
    if (
      newFileList[0]?.originFileObj.type === "image/jpeg" ||
      newFileList[0]?.originFileObj.type === "image/jpg" ||
      newFileList[0]?.originFileObj.type === "image/png" || 
      newFileList[0]?.originFileObj.type === "image/webp"
    ) {
      setFeatureSelectedFile(newFileList[0]?.originFileObj);
      setFeatureFileError("");
    } else {
      setFeatureFileError("Image must be (jpeg, jpg or png) format!");
    }
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "banner" }]} />
      </div>

      <Grid container>
        <Grid item md={6} xs={12} className="mb-4">
          <Card elevation={3}>
            <CardHeader title="Offer Banner" />

            {!isPageLoading ? (
              <form className="px-4 py-6" onSubmit={offerFormSubmitHandler}>
                <Grid container spacing={3}>
                  <Grid item sm={8} xs={12}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography className="mb-2">Left Banner</Typography>
                        <Upload
                          listType="picture-card"
                          fileList={leftFileList}
                          onChange={leftImageHandler}
                        >
                          {leftFileList.length >= 1 ? null : (
                            <span>
                              <Icon style={{ color: "gray" }}>photo_size_select_actual</Icon>
                            </span>
                          )}
                        </Upload>

                        <p style={{ color: "red" }}>
                          <small>{leftFileError}</small>
                        </p>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography className="mb-2">Right Banner</Typography>
                        <Upload
                          listType="picture-card"
                          fileList={rightFileList}
                          onChange={rightImageHandler}
                        >
                          {rightFileList.length >= 1 ? null : (
                            <span>
                              <Icon style={{ color: "gray" }}>photo_size_select_actual</Icon>
                            </span>
                          )}
                        </Upload>

                        <p style={{ color: "red" }}>
                          <small>{rightFileError}</small>
                        </p>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Button
                  className="mb-4 mt-2 px-12"
                  variant="contained"
                  color="primary"
                  type="submit"
                  style={{ marginRight: "20px" }}
                  disabled={isOfferLoading}
                >
                  {isOfferLoading ? <CircularProgress size={24} color="inherit" /> : "Update"}
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

        <Grid item md={6} xs={12} className="mb-4"></Grid>

        <Grid item md={6} xs={12} className="mb-4">
          <Card elevation={3}>
            <CardHeader title="Feature Banner" />

            {!isPageLoading ? (
              <form className="px-4 py-6" onSubmit={featureFormSubmitHandler}>
                <Grid container spacing={3}>
                  <Grid item sm={8} xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography className="mb-2">Feature Banner</Typography>
                      <Upload
                        listType="picture-card"
                        fileList={featureFileList}
                        onChange={featureImageHandler}
                      >
                        {featureFileList.length >= 1 ? null : (
                          <span>
                            <Icon style={{ color: "gray" }}>photo_size_select_actual</Icon>
                          </span>
                        )}
                      </Upload>

                      <p style={{ color: "red" }}>
                        <small>{featureFileError}</small>
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
                  disabled={isFeatureLoading}
                >
                  {isFeatureLoading ? <CircularProgress size={24} color="inherit" /> : "Update"}
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

export default PopupImage;
