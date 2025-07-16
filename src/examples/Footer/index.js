// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import { FaGithub, FaLinkedin, FaGlobe } from "react-icons/fa";

function Footer() {
  return (
    <VuiBox
      component="footer"
      py={3}
      px={2}
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{
        background: "#1E1E2F",
        color: "#ffffff",
        borderTop: "1px solid #444",
        marginTop: "auto",
      }}
    >
      {/* Brand / Description */}
      <VuiTypography
        variant="button"
        fontWeight="bold"
        
        mb={1}
        color="white"
        sx={{ textAlign: "center", letterSpacing: "0.5px", fontSize: "20px" }}
      >
        Workflow Orchestration Dashboard
      </VuiTypography>
      <VuiTypography
        variant="caption"
        color="white"
        mb={2}
        sx={{ opacity: 0.7, textAlign: "center" }}
      >
        Empowering teams to orchestrate, monitor and automate your workflows efficiently.
      </VuiTypography>

      {/* Links */}
      <VuiBox display="flex" justifyContent="center" flexWrap="wrap" gap="24px" mb={2}>
        <VuiTypography
          component="a"
          href="/about"
          variant="body2"
          color="white"
          sx={{ opacity: 0.8, "&:hover": { opacity: 1, textDecoration: "underline" } }}
        >
          About Us
        </VuiTypography>
        <VuiTypography
          component="a"
          href="/docs"
          variant="body2"
          color="white"
          sx={{ opacity: 0.8, "&:hover": { opacity: 1, textDecoration: "underline" } }}
        >
          Documentation
        </VuiTypography>
        <VuiTypography
          component="a"
          href="/support"
          variant="body2"
          color="white"
          sx={{ opacity: 0.8, "&:hover": { opacity: 1, textDecoration: "underline" } }}
        >
          Support
        </VuiTypography>
        <VuiTypography
          component="a"
          href="/privacy"
          variant="body2"
          color="white"
          sx={{ opacity: 0.8, "&:hover": { opacity: 1, textDecoration: "underline" } }}
        >
          Privacy Policy
        </VuiTypography>
      </VuiBox>

      {/* Social icons */}
      <VuiBox display="flex" justifyContent="center" gap="18px" mb={2}>
        <VuiTypography
          component="a"
          href="https://github.com/qhuy1504"
          target="_blank"
          rel="noopener"
          color="white"
          sx={{ fontSize: "18px", opacity: 0.8, "&:hover": { opacity: 1 } }}
        >
          <FaGithub />
        </VuiTypography>
        <VuiTypography
          component="a"
          href="https://github.com/qhuy1504"
          target="_blank"
          rel="noopener"
          color="white"
          sx={{ fontSize: "18px", opacity: 0.8, "&:hover": { opacity: 1 } }}
        >
          <FaLinkedin />
        </VuiTypography>
        <VuiTypography
          component="a"
          href="https://github.com/qhuy1504"
          target="_blank"
          rel="noopener"
          color="white"
          sx={{ fontSize: "18px", opacity: 0.8, "&:hover": { opacity: 1 } }}
        >
          <FaGlobe />
        </VuiTypography>
      </VuiBox>

      {/* Copyright */}
      <VuiTypography variant="caption" color="white" sx={{ opacity: 0.5 }}>
        © {new Date().getFullYear()} OrchestrateFlow. All rights reserved.
      </VuiTypography>
    </VuiBox>
  );
}

export default Footer;
