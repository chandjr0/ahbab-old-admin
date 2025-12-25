import React, { useState,useEffect } from "react";
import {
  Button,
  Card,
  FormControlLabel,
  Grid,
  Icon,
  TextField,
  Box,
  CircularProgress,
  CardHeader,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
} from "@material-ui/core";
import { notification } from "antd";
import { Breadcrumb } from "../../components";
import axios from "../../../axios";
import { Upload } from "antd";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import IOSSwitch from "../../Shared/Forms/iosSwitch";
import { convertImageToBase64 } from "../../util/convertImageToBase64";
import { useParams,useHistory } from "react-router-dom";
import imageBasePath from "../../../config";


const CreateEmployee = () => {


  const { appId } = useParams();
  const history = useHistory()
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [nidImage, setNidImage] = useState("");
  const [nidFileList, setNidFileList] = useState([]);
  const [profileImage, setProfileImage] = useState("");
  const [profileFileList, setProfileFileList] = useState([]);
  const [docFileList, setDocFileList] = useState([]);
  const [info, setInfo] = useState({})

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("name is required")
      .min(2, "too small name, minimum 2 character"),
    email: Yup.string().required("email is required"),
    phone: Yup.string().required("phone is required"),
    commission: Yup.string().required("Commission is required"),
    presentAddress: Yup.string().required("Present Address is required"),
    permanentAddress: Yup.string().required("Permanent Address is required"),
    officeAddress: Yup.string().required("Office Address is required"),
    nidNumber: Yup.string().required("Nid Number is required"),
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
    setValue,
    // control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const formSubmitHandler = async (data) => {
    let docImage = [];
    if (docFileList?.length) {
      docFileList.map((item, index) => {
        docImage.push(item?.thumbUrl);
      });
    }
    try {
      let obj = { 
        name: data?.name,
        fbId: data.fbId,
        fbPageName:data?.fbPageName,
        whatsAppNo: data.whatsapp,
        referId: data.referId,
        image: profileImage || info?.image,
        password: '',
        nid: {
          number: data.nidNumber,
          nidImage: nidImage || info?.nid?.nidImage,
        },
        address: {
          present: data.presentAddress,
          permanent: data.permanentAddress,
          office: data?.officeAddress,
        },
        legalDocs: docImage,
        status: status ? "active" : "inactive",
        commission: data.commission,
        website: {
          domain: data.domain,
          url: data.url,
        },
      };

      setIsLoading(true);
      const res = await axios.post(`/reseller/update/${info?._id}`, obj);
      if (res?.data?.success) {
        window.location.reload();
        openNotificationWithIcon(res?.data?.message, "success");
        // history.push("/reseller-application-list")
      } else {
        openNotificationWithIcon(res?.data?.message, "error");
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };


  useEffect(() => {
    const getData = async ()=>{
        try {
            let res = await axios.get(`/reseller/view/${appId}`)
            if(res){

              let resData = res?.data?.data;
                 setValue('name',resData?.name)
                 setValue('phone',resData?.phone)
                 setValue('email',resData?.email)
                 setValue('presentAddress',resData?.address?.present)
                 setValue('permanentAddress',resData?.address?.present)
                 setValue('officeAddress',resData?.address?.office)
                 setValue('fbId',resData?.fbPageUrl)
                 setValue('referId',resData?.referId)
                 setValue('domain',resData?.website?.domain)
                 setValue('webUrl',resData?.website?.url)
                 setValue('whatsapp',resData?.whatsAppNo)
                 setValue('commission',resData?.commission)
                 setValue('fbId',resData?.fbId)
                 setValue('fbPageName',resData?.fbPageName)
                 setValue('nidNumber',resData?.nid?.number)
                 setStatus(resData?.status)
                 setInfo(resData)
                 setNidFileList([
                  {
                    uid: "-1",
                    name: "image",
                    status: "done",
                    url: `${imageBasePath}/${resData?.nid?.nidImage}`,
                  },
                ]);
                setProfileFileList([
                  {
                    uid: "-1",
                    name: "image",
                    status: "done",
                    url: `${imageBasePath}/${resData?.image}`,
                  },
                ]);
            }
        } catch (error) {
            
        }
    }
    getData()
  }, [appId])



  const getBase64 = (file) => {
    return new Promise((resolve) => {
      let baseURL = "";
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        baseURL = reader.result;
        resolve(baseURL);
      };
    });
  };

  const nidImageHandler = async ({ fileList: newFileList }) => {
    for (let i = 0; i < newFileList.length; i++) {
      let image = await getBase64(newFileList[i].originFileObj);
      setNidImage(image);
    }
    setNidFileList(newFileList);
  };

  const profileImageHandler = async ({ fileList: newFileList }) => {
    for (let i = 0; i < newFileList.length; i++) {
      let image = await getBase64(newFileList[i].originFileObj);
      setProfileImage(image);
    }
    setProfileFileList(newFileList);
  };

  const docImageHandler = async ({ fileList: newFileList }) => {
    for (let i = 0; i < newFileList.length; i++) {
      let image = await getBase64(newFileList[i].originFileObj);
      newFileList[i]["imgSrc"] = image;
    }
    setDocFileList(newFileList);
  };

  return (
    <div className="m-sm-30">
      {/* <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "New Re-seller" }]} />
      </div> */}

      <Grid container>
        <Grid item md={12} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Update Re-seller" />

            <form
              className="px-4 py-6"
              onSubmit={handleSubmit(formSubmitHandler)}
            >
              <Grid container spacing={3}>
                <Grid item sm={6} xs={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Name<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
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
                    <Typography variant="label" className="mb-2">
                      Email<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      name="email"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("email")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.email?.message}</small>
                    </p>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Phone<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      name="phone"
                      label=""
                      type="number"
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("phone")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.phone?.message}</small>
                    </p>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Refer ID
                    </Typography>
                    <TextField
                      name="referId"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("referId")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.referId?.message}</small>
                    </p>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      WhatsApp Number
                    </Typography>
                    <TextField
                      name="whatsapp"
                      label=""
                      type="number"
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("whatsapp")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.whatsapp?.message}</small>
                    </p>
                  </Box>
                  {/* <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Password<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      name="password"
                      label=""
                      variant="outlined"
                      size="small"
                      type="password"
                      fullWidth
                      {...register("password")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.password?.message}</small>
                    </p>
                  </Box> */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Commission %<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      name="commission"
                      label=""
                      type="number"
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("commission")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.commission?.message}</small>
                    </p>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      FB ID
                    </Typography>
                    <TextField
                      name="fbId"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("fbId")}
                    />
                    {/* <p style={{ color: "red" }}>
                      <small>{errors.fbId?.message}</small>
                    </p> */}
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <FormControl>
                      <FormLabel id="demo-controlled-radio-buttons-group">
                        Status
                      </FormLabel>
                      <RadioGroup
                        row
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <FormControlLabel
                          value="pending"
                          control={<Radio />}
                          label="Pending"
                        />
                        <FormControlLabel
                          value="active"
                          control={<Radio />}
                          label="Active"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                  
                </Grid>

                <Grid item sm={6} xs={6}>
                
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      FB PAGE
                    </Typography>
                    <TextField
                      name="fbPageName"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("fbPageName")}
                    />
                    {/* <p style={{ color: "red" }}>
                      <small>{errors.fbId?.message}</small>
                    </p> */}
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Present Address<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      name="presentAddress"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("presentAddress")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.presentAddress?.message}</small>
                    </p>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Permanent Address<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      name="permanentAddress"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("permanentAddress")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.permanentAddress?.message}</small>
                    </p>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Office Address<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      name="officeAddress"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("officeAddress")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.officeAddress?.message}</small>
                    </p>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Website Domain
                    </Typography>
                    <TextField
                      name="domain"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("domain")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.domain?.message}</small>
                    </p>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Website Url
                    </Typography>
                    <TextField
                      name="webUrl"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      {...register("webUrl")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.webUrl?.message}</small>
                    </p>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      NID Number<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      name="nidNumber"
                      label=""
                      variant="outlined"
                      size="small"
                      type="number"
                      fullWidth
                      {...register("nidNumber")}
                    />
                    <p style={{ color: "red" }}>
                      <small>{errors.nidNumber?.message}</small>
                    </p>
                  </Box>
                  <div style={{ display: "flex", flexDirection: "row" }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="label" className="mb-2">
                        NID
                      </Typography>
                      <Upload
                        listType="picture-card"
                        onChange={nidImageHandler}
                        fileList={nidFileList}
                        // onPreview={onPreview}
                      >
                        {nidFileList.length < 1 && (
                          <span>
                            <span>Upload</span>
                            <br />
                            <span style={{ color: "red", fontSize: "12px" }}>
                              NID IMAGE
                            </span>
                          </span>
                        )}
                      </Upload>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="label" className="mb-2">
                        PROFILE IMAGE
                      </Typography>
                      <Upload
                        listType="picture-card"
                        onChange={profileImageHandler}
                        fileList={profileFileList}
                      >
                        {profileFileList.length < 1 && (
                          <span>
                            <span>Upload</span>
                            <br />
                            <span style={{ color: "red", fontSize: "12px" }}>
                              PROFILE IMAGE
                            </span>
                          </span>
                        )}
                      </Upload>
                    </Box>

                  </div>
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
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default CreateEmployee;
