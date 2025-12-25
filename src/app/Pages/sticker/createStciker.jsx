import React, { useLayoutEffect, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import {
  Grid,
  Typography,
  Box,
  Card,
  Button,
  TextField,
  CircularProgress,
  CardHeader,
} from "@material-ui/core";
import axios from "../../../axios";
import { notification } from "antd";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import { CompactPicker } from "react-color";

const CreateSticker = ({ dataList, setDataList, updateData, setUpdateData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hex, setHex] = useState("#000000");

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("name is required")
      .min(2, "too small name, minimum 2 character")
      .max(20, "too big name, maximum 20 character "),
  });

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  useLayoutEffect(() => {
    if (updateData) {
      setValue("name", updateData?.name);
    }
  }, [updateData, setValue]);

  const formSubmitHandler = async (data) => {
    try {
      setIsLoading(true);
      let res = null;
      if (updateData) {
        res = await axios.patch(`/sticker/update/${updateData._id}`, {
          name: data.name,
          color: hex,
        });

        setDataList(
          dataList.map((list) => {
            if (list._id === updateData._id) {
              list.name = data.name;
              list.color = hex;
            }
            return list;
          })
        );
        setUpdateData(null);
      } else {
        res = await axios.post(`/sticker/create`, { name: data.name, color: hex });
        if (res?.data?.success) {
          setDataList([
            {
              _id: res?.data?.data?._id,
              name: res?.data?.data?.name,
              color: res?.data?.data?.color,
            },
            ...dataList,
          ]);
        }
      }
      openNotificationWithIcon(res?.data?.message, "success");
      reset();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
  };

  const cancelHandler = () => {
    setValue("name", "");
    setUpdateData(null);
  };

  return (
    <Card elevation={3}>
      <CardHeader title={updateData ? "Update Sticker" : "Add New Sticker"} />

      <form className="px-4  py-4" onSubmit={handleSubmit(formSubmitHandler)}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                Name<span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                className="mt-2"
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
              <Typography variant="subtitle1">Set Bg Color</Typography>
              <CompactPicker
                color={hex}
                onChange={(color) => {
                  setHex(color.hex);
                }}
              />
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex" }}>
          <Box>
            <Button
              className="mt-4 px-12"
              variant="contained"
              disabled={isLoading}
              color="primary"
              type="submit"
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : updateData ? (
                "Update"
              ) : (
                "Save"
              )}
            </Button>
          </Box>
          {updateData ? (
            <Box>
              <Button
                className="ml-2 mb-4 mt-2 px-12"
                variant="contained"
                type="submit"
                onClick={cancelHandler}
              >
                cancel
              </Button>
            </Box>
          ) : (
            ""
          )}
        </Box>
      </form>
    </Card>
  );
};

export default CreateSticker;
