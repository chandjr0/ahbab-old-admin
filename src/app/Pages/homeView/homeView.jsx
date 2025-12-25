import React, { useState } from "react";
import {
  Button,
  Card,
  FormControlLabel,
  Grid,
  Box,
  CircularProgress,
  CardHeader,
  Typography,
  Checkbox,
  TextField,
} from "@material-ui/core";
import { notification } from "antd";
import { Breadcrumb } from "../../components";
import axios from "../../../axios";
import { useEffect } from "react";
import Spinner from "../../Shared/Spinner/Spinner";
import { Autocomplete } from "@mui/material";

const PageUpdate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [webCategoryIds, setWebCategoryIds] = useState([]);
  const [webSelectedCategoryOptions, setWebSelectedCategoryOptions] = useState(
    []
  );
  const [mobileCategoryIds, setMobileCategoryIds] = useState([]);
  const [mobileSelectedCategoryOptions, setMobileSelectedCategoryOptions] =
    useState([]);

  const [webOptions, setWebOptions] = useState({
    flashProduct: true,
    featureProducts: true,
    comboProducts: true,
    bestProducts: true,
    categories: [],
  });

  const [mobileOptions, setMobileOptions] = useState({
    flashProduct: true,
    featureProducts: true,
    comboProducts: true,
    bestProducts: true,
    categories: [],
  });

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPageLoading(true);

        let categoryData = await axios.get("/category/fetch-all");
        let categoryList = [];

        // Loop through categories and add children
        for (let category of categoryData?.data?.data) {
          categoryList.push({
            _id: category?._id,
            name: category?.name,
          });

          // If category has children, add them to the categoryList
          if (category?.children?.length > 0) {
            category.children.forEach((child) => {
              categoryList.push({
                _id: child._id,
                name: child.name,
                parentId: category._id, // Add parent reference for easy management
              });
            });
          }
        }

        setCategoryOptions(categoryList);

        let res = await axios.get("/home/fetch-options");
        if (res) {
          let resData = res?.data?.data;

          resData.forEach((data) => {
            if (data?.deviceType === "web") {
              setWebOptions({
                flashProduct: data?.flashProduct,
                featureProducts: data?.featureProducts,
                comboProducts: data?.comboProducts,
                bestProducts: data?.bestProducts,
              });

              // Preselect parent and child categories based on fetched data
              const selectedCategories = data?.categories
                .map((category) => {
                  const parent = categoryList.find(
                    (c) => c._id === category._id
                  );
                  const children = categoryList.filter(
                    (c) => c.parentId === category._id
                  );
                  return [parent, ...children];
                })
                .flat();

              setWebSelectedCategoryOptions(selectedCategories);
              setWebCategoryIds(selectedCategories.map((cat) => cat._id));
            } else {
              setMobileOptions({
                flashProduct: data?.flashProduct,
                featureProducts: data?.featureProducts,
                comboProducts: data?.comboProducts,
                bestProducts: data?.bestProducts,
              });

              const selectedCategories = data?.categories
                .map((category) => {
                  const parent = categoryList.find(
                    (c) => c._id === category._id
                  );
                  const children = categoryList.filter(
                    (c) => c.parentId === category._id
                  );
                  return [parent, ...children];
                })
                .flat();

              setMobileCategoryIds(selectedCategories.map((cat) => cat._id));
            }
          });
        }

        setIsPageLoading(false);
      } catch (err) {
        setIsPageLoading(false);
      }
    };
    fetchData();
  }, []);

  const formSubmitHandler = async (event) => {
    event.preventDefault();

    // if (webCategoryIds.length > 8) {
    //   openNotificationWithIcon(
    //     "Select maximum four category in web categories",
    //     "error"
    //   );
    //   return;
    // }

    if (mobileCategoryIds.length > 8) {
      openNotificationWithIcon(
        "Select maximum four category in mobile categories",
        "error"
      );
      return;
    }

    try {
      let obj = {
        forWeb: { ...webOptions, categories: webCategoryIds },
        forMobile: {
          ...mobileOptions,
          categories: mobileCategoryIds,
        },
      };

      console.log("............................body", obj);
      setIsLoading(true);
      const res = await axios.patch(`/home/update-options`, obj);
      if (res?.data?.success) {
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

  useEffect(() => {
    if (mobileCategoryIds && categoryOptions.length > 0) {
      setMobileSelectedCategoryOptions(
        categoryOptions.filter(
          (cat) =>
            mobileCategoryIds.includes(cat?._id) && {
              _id: cat?._id,
              name: cat?.name,
            }
        )
      );
    }
  }, [mobileCategoryIds, categoryOptions]);

  useEffect(() => {
    if (webCategoryIds.length > 0 && categoryOptions.length > 0) {
      setWebSelectedCategoryOptions(
        categoryOptions.filter((cat) => webCategoryIds.includes(cat._id))
      );
    }
  }, [webCategoryIds, categoryOptions]);
  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "home view" }]} />
      </div>

      <Grid container>
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardHeader title="Home View" />

            {!isPageLoading ? (
              <div>
                <form className="px-4" onSubmit={formSubmitHandler}>
                  <Grid container spacing={3} className="my-4">
                    <Grid item lg={6} xs={12}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Box>
                          <Typography variant="h6" className="mb-2">
                            Web Home
                          </Typography>
                        </Box>
                        <Box>
                          <FormControlLabel
                            control={
                              <Checkbox
                                onClick={() =>
                                  setWebOptions({
                                    ...webOptions,
                                    flashProduct: !webOptions?.flashProduct,
                                  })
                                }
                                checked={webOptions?.flashProduct}
                              />
                            }
                            label={"Flash Products"}
                          />
                        </Box>
                        <Box>
                          <FormControlLabel
                            control={
                              <Checkbox
                                onClick={() =>
                                  setWebOptions({
                                    ...webOptions,
                                    featureProducts:
                                      !webOptions?.featureProducts,
                                  })
                                }
                                checked={webOptions?.featureProducts}
                              />
                            }
                            label={"Feature Products"}
                          />
                        </Box>
                        <Box>
                          <FormControlLabel
                            control={
                              <Checkbox
                                onClick={() =>
                                  setWebOptions({
                                    ...webOptions,
                                    comboProducts: !webOptions?.comboProducts,
                                  })
                                }
                                checked={webOptions?.comboProducts}
                              />
                            }
                            label={"Combo Products"}
                          />
                        </Box>
                        <Box>
                          <FormControlLabel
                            control={
                              <Checkbox
                                onClick={() =>
                                  setWebOptions({
                                    ...webOptions,
                                    bestProducts: !webOptions?.bestProducts,
                                  })
                                }
                                checked={webOptions?.bestProducts}
                              />
                            }
                            label={"Best deal Products"}
                          />
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                          }}
                        >
                          <Autocomplete
                            multiple
                            options={categoryOptions}
                            getOptionLabel={(option) => option.name}
                            isOptionEqualToValue={(option, value) =>
                              option._id === value._id
                            }
                            value={webSelectedCategoryOptions}
                            onChange={(e, val) => {
                              const selectedIds = val.map((v) => v._id);

                              // Find the newly added parent categories
                              const newlyAddedParents = val.filter(
                                (opt) =>
                                  opt.parentId === undefined &&
                                  !webSelectedCategoryOptions.some(
                                    (selected) => selected._id === opt._id
                                  )
                              );

                              // Find the children of the newly added parent categories
                              const childrenToAdd = categoryOptions.filter(
                                (cat) =>
                                  newlyAddedParents.some(
                                    (parent) => parent._id === cat.parentId
                                  )
                              );

                              // Add children when the parent is selected
                              const finalSelectedCategories = [
                                ...val,
                                ...childrenToAdd,
                              ];

                              // Handle removing parent and its children
                              const removedParents =
                                webSelectedCategoryOptions.filter(
                                  (opt) =>
                                    opt.parentId === undefined &&
                                    !selectedIds.includes(opt._id)
                                );

                              // Find children of removed parents
                              const childrenToRemove = categoryOptions
                                .filter((cat) =>
                                  removedParents.some(
                                    (parent) => parent._id === cat.parentId
                                  )
                                )
                                .map((child) => child._id);

                              // Remove children when the parent is removed
                              const finalSelectedIds = finalSelectedCategories
                                .map((cat) => cat._id)
                                .filter((id) => !childrenToRemove.includes(id));

                              // Filter out the removed children and parents
                              const updatedSelectedCategories =
                                finalSelectedCategories.filter(
                                  (cat) => !childrenToRemove.includes(cat._id)
                                );

                              console.log(
                                "Updated Selected Categories: ",
                                updatedSelectedCategories
                              );
                              console.log(
                                "Updated Selected IDs: ",
                                finalSelectedIds
                              );

                              setWebSelectedCategoryOptions(
                                updatedSelectedCategories
                              );
                              setWebCategoryIds(finalSelectedIds);
                            }}
                            size="medium"
                            name="category"
                            filterSelectedOptions
                            renderInput={(params) => {
                              return (
                                <TextField {...params} variant="outlined" />
                              );
                            }}
                            className="min-w-500 max-w-500"
                          />
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item lg={6} xs={12}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Box>
                          <Typography variant="h6" className="mb-2">
                            Mobile Home
                          </Typography>
                        </Box>
                        <Box>
                          <FormControlLabel
                            control={
                              <Checkbox
                                onClick={() =>
                                  setMobileOptions({
                                    ...mobileOptions,
                                    flashProduct: !mobileOptions?.flashProduct,
                                  })
                                }
                                checked={mobileOptions?.flashProduct}
                              />
                            }
                            label={"Flash Products"}
                          />
                        </Box>
                        <Box>
                          <FormControlLabel
                            control={
                              <Checkbox
                                onClick={() =>
                                  setMobileOptions({
                                    ...mobileOptions,
                                    featureProducts:
                                      !mobileOptions?.featureProducts,
                                  })
                                }
                                checked={mobileOptions?.featureProducts}
                              />
                            }
                            label={"Feature Products"}
                          />
                        </Box>
                        <Box>
                          <FormControlLabel
                            control={
                              <Checkbox
                                onClick={() =>
                                  setWebOptions({
                                    ...mobileOptions,
                                    comboProducts:
                                      !mobileOptions?.comboProducts,
                                  })
                                }
                                checked={mobileOptions?.comboProducts}
                              />
                            }
                            label={"Combo Products"}
                          />
                        </Box>
                        <Box>
                          <FormControlLabel
                            control={
                              <Checkbox
                                onClick={() =>
                                  setMobileOptions({
                                    ...mobileOptions,
                                    bestProducts: !mobileOptions?.bestProducts,
                                  })
                                }
                                checked={mobileOptions?.bestProducts}
                              />
                            }
                            label={"Best deal Products"}
                          />
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                          }}
                        >
                          <Autocomplete
                            multiple
                            options={categoryOptions}
                            getOptionLabel={(option) => option.name}
                            isOptionEqualToValue={(option, value) =>
                              option._id === value._id
                            }
                            value={mobileSelectedCategoryOptions}
                            onChange={(e, val) => {
                              setMobileSelectedCategoryOptions(val);
                              setMobileCategoryIds(val.map((v) => v._id));
                            }}
                            size="medium"
                            name="category"
                            filterSelectedOptions
                            renderInput={(params) => (
                              <TextField {...params} variant="outlined" />
                            )}
                            className="min-w-300 max-w-300"
                          />
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} className="mt-4">
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={isLoading}
                        type="submit"
                      >
                        {isLoading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          "Update"
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
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
    </div>
  );
};

export default PageUpdate;
