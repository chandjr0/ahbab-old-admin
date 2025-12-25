import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { notification } from "antd";
import axios from "../../../../../../../axios";
import moment from "moment";
import { useEffect } from "react";
import Spinner from "../../../../../../Shared/Spinner/Spinner";

const RedxCourierTrack = ({ courierTrackId, closeModalHandler, dataList, setDataList }) => {


  const [isPageLoading, setIsPageLoading] = useState(false);
  const [courierTrackData, setCourierTrackData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemove, setIsRemove] = useState(false);

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  useEffect(() => {
    try {
      let fetchData = async () => {
        setIsPageLoading(true);
        let res = await axios.get("/courier-track/redx/parcel/" + courierTrackId);
        setCourierTrackData(res?.data?.data);
        setIsPageLoading(false);
      };

      if (courierTrackId) {
        fetchData();
      }
    } catch (err) {
      setIsPageLoading(false);
    }
  }, [courierTrackId]);

  useEffect(() => {
    const getCourierData = async () => {
      try {
        let res = await axios.get(
          `/courier-service/pathao/view/${courierTrackId?.courierTrackId}`
        );
        if (res?.data?.success) {

          setCourierTrackData(res?.data?.data);
          setIsPageLoading(false);

          // let data  = res?.data?.data?.pathaoKeys;
          // setName(data?.recipient_name);
          // setPhone(data?.recipient_phone);
          // setAddress(data?.recipient_address);
          // setCashCollection(data?.remainingTkPay);
          // setProdValue(data?.remainingTkPay);
          // setDescription(data?.item_description)
          // setInstruction(data?.special_instruction)
          // setWeight(data?.item_weight)
          // setCashCollection(data?.amount_to_collect)
          // setSelectedDistrict(data?.recipient_city)
          // getCityWiseZones(data?.recipient_city)
          // setSelectedZone(data?.recipient_zone)
          // getZoneWiseArea(data?.recipient_zone)
          // setSelectedZone(data?.recipient_zone)
          // setSelectedArea(data?.recipient_area)
          // setSelectedStore(data?.store_id)
        }
      } catch (error) {
        console.log("err in getCourierData");
      }
    };
    getCourierData();
  }, [courierTrackId]);

  const removeRedxCourier = async () => {
    try {
      setIsLoading(true);
      let res = await axios.patch("/courier-track/redx/remove-parcel/" + courierTrackId);
      if (res?.data?.success) {
        setDataList(
          dataList.map((data) =>
            data?.courierTrackId === courierTrackId
              ? {
                  ...data,
                  courierId: null,
                  courierTrackId: null,
                  courierName: "",
                  courierData: null,
                }
              : data
          )
        );

        closeModalHandler();
        openNotificationWithIcon(res?.data?.message, "success");
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon(err?.response?.data?.message, "error");
    }
  };

  return (
    <>
      {isPageLoading ? (
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
      ) : (
        <div>
          <p>
            Consignment ID:{" "}
            <strong className="text-secondary">
              {" " + courierTrackData?.pathaoKeys?.consignment_id}
            </strong>
          </p>
          <p>
            Status: <strong className="text-green">{" " + courierTrackData?.status}</strong>
          </p>
          <div className="mb-5">
            <div
              style={{
                background: "#0b1c4d",
                width: "250px",
                textAlign: "center",
                borderRadius: "10px",
                marginBottom: "-20px",
                marginLeft: "10px",
              }}
            >
              <h5 style={{ color: "#fff", padding: "5px" }}>Customer Information</h5>
            </div>
            <div style={{ border: "1px solid #0b1c4d", borderRadius: "5px" }}>
              <div className="flex ml-3">
                <div
                  style={{ width: "450px", marginTop: "20px" }}
                  className="flex items-center justify-between "
                >
                  <div
                    style={{ width: "200px", marginRight: "16px" }}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p style={{ marginBottom: "2px" }}>Track Id</p>{" "}
                      <p style={{ marginBottom: "2px" }}>Name</p>
                      <p style={{ marginBottom: "2px" }}>Phone</p>
                      <p style={{ marginBottom: "2px" }}>Address</p>
                      <p style={{ marginBottom: "2px" }}>Weight</p>{" "}
                      <p style={{ marginBottom: "2px" }}>Collection</p>
                      <p style={{ marginBottom: "2px" }}>Created Time</p>
                      <p style={{ marginBottom: "2px" }}>Created By</p>
                    </div>
                  </div>
                  <div style={{ width: "300px" }}>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {courierTrackId?.courierTrackId || ""}
                    </p>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {courierTrackData?.pathaoKeys?.recipient_name || ""}
                    </p>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {courierTrackData?.pathaoKeys?.recipient_phone || ""}
                    </p>
                    {/* <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {courierTrackData?.delivery_area || ""}
                    </p> */}
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {courierTrackData?.pathaoKeys?.recipient_address || ""}
                    </p>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {courierTrackData?.pathaoKeys?.item_weight || ""}
                    </p>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {courierTrackData?.pathaoKeys?.amount_to_collect || ""}
                    </p>
                    {/* <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {courierTrackData?.charge || ""}
                    </p> */}
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {moment(courierTrackData?.created_at).format("lll")}
                    </p>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {courierTrackData?.createdBy || ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              maxHeight: 300,
              overflow: "auto",
            }}
          >
            {courierTrackData?.logs.length > 0 && (
              <Table stickyHeader className="whitespace-pre mt-4">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Log</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courierTrackData?.logs.map((data, idx) => (
                    <TableRow key={idx}>
                      <TableCell align="left">
                        <p style={{ maxWidth: "150px" }} className="m-0 p-0 text-gray">
                          <small> {moment(data?.time).format("lll")}</small>
                        </p>
                      </TableCell>
                      <TableCell align="left">
                        <p className="m-0">{data?.message}</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          {/* <div className="my-4">
            <p className="text-error">If you want to remove the order from redx then click the</p>

            {!isRemove ? (
              <Button
                variant="contained"
                className="bg-error"
                size="medium"
                onClick={() => setIsRemove(!isRemove)}
              >
                Remove
              </Button>
            ) : (
              <Box sx={{ display: "flex", mt: 2 }}>
                <Button
                  className="mr-4"
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                  onClick={removeRedxCourier}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : "confirm"}
                </Button>
                <Button variant="outlined" onClick={() => setIsRemove(false)}>
                  Cancel
                </Button>
              </Box>
            )}
          </div> */}
        </div>
      )}
    </>
  );
};

export default RedxCourierTrack;
