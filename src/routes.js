// Vision UI Dashboard React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import ForgotPassword from "layouts/authentication/forgot";
import VerifyOtp from "layouts/authentication/verifyotp";
import ResetPassword from "layouts/authentication/resetpassword";
import ChangePassword from "layouts/authentication/changepassword";
import JobFormPage from "pages/JobFormPage";
import JobListPage from "pages/JobListPage"; // Uncomment if you have a JobListPage
import JobDetailPage from "pages/JobDetailPage"; // Uncomment if you have a JobDetailPage
import TableListPage from "pages/TableListPage"; // Uncomment if you have a TableListPage
import AdminAssignPage from "pages/AdminAssignPage"; // Uncomment if you have an AdminAssignPage
import ImportData from "pages/ImportData"; // Import the new ImportData page

// Vision UI Dashboard React icons
import { IoAccessibility, IoAdd, IoAddSharp, IoAnalytics, IoListCircleOutline, IoRocketSharp, IoFileTrayFullSharp } from "react-icons/io5";
import { IoIosDocument } from "react-icons/io";
import { BsFillPersonFill } from "react-icons/bs";
import { IoBuild } from "react-icons/io5";
import { BsCreditCardFill } from "react-icons/bs";
import { IoStatsChart } from "react-icons/io5";
import { IoHome } from "react-icons/io5";
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "DASHBOARD",
    key: "dashboard",
    route: "/dashboard",
    icon: <IoHome size="15px" color="inherit" />,
    component: Dashboard,
    noCollapse: true,
  },
  
  {
    type: "collapse",
    name: "THÊM JOB",
    key: "add-job",
    icon: <IoRocketSharp size="15px" color="inherit" />,
    route: "/jobs/new",
    component: JobFormPage,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "DANH SÁCH JOB",
    key: "list-job",
    icon: <IoAnalytics size="15px" color="inherit" />,
    route: "/jobs",
    component: JobListPage,
    noCollapse: true,
  },
  {
    route: "/jobs/:jobId",
    component: JobDetailPage,
    noCollapse: true,
    hidden: true,
  },
  {
    type: "collapse",
    name: "DANH SÁCH BẢNG",
    key: "list-table",
    icon: <IoAnalytics size="15px" color="inherit" />,
    route: "/tablelist",
    component: TableListPage,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "TABLES",
    key: "tables",
    route: "/tables",
    icon: <IoStatsChart size="15px" color="inherit" />,
    component: Tables,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "BILLING",
    key: "billing",
    route: "/billing",
    icon: <BsCreditCardFill size="15px" color="inherit" />,
    component: Billing,
    noCollapse: true,
  },
  // {
  //   type: "collapse",
  //   name: "RTL",
  //   key: "rtl",
  //   route: "/rtl",
  //   icon: <IoBuild size="15px" color="inherit" />,
  //   component: RTL,
  //   noCollapse: true,
  // },
  { type: "title", title: "Account Pages", key: "account-pages" },
  {
    type: "collapse",
    name: "PROFILE",
    key: "profile",
    route: "/profile",
    icon: <BsFillPersonFill size="15px" color="inherit" />,
    component: Profile,
    noCollapse: true,
  },
  {
   
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    icon: <IoIosDocument size="15px" color="inherit" />,
    component: SignIn,
    noCollapse: true,
  },
  {
   
    name: "Sign Up",
    key: "sign-up",
    route: "/authentication/sign-up",
    icon: <IoRocketSharp size="15px" color="inherit" />,
    component: SignUp,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "PHÂN QUYỀN",
    key: "assign-groups",
    route: "/assign-groups",
    icon: <IoRocketSharp size="15px" color="inherit" />,
    component: AdminAssignPage,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "IMPORT DATA",
    key: "import-data",
    icon: <IoFileTrayFullSharp size="15px" color="inherit" />,
    route: "/import",
    component: ImportData,
    noCollapse: true,
  },
  {
   
    name: "QUÊN MẬT KHẨU",
    key: "forgot-password",
    icon: <IoFileTrayFullSharp size="15px" color="inherit" />,
    route: "/authentication/forgot-password",
    component: ForgotPassword,
    noCollapse: true,
  },
  {

    name: "NHẬP OTP",
    key: "verify-otp",
    icon: <IoFileTrayFullSharp size="15px" color="inherit" />,
    route: "/authentication/verify-otp",
    component: VerifyOtp,
    noCollapse: true,
  },
  {
    name: "ĐẶT LẠI MẬT KHẨU",
    key: "reset-password",
    icon: <IoFileTrayFullSharp size="15px" color="inherit" />,
    route: "/authentication/reset-password",
    component: ResetPassword,
    noCollapse: true,
  },
  {
    name: "ĐỔI MẬT KHẨU",
    key: "change-password",
    icon: <IoFileTrayFullSharp size="15px" color="inherit" />,
    route: "/authentication/change-password",
    component: ChangePassword,
    noCollapse: true,
  },



];

export default routes;
