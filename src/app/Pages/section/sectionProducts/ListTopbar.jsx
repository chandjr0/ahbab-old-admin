import React, { useState } from "react";
import {
  Icon,
  Slider,
  TextField,
  IconButton,
  //   InputAdornment,
  Hidden,
  Box,
  Avatar,
} from "@material-ui/core";
import { Autocomplete } from "@mui/material";
import axios from "../../../../axios";
import imageBasePath from "../../../../config";
import { notification } from "antd";

const ListTopbar = ({
  viewMode,
  sliderValue,
  handleSldierChange,
  handleViewChange,
  list,
  setList,
  sectionData,
}) => {
  let marks = [{ value: 25 }, { value: 50 }, { value: 75 }, { value: 100 }];
  const [productList, setProductList] = useState([]);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const searchProductHandler = async (value) => {
    let res = await axios.post(`/product/search-by-sku-or-name?page=1&limit=20&userType=CUSTOMER`, {
      value: value || " ",
    });
    if (res) {
      setProductList(res?.data?.data);
    } else {
      setProductList([]);
    }
  };

  const addToListProductHandler = async (prod) => {
    if (prod) {
      try {
        for (let product of list) {
          if (product._id === prod?._id) {
            openNotificationWithIcon("Product already included!", "error");
            return;
          }
        }

        let res = await axios.patch(`/section/add-product/${sectionData?._id}`, {
          productId: prod?._id,
        });
        if (res) {
          setList([prod, ...list]);
        }
      } catch (err) {
        openNotificationWithIcon(err?.response?.data?.message, "error");
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between mb-8">
      <div className="flex items-center">
        <Autocomplete
          sx={{ width: 300 }}
          autoHighlight
          options={productList}
          getOptionLabel={(option) => option?.name}
          onChange={(e, value) => addToListProductHandler(value)}
          filterSelectedOptions
          name="search"
          renderOption={(props, option) => (
            <Box
              key={option?._id}
              component="li"
              className="text-green"
              sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
              {...props}
            >
              <Avatar
                variant="square"
                loading="lazy"
                width="20"
                src={imageBasePath + "/" + option?.galleryImage[0]}
                alt=""
                className="mr-2"
              />
              {option?.name}
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              onChange={(e) => {
                console.log("search: ", e.target.value);
                searchProductHandler(e.target.value);
              }}
              label="Add Product to section"
              variant="outlined"
            />
          )}
        />
      </div>

      <div className="flex items-center">
        <Hidden xsDown>
          {viewMode === "grid" && (
            <Slider
              className="w-120 mr-4"
              value={sliderValue}
              min={25}
              step={null}
              marks={marks}
              onChange={handleSldierChange}
              aria-labelledby="continuous-slider"
            />
          )}
          <IconButton
            color={viewMode === "grid" ? "primary" : "default"}
            onClick={() => handleViewChange("grid")}
          >
            <Icon>view_comfy</Icon>
          </IconButton>

          <IconButton
            color={viewMode === "list" ? "primary" : "default"}
            onClick={() => handleViewChange("list")}
          >
            <Icon>list</Icon>
          </IconButton>
        </Hidden>
      </div>
    </div>
  );
};

export default ListTopbar;
