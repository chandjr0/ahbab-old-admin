import {
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@material-ui/core";
import { notification } from "antd";
import { Breadcrumb } from "../../components/index";
import React, { useEffect, useState } from "react";
import axios from "../../../axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

const CreateAttributeValue = () => {
  const [attribute, setAttribute] = useState([]);
  const [attributeId, setAttributeId] = useState(null);
  const [attributeOption, setAttributeOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("name is required"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  useEffect(() => {
    const getAttribute = async () => {
      const res = await axios.get(`attribute/fetch-all`);
      setAttribute(res?.data?.data);
    };

    getAttribute();
  }, []);

  const handleChange = (value) => {
    const resAttribute = attribute?.filter((item) => item?._id === value);
    setAttributeOption(resAttribute[0]?.options);
    setAttributeId(value);
  };

  const formSubmitHandler = async (data) => {
    if (attributeId === null) {
      openNotificationWithIcon("Attribute name must be selected!", "error");
      return;
    }
    setIsLoading(true);
    try {
      const resOption = await axios.post(`attribute/add-option`, {
        attributeId: attributeId,
        name: data.name,
      });

      if (resOption?.data?.success) {
        openNotificationWithIcon(resOption?.data?.message, "success");
        setAttributeOption([
          ...attributeOption,
          {
            _id: resOption?.data?.data?._id,
            name: resOption?.data?.data?.name,
          },
        ]);
        reset();
        setIsLoading(false);
      }
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "New Attribute Option" }]} />
      </div>

      <Grid container>
        <Grid item md={6} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Add New Attribute Value" />

            <form className="px-4 py-6" onSubmit={handleSubmit(formSubmitHandler)}>
              <Grid container spacing={3}>
                <Grid item sm={8} xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">Attributes Name</Typography>
                    <TextField
                      className="mb-4 mt-2"
                      name="attributeId"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      select
                      defaultValue="attribute"
                      onChange={(event) => handleChange(event.target.value)}
                    >
                      <MenuItem value="attribute" selected disabled>
                        Select attribute
                      </MenuItem>
                      {attribute?.map((item, index) => (
                        <MenuItem value={item?._id} key={index}>
                          {item?.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    {attributeOption?.map((item, index) => (
                      <>
                        <span style={{ position: "relative" }}>
                          <Chip
                            style={{
                              marginRight: "5px",
                              marginBottom: "10px",
                            }}
                            key={index}
                            label={item?.name}
                          />
                        </span>
                      </>
                    ))}
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">
                      Attribute Value Name<span style={{ color: "red" }}>*</span>
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
                  "Save Attribute Value"
                )}
              </Button>
            </form>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default CreateAttributeValue;
