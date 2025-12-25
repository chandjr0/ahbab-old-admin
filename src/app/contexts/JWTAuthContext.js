import React, { createContext, useEffect, useReducer } from "react";
import jwtDecode from "jwt-decode";
import axios from "../../axios";
import { MatxLoading } from "../components";
import { notification, openNotificationWithIcon } from "antd";

const initialState = {
  isAuthenticated: false, 
  isInitialised: false,
  user: null,
};

// const [cookies, setCookie, removeCookie] = useCookies(['user']);

const isValidToken = (accessToken) => {
  if (!accessToken) {
    return false;
  }
  const decodedToken = jwtDecode(accessToken);
  const currentTime = Date.now() / 1000;
  return decodedToken.exp > currentTime;
};

const setSession = (accessToken) => {
  if (accessToken) {
    // console.log("set here...");
    localStorage.setItem("accessToken", accessToken);
    axios.defaults.headers.common.Authorization = `${accessToken}`;
  } else {
    localStorage.removeItem("accessToken");
    delete axios.defaults.headers.common.Authorization;
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INIT": {
      const { isAuthenticated, user } = action.payload;

      return {
        ...state,
        isAuthenticated,
        isInitialised: true,
        user,
      };
    }
    case "LOGIN": {
      const { user } = action.payload;

      return {
        ...state,
        isAuthenticated: true,
        user,
      };
    }
    case "LOGOUT": {
      localStorage.removeItem("menuList");
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    }
    case "REGISTER": {
      const { user } = action.payload;

      return {
        ...state,
        isAuthenticated: true,
        user,
      };
    }
    default: {
      return { ...state };
    }
  }
};

const AuthContext = createContext({
  ...initialState,
  method: "JWT",
  login: () => Promise.resolve(),
  logout: () => {},
  register: () => Promise.resolve(),
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };
  const login = async (email, password) => {
    try {
      const response = await axios.post("/admin/signin", {
        email,
        password,
      });
      // const { token, user } = response.data.data
      if (response.data.data.role === "employee") {
        localStorage.setItem("menuList", JSON.stringify(response.data.data.menuList));
      }

      // console.log('.................res',response);
      const token = response.data.data.token;
      const user = {
        email: response.data.data.email,
        name: response.data.data.email,
        role: response.data.data.email,
        superAdmin: response.data.data.email,
        _id: response.data.data.email,
        orderStatusUpdate:response.data.data.orderStatusUpdate
      };

      setSession(token);
      openNotificationWithIcon(response?.data?.message, "success");

      dispatch({
        type: "LOGIN",
        payload: {
          user,
        },
      });
    } catch (error) {
      openNotificationWithIcon(error?.response?.data?.message, "error");
    }
  };

  const register = async (email, username, password) => {
    const response = await axios.post("/api/auth/register", {
      email,
      username,
      password,
    });

    const { accessToken, user } = response.data;

    setSession(accessToken);

    dispatch({
      type: "REGISTER",
      payload: {
        user,
      },
    });
  };

  const logout = () => {
    setSession(null);
    dispatch({ type: "LOGOUT" });
  };

  useEffect(() => {
    (async () => {
      try {
        const accessToken = window.localStorage.getItem("accessToken");

        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken);
          const decoded = jwtDecode(accessToken);
          // console.log('useEffect=========',decoded)

          // const response = await axios.get('/admin/signin')
          const user = {
            email: decoded?.data?.email,
            name: decoded?.data?.name,
            role: decoded?.data?.role,
            superAdmin: decoded?.data?.superAdmin,
            _id: decoded?.data?._id,
            orderStatusUpdate:decoded?.data.orderStatusUpdate
          };

          dispatch({
            type: "INIT",
            payload: {
              isAuthenticated: true,
              user,
            },
          });
        } else {
          dispatch({
            type: "INIT",
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: "INIT",
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    })();
  }, []);

  if (!state.isInitialised) {
    return <MatxLoading />;
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: "JWT",
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
