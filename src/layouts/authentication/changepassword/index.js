import React, { useState } from "react";
import {
    TextField,
    Button,
    Typography,
    Box,
    Snackbar,
    Alert,
    LinearProgress,
} from "@mui/material";
import zxcvbn from "zxcvbn";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

const passwordLabels = ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"];
const strengthColors = ["#ff0000", "#ff5722", "#ff9800", "#03a9f4", "#4caf50"];

export default function ChangePassword() {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCloseSnackbar = () =>
        setSnackbar((prev) => ({ ...prev, open: false }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { currentPassword, newPassword, confirmPassword } = formData;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return setSnackbar({
                open: true,
                message: "Vui lòng điền đầy đủ thông tin",
                severity: "warning",
            });
        }

        if (newPassword !== confirmPassword) {
            return setSnackbar({
                open: true,
                message: "Mật khẩu mới và xác nhận không khớp",
                severity: "error",
            });
        }

        try {
            const token = localStorage.getItem("token");
            console.log("Token:", token);
            const res = await fetch("http://localhost:3001/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
            });

            const result = await res.json();

            if (!res.ok) {
                return setSnackbar({
                    open: true,
                    message: result.error || "Đổi mật khẩu thất bại",
                    severity: "error",
                });
            }

            setSnackbar({
                open: true,
                message: "Đổi mật khẩu thành công",
                severity: "success",
            });

            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            setSnackbar({
                open: true,
                message: "Lỗi hệ thống",
                severity: "error",
            });
        }
    };

    const strength = zxcvbn(formData.newPassword);

    return (
        <DashboardLayout>
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ maxWidth: 400, mx: "auto", mt: 5 }}
            >
                <Typography variant="h5" mb={2} sx={{
                    textAlign: "center",
                    fontWeight: "bold",
                    color: "#333",
                    fontSize: "1.5rem",
                    fontFamily: "Noto sans, sans-serif",
             }}>
                Đổi mật khẩu
            </Typography>

                <div className="form-group">
                    <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                    <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        className="form-control"
                        value={formData.currentPassword}
                        placeholder="Nhập mật khẩu hiện tại"
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="newPassword">Mật khẩu mới</label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        className="form-control"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        placeholder="Nhập mật khẩu mới"
                    />
                </div>

            {formData.newPassword && (
                <>
                    <LinearProgress
                        
                        variant="determinate"
                        value={((strength.score + 1) / 5) * 100}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            my: 1,
                            "& .MuiLinearProgress-bar": {
                                backgroundColor: strengthColors[strength.score],
                            },
                        }}
                    />
                    <Typography
                        variant="caption"
                        sx={{ color: strengthColors[strength.score], fontWeight: "bold" }}
                    >
                        Độ mạnh: {passwordLabels[strength.score]}
                    </Typography>
                </>
            )}

                <div className="form-group">
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="form-control"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Nhập lại mật khẩu mới"
                    />
                </div>

            <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 2, fontWeight: "bold", fontSize: "1rem", color: "white !important" }}
            >
                Lưu thay đổi
            </Button>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
            </Box>
        </DashboardLayout>
    );
}
