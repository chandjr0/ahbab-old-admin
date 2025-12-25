import { Box, Button, CircularProgress, Grid } from "@material-ui/core";
import { Save } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { Breadcrumb } from "../../../components";
import CartDetails from "./cartDetails";
import CustomerDetails from "./customerDetails";
import OrderNote from "./orderNote";
import ProductList from "./productList";
import axios from "../../../../axios";
import { notification } from "antd";
import { convertImageToBase64 } from "../../../util/convertImageToBase64";
import OldProducts from "./oldProducts";

const PosOrder = () => {
  const [cartProducts, setCartProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [courierOptions, setCourierOptions] = useState([]);
  const [courier, setCourier] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [totalPayTk, setTotalPayTk] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState("");
  const [totalProductPrice, setTotalProductPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [deliveryData, setDeliveryData] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [customerPageLoading, setCustomerPageLoading] = useState(false);
  const [createTime, setCreateTime] = useState(new Date());
  const [customerNote, setCustomerNote] = useState("");
  const [allDistrictList, setAllDistrictList] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [allAreaList, setAllAreaList] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [deliveryLocationInsideOrOut, setDeliveryLocationInsideOrOut] =
    useState("");
  const [selectedZone, setselectedZone] = useState("");
  const [zoneList, setzoneList] = useState([]);
  const [combos, setCombos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCustomerPageLoading(true);
        const [courierData, settingData] = await Promise.all([
          axios.get("/courier/fetch-all"),
          axios.get("/setting/admin/view"),
        ]);

        setCourierOptions(courierData?.data?.data);
        setDeliveryData(settingData?.data?.data?.deliveryCharge);
        setCustomerPageLoading(false);
      } catch (err) {
        setCustomerPageLoading(false);
      }
    };
    fetchData();

    const getDistricts = async () => {
      try {
        let res = await axios.get(`/courier-service/pathao/get-areas`);
        if (res?.data) {
          setAllDistrictList(res?.data?.data);
        }
        setCustomerPageLoading(false);
      } catch (err) {
        setCustomerPageLoading(false);
      }
    };
    getDistricts();
  }, []);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const imageHandler = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (
      newFileList[0]?.originFileObj.type === "image/jpeg" ||
      newFileList[0]?.originFileObj.type === "image/jpg" ||
      newFileList[0]?.originFileObj.type === "image/png" ||
      newFileList[0]?.originFileObj.type === "image/webp"
    ) {
      setSelectedFile(newFileList[0]?.originFileObj);
    } else {
      setSelectedFile(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      let res = await axios.post(`/customer/admin/fetch-by-phone`, {
        phone: phone || " ",
      });

      if (res?.data?.success) {
        let customer = res?.data?.data;
        setCustomerId(customer?._id);
        setName(customer?.name);
        setDetails(customer?.address);
      } else {
        setCustomerId("");
      }
    };
    if (phone.length === 11) {
      fetchData();
    } else {
      setCustomerId("");
    }
  }, [phone]);

  useEffect(() => {
    if (cartProducts.length > 0) {
      let productPrice = 0;
      cartProducts.forEach((product) => {
        productPrice += product?.subTotal;
      });
      setTotalProductPrice(productPrice);
    }
  }, [cartProducts]);

  useEffect(() => {
    if (selectedDistrict === 1) {
      setDeliveryLocationInsideOrOut("inside");
      setDeliveryCharge(deliveryData?.inside?.amount);
    } else {
      setDeliveryCharge(deliveryData?.outside?.amount);
      setDeliveryLocationInsideOrOut("outside");
    }
  }, [deliveryData, selectedDistrict]);

  const formSubmitHandler = async (event) => {
    event.preventDefault();

    let city = allDistrictList.find((e) => e.city_id == selectedDistrict);
    let zone = zoneList.find((e) => e.zone_id == selectedZone);
    let area = allAreaList.find((e) => e.area_id == selectedArea);

    try {
      setIsLoading(true);
      let errorMsg = "";
      if (cartProducts.length <= 0) {
        errorMsg = "Select minimum one product";
      } else if (!phone) {
        errorMsg = "Phone is required";
      } else if (phone.length !== 11) {
        errorMsg = "Phone number must be 11 digit.";
      } else if (!name) {
        errorMsg = "Name is required";
      } else if (!details) {
        errorMsg = "Address is required";
      } else if (selectedDistrict === "") {
        errorMsg = "Select delivery location";
      } else if (!paymentType) {
        errorMsg = "Select Payment Type";
      }

      if (errorMsg !== "") {
        openNotificationWithIcon(errorMsg, "error");
        setIsLoading(false);
        return;
      }

      let baseImg = "";
      if (selectedFile) {
        baseImg = await convertImageToBase64(selectedFile);
      }

      let selectedProducts = [];

      cartProducts.forEach((product) => {
        if (!product.isCombo) {
          selectedProducts.push({
            productId: product?.productId,
            isVariant: product?.isVariant,
            variationId: product?.variantId,
            variationName: product?.variantName,
            quantity: product?.quantity,
            price: product?.price,
          });
        }
      });

      let obj = {
        customerId: customerId,
        products: selectedProducts,
        combos: combos,
        adminNoteMessage: adminNote,
        customerNote: customerNote,
        deliveryType: deliveryLocationInsideOrOut,
        payment: {
          paymentType: paymentType,
          amount: Number(totalPayTk) || 0,
          details: paymentDetails,
          documentImg: baseImg,
        },
        customerCharge: {
          totalProductPrice: Number(totalProductPrice) || 0,
          discountPrice: Number(discountPrice) || 0,
          deliveryCharge: Number(deliveryCharge) || 0,
          totalPayTk: Number(totalPayTk) || 0,
        },
        deliveryAddress: {
          name: name,
          phone: phone,
          cityId: city?._id,
          zoneId: zone?._id,
          areaId: area?._id,
          address: details,
        },
      };


      let res = await axios.post("/admin-order/create-pos-order", obj);
      if (res) {
        openNotificationWithIcon(res.data?.message, "success");
        window.location.reload(false);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  useEffect(() => {
    console.log("createTime: ", new Date(createTime).toISOString());
  }, [createTime]);

  const districtWiseZone = async (id) => {
    try {
      let res = await axios.get(`/courier-service/pathao/get-zones/${id}`);
      if (res?.data) {
        setzoneList(res?.data?.data);
        setselectedZone("");
      }
      setCustomerPageLoading(false);
    } catch (err) {
      setCustomerPageLoading(false);
    }
  };

  return (
    <div className="m-sm-30">
      <form onSubmit={formSubmitHandler}>
        <Grid container spacing={2} className="mb-4">
          <Grid item xs={12} md={6} lg={4}>
            <ProductList
              cartProducts={cartProducts}
              setCartProducts={setCartProducts}
              setCombos={setCombos}
              combos={combos}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <CustomerDetails
              customerId={customerId}
              fileList={fileList}
              phone={phone}
              setPhone={setPhone}
              name={name}
              setName={setName}
              details={details}
              setDetails={setDetails}
              courierOptions={courierOptions}
              courier={courier}
              setCourier={setCourier}
              paymentType={paymentType}
              setPaymentType={setPaymentType}
              totalPayTk={totalPayTk}
              setTotalPayTk={setTotalPayTk}
              paymentDetails={paymentDetails}
              setPaymentDetails={setPaymentDetails}
              imageHandler={imageHandler}
              customerPageLoading={customerPageLoading}
              grandTotalBill={
                Number(totalProductPrice) +
                Number(deliveryCharge) -
                Number(discountPrice)
              }
              allDistrictList={allDistrictList}
              setSelectedDistrict={setSelectedDistrict}
              selectedDistrict={selectedDistrict}
              districtWiseZone={districtWiseZone}
              allAreaList={allAreaList}
              selectedArea={selectedArea}
              setSelectedArea={setSelectedArea}
              setselectedZone={setselectedZone}
              zoneList={zoneList}
              // zoneWiseArea={zoneWiseArea}
              selectedZone={selectedZone}
            />
          </Grid>
          <Grid item xs={12} md={12} lg={4}>
            <CartDetails
              cartProducts={cartProducts}
              setCartProducts={setCartProducts}
              totalProductPrice={totalProductPrice}
              setTotalProductPrice={setTotalProductPrice}
              discountPrice={discountPrice}
              setDiscountPrice={setDiscountPrice}
              deliveryCharge={deliveryCharge}
              setDeliveryCharge={setDeliveryCharge}
              totalPayTk={totalPayTk}
              setCombos={setCombos}
              combos={combos}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <OrderNote
              title="Admin"
              adminNote={adminNote}
              setAdminNote={setAdminNote}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <OrderNote
              title="Customer"
              adminNote={customerNote}
              setAdminNote={setCustomerNote}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <OldProducts customerId={customerId} />
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Submit"
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default PosOrder;
