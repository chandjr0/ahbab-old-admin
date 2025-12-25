import React from "react";
import { Redirect } from "react-router-dom";

import MyRoutes from "./Pages/myRoutes";

const redirectRoute = [
  {
    path: "/",
    exact: true,
    component: () => <Redirect to="/dashboard" />,
  },
];

const errorRoute = [
  {
    component: () => <Redirect to="/404" />,
  },
];

const routes = [...MyRoutes, ...redirectRoute, ...errorRoute];

export default routes;
