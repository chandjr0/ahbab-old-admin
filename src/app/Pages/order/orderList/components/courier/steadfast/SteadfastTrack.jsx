import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
} from "@material-ui/core";
import { notification } from "antd";
import axios from "../../../../../../../axios";
import moment from "moment";
import { useEffect } from "react";
import Spinner from "../../../../../../Shared/Spinner/Spinner";

const SteadfastTrack = ({ courierTrackId, closeModalHandler, dataList, setDataList }) => {
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
        let res = await axios.get("/courier-track/steadfast/parcel/" + courierTrackId);
        console.log("res: ", res);
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

  const removeRedxCourier = async () => {
    try {
      setIsLoading(true);
      let res = await axios.patch("/courier-track/steadfast/remove-parcel/" + courierTrackId);
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
          <h2 className="text-primary text-center">Steadfast</h2>
          <p>
            Order ID:{" "}
            <strong className="text-secondary">
              {" " + courierTrackData?.steadfastKeys?.invoice}
            </strong>
          </p>
          <p>
            Status:{" "}
            <strong className="text-green">{" " + courierTrackData?.steadfastKeys?.status}</strong>
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
                  style={{ marginTop: "20px", marginRight: "20px" }}
                  className="flex items-center justify-between "
                >
                  <div
                    style={{ width: "200px", marginRight: "16px" }}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p style={{ marginBottom: "4px" }}>Track Id</p>{" "}
                      <p style={{ marginBottom: "4px" }}>consignment id</p>{" "}
                      <p style={{ marginBottom: "4px" }}>Name</p>
                      <p style={{ marginBottom: "4px" }}>Phone</p>
                      <p style={{ marginBottom: "4px" }}>Address</p>
                      <p style={{ marginBottom: "4px" }}>Collection</p>
                      <p style={{ marginBottom: "4px" }}>Created Time</p>
                      <p style={{ marginBottom: "4px" }}>Created By</p>
                      <p style={{ marginBottom: "4px" }}>Note</p>
                      {/* 
                      <p style={{ marginBottom: "2px" }}>Weight</p>{" "}
                      <p style={{ marginBottom: "2px" }}>Delivery Charge</p> */}
                    </div>
                  </div>
                  <div>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {courierTrackData?.trackId || ""}
                    </p>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {courierTrackData?.steadfastKeys?.consignment_id || ""}
                    </p>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {courierTrackData?.steadfastKeys?.recipient_name || ""}
                    </p>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {courierTrackData?.steadfastKeys?.recipient_phone || ""}
                    </p>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {courierTrackData?.steadfastKeys?.recipient_address || ""}
                    </p>
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {courierTrackData?.steadfastKeys?.cod_amount || ""}
                    </p>
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
                    </p>{" "}
                    <p
                      style={{
                        marginBottom: "2px",
                        borderBottom: "1px solid #1234",
                      }}
                    >
                      {courierTrackData?.steadfastKeys?.note || ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {courierTrackData?.status === "cancel" &&
            courierTrackData?.steadfastKeys?.status === "cancelled" && (
              <div className="my-4">
                <p className="text-error">
                  If you want to remove the order from Steadfast then click the
                </p>

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
              </div>
            )}
        </div>
      )}
    </>
  );
};

export default SteadfastTrack;
