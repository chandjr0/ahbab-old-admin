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
import axios from "../../../../axios";
import { notification } from "antd";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

const CreateSection = ({ dataList, setDataList, updateData, setUpdateData }) => {
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("name is required")
      .min(2, "too small name, minimum 2 character")
      .max(25, "too big name, maximum 25 character "),
    description: Yup.string().nullable(),
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
      setValue("description", updateData?.description);
    }
  }, [updateData, setValue]);

  const formSubmitHandler = async (data) => {
    try {
      setIsLoading(true);
      let res = null;
      if (updateData) {
        res = await axios.patch(`/section/update/${updateData._id}`, {
          name: data?.name,
          description: data?.description,
        });

        setDataList(
          dataList.map((list) => {
            if (list._id === updateData._id) {
              list.name = data.name;
              list.description = data.description;
            }
            return list;
          })
        );
        setUpdateData(null);
      } else {
        res = await axios.post(`/section/create`, {
          name: data?.name,
          description: data?.description,
        });
        if (res?.data?.success) {
          setDataList([
            {
              _id: res?.data?.data?._id,
              name: res?.data?.data?.name,
              description: res?.data?.data?.description,
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
    setValue("description", "");
    setUpdateData(null);
  };

  return (
    <Card elevation={3}>
      <CardHeader title={updateData ? "Update Section" : "Add New Section"} />

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

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Description</Typography>
              <TextField
                className="mt-2"
                name="name"
                label=""
                variant="outlined"
                size="small"
                fullWidth
                multiline
                minRows={3}
                {...register("description")}
              />
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex" }}>
          <Box>
            <Button
              className="mb-4 mt-2 px-12"
              variant="contained"
              disabled={isLoading}
              color="primary"
              type="submit"
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : updateData ? (
                "Update Section"
              ) : (
                "Save Section"
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

export default CreateSection;
