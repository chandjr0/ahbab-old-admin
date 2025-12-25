import React, { useState, useEffect } from "react";
import { 
  Grid, 
  Card, 
  CardContent, 
  Switch, 
  FormControlLabel, 
  TextField, 
  Typography, 
  Box,
  Divider,
  Button,
  CircularProgress,
  Snackbar
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Breadcrumb } from "../../components/index";
import axios from "../../../axios";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  card: {
    marginBottom: theme.spacing(3),
  },
  toggleSection: {
    padding: theme.spacing(2),
    backgroundColor: "#f5f5f5",
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
  paymentTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: theme.spacing(2),
    color: "#333",
  },
  fieldContainer: {
    marginBottom: theme.spacing(2),
  },
  toggleButton: {
    "& .MuiSwitch-colorSecondary.Mui-checked": {
      color: "#4caf50",
    },
    "& .MuiSwitch-colorSecondary.Mui-checked + .MuiSwitch-track": {
      backgroundColor: "#4caf50",
    },
  },
  formField: {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#fff",
    },
  },
  saveButton: {
    marginTop: theme.spacing(3),
    backgroundColor: "#4caf50",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#45a049",
    },
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "200px",
  },
}));

const OnlinePayment = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPaymentEnabled, setIsPaymentEnabled] = useState(false);
  const [paymentData, setPaymentData] = useState({
    bkashUsername: "",
    bkashPassword: "",
    bkashAppKey: "",
    bkashAppSecret: "",
  });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch existing payment data on component mount
  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/online-payment/bkash-view");
      
      const data = response?.data?.data;
      setIsPaymentEnabled(data.isBkashActive || false);
      setPaymentData({
        bkashUsername: data.bkashUsername || "",
        bkashPassword: data.bkashPassword || "",
        bkashAppKey: data.bkashAppKey || "",
        bkashAppSecret: data.bkashAppSecret || "",
      });
    } catch (error) {
      console.error("Error fetching payment data:", error);
      showNotification("Error fetching payment data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const requestData = {
        isBkashActive: isPaymentEnabled,
        bkashUsername: paymentData.bkashUsername,
        bkashPassword: paymentData.bkashPassword,
        bkashAppKey: paymentData.bkashAppKey,
        bkashAppSecret: paymentData.bkashAppSecret,
      };

      const response = await axios.post(
        "online-payment/bkash-create",
        requestData
      );

      showNotification("Payment settings saved successfully!", "success");
    } catch (error) {
      console.error("Error saving payment data:", error);
      const errorMessage = error.response?.data?.message || "Error saving payment settings";
      showNotification(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  const handleToggle = (event) => {
    setIsPaymentEnabled(event.target.checked);
  };

  const handleInputChange = (field) => (event) => {
    setPaymentData({
      ...paymentData,
      [field]: event.target.value,
    });
  };

  if (loading) {
    return (
      <div className={classes.root}>
        <div className="mb-sm-30">
          <Breadcrumb routeSegments={[{ name: "Online Payment" }]} />
        </div>
        <div className={classes.loadingContainer}>
          <CircularProgress />
        </div>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className="mb-sm-30">
        <Breadcrumb routeSegments={[{ name: "Online Payment" }]} />
      </div>

      <Card className={classes.card}>
        <CardContent>
          <Box className={classes.toggleSection}>
            <Typography className={classes.paymentTitle}>
              Bkash Online Payment
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={isPaymentEnabled}
                  onChange={handleToggle}
                  color="secondary"
                  className={classes.toggleButton}
                />
              }
              label={
                <Typography variant="h6" style={{ fontWeight: "500" }}>
                  {isPaymentEnabled ? "Enabled" : "Disabled"}
                </Typography>
              }
            />
          </Box>

          {isPaymentEnabled && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box className={classes.fieldContainer}>
                  <Typography variant="subtitle1" gutterBottom>
                    User Name:
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={paymentData.bkashUsername}
                    onChange={handleInputChange("bkashUsername")}
                    className={classes.formField}
                    placeholder="Enter user name"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box className={classes.fieldContainer}>
                  <Typography variant="subtitle1" gutterBottom>
                    Password:
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="text"
                    value={paymentData.bkashPassword}
                    onChange={handleInputChange("bkashPassword")}
                    className={classes.formField}
                    placeholder="Enter password"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box className={classes.fieldContainer}>
                  <Typography variant="subtitle1" gutterBottom>
                    App Key:
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={paymentData.bkashAppKey}
                    onChange={handleInputChange("bkashAppKey")}
                    className={classes.formField}
                    placeholder="Enter app key"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box className={classes.fieldContainer}>
                  <Typography variant="subtitle1" gutterBottom>
                    App Secret:
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={paymentData.bkashAppSecret}
                    onChange={handleInputChange("bkashAppSecret")}
                    className={classes.formField}
                    placeholder="Enter app secret"
                  />
                </Box>
              </Grid>
            </Grid>
          )}

          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              className={classes.saveButton}
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        message={notification.message}
      />
    </div>
  );
};

export default OnlinePayment; 