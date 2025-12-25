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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@material-ui/core";
import { Image, notification } from "antd";
import { Breadcrumb } from "../../components";
import axios from "../../../axios";
import { Upload } from "antd";
import imageBasePath from "../../../config";
import Spinner from "../../Shared/Spinner/Spinner";
import { RiDeleteBin3Line } from "react-icons/ri";
import SimpleModal from "../../Shared/SimpleModal/SimpleModal";
import { getBase64 } from "../../util/getBase64";

const SliderImages = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [url, setUrl] = useState("");
  const [fileError, setFileError] = useState("");
  const [dataList, setDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deleteData, setDeleteData] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  // New state for mobile slider images
  const [isLoadingMobie, setIsLoadingMobie] = useState(false);
  const [mobileSliderList, setMobileSliderList] = useState([]);
  const [selectedMobileFile, setSelectedMobileFile] = useState(null);
  const [fileMobileList, setFileMobileList] = useState([]);
  const [mobileUrl, setMobileUrl] = useState("");
  const [fileMobileError, setFileMobileError] = useState("");
  const [deleteDataMobile, setDeleteDataMobile] = useState(null);
  const [mobileConfrimShow, setMobileConfirmShow] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPageLoading(true);
        let res = await axios.get("/setting/admin/view");
        if (res) {
          let data = res?.data?.data;
          setDataList(data?.sliderImgs);
          setMobileSliderList(data?.sliderImgsForMobile);
        }
        setIsPageLoading(false);
        setErrorMsg("");
      } catch (err) {
        setIsPageLoading(false);
        setErrorMsg(err?.response?.data?.message);
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
      if (fileError) return;

      let baseImg = "";
      if (selectedFile) {
        baseImg = await getBase64(selectedFile);
      }

      if (baseImg === "") {
        openNotificationWithIcon("Add a image", "error");
        return;
      }

      let obj = {
        url: url,
        image: baseImg,
      };

      setIsLoading(true);
      const res = await axios.patch(`/setting/admin/upload-slider-image`, obj);
      if (res?.data?.success) {
        setUrl("");
        setFileList([]);
        setSelectedFile(null);
        setDataList(res?.data?.data);
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

  // New form submit handler for mobile slider images
  const formSubmitMobileHandler = async (event) => {
    event.preventDefault();
    try {
      if (fileMobileError) return;

      let baseMobileImg = "";
      if (selectedMobileFile) {
        baseMobileImg = await getBase64(selectedMobileFile);
      }

      if (baseMobileImg === "") {
        openNotificationWithIcon("Add a mobile image", "error");
        return;
      }

      let obj = {
        url: mobileUrl,
        image: baseMobileImg,
      };

      setIsLoadingMobie(true);
      const res = await axios.patch(
        `/setting/admin/upload-slider-image-mobile`,
        obj
      );
      if (res?.data?.success) {
        setMobileUrl("");
        setFileMobileList([]);
        setSelectedMobileFile(null);
        setMobileSliderList(res?.data?.data);
        setFileMobileError("");
        openNotificationWithIcon(res?.data?.message, "success");
      } else {
        openNotificationWithIcon(res?.data?.message, "error");
      }
      setIsLoadingMobie(false);
    } catch (err) {
      setIsLoadingMobie(false);
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

  // New image handler for mobile slider images
  const imageHandlerMobile = ({ fileList: newFileList }) => {
    setFileMobileList(newFileList);
    if (
      newFileList[0]?.originFileObj.type === "image/jpeg" ||
      newFileList[0]?.originFileObj.type === "image/jpg" ||
      newFileList[0]?.originFileObj.type === "image/png" ||
      newFileList[0]?.originFileObj.type === "image/webp"
    ) {
      setSelectedMobileFile(newFileList[0]?.originFileObj);
      setFileMobileError("");
    } else {
      setFileMobileError("Image must be (jpeg, jpg, png or webp) format!");
    }
  };

  // Closing modal and delete logic remains the same
  const closeModalHandler = () => {
    setDeleteData(false);
    setIsOpenModal(false);
  };

  const deleteHandler = async () => {
    try {
      console.log("From delet data web: ", deleteData);
      let res = await axios.post(
        `/setting/admin/delete-slider-image`,
        deleteData
      );
      setDeleteData(null);
      setDataList(res?.data?.data);
      openNotificationWithIcon(res?.data?.message, "success");
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
    setDeleteData(null);
    setIsOpenModal(false);
  };

  const deleteHandlerMobile = async () => {
    try {
      const res = await axios.delete(
        `/setting/admin/delete-slider-image-mobile`,
        {
          data: deleteDataMobile, // deleteDataMobile should be sent as the data object
        }
      );

      setDeleteDataMobile(null);
      setMobileSliderList(res?.data?.data); // Assuming this updates the mobile slider images list
      openNotificationWithIcon(res?.data?.message, "success");
      setMobileConfirmShow(false);
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
      setMobileConfirmShow(false);
    }

    setDeleteDataMobile(null);
    setIsOpenModal(false);
    setMobileConfirmShow(false);
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Slider Image" }]} />
      </div>

      <Grid container spacing={3}>
        <Grid item md={5} xs={12} className="mb-4">
          <Card elevation={3}>
            <CardHeader title="Add New Slider Image For Web" />

            <form className="px-4 py-6" onSubmit={formSubmitHandler}>
              <Grid container spacing={3}>
                <Grid item sm={8} xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography className="mb-2">
                      Image For Slider (700 x 400)
                    </Typography>
                    <Upload
                      listType="picture-card"
                      fileList={fileList}
                      onChange={imageHandler}
                    >
                      {fileList.length >= 1 ? null : (
                        <span>
                          <Icon style={{ color: "gray" }}>
                            photo_size_select_actual
                          </Icon>
                        </span>
                      )}
                    </Upload>

                    <p style={{ color: "red" }}>
                      <small>{fileError}</small>
                    </p>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <InputLabel className="mb-2 text-black">
                      Add a link for pop up image
                    </InputLabel>
                    <TextField
                      label=""
                      placeholder="https://...."
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
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
                  "Add"
                )}
              </Button>
            </form>
          </Card>
        </Grid>
        <Grid item md={5} xs={12} className="mb-4">
          <Card elevation={3}>
            <CardHeader title="Add New Slider Image For Mobile" />

            <form className="px-4 py-6" onSubmit={formSubmitMobileHandler}>
              <Grid container spacing={3}>
                <Grid item sm={8} xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography className="mb-2">
                      Image For Slider (350 x 200)
                    </Typography>
                    <Upload
                      listType="picture-card"
                      fileList={fileMobileList}
                      onChange={imageHandlerMobile}
                    >
                      {fileMobileList.length >= 1 ? null : (
                        <span>
                          <Icon style={{ color: "gray" }}>
                            photo_size_select_actual
                          </Icon>
                        </span>
                      )}
                    </Upload>

                    <p style={{ color: "red" }}>
                      <small>{fileMobileError}</small>
                    </p>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <InputLabel className="mb-2 text-black">
                      Add a link for pop up image
                    </InputLabel>
                    <TextField
                      label=""
                      placeholder="https://...."
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={mobileUrl}
                      onChange={(e) => setMobileUrl(e.target.value)}
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
                disabled={isLoadingMobie}
              >
                {isLoadingMobie ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Add"
                )}
              </Button>
            </form>
          </Card>
        </Grid>

        <Grid item md={5} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Web Slider Images" />
            {!isPageLoading ? (
              <div className="w-full overflow-auto  px-6 py-8">
                {dataList.length > 0 && errorMsg === "" ? (
                  <Table className="whitespace-pre">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">
                          <strong>#</strong>
                        </TableCell>
                        <TableCell align="center">Image</TableCell>
                        <TableCell align="center">Url</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dataList.map((data, index) => (
                        <TableRow key={index}>
                          <TableCell className="capitalize" align="center">
                            {index + 1}
                          </TableCell>
                          <TableCell className="capitalize" align="center">
                            <Image
                              width={200}
                              src={imageBasePath + "/" + data?.image}
                            />
                          </TableCell>
                          <TableCell className="capitalize" align="center">
                            {data?.url ? data?.url : "---"}
                          </TableCell>

                          <TableCell align="center">
                            <IconButton
                              onClick={() => {
                                setIsOpenModal(true);
                                setDeleteData(data);
                              }}
                              style={{
                                backgroundColor: "#ebedec",
                                color: "red",
                              }}
                            >
                              <RiDeleteBin3Line style={{ fontSize: "16px" }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography
                    variant="body2"
                    style={{
                      textAlign: "center",
                      color: "gray",
                      paddingY: "14px",
                      padding: "8px",
                    }}
                  >
                    No Data Found
                  </Typography>
                )}
              </div>
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
        <Grid item md={5} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Mobile Slider Images" />
            {!isPageLoading ? (
              <div className="w-full overflow-auto  px-6 py-8">
                {mobileSliderList?.length > 0 && errorMsg === "" ? (
                  <Table className="whitespace-pre">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">
                          <strong>#</strong>
                        </TableCell>
                        <TableCell align="center">Image</TableCell>
                        <TableCell align="center">Url</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mobileSliderList?.map((data, index) => (
                        <TableRow key={index}>
                          <TableCell className="capitalize" align="center">
                            {index + 1}
                          </TableCell>
                          <TableCell className="capitalize" align="center">
                            <Image
                              width={200}
                              src={imageBasePath + "/" + data?.image}
                            />
                          </TableCell>
                          <TableCell className="capitalize" align="center">
                            {data?.url ? data?.url : "---"}
                          </TableCell>

                          <TableCell align="center">
                            <IconButton
                              onClick={() => {
                                setIsOpenModal(true);
                                setDeleteDataMobile(data);
                                setMobileConfirmShow(true);
                              }}
                              style={{
                                backgroundColor: "#ebedec",
                                color: "red",
                              }}
                            >
                              <RiDeleteBin3Line style={{ fontSize: "16px" }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography
                    variant="body2"
                    style={{
                      textAlign: "center",
                      color: "gray",
                      paddingY: "14px",
                      padding: "8px",
                    }}
                  >
                    No Data Found
                  </Typography>
                )}
              </div>
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

      <SimpleModal isShow={isOpenModal} closeModalHandler={closeModalHandler}>
        {deleteData || deleteDataMobile ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <Box>
              <Typography variant="h5">Are you sure?</Typography>
            </Box>
            <Box>
              <Button
                variant="contained"
                color="secondary"
                className="mr-4"
                onClick={
                  mobileConfrimShow ? deleteHandlerMobile : deleteHandler
                }
              >
                Yes
              </Button>
              <Button variant="outlined" onClick={() => setIsOpenModal(false)}>
                No
              </Button>
            </Box>
          </Box>
        ) : (
          ""
        )}
      </SimpleModal>
    </div>
  );
};

export default SliderImages;
