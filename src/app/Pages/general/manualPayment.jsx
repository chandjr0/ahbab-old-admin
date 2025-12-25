import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Grid,
  TextField,
  Box,
  CircularProgress,
  CardHeader,
  InputLabel,
  MenuItem,
  FormControlLabel,
  Icon,
  Typography,
} from "@material-ui/core";
import { notification } from "antd";
import axios from "../../../axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import IOSSwitch from "../../Shared/Forms/iosSwitch";
import { Upload } from "antd";
import { convertImageToBase64 } from "../../util/convertImageToBase64";
import { getBase64 } from "../../util/getBase64";
import { Breadcrumb, RichTextEditor } from "../../components";
import { number } from "prop-types";

const CreateMarket = () => {


  const [isLoading, setIsLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [fileList, setFileList] = useState([]);
  const validationSchema = Yup.object().shape({});
  const [description, setDescription] = useState('')
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
    if (fileError) return;
    let baseImg = "";
    if (selectedFile) {
      baseImg = await getBase64(selectedFile);
    }

    let obj = {
      name: data.name,
      description: description,
      phone: data.number,
      isDisabled: isFeatured,
      image: baseImg,
    };

    try {
      setIsLoading(true);
      const res = await axios.post(`/setting/payment/create`, obj);
      if (res?.data?.success) {
        window.location.reload();
        openNotificationWithIcon(res?.data?.message, "success");
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
      setFileError("Image must be (jpeg, jpg or png) format!");
    }
  };

  return (
    <div className="m-sm-30">
      <Grid container>
        <Grid md={2} xs={12}></Grid>
        <Grid item md={8} xs={12}>
          <Card elevation={3}>
            <CardHeader className="text-center" title="Add Payment" />
            <form
              className="px-4 py-6"
              onSubmit={handleSubmit(formSubmitHandler)}
            >
              <Grid container spacing={3}>
                <Grid item sm={12} xs={12}>
                  <>
                    <Grid
                      container
                      spacing={1}
                      alignItems="center"
                      className="mb-2"
                    >
                      <Grid item sm={3} xs={12}>
                        <InputLabel>Name</InputLabel>
                      </Grid>
                      <Grid item sm={8} xs={12}>
                        <Box sx={{ mb: 2 }}>
                          <TextField
                            {...register("name")}
                            label=""
                            name="name"
                            variant="outlined"
                            size="small"
                            fullWidth
                          ></TextField>
                          <p style={{ color: "red" }}>
                            <small>{errors.name?.message}</small>
                          </p>
                        </Box>
                      </Grid>
                    </Grid>
                    <Grid
                      container
                      spacing={1}
                      alignItems="center"
                      className="mb-2"
                    >
                      <Grid item sm={3} xs={12}>
                        <InputLabel>Number</InputLabel>
                      </Grid>
                      <Grid item sm={8} xs={12}>
                        <Box sx={{ mb: 2 }}>
                          <TextField
                            {...register("number")}
                            label=""
                            name="number"
                            variant="outlined"
                            size="small"
                            fullWidth
                          ></TextField>
                          <p style={{ color: "red" }}>
                            <small>{errors.number?.message}</small>
                          </p>
                        </Box>
                      </Grid>
                    </Grid>
                    <Grid
                      container
                      spacing={1}
                      alignItems="center"
                      className="mb-2"
                    >
                      <Grid item sm={3} xs={12}>
                        <InputLabel>Description</InputLabel>
                      </Grid>
                      <Grid item sm={8} xs={12}>
                        <Box sx={{ mb: 2 }}>
                          {/* <TextField
                            {...register("description")}
                            label=""
                            name="description"
                            multiline
                            minRows={4}
                            variant="outlined"
                            size="small"
                            fullWidth
                            // onChange={(e) => {
                            //   setSelectedDuration(e.target.value);
                            // }}
                            // value={selectedDuration}
                          ></TextField> */}
                          <RichTextEditor
                            className="mb-4 border-none"
                            content={description}
                            disabled={true}
                            handleContentChange={(content) =>
                                setDescription(content)
                            }
                            placeholder="write here..."
                          />
                        
                        </Box>
                      </Grid>
                    </Grid>
                    <Grid
                      container
                      spacing={1}
                      alignItems="center"
                      className="mb-2"
                    >
                      <Grid item sm={3} xs={12}>
                        <InputLabel></InputLabel>
                      </Grid>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="label" className="mb-2">
                          Upload Image<span style={{ color: "red" }}>*</span>
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
                        <FormControlLabel
                          control={
                            <IOSSwitch
                              sx={{ m: 1 }}
                              onClick={() => setIsFeatured(!isFeatured)}
                              checked={isFeatured ? false : true}
                            />
                          }
                          label={isFeatured === true ? `Off` : `On`}
                        />
                      </Box>
                    </Grid>
                  </>
                </Grid>
              </Grid>

              <Button
                className="mb-4 mt-2 px-12"
                variant="contained"
                color="#8EBB4F"
                type="submit"
                style={{
                  marginRight: "20px",
                  background: "green",
                  color: "#fff",
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "UPDATE"
                )}
              </Button>
            </form>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default CreateMarket;
