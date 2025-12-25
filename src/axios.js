import Axios from "axios";
let token = window.localStorage.getItem("accessToken") || "";

const axios = Axios.create({ 

  baseURL:
    process.env.NODE_ENV === "development" 
      ? `${process.env.REACT_APP_LOCAL_API}/api/v1`
      : `${process.env.REACT_APP_LIVE_API}/api/v1`,
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
});

export default axios;
