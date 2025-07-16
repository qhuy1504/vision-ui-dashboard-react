import { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import VuiBox from "components/VuiBox";
import VuiInput from "components/VuiInput";
import VuiButton from "components/VuiButton";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

function ResetPassword() {
    const history = useHistory();
    const location = useLocation();
    const email = location.state?.email || "";

    const [newPassword, setNewPassword] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

    const handleReset = async () => {
        try {
            const res = await fetch("http://localhost:3001/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword }),
            });

            const result = await res.json();

            if (!res.ok) {
                setSnackbar({ open: true, message: result.error, severity: "error" });
                return;
            }

            setSnackbar({ open: true, message: "Đổi mật khẩu thành công", severity: "success" });
            setTimeout(() => {
                history.push("/authentication/sign-in");
            }, 1500);
        } catch (err) {
            setSnackbar({ open: true, message: "Lỗi hệ thống", severity: "error" });
        }
    };

    return (
        <VuiBox sx={{ maxWidth: 400, margin: "auto", mt: 5 }}>
            <h3>Đặt lại mật khẩu</h3>
            <p>Email đang xử lý: <strong>{email}</strong></p>
            <VuiInput
                placeholder="Mật khẩu mới"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            <VuiBox mt={2}>
                <VuiButton color="info"
                    sx={{ fontSize: "16px", fontWeight: "bold" }}
                    fullWidth onClick={handleReset}>Xác nhận đổi mật khẩu</VuiButton>
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

export default ResetPassword;
