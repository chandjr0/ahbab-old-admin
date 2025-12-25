import {

  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
  TableCell,
  TableRow,
  Table,
  TableHead,
  TableBody,

} from "@material-ui/core";
import { Save } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import CartDetails from "./cartDetails";
import CustomerDetails from "./customerDetails";
import OrderNote from "./orderNote";
import ProductList from "./productList";
import axios from "../../../../axios";
import { notification } from "antd";
import { useParams } from "react-router-dom";
import imageBasePath from "../../../../config";
import Spinner from "../../../Shared/Spinner/Spinner";
import { convertImageToBase64 } from "../../../util/convertImageToBase64";
import SimpleModal from "../../../Shared/SimpleModal/SimpleModal";
import moment from "moment";

const PosOrderUpdate = () => {

  const { serialId, type } = useParams();

  const [orderData, setOrderData] = useState(null);
  const [cartProducts, setCartProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
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
  const [isInsideLocation, setIsInsideLocation] = useState("");
  const [noteList, setNoteList] = useState([]);
  const [adminNote, setAdminNote] = useState("");
  const [customerPageLoading, setCustomerPageLoading] = useState(false);
  const [customerNote, setCustomerNote] = useState("");
  const [allDistrictList, setAllDistrictList] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [allAreaList, setAllAreaList] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedZone, setselectedZone] = useState("");
  const [zoneList, setzoneList] = useState([]);
  const [deliveryLocationInsideOrOut, setDeliveryLocationInsideOrOut] = useState("");
  const [combos, setCombos] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      let url =
        type == "reseller"
          ? "/reseller-order/admin/single-order-for-update/"
          : "/admin-order/single-order-for-update/";
      try {
        setCustomerPageLoading(true);
        const [settingData, orderData] = await Promise.all([
          axios.get("/setting/admin/view"),
          axios.get(url + serialId),
        ]);
        setDeliveryData(settingData?.data?.data?.deliveryCharge);
        setOrderData(orderData?.data?.data);
        setCustomerPageLoading(false);
      } catch (err) {
        setErrorMsg(err?.response?.data?.message);
        setCustomerPageLoading(false);
      }
    };
    if (serialId) {
      fetchData();
    }

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
  }, [serialId]);

  useEffect(() => {
    if (orderData) {
      setCustomerId(orderData?.customerId);

      // change data structure for cart and combo
      if (orderData?.combos) {
        const combosWithFlag = orderData.combos.map((combo) => {
          const { _id, galleryImage, ...rest } = combo; 
          const comboId = _id; 
          const subTotal = combo.price * combo.quantity;
          return {
            ...rest,
            images: galleryImage,
            isCombo: true,
            subTotal,
            comboId,
          }; 
        });
        setCartProducts([...orderData.products, ...combosWithFlag]);
      } else {
        setCartProducts(orderData?.products);
      }

      // get right data structure for combos
      setCombos(
        orderData.combos.map((item) => {
          return {
            comboId: item?._id,
            price: item?.price || 0,
            quantity: item?.quantity,
            uid:item?.uid,
            products: item.comboProducts.map((it) => {
              return {
                productId: it?.product?._id,
                isVariant: it?.isVariant,
                variationId: it?.isVariant? it?.variation?._id : '',
                variationName: it?.isVariant? it?.variationName : '',
              }
            }),
          };
        })
      );

      setPhone(orderData?.deliveryAddress?.phone);
      setName(orderData?.deliveryAddress?.name);
      setDetails(orderData?.deliveryAddress?.address);
      setCourier(orderData?.courierName);
      setPaymentType(orderData?.payment?.paymentType);
      setTotalPayTk(orderData?.payment?.amount);
      setPaymentDetails(orderData?.payment?.details);
      setTotalProductPrice(orderData?.customerCharge?.totalProductPrice);
      setDiscountPrice(orderData?.customerCharge?.discountPrice);
      setDeliveryCharge(orderData?.customerCharge?.deliveryCharge);
      setSelectedDistrict(orderData?.deliveryAddress?.city?.city_id);

      districtWiseZone(orderData?.deliveryAddress?.city?.city_id);

      let imageArray = [];
      if (orderData?.payment?.documentImg !== "") {
        imageArray = [
          {
            url: imageBasePath + "/" + orderData?.payment?.documentImg,
          },
        ];
      }
      setNoteList(orderData?.adminNote);
      setCustomerNote(orderData?.customerNote);
      setFileList(imageArray);
      setTimeout(() => {
        setselectedZone(orderData?.deliveryAddress?.zone?.zone_id);
      }, 500);

      setTimeout(() => {
        setSelectedArea(orderData?.deliveryAddress?.area?.area_id);
      }, 1000);
    }
  }, [orderData]);

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
    if (cartProducts.length > 0) {
      let productPrice = 0;
      cartProducts.forEach((product) => {
        productPrice += product?.subTotal;
      });
      setTotalProductPrice(productPrice);
    }
  }, [cartProducts]);


  useEffect(() => {
    if (isInsideLocation === "inside") {
      setDeliveryCharge(deliveryData?.inside?.amount);
    } else if (isInsideLocation === "outside") {
      setDeliveryCharge(deliveryData?.outside?.amount);
    } else {
      setDeliveryCharge(0);
    }
  }, [deliveryData, isInsideLocation]);

  const formSubmitHandler = async (event) => {
    event.preventDefault();

    let city = allDistrictList.find((e) => e.city_id == selectedDistrict);
    let zone = zoneList.find((e) => e.zone_id == selectedZone);

    try {
      setIsLoading(true);
      let errorMsg = "";
      if (cartProducts.length <= 0) {
        errorMsg = "Select minimum one product";
      } else if (!phone) {
        errorMsg = "Phone is required";
      } else if (!name) {
        errorMsg = "Name is required";
      } else if (!details) {
        errorMsg = "Address is required";
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
      } else if (fileList.length > 0) {
        baseImg = fileList[0].url.split(imageBasePath + "/")[1];
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
        courierName: courier,
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
          address: details,
          cityId: city?._id,
          zoneId: zone?._id,
          // areaId: area?._id,
        },
      };
      console.log("......................body", obj);

      if (type == "reseller") {
        obj["resellerId"] = orderData?.resellerInfo?.resellerId;
      }

      let url =
        type == "reseller"
          ? "/reseller-order/admin/update-order"
          : "/admin-order/update-order";

      let res = await axios.patch(`${url}/${serialId}`, obj);
      if (res?.data?.success) {
        setAdminNote("");
        openNotificationWithIcon(res.data?.message, "success");
        window.location.reload(true);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  useEffect(() => {
    if (selectedDistrict === 1) {
      setDeliveryLocationInsideOrOut("inside");
      setDeliveryCharge(deliveryData?.inside?.amount);
    } else {
      setDeliveryCharge(deliveryData?.outside?.amount);
      setDeliveryLocationInsideOrOut("outside");
    }
  }, [deliveryData, selectedDistrict]);

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
      <div>
        <div
          style={{
            background: "#34A853",
            width: "150px",
            textAlign: "center",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => setOpenModal(true)}
        >
          <h6 style={{ padding: "5px", color: "#fff" }}>View Update History</h6>
        </div>
      </div>

      {!customerPageLoading ? (
        errorMsg ? (
          <Typography
            variant="h6"
            style={{
              textAlign: "center",
              color: "red",
              paddingY: "14px",
              padding: "8px",
            }}
          >
            {errorMsg}
          </Typography>
        ) : (
          <form onSubmit={formSubmitHandler}>
            <Grid container spacing={2} className="mb-4">
              <Grid item xs={12} md={6} lg={4}>
                <ProductList
                  cartProducts={cartProducts}
                  setCartProducts={setCartProducts}
                  type={type}
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
                  isInsideLocation={isInsideLocation}
                  setIsInsideLocation={setIsInsideLocation}
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
                  noteList={noteList}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <OrderNote
                  title="Customer"
                  adminNote={customerNote}
                  setAdminNote={setCustomerNote}
                  noteList={noteList}
                />
              </Grid>

              {/* <Grid item xs={12} md={6}>
                <OldProducts customerId={orderData?.customerId} orderId={orderData?._id} />
              </Grid> */}
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
        )
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

      <SimpleModal
        isShow={openModal}
        closeModalHandler={() => setOpenModal(false)}
        width={600}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <h5 className="text-center">Order Update History</h5>
          <Box>
            <Table stickyHeader className="whitespace-pre">
              <TableHead>
                <TableRow>
                  <TableCell className="min-w-50">
                    <strong>#</strong>
                  </TableCell>
                  <TableCell className="min-w-100">Time</TableCell>
                  <TableCell className="min-w-100">Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderData?.updateHistory?.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell className="capitalize" align="left">
                      {index + 1}
                    </TableCell>

                    <TableCell className="capitalize" align="left">
                      <p>{moment(data?.time).format("llll")}</p>
                    </TableCell>

                    <TableCell className="capitalize" align="left">
                      {data?.message}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
      </SimpleModal>
    </div>
  );
};

export default PosOrderUpdate;
