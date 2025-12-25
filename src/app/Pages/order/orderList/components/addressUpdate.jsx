import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
  MenuItem
} from "@material-ui/core";
import { notification } from "antd";
import axios from "../../../../../axios";
import { useEffect } from "react";

const AddressUpdate = ({
  orderAddressData,
  closeModalHandler,
  dataList,
  setDataList,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [allDistrictList, setAllDistrictList] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [allAreaList, setAllAreaList] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");

  useEffect(() => {
    if (orderAddressData) {
      setAddress(orderAddressData?.address);
    }
    const getDistricts = async () => {
      try {
        let res = await axios.get(`/location/districts`);
        if (res?.data) {
          setAllDistrictList(res?.data?.data);
        }
      } catch (err) {}
    };
    getDistricts();
    const getArea = async () => {
      try {
        let res = await axios.get(
          `/location/district-areas/${orderAddressData?.districtId}`
        );
        if (res?.data) {
          setAllAreaList(res?.data?.data);
          setSelectedArea("");
        }
      } catch (err) {}
    };
    getArea();
  }, [orderAddressData]);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const formSubmitHandler = async () => {
    try {
      setIsLoading(true);

      let obj = {
        address: address,
        districtId:selectedDistrict || orderAddressData?.districtId,
        areaId: selectedArea || orderAddressData?.areaId,
      };

      let res = await axios.patch(
        `/admin-order/update-address/${orderAddressData?._id}`,
        obj
      );

      if (res) {
        setDataList(
          dataList.map((data) =>
            data?._id === orderAddressData?._id
              ? {
                  ...data,
                  deliveryAddress: res?.data?.data?.deliveryAddress,
                }
              : data
          )
        );

        closeModalHandler();
        window.location.reload()
        openNotificationWithIcon(res?.data?.message, "success");
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  const districtWiseArea = async (id) => {
    try {
      let res = await axios.get(`/location/district-areas/${id}`);
      if (res?.data) {
        setAllAreaList(res?.data?.data);
        setSelectedArea("");
      }
    } catch (err) {}
  };

  return (
    <div>
      <p className="m-0">
        ID:{" "}
        <strong className="text-secondary">
          {" " + orderAddressData?.serialId}
        </strong>
      </p>
      <Typography className="mb-4 text-center text-primary" variant="h6">
        Customer Address
      </Typography>

      <Grid container spacing={1} alignItems="center">
        <Grid container spacing={1} alignItems="center" className="mb-2">
          {/* <Grid item sm={4} xs={12}>
            <InputLabel>District</InputLabel>
          </Grid> */}
          <Grid item xs={12}>
            <TextField
              label="Select District"
              placeholder=""
              size="small"
              variant="outlined"
              fullWidth
              select
              value={selectedDistrict || orderAddressData?.districtId}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                districtWiseArea(e.target.value);
              }}
            >
              <MenuItem value="">-- select district --</MenuItem>
              {allDistrictList.length > 0 &&
                allDistrictList.map((data, idx) => (
                  <MenuItem value={data?._id} key={idx}>
                    {data?.name}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
        </Grid>
        <Grid container spacing={1} alignItems="center" className="mb-2">
          {/* <Grid item sm={4} xs={12}>
            <InputLabel>Area</InputLabel>
          </Grid> */}
          <Grid item xs={12}>
            <TextField
              label="Select Area"
              placeholder=""
              size="small"
              variant="outlined"
              fullWidth
              select
              value={selectedArea || orderAddressData?.areaId}
              onChange={(e) => {
                setSelectedArea(e.target.value);
              }}
            >
              <MenuItem value="">-- select area --</MenuItem>
              {allAreaList.length > 0 &&
                allAreaList.map((data, idx) => (
                  <MenuItem value={data?._id} key={idx}>
                    {data?.name}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
        </Grid>
        <Grid item xs={12} className="mb-2">
          <TextField
            label="Address"
            placeholder=""
            size="small"
            variant="outlined"
            fullWidth
            multiline
            minRows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Grid>

        <Box sx={{ display: "flex", mt: 2 }}>
          <Button
            className="mr-4"
            variant="contained"
            color="primary"
            disabled={isLoading}
            onClick={formSubmitHandler}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Update"
            )}
          </Button>
          <Button variant="outlined" onClick={closeModalHandler}>
            Cancel
          </Button>
        </Box>
        
      </Grid>
    </div>
  );
};

export default AddressUpdate;
