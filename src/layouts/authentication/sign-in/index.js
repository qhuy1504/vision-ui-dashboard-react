import { useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { FiEye, FiEyeOff } from "react-icons/fi";

// Vision UI components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiInput from "components/VuiInput";
import VuiButton from "components/VuiButton";
import VuiSwitch from "components/VuiSwitch";
import GradientBorder from "examples/GradientBorder";

// Theme
import radialGradient from "assets/theme/functions/radialGradient";
import palette from "assets/theme/base/colors";
import borders from "assets/theme/base/borders";

// Layout
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Image
import bgSignIn from "assets/images/signInImage.png";
import { RiFontFamily } from "react-icons/ri";
function SignIn() {
  const [rememberMe, setRememberMe] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // "error" | "info" | "warning"
  });

  const history = useHistory();
  const { pathname } = useLocation();

  const handleSetRememberMe = () => setRememberMe(!rememberMe);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSignIn = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        setSnackbar({
          open: true,
          message: err.error || "Đăng nhập thất bại!",
          severity: "error",
        });
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("menus", JSON.stringify(data.menus));
      console.log("Token:", data.token);
      console.log("Menus:", data.menus);

      setSnackbar({
        open: true,
        message: "Đăng nhập thành công!",
        severity: "success",
      });

      setTimeout(() => {
        history.push("/dashboard"); // Điều hướng sau 1s
      }, 1000);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Lỗi hệ thống khi đăng nhập!",
        severity: "error",
      });
    }
  };

  return (
    <CoverLayout
      title="Hello!"
      color="white"
      description="Enter username and password to sign in"
      premotto="PREFECT BY THE FUTURE:"
      motto="PREFECT UI DASHBOARD"
      image={bgSignIn}
    >
      <VuiBox
        component="form"
        role="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSignIn();
        }}
        style={{
          border: "2px solid #ccc",
          padding: "20px",
          borderRadius: "8px",
          backgroundColor: "#f0f0f0",
          width: "400px",
        }}
      >
        <VuiBox mb={2}>
          <VuiTypography component="label" variant="button" color="black" fontWeight="medium">
            Username
          </VuiTypography>
          <GradientBorder
            minWidth="100%"
            padding="1px"
            borderRadius={borders.borderRadius.lg}
            backgroundImage={radialGradient(
              palette.gradients.borderLight.main,
              palette.gradients.borderLight.state,
              palette.gradients.borderLight.angle
            )}
          >
            <VuiInput
              key={pathname}
              name="username"
              type="text"
              placeholder="Your username..."
              value={formData.username}
              onChange={handleChange}
              sx={{
                color: "#000",
                "&::placeholder": {
                  color: "#000",
                  opacity: 1,
                },
              }}
            />
          </GradientBorder>
        </VuiBox>

        <VuiBox mb={2} position="relative">
          <VuiTypography component="label" variant="button" color="black" fontWeight="medium">
            Password
          </VuiTypography>
          <GradientBorder
            minWidth="100%"
            padding="1px"
            borderRadius={borders.borderRadius.lg}
            backgroundImage={radialGradient(
              palette.gradients.borderLight.main,
              palette.gradients.borderLight.state,
              palette.gradients.borderLight.angle
            )}
          >
            <VuiInput
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password..."
              value={formData.password}
              onChange={handleChange}
              sx={{
                color: "#000",
                "&::placeholder": {
                  color: "#000",
                  opacity: 1,
                },
                paddingRight: "40px", // chừa chỗ cho icon
              }}
            />
          </GradientBorder>

          {/* Icon eye */}
          <VuiBox
            position="absolute"
            top="75%"
            right="10px"
            sx={{ transform: "translateY(-50%)", cursor: "pointer", color: "#666" }}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </VuiBox>
        </VuiBox>


        <VuiBox display="flex" alignItems="center">
          <VuiSwitch color="info" checked={rememberMe} onChange={handleSetRememberMe} />
          <VuiTypography
            variant="caption"
            color="black"
            fontWeight="medium"
            onClick={handleSetRememberMe}
            sx={{ cursor: "pointer", userSelect: "none" }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;Remember me
          </VuiTypography>


          <VuiBox mt={1} textAlign="center" marginLeft="auto" sx={{
            cursor: "pointer",
            fontFamily: '"Roboto", sans-serif',
           }}>
            <VuiTypography
              component={Link}
              to="/authentication/forgot-password"
              variant="caption"
              color="info"
              fontWeight="medium"
              sx={{
                textDecoration: "underline", cursor: "pointer"
                , fontSize: "14px", fontWeight: "bold"
               }}
          
            >
              Quên mật khẩu?
            </VuiTypography>
          </VuiBox>

        </VuiBox>

        <VuiBox mt={4} mb={1}>
          <VuiButton color="info" fullWidth type="submit">
            SIGN IN
          </VuiButton>
        </VuiBox>

        <VuiBox mt={3} textAlign="center">
          <VuiTypography variant="button" color="text" fontWeight="regular">
            Don&apos;t have an account?{" "}
            <VuiTypography
              component={Link}
              to="/authentication/sign-up"
              variant="button"
              color="black"
              fontWeight="medium"
            >
              Sign up
            </VuiTypography>
          </VuiTypography>
        </VuiBox>
      </VuiBox>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </CoverLayout>
  );
}

export default SignIn;
