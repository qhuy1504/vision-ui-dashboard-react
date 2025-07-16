import { useState } from "react";
import { useHistory } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiInput from "components/VuiInput";
import VuiButton from "components/VuiButton";
import CoverLayout from "layouts/authentication/components/CoverLayout";
import bgSignIn from "assets/images/signInImage.png";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
    const history = useHistory();

    const handleSendOtp = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const result = await res.json();

            if (!res.ok) {
                return setSnackbar({ open: true, message: result.error, severity: "error" });
            }

            setSnackbar({ open: true, message: "OTP đã gửi tới email", severity: "success" });
            setTimeout(() => {
                history.push("/authentication/verify-otp", { email }); // Truyền email sang trang xác thực OTP
            }, 1500);
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: "Lỗi hệ thống", severity: "error" });
        }
    };

    return (
        <CoverLayout
            title="Quên mật khẩu?"
            color="white"
            description="Nhập email để nhận mã OTP"
            image={bgSignIn}
        >
            <VuiBox component="form" onSubmit={(e) => e.preventDefault()} width="400px" p={3} sx={{ backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
                <VuiTypography variant="button" color="black" fontWeight="medium" mb={1}>
                    Email
                </VuiTypography>
                <VuiInput
                    placeholder="Nhập email đã đăng ký"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                />

                <VuiBox mt={3}>
                    <VuiButton color="info"
                        sx={{ fontSize: "16px", fontWeight: "bold" }}
                        fullWidth onClick={handleSendOtp}>
                        Gửi mã OTP
                    </VuiButton>
                </VuiBox>
            </VuiBox>

            <Snackbar open={snackbar.open} autoHideDuration={3000}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
                <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </CoverLayout>
    );
}

export default ForgotPassword;
