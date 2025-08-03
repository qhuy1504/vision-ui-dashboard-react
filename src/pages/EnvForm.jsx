import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Tabs,
    Tab,
    Button,
    Snackbar,
    Alert,
    Card,
    Typography,
    IconButton,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import "../css/EnvForm.css";


const EnvForm = () => {
    const [data, setData] = useState({});
    const [selectedTab, setSelectedTab] = useState(0);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, section: null, fieldId: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        axios
            .get(`${API_URL}/api/env-config`, {
                headers: {
                    'X-API-KEY': process.env.REACT_APP_ADMIN_API_KEY
                }
            })
            .then((res) => {
                setData(res.data || {});
            })
            .catch((err) =>
                setSnackbar({ open: true, message: "Lỗi khi tải dữ liệu: " + err.message, severity: "error" })
            );
    }, [API_URL]);

    console.log("Data loaded:", data);

    // Cập nhật currentTabKey:
    const tabKeys = Object.keys(data);
    const currentTabKey = tabKeys[selectedTab] || "";

    const handleChangeKey = (section, id, newKey) => {
        setData((prev) => {
            const updated = prev[section].map((item) =>
                item.id === id ? { ...item, key: newKey } : item
            );
            return { ...prev, [section]: updated };
        });
    };

    const handleChangeValue = (section, id, newValue) => {
        setData((prev) => {
            const updated = prev[section].map((item) =>
                item.id === id ? { ...item, value: newValue } : item
            );
            return { ...prev, [section]: updated };
        });
    };

    const handleAddField = (section) => {
        setData((prev) => {
            // Lấy tất cả các id từ mọi section
            const allIds = Object.values(prev)
                .flat()
                .map((item) => parseInt(item.id, 10));
            const maxId = allIds.length ? Math.max(...allIds) : 0;
            const newId = (maxId + 1).toString();

            return {
                ...prev,
                [section]: [...prev[section], { id: newId, key: "NEW_FIELD", value: "" }],
            };
        });
    };


    const handleRemoveField = (section, id) => {
        setData((prev) => ({
            ...prev,
            [section]: prev[section].filter((item) => item.id !== id),
        }));
    };

    const handleSubmit = () => {
        const currentSection = {};
        currentSection[currentTabKey] = [];

        data[currentTabKey].forEach(({id, key, value }) => {
            if (key) currentSection[currentTabKey].push({ id, key, value });
        });

        axios
            .post(
                `${API_URL}/api/env-config`,
                currentSection,
                {
                    headers: {
                        "X-API-KEY": process.env.REACT_APP_ADMIN_API_KEY
                    }
                }
        ).then(() =>
            setSnackbar({
                open: true,
                message: "Đã lưu cấu hình thành công.",
                severity: "success",
            })
        )
            .catch((err) => {
                const errMsg =
                    err.response?.data?.message || // thông báo chi tiết từ server
                    err.message ||                 // fallback chung
                    "Lỗi không xác định.";

                setSnackbar({
                    open: true,
                    message: "Lỗi khi lưu: " + errMsg,
                    severity: "error",
                });
            });
    };


    const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));



    return (
        <DashboardLayout>
            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, section: null, fieldId: null })}
            >
                <DialogTitle>Xác nhận xoá trường</DialogTitle>
                <DialogContent> Bạn có chắc muốn xoá trường này không? </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setConfirmDialog({ open: false, section: null, fieldId: null })}
                        variant="contained"
                        sx={{ backgroundColor: "red", color: "white !important", fontSize: "14px" }}
                    >
                        Huỷ
                    </Button>
                    <Button
                        onClick={() => {
                            handleRemoveField(confirmDialog.section, confirmDialog.fieldId);
                            setConfirmDialog({ open: false, section: null, fieldId: null });
                        }}
                        variant="contained"
                        sx={{ backgroundColor: "#43a047", color: "white !important", fontSize: "14px" }}
                    >
                        Xoá
                    </Button>
                </DialogActions>
            </Dialog>

            <Box p={4}>
                <Card sx={{ p: 3 }}>
                    <Tabs
                        value={selectedTab}
                        onChange={(e, newValue) => setSelectedTab(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            ".MuiTab-root": {
                                fontSize: "16px",
                                textTransform: "none",
                                fontWeight: "bold",
                                border: "2px solid #1976d2",
                                borderRadius: "6px",
                                marginRight: "8px",
                                color: "black !important",
                            },
                        }}
                    >
                        {tabKeys.map((tab) => (
                            <Tab
                                sx={{
                                    color: "#1976d2",
                                    "&.Mui-selected": {
                                        color: "white !important",
                                        backgroundColor: "#1976d2",
                                    },
                                }}
                                key={tab}
                                label={tab}
                            />
                        ))}
                    </Tabs>

                    <Box mt={4}>
                        {data[currentTabKey]?.length ? (
                            data[currentTabKey].map(({ id, key, value }) => (
                                console.log("Rendering field:", id, key, value),
                                <Stack key={id} direction="row" spacing={2} alignItems="center" mb={2}>
                                    <div className="form-group">
                                        <label className="form-label">Key</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={key}
                                            onChange={(e) => handleChangeKey(currentTabKey, id, e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Value</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={value}
                                            onChange={(e) => handleChangeValue(currentTabKey, id, e.target.value)}
                                        />
                                    </div>
                                    <IconButton
                                        aria-label="delete"
                                        color="error"
                                        onClick={() =>
                                            setConfirmDialog({ open: true, section: currentTabKey, fieldId: id })
                                        }
                                        sx={{ marginTop: "35px !important", color: "red" }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Stack>
                            ))
                        ) : (
                            <Typography>Không có trường nào.</Typography>
                        )}

                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleAddField(currentTabKey)}
                            sx={{ color: "white !important", fontSize: "16px", mt: 2, backgroundColor: "#43a047" }}
                        >
                            Thêm trường
                        </Button>

                        <Box mt={6} textAlign="right">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                sx={{ color: "white !important", fontSize: "16px" }}
                            >
                                Lưu cấu hình
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert severity={snackbar.severity} onClose={handleCloseSnackbar} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </DashboardLayout>
    );
};

export default EnvForm;