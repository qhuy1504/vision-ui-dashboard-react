import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";

// @mui material components
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";

// Icons
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiInput from "components/VuiInput";
import VuiButton from "components/VuiButton";
import VuiSwitch from "components/VuiSwitch";
import GradientBorder from "examples/GradientBorder";

// Vision UI Dashboard assets
import radialGradient from "assets/theme/functions/radialGradient";
import rgba from "assets/theme/functions/rgba";
import palette from "assets/theme/base/colors";
import borders from "assets/theme/base/borders";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgSignIn from "assets/images/signUpImage.png";




function SignUp() {
  const [rememberMe, setRememberMe] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    email: "", // Added email field
    avatar: null, // Optional avatar field
  });

  const history = useHistory();
  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // "error" | "info" | "warning"
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };
  
  const handleSignUp = async () => {
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("username", formData.username);
      payload.append("password", formData.password);
      payload.append("email", formData.email);
      if (formData.avatar) {
        payload.append("avatar", formData.avatar);
      }

      const res = await fetch("http://localhost:3001/api/admin/users", {
        method: "POST",
        body: payload,
      });

      const data = await res.json();

      if (!res.ok) {
        showSnackbar(`Đăng ký thất bại: ${data.error || "Unknown error"}`, "error");
        return;
      }

      showSnackbar("Đăng ký thành công!", "success");
      setTimeout(() => {
        history.push("/authentication/sign-in");
      }, 1500);
    } catch (error) {
      console.error("Đăng ký lỗi:", error);
      showSnackbar("Đăng ký thất bại! Không thể kết nối server.", "error");
    }
  };
  
  

  return (
    <CoverLayout
      color="black"
      description=""
      image={bgSignIn}
      premotto="PREFECT"
      motto="PREFECT VISION UI DASHBOARD"
      cardContent
    >
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>

      <GradientBorder borderRadius={borders.borderRadius.form} minWidth="100%" maxWidth="100%">
        <VuiBox
          component="form"
          role="form"
          borderRadius="inherit"
          p="45px"
          sx={({ palette: { secondary } }) => ({
            backgroundColor: "#f0f0f0",
          })}
        >
          <VuiTypography
            color="black"
            fontWeight="bold"
            textAlign="center"
            mb="24px"
            sx={({ typography: { size } }) => ({ fontSize: size.lg })}
          >
            Register with
          </VuiTypography>


          {/* Name */}
          <VuiBox mb={2}>
            <VuiBox mb={1} ml={0.5}>
              <VuiTypography component="label" variant="button" color="black" fontWeight="medium">
                Name
              </VuiTypography>
            </VuiBox>
            <GradientBorder
              minWidth="100%"
              borderRadius={borders.borderRadius.lg}
              padding="1px"
              backgroundImage={radialGradient(
                palette.gradients.borderLight.main,
                palette.gradients.borderLight.state,
                palette.gradients.borderLight.angle
              )}
            >
              <VuiInput
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name..."
                sx={({ typography: { size } }) => ({ fontSize: size.sm, color: rgba(palette.white.main, 0.8), backgroundColor: rgba(palette.black.main, 0.1) })} // Adjusted color for better visibility
              />
            </GradientBorder>
          </VuiBox>

          {/* Username */}
          <VuiBox mb={2}>
            <VuiBox mb={1} ml={0.5}>
              <VuiTypography component="label" variant="button" color="black" fontWeight="medium">
                Username
              </VuiTypography>
            </VuiBox>
            <GradientBorder
              minWidth="100%"
              borderRadius={borders.borderRadius.lg}
              padding="1px"
              backgroundImage={radialGradient(
                palette.gradients.borderLight.main,
                palette.gradients.borderLight.state,
                palette.gradients.borderLight.angle
              )}
            >
              <VuiInput
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your username..."
                sx={({ typography: { size } }) => ({ fontSize: size.sm, color: rgba(palette.white.main, 0.8), backgroundColor: rgba(palette.black.main, 0.1) })}
              />
            </GradientBorder>
          </VuiBox>

          {/* Email */}
          <VuiBox mb={2}>
            <VuiBox mb={1} ml={0.5}>
              <VuiTypography component="label" variant="button" color="black" fontWeight="medium">
                Email
              </VuiTypography>
            </VuiBox>
            <GradientBorder
              minWidth="100%"
              borderRadius={borders.borderRadius.lg}
              padding="1px"
              backgroundImage={radialGradient(
                palette.gradients.borderLight.main,
                palette.gradients.borderLight.state,
                palette.gradients.borderLight.angle
              )}
            >
              <VuiInput
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email address..."
                sx={({ typography: { size } }) => ({
                  fontSize: size.sm,
                  color: rgba(palette.white.main, 0.8),
                  backgroundColor: rgba(palette.black.main, 0.1),
                })}
              />
            </GradientBorder>
          </VuiBox>


          {/* Password */}
          <VuiBox mb={2}>
            <VuiBox mb={1} ml={0.5}>
              <VuiTypography component="label" variant="button" color="black" fontWeight="medium">
                Password
              </VuiTypography>
            </VuiBox>
            <GradientBorder
              minWidth="100%"
              borderRadius={borders.borderRadius.lg}
              padding="1px"
              backgroundImage={radialGradient(
                palette.gradients.borderLight.main,
                palette.gradients.borderLight.state,
                palette.gradients.borderLight.angle
              )}
            >
              <VuiInput
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password..."
                sx={({ typography: { size } }) => ({ fontSize: size.sm, color: rgba(palette.white.main, 0.8), backgroundColor: rgba(palette.black.main, 0.1) })}
              />
            </GradientBorder>
          </VuiBox>
          
          {/* Avatar (optional) */}

          <VuiBox mb={2}>
            <VuiBox mb={1} ml={0.5}>
              <VuiTypography component="label" variant="button" color="black" fontWeight="medium">
                Avatar
              </VuiTypography>
            </VuiBox>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData((prev) => ({ ...prev, avatar: e.target.files[0] }))}
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "5px",
                padding: "8px",
                width: "100%",
              }}
            />
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
          </VuiBox>

          <VuiBox mt={4} mb={1}>
            <VuiButton color="info" fullWidth onClick={handleSignUp}>
              SIGN UP
            </VuiButton>
          </VuiBox>

          <VuiBox mt={3} textAlign="center">
            <VuiTypography variant="button" color="text" fontWeight="regular">
              Already have an account?{" "}
              <VuiTypography
                component={Link}
                to="/authentication/sign-in"
                variant="button"
                color="black"
                fontWeight="medium"
              >
                Sign in
              </VuiTypography>
            </VuiTypography>
          </VuiBox>
        </VuiBox>
      </GradientBorder>
    </CoverLayout>
  );
}

export default SignUp;
