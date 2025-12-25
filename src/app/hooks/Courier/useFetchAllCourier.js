import { useState, useEffect } from "react";
import axios from "../../../axios";
import { notification } from "antd";

// Custom hook for managing courier statuses
const useCourierStatus = (pathaoId, steadfastId) => {
  const [pathaoIsOn, setPathaoIsOn] = useState(false);
  const [steadfastIsOn, setSteadfastIsOn] = useState(false);
  const [couriers, setCouriers] = useState(null);
  
  // Loading states for each toggle
  const [pathaoLoading, setPathaoLoading] = useState(false);
  const [steadfastLoading, setSteadfastLoading] = useState(false);

  // Fetch all couriers and initialize statuses
  const fetchCouriers = async () => {
    try {
      const response = await axios.get("/courier/fetch-all");
      const courierData = response?.data;

      setPathaoIsOn(response?.data?.data[0]?.status);
      setSteadfastIsOn(response?.data?.data[1]?.status);

      setCouriers(courierData);
    } catch (error) {
      console.error("Error fetching couriers:", error);
    }
  };

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  // Update courier status
  const updateCourierStatus = async (courierId, status) => {
    try {
      const response = await axios.patch("/courier/status-update", {
        id: courierId,
        status,
      });
      if (response?.data?.success) {
        openNotificationWithIcon(response?.data?.message, "success");
        return true;
      } else {
        openNotificationWithIcon(response?.data?.message, "error");
        return false;
      }
    } catch (err) {
      console.error("Error updating courier status:", err);
      openNotificationWithIcon(err?.response?.data?.message, "error");
      return false;
    }
  };

  // Handlers for toggling Pathao status
  const togglePathaoStatus = (status) => {
    setPathaoLoading(true); // Set loading to true before the request
    updateCourierStatus(pathaoId, status)
      .then((statusUpdate) => {
        if (statusUpdate) {
          setPathaoIsOn(status); // Update state based on the resolved value
        } else {
          setPathaoIsOn(couriers?.data?.[0]?.status || false);
        }
      })
      .catch((error) => {
        console.error("Error during Pathao status update:", error); // Handle any error
        setPathaoIsOn(couriers?.data?.[0]?.status || false); // Set state to false on error if needed
      })
      .finally(() => {
        setPathaoLoading(false); // Always set loading to false after the request
      });
  };

  // Handlers for toggling Steadfast status
  const toggleSteadfastStatus = (status) => {
    setSteadfastLoading(true); // Set loading to true before the request
    updateCourierStatus(steadfastId, status)
      .then((statusUpdate) => {
        if (statusUpdate) {
          setSteadfastIsOn(status);
        } else {
          setSteadfastIsOn(couriers?.data?.[1]?.status || false);
        }
      })
      .catch((error) => {
        console.error("Error during Steadfast status update:", error); // Handle any error
        setSteadfastIsOn(couriers?.data?.[1]?.status || false); // Optionally reset state on error
      })
      .finally(() => {
        setSteadfastLoading(false); // Always set loading to false after the request
      });
  };

  // Fetch couriers when the component mounts
  useEffect(() => {
    fetchCouriers();
  }, []);

  // Return the relevant data and actions
  return {
    couriers,
    pathaoIsOn,
    steadfastIsOn,
    pathaoLoading, // Expose loading state for Pathao
    steadfastLoading, // Expose loading state for Steadfast
    togglePathaoStatus,
    toggleSteadfastStatus,
  };
};

export default useCourierStatus;
