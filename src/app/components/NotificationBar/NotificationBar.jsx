import React, { Fragment } from "react";
import { useState, useEffect } from "react";
import axios from "../../../axios";

import { Icon, Badge, Card, Button, IconButton, Drawer } from "@material-ui/core";
import { Link } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core/styles";
import { getTimeDifference } from "../../../utils";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import useSettings from "../../hooks/useSettings";
import useNotification from "../../hooks/useNotification"; 
import { notification, openNotificationWithIcon } from "antd";
import { useHistory } from "react-router-dom";
import moment from "moment";

const useStyles = makeStyles(({ palette, ...theme }) => ({
  notification: {
    width: "var(--sidenav-width)",
    "& .notification__topbar": {
      height: "var(--topbar-height)",
    },
  },
  notificationCard: {
    "&:hover": {
      "& .delete-button": {
        cursor: "pointer",
        display: "unset",
        right: 0,
        marginTop: 6,
        top: 0,
        zIndex: 2,
      },
      "& .card__topbar__time": {
        display: "none",
      },
    },
    "& .delete-button": {
      display: "none",
      position: "absolute",
      right: 0,
      marginTop: 9,
    },
    "& .card__topbar__button": {
      borderRadius: 15,
      opacity: 0.9,
    },
  },
}));

const NotificationBar = ({ container }) => {
  const [panelOpen, setPanelOpen] = React.useState(false);

  const classes = useStyles();
  const { settings } = useSettings();
  const { deleteNotification, clearNotifications, notifications } = useNotification();

  const handleDrawerToggle = () => {
    setPanelOpen(!panelOpen);
  };

  const [allNotifications, setallNotifications] = useState([]);
  const [isAlive, setisAlive] = useState(false);
  const history = useHistory();

  const openNotificationWithIcon = (message, type) => {
    notification[type]({
      message,
    });
  };

  // my code
  useEffect(() => {
    axios
      .get(`notification-admin/view`)
      .then(({ data }) => {
        setallNotifications(data?.data);
      })
      .catch((err) => {});
  }, [isAlive]);

  const markAsRead = (val) => {
    axios
      .get(`notification-admin/update/${val}`)
      .then(({ data }) => {
        openNotificationWithIcon(data?.message, "success");
        setPanelOpen(false);
        setisAlive(!isAlive);
      })
      .catch((err) => {
        openNotificationWithIcon(err?.response?.data?.message, "error");
        setisAlive(!isAlive);
      });
  };

  const gotoOrderList = (val) => {
    if (val != 3) {
      history.push({
        pathname: "/pages/order-list",
      });
    } else if (val == 3) {
      history.push({
        pathname: "/pages/pending/re-seller",
      });
    }

    setPanelOpen(false);
  };

  return (
    <Fragment>
      <IconButton onClick={handleDrawerToggle}>
        <Badge color="secondary" badgeContent={allNotifications?.length}>
          <Icon>notifications</Icon>
        </Badge>
      </IconButton>

      <ThemeProvider theme={settings.themes[settings.activeTheme]}>
        <Drawer
          width={"100px"}
          container={container}
          variant="temporary"
          anchor={"right"}
          open={panelOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
        >
          <div className={classes.notification}>
            <div className="notification__topbar elevation-z6 flex items-center p-4 mb-4">
              <Icon color="primary">notifications</Icon>
              <h5 className="ml-2 my-0 font-medium">Notifications</h5>
            </div>

            {allNotifications?.map((notification, index) => (
              <div key={notification.id} className={clsx("relative", classes.notificationCard)}>
                <Card
                  className="mx-4 mb-6"
                  elevation={3}
                  onClick={() => gotoOrderList(notification?.textType)}
                >
                  <div className="card__topbar flex items-center justify-between p-2 bg-light-gray">
                    <div>
                      <h6>{notification?.text}</h6>
                      <div>
                        {/* <p>Order No:#123</p> */}
                        <p>Date : {notification?.date.slice(0, 10)}</p>
                      </div>
                      <div>
                        <Button
                          onClick={() => markAsRead(notification?._id)}
                          style={{ backgroundColor: "blue", color: "#fff" }}
                        >
                          Mark as Read
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
            {/* {!!notifications?.length && (
                            <div className="text-center">
                                <Button onClick={clearNotifications}>
                                    Clear Notifications
                                </Button>
                            </div>
                        )} */}
          </div>
        </Drawer>
      </ThemeProvider>
    </Fragment>
  );
};

export default NotificationBar;
