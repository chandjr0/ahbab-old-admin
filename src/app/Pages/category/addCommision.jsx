import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  FormControlLabel,
  Grid,
  Icon,
  TextField,
  Box,
  CardHeader,
  MenuItem,
  CircularProgress,
} from "@material-ui/core";
import { notification, Typography } from "antd";
import { Breadcrumb } from "../../components";
import axios from "../../../axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";


const CategoryForm = () => {

  const [parentCatOption, setParentCatOption] = useState([]);
  const [parentId, setParentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [categoryData, setCategoryData] = useState({});

  const validationSchema = Yup.object().shape({
    commission: Yup.string()
      .required("Commission is required")
      
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
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    let fetchData = async () => {
      let categoryData = await axios.get("/category/fetch-all");

      let categoryList = [];
      for (let category of categoryData?.data?.data) {
        categoryList.push({
          _id: category?._id,
          name: category?.name,
          slug: category?.slug,
        });
        for (let subCategory of category?.children) {
          categoryList.push({
            _id: subCategory?._id,
            name: "➤ " + subCategory?.name,
            slug: subCategory?.slug,
          });
        }
      }
      setParentCatOption(categoryList);
    };

    fetchData();
  }, []);

  const formSubmitHandler = async (data) => {
    try {
      let obj = {
        categoryId: parentId,
        commission: data.commission,
      };

      setIsLoading(true);
      const res = await axios.post(`/category/reseller/add-commission`, obj);
      if (res?.data?.success) {
        openNotificationWithIcon(res?.data?.message, "success");
        getCategoryInfo(parentId)
      } else {
        openNotificationWithIcon(res?.data?.message, "error");
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  const getCategoryInfo = async (val) => {
    setParentId(val);
    try {
      let res = await axios.get(`/category/commission-details/${val}`);
      if (res) {
        setCategoryData(res?.data?.data);
      }
    } catch (error) {}
  };

  const removeCommission = async () => {
    try {
      let res = await axios.delete(
        `/category/reseller/remove-commission/${parentId}`
      );
      if (res) {
        openNotificationWithIcon(res?.data?.message, "success");
        setCategoryData(res?.data?.data);
        getCategoryInfo(parentId);
      }
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
  };


  return (
    <div className="m-sm-30">
    

      <Grid container>
        <Grid item md={6} xs={12}>
          <Card elevation={3}>
            <CardHeader title="Add Category Wise Commission" />

            <form
              className="px-4 py-6"
              onSubmit={handleSubmit(formSubmitHandler)}
            >
              <Grid container spacing={3}>
                <Grid item sm={8} xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="label" className="mb-2">
                      Select Category<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      select
                      name="parentId"
                      label=""
                      variant="outlined"
                      size="small"
                      fullWidth
                      onChange={(e) => getCategoryInfo(e.target.value)}
                      value={parentId}
                    >
                      <MenuItem value="">--select one--</MenuItem>
                      {parentCatOption.map((p) => (
                        <MenuItem key={p._id} value={p._id}>
                          {p.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  {categoryData?.categoryData?.resellerDetails
                    ?.isCommissionOn ? (
                    <div>
                      <h6>
                        Commission Applied :{" "}
                        {
                          categoryData?.categoryData?.resellerDetails
                            ?.commission
                        }{" "}
                        %
                      </h6>
                      <h6>
                        Total Product's : {categoryData?.totalChildProduct}
                      </h6>
                      <h6>
                        Product's with category wise commission :{" "}
                        {categoryData?.applyTotalChildProduct}
                      </h6>
                    </div>
                  ) : null}

                  {categoryData?.categoryData?.resellerDetails
                    ?.isCommissionOn ? (
                    <div>
                      <Button
                        onClick={() => removeCommission()}
                        style={{ background: "red", color: "#fff" }}
                      >
                        Remove Commission
                      </Button>
                    </div>
                  ) : null}

                  {parentId ? (
                    <Box sx={{ mb: 2, mt: 5 }}>
                      <Typography variant="label" className="mb-2">
                        Add New Commission %
                        <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        name="commission"
                        label="Insert here...."
                        variant="outlined"
                        size="small"
                        type="number"
                        fullWidth
                        {...register("commission")}
                      />
                      <p style={{ color: "red" }}>
                        <small>{errors.commission?.message}</small>
                      </p>
                    </Box>
                  ) : null}
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

export default CategoryForm;
