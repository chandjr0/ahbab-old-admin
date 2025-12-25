import AdminLogin from "./login/AdminLogin";
import NotFound from "./NotFound";
import ForgotPassword from "./ForgotPassword";
import FirebaseRegister from "./register/FirebaseRegister";

const sessionRoutes = [
  {
    path: "/signup",
    component: FirebaseRegister,
  },
  {
    path: "/signin",
    component: AdminLogin,
  },
  {
    path: "/forgot-password",
    component: ForgotPassword,
  },
  {
    path: "/404",
    component: NotFound,
  },
];

export default sessionRoutes;
