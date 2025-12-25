import React, { useLayoutEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  TextField,
} from "@material-ui/core";
import { notification } from "antd";
import axios from "../../../../../../../axios";
import { useEffect } from "react";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";

const AddRedxCourierPage = ({
  courierOrderData,
  courierData,
  closeModalHandler,
  dataList,
  setDataList,
  courierTrackId,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cashCollection, setCashCollection] = useState("");
  const [prodValue, setProdValue] = useState("");
  const [weight, setWeight] = useState(0.5);
  const [instruction, setInstruction] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState({});
  const [districtList, setDistrictList] = useState([]);
  const [zoneList, setZoneList] = useState([]);
  const [selectedZone, setSelectedZone] = useState({});
  const [areaList, setAreaList] = useState([]);
  const [selectedArea, setSelectedArea] = useState({});
  const [storeList, setStoreList] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [description, setDescription] = useState("");
  const [buttonDisable, setButtonDisable] = useState(false)

  // useLayoutEffect(() => {
  //   const fetchData = async () => {
  //     let res = await axios.get("courier-track/redx/areas");
  //     let areaData = res?.data?.data;
  //     setDistrictOptions(areaData);
  //     setAreaOptions([]);
  //   };
  //   fetchData();
  // }, []);

  useEffect(() => {
    if (courierOrderData) {
      setName(courierOrderData?.deliveryAddress?.name);
      setPhone(courierOrderData?.deliveryAddress?.phone);
      setAddress(courierOrderData?.deliveryAddress?.address);
      setCashCollection(courierOrderData?.customerCharge?.remainingTkPay);
      setSelectedDistrict(courierOrderData?.deliveryAddress?.city)
      setSelectedZone(courierOrderData?.deliveryAddress?.zone)
      setSelectedArea(courierOrderData?.deliveryAddress?.area)
      setProdValue(courierOrderData?.customerCharge?.remainingTkPay);
    }
  }, [courierOrderData]);

  const handleIncrease = () => {
    setWeight(weight + 0.5);
  };

  const handleDecrease = () => {
    if (weight > 0.5) {
      setWeight(weight - 0.5);
    }
  };

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const formSubmitHandler = async () => {
    setButtonDisable(true)

    try {
      setIsLoading(true);
      let qty = courierOrderData?.products?.reduce(
        (total, product) => total + product.quantity,
        0
      );

      let obj = {
        orderType: "admin",
        orderSerialId: courierOrderData?.serialId,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        store_id: selectedStore,
        city_id: selectedDistrict?.city_id,
        zone_id: selectedZone?.zone_id,
        area_id: selectedArea?.area_id,
        totalQuantity: qty,
        weight: weight.toString(),
        collectionMoney: cashCollection,
        instruction: instruction,
        description: description,
      };


      let res = await axios.post("/courier-service/pathao/create-parcel", obj);
      if (res?.data?.success) {
        setDataList(
          dataList.map((data) =>
            data?._id === courierOrderData?._id
              ? {
                  ...data,
                  courierTrackId: res?.data?.data?.courierTrackId,
                  courierStatus: res?.data?.data?.courierStatus,
                  courierData: res?.data?.data?.courierData,
                }
              : data
          )
        );
        closeModalHandler();
        setButtonDisable(false)
        openNotificationWithIcon(res?.data?.message, "success");
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  const cancelAddRedx = () => {
    setDataList(
      dataList.map((data) =>
        data?._id === courierOrderData?._id
          ? {
              ...data,
              courierTrackId: null,
              courierStatus: "",
              // courierId: res?.data?.data?.courierId,
              courierData: courierOrderData?.courierData
                ? courierOrderData?.courierData
                : {
                    _id: null,
                    name: "",
                  },
            }
          : data
      )
    );
    closeModalHandler();
    window.location.reload(false);
  };

  useEffect(() => {
    const getDistrict = async () => {
      try {
        let res = await axios.get(`/courier-service/pathao/get-areas`);
        if (res?.data?.success) {
          setDistrictList(res?.data?.data);
        }
      } catch (error) {
        console.log("err in getDistrict");
      }
    };
    getDistrict();
    const getStores = async () => {
      try {
        let res = await axios.get(`/courier-service/pathao/get-stores`);
        if (res?.data?.success) {
          setStoreList(res?.data?.data);
        }
      } catch (error) {
        console.log("err in getDistrict");
      }
    };
    getStores();
  }, []);

  // const getCityWiseZones = async (id) => {
  //   setSelectedZone('')
  //   try {
  //     let res = await axios.get(`/courier-service/pathao/get-zones/${id}`);
  //     if (res?.data?.success) {
  //       setZoneList(res?.data?.data);
  //     }
  //   } catch (error) {
  //     console.log("err in getDistrict");
  //   }
  // };

  // const getZoneWiseArea = async (id) => {
  //   setSelectedArea('')
  //   try {
  //     let res = await axios.get(`/courier-service/pathao/get-areas/${id}`);
  //     if (res?.data?.success) {
  //       setAreaList(res?.data?.data);
  //     }
  //   } catch (error) {
  //     console.log("err in getDistrict");
  //   }
  // };

  // useEffect(() => {
  //   const getCourierData = async () => {
  //     try {
  //       let res = await axios.get(
  //         `/courier-service/pathao/view/${courierTrackId?.courierTrackId}`
  //       );
  //       if (res?.data?.success) {

  //         let data  = res?.data?.data?.pathaoKeys;
  //         setName(data?.recipient_name);
  //         setPhone(data?.recipient_phone);
  //         setAddress(data?.recipient_address);
  //         setCashCollection(data?.remainingTkPay);
  //         setProdValue(data?.remainingTkPay);
  //         setDescription(data?.item_description)
  //         setInstruction(data?.special_instruction)
  //         setWeight(data?.item_weight)
  //         setCashCollection(data?.amount_to_collect)
  //         setSelectedDistrict(data?.recipient_city)
  //         getCityWiseZones(data?.recipient_city)
  //         setSelectedZone(data?.recipient_zone)
  //         getZoneWiseArea(data?.recipient_zone)
  //         setSelectedZone(data?.recipient_zone)
  //         setSelectedArea(data?.recipient_area)
  //         setSelectedStore(data?.store_id)

          
  //         // amount_to_collect: "50";
  //         // consignment_id: "DT300124J6T3JQ";
  //         // delivery_type: "48";
  //         // item_description: "des";
  //         // item_quantity: "2";
  //         // item_type: "2";
  //         // item_weight: "0.5";
  //         // order_status: "Pending";
  //         // recipient_address: "dhaka r pashe";
  //         // recipient_area: "15366";
  //         // recipient_city: "1";
  //         // recipient_name: "alu";
  //         // recipient_phone: "01728897256";
  //         // recipient_zone: "941";
  //         // sender_name: "BASTOB";
  //         // sender_phone: "01521334958";
  //         // special_instruction: "inst";
  //         // store_id: "130752";

  //       }
  //     } catch (error) {
  //       console.log("err in getCourierData");
  //     }
  //   };
  //   getCourierData();
  // }, [courierTrackId]);

  return (
    <div>
      <h4 className="text-center mb-2">Pathao Courier</h4>
      <p>
        ID:{" "}
        <strong className="text-secondary">{courierOrderData?.serialId}</strong>
      </p>
      <Grid container spacing={2} className="border mb-2">
        <Grid item lg={6}>
          <TextField
            label="Name"
            placeholder=""
            name="name"
            size="small"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Grid>
        <Grid item lg={6}>
          <TextField
            label="Phone"
            placeholder=""
            name="name"
            size="small"
            variant="outlined"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Grid>
        <Grid item lg={6}>
          <TextField
            label="Address"
            placeholder=""
            name="name"
            size="small"
            variant="outlined"
            fullWidth
            multiline
            minRows={1}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Grid>
        <Grid item lg={6}>
          <TextField
            label="Weight(kg)"
            placeholder=""
            name="name"
            size="small"
            variant="outlined"
            fullWidth
            value={weight}
            onChange={(e) => {
              if (e.target.value) {
                setWeight(parseFloat(e.target.value));
              } else {
                setWeight(0.5);
              }
            }}
            InputProps={{
              endAdornment: (
                <>
                  <IconButton
                    style={{ padding: "8px" }}
                    onClick={handleIncrease}
                  >
                    <AddIcon style={{ fontSize: "14px" }} />
                  </IconButton>
                  <IconButton
                    style={{ padding: "8px" }}
                    onClick={handleDecrease}
                  >
                    <RemoveIcon style={{ fontSize: "14px" }} />
                  </IconButton>
                </>
              ),
            }}
          />
        </Grid>
        <Grid item lg={6}>
          <TextField
            label="Cash Collection"
            placeholder=""
            name="name"
            size="small"
            variant="outlined"
            fullWidth
            value={cashCollection}
            onChange={(e) => setCashCollection(e.target.value)}
          />
        </Grid>
        {/* <Grid item lg={6}>
          <TextField
            label="Product Value"
            placeholder=""
            name="name"
            size="small"
            variant="outlined"
            fullWidth
            value={prodValue}
            onChange={(e) => setProdValue(e.target.value)}
          />
        </Grid> */}
        <Grid item lg={6}>
          <TextField
            label="Cities"
            placeholder=""
            name=""
            size="small"
            variant="outlined"
            fullWidth
            disabled
            // onChange={(e) => {
            //   getCityWiseZones(e.target.value);
            //   setSelectedDistrict(e.target.value);
            // }}
            value={selectedDistrict?.city_name}
          >
          
          </TextField>
        </Grid>
        <Grid item lg={6}>
          <TextField
            label="Zone"
            placeholder=""
            name=""
            size="small"
            variant="outlined"
            fullWidth
            disabled
            // onChange={(e) => {
            //   getZoneWiseArea(e.target.value);
            //   setSelectedZone(e.target.value);
            // }}
            value={selectedZone?.zone_name}
          >
           
          </TextField>
        </Grid>
        <Grid item lg={6}>
          <TextField
            label="Area"
            placeholder=""
            size="small"
            variant="outlined"
            fullWidth
            disabled
            value={selectedArea?.area_name}
          >
           
          </TextField>
        </Grid>
        <Grid item lg={6}>
          <TextField
            label="Stores"
            placeholder=""
            name=""
            size="small"
            variant="outlined"
            fullWidth
            select
            onChange={(e) => setSelectedStore(e.target.value)}
            value={selectedStore}
          >
            <MenuItem value="">--select--</MenuItem>
            {storeList.map((val) => (
              <MenuItem key={val?.name} value={val?.store_id}>
                {val?.store_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item sm={12}>
          <TextField
            label="Description"
            placeholder=""
            name="name"
            size="small"
            variant="outlined"
            fullWidth
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Grid>
        <Grid item sm={12}>
          <TextField
            label="Instruction"
            placeholder=""
            name="name"
            size="small"
            variant="outlined"
            fullWidth
            multiline
            minRows={2}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
          />
        </Grid>
      {courierTrackId.courierTrackId?null:
        <Grid item sm={12}>
          <Box sx={{ display: "flex", mt: 2 }}>
            <Button
              className="mr-4"
              variant="contained"
              color="primary"
              disabled={buttonDisable}
              onClick={formSubmitHandler}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Update"
              )}
            </Button>
            <Button variant="outlined" onClick={cancelAddRedx}>
              Cancel
            </Button>
          </Box>
        </Grid>
        }
      </Grid>
    </div>
  );
};

export default AddRedxCourierPage;
