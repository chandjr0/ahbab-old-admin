import React, { Fragment, useEffect, useState } from "react";
import Scrollbar from "react-perfect-scrollbar";
import { navigations } from "../../navigations";
import { MatxVerticalNav } from "../index";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import useSettings from "../../hooks/useSettings";
import useAuth from "../../hooks/useAuth";

import jwtDecode from "jwt-decode";

const useStyles = makeStyles(({ palette, ...theme }) => ({
  scrollable: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  sidenavMobileOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: "100vw",
    background: "rgba(0, 0, 0, 0.54)",
    zIndex: -1,
    [theme.breakpoints.up("lg")]: {
      display: "none",
    },
  },
}));

const Sidenav = ({ children }) => {
  const classes = useStyles();
  const { settings, updateSettings } = useSettings();
  const { user } = useAuth();




  const updateSidebarMode = (sidebarSettings) => {
    let activeLayoutSettingsName = settings.activeLayout + "Settings";
    let activeLayoutSettings = settings[activeLayoutSettingsName];

    updateSettings({
      ...settings,
      [activeLayoutSettingsName]: {
        ...activeLayoutSettings,
        leftSidebar: {
          ...activeLayoutSettings.leftSidebar,
          ...sidebarSettings,
        },
      },
    });
  };
  const token = localStorage.getItem("accessToken");
  const decode = jwtDecode(token);

  const [menuItems, setMenuItems] = useState(
    JSON.parse(localStorage.getItem("menuList"))
  );
  const [userRole, setUserRole] = useState(decode.data?.role);
  const [result, setResult] = useState([]);

  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      let updatedNavigation = [];
      navigations.forEach((navData) => {
        let accessData = menuItems.find((menu) => menu?.name === navData?.name);

        if (accessData) {
          let navObj = { ...navData };
          let updateChildren = [];
          if (navObj.children) {
            navObj.children.forEach((child) => {
              if (accessData?.subMenuList?.includes(child?.name)) {
                updateChildren.push(child);
              }
            });
            navObj.children = updateChildren;
          }
          updatedNavigation.push(navObj);
        }
      });

      setResult(updatedNavigation);
    } else {
      if (userRole == "admin") {
        setResult(navigations);
      } else {
        setResult([]);
      }
    }
  }, [menuItems]);

  return (
    <Fragment>
      <Scrollbar
        options={{ suppressScrollX: true }}
        className={clsx("relative", classes.scrollable)}
      >
        {children}
        <MatxVerticalNav items={result} />
      </Scrollbar>

      <div
        onClick={() => updateSidebarMode({ mode: "close" })}
        className={classes.sidenavMobileOverlay}
      />
    </Fragment>
  );
};

export default Sidenav;
