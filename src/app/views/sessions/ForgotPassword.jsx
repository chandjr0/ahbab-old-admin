import React, { useState } from "react";
import {
  Card,
  Checkbox,
  FormControlLabel,
  Grid,
  Button,
  CircularProgress,
} from "@material-ui/core";
import { Formik, Field, Form } from "formik";

import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
// import { MatxLogo, MatxDivider } from "../../../components/index";
import { makeStyles } from "@material-ui/core/styles";
import history from "../../../history";
import clsx from "clsx";
import useAuth from "../../hooks/useAuth";
import { values } from "lodash-es";
import axios from "../../../axios";
import { notification, openNotificationWithIcon } from "antd";

const useStyles = makeStyles(({ palette, ...theme }) => ({
  cardHolder: {
    background: "#1A2038",
  },
  card: {
    maxWidth: 800,
    margin: "1rem",
  },
  cardLeft: {
    background: "#161c37 url(/assets/images/bg-3.png) no-repeat",
    backgroundSize: "cover",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.down("sm")]: {
      minWidth: 200,
    },
  },
  logo: {
    display: "flex",
    alignItems: "center",
    "& span": {
      fontSize: 26,
      lineHeight: 1.3,
      fontWeight: 800,
    },
  },
  mainTitle: {
    fontSize: 18,
    lineHeight: 1.3,
    marginBottom: 24,
  },
  features: {
    "& .item": {
      position: "relative",
      marginBottom: 12,
      paddingLeft: 20,
      "&::after": {
        position: "absolute",
        content: '""',
        width: 4,
        height: 4,
        borderRadius: 4,
        left: 4,
        top: 7,
        backgroundColor: palette.error.main,
      },
    },
  },
  buttonProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  socialButton: {
    width: "100%",
    "& img": {
      margin: "0 8px",
    },
  },
}));

const AdminLogin = () => {


  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
    remember: true,
  });

  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState('')
  const [isOtp, setIsOtp] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [isPassword, setIsPassword] = useState(false)
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')




  const { login } = useAuth();

  const classes = useStyles();

  const handleChange = ({ target: { name, value } }) => {
    let temp = { ...userInfo };
    temp[name] = value;
    setUserInfo(temp);
  };

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  const handleFormSubmit = async () => {
    if(isOtp){
      try {
        let res  = await axios.post(`/admin/verify-reset-otp`,{otpCode:otpCode})
        if(res){
         setIsOtp(false)
         setIsPassword(true)
         setToken(res?.data?.token)
         openNotificationWithIcon(res?.data?.message, "success");

        }
     } catch (e) {
       setLoading(false);
       openNotificationWithIcon(e?.response?.data?.message, "error");
 
     }
    }else if (isPassword){
      if(confirmPassword == password){
        try {
          let res  = await axios.post(`/admin/reset-password`,{password:password,token:token})
          if(res){
            openNotificationWithIcon(res?.data?.message, "success");

            history.push("/signin")
          }
       } catch (e) {
         setLoading(false);
         openNotificationWithIcon(e?.response?.data?.message, "error");
   
       }
      }else{
        openNotificationWithIcon("Password Didn't matched", "error");

      }
     
    }else{
      try {
        let res  = await axios.post(`/admin/forget-password`,{phone:phone})
        if(res){
         setIsOtp(true)
         openNotificationWithIcon(res?.data?.message, "success");

        }
     } catch (e) {
       setLoading(false);
       openNotificationWithIcon(e?.response?.data?.message, "error");
 
     }
    }
   
  };


  return (
    <Formik
      initialValues={{
        email: "",
        password: "",
      }}
      onSubmit={async (values) => {
        
      }}
    >
      <div
        className={clsx(
          "flex justify-center items-center  min-h-full-screen",
          classes.cardHolder
        )}
      >
        <Card className={classes.card}>
          <Grid container>
            <Grid item lg={6} md={6} sm={5} xs={12}>
              <div
                className={clsx({
                  "py-8 px-14 h-full": true,
                  [classes.cardLeft]: true,
                })}
              >
                <div className={classes.logo}>
                  {/* <img height="45px" src="/Logo.png" alt="Logo" /> */}
                </div>
                <h1 className={classes.mainTitle}>Admin Dashboard</h1>
                <div className={classes.features}>
                  <div className="item">Admin Password Reset</div>
                </div>
                <span className="flex-grow"></span>
              </div>
            </Grid>
            <Grid item lg={6} md={6} sm={6} xs={12}>
              
              <div className="p-8 h-full relative">
                <ValidatorForm onSubmit={handleFormSubmit}>

                  <TextValidator
                    className="mb-6 w-full"
                    variant="outlined"
                    size="small"
                    label="Phone"
                    onChange={(e)=>setPhone(e.target.value)}
                    value={phone}
                    type="number"
                    name="phone"
                   
                  />

                  {isOtp?
                  <TextValidator
                    className="mb-3 w-full"
                    label="Otp Code"
                    variant="outlined"
                    size="small"
                    onChange={(e)=>setOtpCode(e.target.value)}
                    value={otpCode}
                    name="otp"
                    type="number"
                     
                  />
                  :null}
                  
                  {isPassword?
                  <>
                  <TextValidator
                    className="mb-3 w-full"
                    label="Password"
                    variant="outlined"
                    size="small"
                    name="password"
                    type="password"
                    onChange={(e)=>setPassword(e.target.value)}
                    value={password}
                    
                  />
                  <TextValidator
                  className="mb-3 w-full"
                  label="Confirm Password"
                  variant="outlined"
                  size="small"
                  name="password"
                  type="password"
                  onChange={(e)=>setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                  
                />
                </>
                  :null}
                 
                  {message && <p className="text-error">{message}</p>}

                  <div className="flex flex-wrap items-center mb-4">
                    <div className="relative">
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        type="submit"
                      >
                        Send
                      </Button>
                      {loading && (
                        <CircularProgress
                          size={24}
                          className={classes.buttonProgress}
                        />
                      )}
                    </div>
                    
                  </div>
                 
                </ValidatorForm>
              </div>
            </Grid>
          </Grid>
        </Card>
      </div>
    </Formik>
  );
};

export default AdminLogin;
