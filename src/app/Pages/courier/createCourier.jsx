import React, { useEffect, useLayoutEffect, useState } from "react";
import { Breadcrumb } from "../../components/index";
import "react-loading-skeleton/dist/skeleton.css";
import {
  Grid,
  Typography,
  Box,
  Card,
  Divider,
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

const CreateCourier = ({ dataList, setDataList, updateData, setUpdateData }) => {
  const [isLoading, setIsLoading] = useState(false);

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
        res = await axios.patch(`/courier/update/${updateData._id}`, { name: data.name });

        setDataList(
          dataList.map((list) => {
            if (list._id === updateData._id) {
              list.name = data.name;
            }
            return list;
          })
        );
        setUpdateData(null);
      } else {
        res = await axios.post(`/courier/create`, { name: data.name });
        if (res?.data?.success) {
          setDataList([
            {
              _id: res?.data?.data?._id,
              name: res?.data?.data?.name,
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
      <CardHeader title={updateData ? "Update Courier" : "Add New Courier"} />

      <form className="px-4  py-6" onSubmit={handleSubmit(formSubmitHandler)}>
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
          </Grid>
        </Grid>

        <Box sx={{ display: "flex" }}>
          <Box>
            <Button
              className="mb-4 mt-2 px-12"
              variant="contained"
              color="primary"
              type="submit"
              // style={{ marginRight: "20px" }}
                disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : updateData ? (
                "Update Courier"
              ) : (
                "Save Courier"
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

export default CreateCourier;
