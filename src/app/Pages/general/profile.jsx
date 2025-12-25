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
} from "@material-ui/core";
import { notification } from "antd";
import { Breadcrumb } from "../../components";
import axios from "../../../axios";
import { Upload } from "antd";
import imageBasePath from "../../../config";
import Spinner from "../../Shared/Spinner/Spinner";
// import { convertImageToBase64 } from "../../util/convertImageToBase64";
import { getBase64 } from "../../util/getBase64";
import IOSSwitch from "../../Shared/Forms/iosSwitch";

const Profile = () => {
  const [selectedFile, setSelectedFile] = useState();
  const [fileList, setFileList] = useState([]);
  const [footerLogoDescription, setFooterLogoDescription] = useState("");
  const [shopName, setShopName] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [facebookLink, setFacebookLink] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [roadNo, setRoadNo] = useState("");
  const [union, setUnion] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [fileError1, setFileError1] = useState("");
  const [fileError, setFileError] = useState("");
  const [showWhatsapp, setShowWhatsapp] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#194d33");
  const [secondaryColor, setSecondaryColor] = useState("#000000");
  const [instaLink, setInstaLink] = useState("");
  const [youtube, setyoutube] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [whatsappSharingNumber, setWhatsappSharingNumber] = useState("");
  const [fbPageSharingName, setFbPageSharingName] = useState("");
  const [showPromo, setShowPromo] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedFavIcon, setSelectedFavIcon] = useState("");
  const [favIcon, setFavIcon] = useState([]);
  const [footerPay, setFooterPay] = useState([]);
  const [footerIcon, setFooterIcon] = useState("");
  const [footerLogoFileList, setFooterLogoFileList] = useState([]);
  const [selectedFooterLogoFile, setSelectedFooterLogoFile] = useState("");
  const [footerLogoFileError, setFooterLogoFileError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPageLoading(true);
        let res = await axios.get("/setting/admin/view");
        if (res) {
          let data = res?.data?.data;
          setFooterLogoDescription(data?.footerLogoDescription);
          setShopName(data?.shopName);
          setSubTitle(data?.subTitle);
          setEmail(data?.email);
          setPhone(data?.phone);
          setFacebookLink(data?.socialLinks?.facebook);
          setWhatsappLink(data?.socialLinks?.whatsapp);
          setInstaLink(data?.socialLinks?.instagram);
          setyoutube(data?.socialLinks?.youtube);
          setyoutube(data?.socialLinks?.youtube);
          setTiktok(data?.socialLinks?.tiktok);
          setShowPayment(data?.isOnlinePayHide);
          setShowPromo(data?.isPromoHide);

          setHouseNo(data?.address?.house);
          setRoadNo(data?.address?.road);
          setUnion(data?.address?.union);
          setDistrictName(data?.address?.district);
          setZipCode(data?.address?.zipCode);
          setPrimaryColor(data?.colors?.primary);
          setSecondaryColor(data?.colors?.secondary);
          setShowPhone(data?.productDetails?.showPhone);
          setShowWhatsapp(data?.productDetails?.showWhatsapp);
          setWhatsappSharingNumber(data?.socialMediaSharing?.whatsappNumber);
          setFbPageSharingName(data?.socialMediaSharing?.facebookPageName);

          if (data?.footerLogoImg) {
            setFooterLogoFileList([
              {
                url: imageBasePath + "/" + data?.footerLogoImg,
              },
            ]);
          }

          if (data?.logoImg) {
            setFileList([
              {
                url: imageBasePath + "/" + data?.logoImg,
              },
            ]);
          }
          if (data?.favIcon) {
            setFavIcon([
              {
                url: imageBasePath + "/" + data?.favIcon,
              },
            ]);
          }
          if (data?.paymentBannerImg) {
            setFooterPay([
              {
                url: imageBasePath + "/" + data?.paymentBannerImg,
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

  const formSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (fileError) return;

      let baseImg = "";
      if (selectedFile) {
        baseImg = await getBase64(selectedFile);
      } else if (fileList.length > 0) {
        baseImg = fileList[0].url.split(imageBasePath + "/")[1];
      }

      let favIconImg = "";
      if (selectedFavIcon) {
        favIconImg = await getBase64(selectedFavIcon);
      } else if (favIcon?.length > 0) {
        favIconImg = favIcon[0]?.url.split(imageBasePath + "/")[1];
      }

      let footerImg = "";
      if (footerIcon) {
        footerImg = await getBase64(footerIcon);
      } else if (footerPay?.length > 0) {
        footerImg = footerPay[0]?.url.split(imageBasePath + "/")[1];
      }

      let footerLogoImg = "";
      if (selectedFooterLogoFile) {
        footerLogoImg = await getBase64(selectedFooterLogoFile);
      } else if (footerLogoFileList?.length > 0) {
        footerLogoImg = footerLogoFileList[0]?.url.split(
          imageBasePath + "/"
        )[1];
      }

      let obj = {
        footerLogoDescription,
        shopName: shopName,
        subTitle: subTitle,
        email: email,
        phone: phone,
        isOnlinePayHide: showPayment,
        isPromoHide: showPromo,
        productDetails: {
          showPhone: showPhone,
          showWhatsapp: showWhatsapp,
        },
        paymentBannerImg: footerImg,
        address: {
          house: houseNo,
          road: roadNo,
          union: union,
          district: districtName,
          zipCode: zipCode,
        },
        socialLinks: {
          facebook: facebookLink,
          whatsapp: whatsappLink,
          instagram: instaLink,
          youtube: youtube,
          tiktok: tiktok,
        },
        socialMediaSharing: {
          whatsappNumber: whatsappSharingNumber,
          facebookPageName: fbPageSharingName,
        },
        colors: {
          primary: primaryColor,
          secondary: secondaryColor,
        },
        logoImg: baseImg,
        favIcon: favIconImg,
        footerLogoImg,
      };

      setIsLoading(true);
      const res = await axios.patch(`/setting/admin/update-basic`, obj);
      if (res?.data?.success) {
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
      setFileError("Image must be (jpeg, jpg, webp or png) format!");
    }
  };

  const imageHandler2 = ({ fileList: newFileList }) => {
    setFavIcon(newFileList);
    setSelectedFavIcon(newFileList[0]?.originFileObj);
    setFileError1("");
  };

  const imageHandler3 = ({ fileList: newFileList }) => {
    setFooterPay(newFileList);
    setFooterIcon(newFileList[0]?.originFileObj);
    setFileError1("");
  };

  // Handler for footer logo image
  const footerLogoImageHandler = ({ fileList: newFileList }) => {
    setFooterLogoFileList(newFileList);
    if (
      newFileList[0]?.originFileObj.type === "image/jpeg" ||
      newFileList[0]?.originFileObj.type === "image/jpg" ||
      newFileList[0]?.originFileObj.type === "image/png" ||
      newFileList[0]?.originFileObj.type === "image/webp"
    ) {
      setSelectedFooterLogoFile(newFileList[0]?.originFileObj);
      setFooterLogoFileError("");
    } else {
      setFooterLogoFileError("Image must be (jpeg, jpg, webp, or png) format!");
    }
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Profile" }]} />
      </div>

      <Grid container>
        <Grid item md={6} xs={12}>
          <Card elevation={5}>
            <CardHeader title="Update Site Profile" />

            {!isPageLoading ? (
              <form className="px-4 py-6" onSubmit={formSubmitHandler}>
                <Grid container spacing={3}>
                  <Grid item sm={9} xs={12}>
                    <div className="flex items-center justify-between">
                      <Box sx={{ mb: 2 }}>
                        <Typography className="mb-2">
                          Site Logo (300*100 Pixel){" "}
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
                        <Typography className="mb-2">
                          Footer Pay Banner (1200*60 Pixel){" "}
                        </Typography>
                        <Upload
                          listType="picture-card"
                          fileList={footerPay}
                          onChange={imageHandler3}
                        >
                          {footerPay?.length >= 1 ? null : (
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
                        <Typography className="mb-2">
                          {" "}
                          Favicon (80*80 Pixel){" "}
                        </Typography>
                        <Upload
                          listType="picture-card"
                          fileList={favIcon}
                          onChange={imageHandler2}
                        >
                          {favIcon?.length >= 1 ? null : (
                            <span>
                              <Icon style={{ color: "gray" }}>
                                photo_size_select_actual
                              </Icon>
                            </span>
                          )}
                        </Upload>

                        <p style={{ color: "red" }}>
                          <small>{fileError1}</small>
                        </p>
                      </Box>
                    </div>
                    {/* New Footer Logo box */}
                    <Box sx={{ mb: 2 }}>
                      <Typography className="mb-2">
                        Footer Logo (300*100 Pixel)
                      </Typography>
                      <Upload
                        listType="picture-card"
                        fileList={footerLogoFileList}
                        onChange={footerLogoImageHandler}
                      >
                        {footerLogoFileList.length >= 1 ? null : (
                          <span>
                            <Icon style={{ color: "gray" }}>
                              photo_size_select_actual
                            </Icon>
                          </span>
                        )}
                      </Upload>
                      <p style={{ color: "red" }}>
                        <small>{footerLogoFileError}</small>
                      </p>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-2 text-black">
                        Footer Logo Description
                      </InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        multiline
                        minRows={3}
                        value={footerLogoDescription}
                        onChange={(e) =>
                          setFooterLogoDescription(e.target.value)
                        }
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-2 text-black">
                        Shop Name
                      </InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-2 text-black">
                        Sub Title
                      </InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        multiline
                        minRows={3}
                        value={subTitle}
                        onChange={(e) => setSubTitle(e.target.value)}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-2 text-black">Email</InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </Box>
                    <Box sx={{ mb: 6 }}>
                      <InputLabel className="mb-2 text-black">Phone</InputLabel>
                      <TextField
                        name="name"
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-2 text-black">
                        Facebook Link
                      </InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={facebookLink}
                        onChange={(e) => setFacebookLink(e.target.value)}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-2 text-black">
                        Whatsapp Link
                      </InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={whatsappLink}
                        onChange={(e) => setWhatsappLink(e.target.value)}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-2 text-black">
                        Instagram Link
                      </InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={instaLink}
                        onChange={(e) => setInstaLink(e.target.value)}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-2 text-black">
                        Youtube Link
                      </InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={youtube}
                        onChange={(e) => setyoutube(e.target.value)}
                      />
                    </Box>
                    <Box sx={{ mb: 6 }}>
                      <InputLabel className="mb-2 text-black">
                        Tiktok Link
                      </InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={tiktok}
                        onChange={(e) => setTiktok(e.target.value)}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-2 text-black">
                        Whats App Sharing Number
                      </InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={whatsappSharingNumber}
                        onChange={(e) =>
                          setWhatsappSharingNumber(e.target.value)
                        }
                      />
                    </Box>

                    <Box sx={{ mb: 6 }}>
                      <InputLabel className="mb-2 text-black">
                        Facebook Page Sharing Name
                      </InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={fbPageSharingName}
                        onChange={(e) => setFbPageSharingName(e.target.value)}
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-2 text-black">
                        House No.
                      </InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={houseNo}
                        onChange={(e) => setHouseNo(e.target.value)}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-2 text-black">
                        Road No.
                      </InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={roadNo}
                        onChange={(e) => setRoadNo(e.target.value)}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-2 text-black">Union</InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={union}
                        onChange={(e) => setUnion(e.target.value)}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <InputLabel className="mb-2 text-black">
                        District Name
                      </InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={districtName}
                        onChange={(e) => setDistrictName(e.target.value)}
                      />
                    </Box>
                    <Box sx={{ mb: 6 }}>
                      <InputLabel className="mb-2 text-black">
                        Zip Code
                      </InputLabel>
                      <TextField
                        label=""
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                      />
                    </Box>

                    <Box
                      sx={{
                        mb: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                      }}
                    >
                      <Box sx={{ m: 1 }}>
                        <FormControlLabel
                          control={
                            <IOSSwitch
                              sx={{ m: 1 }}
                              checked={showPromo}
                              onClick={() => setShowPromo(!showPromo)}
                            />
                          }
                          label="Show Promo Code"
                        />
                      </Box>
                      <Box sx={{ m: 1 }}>
                        <FormControlLabel
                          control={
                            <IOSSwitch
                              sx={{ m: 1 }}
                              checked={showPayment}
                              onClick={() => setShowPayment(!showPayment)}
                            />
                          }
                          label="Show Online Payment"
                        />
                      </Box>
                      <Box sx={{ m: 1 }}>
                        <FormControlLabel
                          control={
                            <IOSSwitch
                              sx={{ m: 1 }}
                              checked={showWhatsapp}
                              onClick={() => setShowWhatsapp(!showWhatsapp)}
                            />
                          }
                          label="Show Whatsapp"
                        />
                      </Box>
                      <Box sx={{ m: 1 }}>
                        <FormControlLabel
                          control={
                            <IOSSwitch
                              sx={{ m: 1 }}
                              checked={showPhone}
                              onClick={() => setShowPhone(!showPhone)}
                            />
                          }
                          label="Show Phone Number"
                        />
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

export default Profile;
