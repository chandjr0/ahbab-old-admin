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
import { MatxLogo, MatxDivider } from "../../../components/index";
import { makeStyles } from "@material-ui/core/styles";
import history from "../../../../history";
import clsx from "clsx";
import useAuth from "../../../hooks/useAuth";
import { values } from "lodash-es";

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
  const { login } = useAuth();

  const classes = useStyles();

  const handleChange = ({ target: { name, value } }) => {
    let temp = { ...userInfo };
    temp[name] = value;
    setUserInfo(temp);
  };

  const handleFormSubmit = async () => {
    setLoading(true);
    try {
      await login(userInfo.email, userInfo.password);
      history.push("/");
      window.location.reload();
    } catch (e) {
      console.log(e);
      setMessage(e.message);
      setLoading(false);
    }
  };

  // const handleGoogleLogin = async (event) => {
  //     try {
  //         await signInWithGoogle()
  //         history.push('/')
  //     } catch (e) {
  //         setMessage(e.message)
  //         setLoading(false)
  //         console.log('e==================',e)
  //     }
  // }

  return (
    <Formik
      initialValues={{
        email: "",
        password: "",
      }}
      onSubmit={async (values) => {
        //   console.log('vvvvvvvvvvvvvvv',values)
        // await new Promise((r) => setTimeout(r, 500));
        // alert(JSON.stringify(values, null, 2));
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
                  <div className="item">Admin Login</div>
                </div>
                <span className="flex-grow"></span>
              </div>
            </Grid>
            <Grid item lg={6} md={6} sm={6} xs={12}>
              {/* <div className="px-8 pt-8">
                            <Button
                                // onClick={handleGoogleLogin}
                                variant="contained"
                                className={classes.socialButton}
                            >
                                <img
                                    src="/assets/images/logos/google.svg"
                                    alt=""
                                />
                                Sign In With Google
                            </Button>
                        </div>

                        <MatxDivider className="mt-6 px-8" text="Or" /> */}

              <div className="p-8 h-full relative">
                <ValidatorForm onSubmit={handleFormSubmit}>
                  <TextValidator
                    className="mb-6 w-full"
                    variant="outlined"
                    size="small"
                    label="Email"
                    onChange={handleChange}
                    type="email"
                    name="email"
                    value={values.email}
                    // validators={['required', 'isEmail']}
                    // errorMessages={[
                    //     'this field is required',
                    //     'email is not valid',
                    // ]}
                  />
                  <TextValidator
                    className="mb-3 w-full"
                    label="Password"
                    variant="outlined"
                    size="small"
                    onChange={handleChange}
                    name="password"
                    type="password"
                    value={values.password}
                    // validators={['required']}
                    // errorMessages={['this field is required']}
                  />
                  <FormControlLabel
                    className="mb-3 min-w-288"
                    name="remember"
                    onChange={handleChange}
                    control={
                      <Checkbox
                        size="small"
                        onChange={({ target: { checked } }) =>
                          handleChange({
                            target: {
                              name: "remember",
                              value: checked,
                            },
                          })
                        }
                        checked={userInfo.remember}
                      />
                    }
                    label="Remeber me"
                  />

                  {message && <p className="text-error">{message}</p>}

                  <div className="flex flex-wrap items-center mb-4">
                    <div className="relative">
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        type="submit"
                      >
                        Sign in
                      </Button>
                      {loading && (
                        <CircularProgress
                          size={24}
                          className={classes.buttonProgress}
                        />
                      )}
                    </div>
                    {/* <span className="mr-2 ml-5">or</span>
                                    <Button
                                        className="capitalize"
                                        onClick={() =>
                                            history.push('/signup')
                                        }
                                    >
                                        Sign up
                                    </Button> */}
                  </div>
                  <Button
                    className="text-primary"
                    onClick={() => history.push("/forgot-password")}
                  >
                    Forgot password?
                  </Button>
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
