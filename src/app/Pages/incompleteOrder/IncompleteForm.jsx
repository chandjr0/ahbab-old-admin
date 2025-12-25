import React, { useState } from "react";

import {
  InputLabel,
  MenuItem,
  TextField,
  Grid,
  Box,
  Button,
  CircularProgress,
} from "@material-ui/core";
import { Save } from "@material-ui/icons";

const IncompleteForm = ({
  allDistrictList,
  setSelectedDistrict,
  selectedDistrict,
  selectedDistrictData,
  setSelectedDistrictData,
  zonesList,
  selectedZone,
  setSelectedZone,
  phone,
  setPhone,
  name,
  setName,
  details,
  setDetails,
  value,
  orderId,
  updateOrder,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      phone,
      name,
      cityId: selectedDistrict?.toString(),
      zoneId: selectedZone,
      address: details,
      status: value,
      orderId,
    };

    await updateOrder(formData);
  };

  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
    setSelectedZone("");
    
    const district = allDistrictList.find(d => d._id === districtId);
    setSelectedDistrictData(district || null);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={1} alignItems="center" className="mt-4 mb-2">
          <Grid item sm={4} xs={12}>
            <InputLabel>
              Phone<span style={{ color: "red" }}>*</span>
            </InputLabel>
          </Grid>
          <Grid item sm={8} xs={12}>
            <TextField
              label=""
              placeholder="Enter customer number"
              name="phone"
              size="small"
              variant="outlined"
              type="number"
              fullWidth
              value={phone}
              onChange={(e) => {
                if (e.target.value.length <= 11) {
                  setPhone(e.target.value);
                }
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={1} alignItems="center" className="mb-2">
          <Grid item sm={4} xs={12}>
            <InputLabel>
              Name<span style={{ color: "red" }}>*</span>
            </InputLabel>
          </Grid>
          <Grid item sm={8} xs={12}>
            <TextField
              label=""
              placeholder="Enter customer name"
              name="name"
              size="small"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
        </Grid>

        <Grid container spacing={1} alignItems="center" className="mb-2">
          <Grid item sm={4} xs={12}>
            <InputLabel>
              District <span style={{ color: "red" }}>*</span>
            </InputLabel>
          </Grid>
          <Grid item sm={8} xs={12}>
            <TextField
              label="Select District"
              size="small"
              variant="outlined"
              fullWidth
              select
              value={selectedDistrict}
              onChange={handleDistrictChange}
            >
              <MenuItem value="">-- select district --</MenuItem>
              {allDistrictList.length > 0 &&
                allDistrictList.map((data, idx) => (
                  <MenuItem value={data?._id} key={idx}>
                    {data?.city_name}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
        </Grid>

        <Grid container spacing={1} alignItems="center" className="mb-2">
          <Grid item sm={4} xs={12}>
            <InputLabel>
              Zone <span style={{ color: "red" }}>*</span>
            </InputLabel>
          </Grid>
          <Grid item sm={8} xs={12}>
            <TextField
              label="Select Zone"
              size="small"
              variant="outlined"
              fullWidth
              select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              disabled={!selectedDistrictData}
            >
              <MenuItem value="">-- select zone --</MenuItem>
              {zonesList.length > 0 &&
                zonesList.map((zone, idx) => (
                  <MenuItem value={zone?._id} key={idx}>
                    {zone?.zone_name}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
        </Grid>

        <Grid container spacing={1} alignItems="center" className="mb-2">
          <Grid item sm={4} xs={12}>
            <InputLabel>
              Address<span style={{ color: "red" }}>*</span>
            </InputLabel>
          </Grid>
          <Grid item sm={8} xs={12}>
            <TextField
              variant="outlined"
              fullWidth
              multiline
              minRows={3}
              size="small"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              className="mt-8 px-8"
              startIcon={<Save />}
              type="submit"
              disabled={isLoading || !selectedDistrictData || !selectedZone}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Submit"
              )}
            </Button>
          </Box>
        </Grid>
      </form>
    </div>
  );
};

export default IncompleteForm;