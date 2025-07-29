import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Tabs,
    Tab,
    Input,
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

const TABS = ["frontend", "backend", "prefect_flows", "mcp_tools"];

const EnvForm = () => {
    const [data, setData] = useState({});
    const [selectedTab, setSelectedTab] = useState(0);
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        section: null,
        fieldKey: null,
    });

    // Snackbar state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success", // "error", "info", "warning"
    });

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        axios
            .get(`${API_URL}/api/env-config`)
            .then((res) => setData(res.data))
            .catch((err) => {
                setSnackbar({
                    open: true,
                    message: "Lỗi khi tải dữ liệu: " + err.message,
                    severity: "error",
                });
            });
    }, [API_URL]);

    const handleChange = (section, key, value) => {
        setData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value,
            },
        }));
    };

    const handleAddField = (section) => {
        // Sinh key mới theo dạng NEW_FIELD, NEW_FIELD_1, NEW_FIELD_2,...
        const currentFields = data[section] ? Object.keys(data[section]) : [];
        let newKey = "NEW_FIELD";
        let count = 1;
        while (currentFields.includes(newKey)) {
            newKey = `NEW_FIELD_${count}`;
            count++;
        }
        setData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [newKey]: "",
            },
        }));
    };

    const handleRemoveField = (section, fieldKey) => {
        setData((prev) => {
            const updatedSection = { ...prev[section] };
            delete updatedSection[fieldKey];
            return {
                ...prev,
                [section]: updatedSection,
            };
        });
    };

    const handleSubmit = () => {
        axios
            .post(`${API_URL}/api/env-config`, data)
            .then(() =>
                setSnackbar({
                    open: true,
                    message: "Đã lưu cấu hình thành công.",
                    severity: "success",
                })
            )
            .catch((err) =>
                setSnackbar({
                    open: true,
                    message: "Lỗi khi lưu: " + err.message,
                    severity: "error",
                })
            );
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const currentTabKey = TABS[selectedTab];

    return (
        <DashboardLayout>
            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, section: null, fieldKey: null })}
            >
                <DialogTitle>Xác nhận xoá trường</DialogTitle>
                <DialogContent>
                    Bạn có chắc muốn xoá trường <strong>{confirmDialog.fieldKey}</strong> không?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ open: false, section: null, fieldKey: null })}
                        variant="contained"
                        sx={{
                            backgroundColor: "red",
                            color: "white !important",
                            fontSize: "14px",
                            "&:hover": { backgroundColor: "darkred" },
                        }}
                    >
                        Huỷ
                    </Button>
                    <Button
                        onClick={() => {
                            handleRemoveField(confirmDialog.section, confirmDialog.fieldKey);
                            setConfirmDialog({ open: false, section: null, fieldKey: null });
                        }}
                        color="error"
                        variant="contained"
                
                        sx={{
                            backgroundColor: "#43a047",
                            color: "white !important",
                            fontSize: "14px",
                            "&:hover": { backgroundColor: "darkgreen" },
                        }}
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
                                color: "black !important",
                                textTransform: "none",
                                border: "3px solid #1e88e5",
                                borderRadius: "8px",
                                marginRight: "8px",
                                fontWeight: "bold",
                            },
                        }}
                    >
                        {TABS.map((tab) => (
                            <Tab key={tab} label={tab} />
                        ))}
                    </Tabs>

                    <Box mt={4}>
                        {data[currentTabKey] ? (
                            Object.entries(data[currentTabKey]).map(([key, value]) => (
                                <Stack direction="row" alignItems="center" spacing={2} key={key} mb={2}>
                                    <Box flex={1}>
                                        <Typography fontWeight="bold" mb={1}>
                                            {key}
                                        </Typography>
                                        <Input
                                            value={value}
                                            fullWidth
                                            onChange={(e) => handleChange(currentTabKey, key, e.target.value)}
                                          
                                            sx={{
                                                backgroundColor: "#fff",
                                                fontSize: "16px !important",
                                                borderRadius: 2,
                                                width: '100% !important', // ← override lại width
                                                "& .MuiOutlinedInput-root": {
                                                    paddingRight: "48px",
                                                },
                                                "& .MuiOutlinedInput-inputMultiline": {
                                                    padding: "10px 12px",
                                                    width: '100% !important',
                                                    overflow: "auto !important", // ← override class nội bộ css-12ox7py

                                                },
                                                "& .MuiInputBase-input": {
                                                    width: '100% !important', // ← override class nội bộ css-12ox7py
                                                }
                                            }}
                                        />
                                    </Box>
                                    <IconButton
                                        aria-label="delete"
                                        onClick={() =>
                                            setConfirmDialog({
                                                open: true,
                                                section: currentTabKey,
                                                fieldKey: key,
                                            })
                                        }
                                        color="error"
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
                            sx={{ color: "white !important", fontSize: "16px", backgroundColor: "#12b300ff", mt: 2 }}
                        >
                            THÊM TRƯỜNG
                        </Button>

                        <Box mt={6} textAlign="right">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                sx={{ color: "white !important", fontSize: "16px" }}
                            >
                                LƯU CẤU HÌNH
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
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </DashboardLayout>
    );
};

export default EnvForm;
