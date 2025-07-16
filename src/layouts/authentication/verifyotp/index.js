import { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import VuiBox from "components/VuiBox";
import VuiInput from "components/VuiInput";
import VuiButton from "components/VuiButton";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

function VerifyOtp() {
    const history = useHistory();
    const location = useLocation();
    const email = location.state?.email || "";

    const [otp, setOtp] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

    const handleVerify = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const result = await res.json();

            if (!res.ok) {
                setSnackbar({ open: true, message: result.error, severity: "error" });
                return;
            }

            setSnackbar({ open: true, message: "Xác thực OTP thành công", severity: "success" });

            setTimeout(() => {
                history.push("/authentication/reset-password", { email });
            }, 1500);
        } catch (err) {
            setSnackbar({ open: true, message: "Lỗi hệ thống", severity: "error" });
        }
    };

    return (
        <VuiBox sx={{ maxWidth: 400, margin: "auto", mt: 5 }}>
            <h3>Xác thực mã OTP</h3>
            <p>Vui lòng nhập mã OTP đã gửi tới: <strong>{email}</strong></p>
            <VuiInput
                placeholder="Nhập OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
            />
            <VuiBox mt={2}>
                <VuiButton color="info"
                    sx={{ fontSize: "16px", fontWeight: "bold" }}
                    fullWidth onClick={handleVerify}>Xác nhận</VuiButton>
            </VuiBox>

            <Snackbar open={snackbar.open}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <MuiAlert severity={snackbar.severity} sx={{ width: "100%" }}>
                    {snackbar.message}
                </MuiAlert>
            </Snackbar>
        </VuiBox>
    );
}

export default VerifyOtp;
