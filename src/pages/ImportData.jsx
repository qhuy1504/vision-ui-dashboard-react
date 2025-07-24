import { useState, useRef } from "react";
import {
    Button, Card, Typography, Select, MenuItem,
    Grid, FormControl, InputLabel, Tabs, Tab, Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow, TextField, Checkbox, FormControlLabel
} from "@mui/material";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Paper from "@mui/material/Paper";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

import ChatBox from "../examples/Configurator/ChatBox.js";

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import "../css/UserGroupTable.css";
import "../css/ImportData.css"; // Uncomment if you have specific styles for this page

function ImportData() {
    const [file, setFile] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);

    const rowsPerPage = 20;
    const [currentPage, setCurrentPage] = useState(1);
    const paginatedData = tableData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );
    const totalPages = Math.ceil(tableData.length / rowsPerPage);

    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const [numericColumns, setNumericColumns] = useState([]);
    const [selectedNumericCol, setSelectedNumericCol] = useState("");

    const [tableName, setTableName] = useState("");
    const [overwrite, setOverwrite] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success", // "error" | "info" | "warning"
    });

    const [aiSummary, setAiSummary] = useState("");
    const [chatOpen, setChatOpen] = useState(true);
    const [externalMessage, setExternalMessage] = useState(null);



    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file || !tableName.trim()) {
            return setSnackbar({
                open: true,
                message: "Vui lòng chọn file và nhập tên bảng.",
                severity: "warning",
            });
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("tableName", tableName.trim());
        formData.append("overwrite", overwrite);

        try {
            setLoading(true);

            const res = await fetch("http://localhost:3001/api/import/upload", {
                method: "POST",
                body: formData,
            });

            const result = await res.json();

            // Nếu có lỗi từ server (VD: bảng tồn tại, định dạng file sai,...)
            if (!res.ok) {
                setSnackbar({
                    open: true,
                    message: result.error || "Có lỗi xảy ra.",
                    severity: "error",
                });
                return;
            }

            if (result.data && result.data.length > 0) {
                setColumns(Object.keys(result.data[0]));
                setTableData(result.data);
                setCurrentPage(1);

                // Gửi sang AI để phân tích
                const slicedData = result.data.slice(0, 5); // 10 dòng đầu
                const formattedQA = slicedData;

                try {
                    const resAI = await fetch("http://localhost:3001/api/ai/ask-ollama", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            prompt: `
                            
                            ${JSON.stringify(formattedQA, null, 2)}
                           Tên bảng: "${tableName.trim()}"  
                           Các cột: ${columns.join(", ")}
                           Hãy phản hồi dựa trên dữ liệu trên.

                            `.trim()
                        }),
                    });

                    console.log("formattedQA:", JSON.stringify(formattedQA, null, 2));




                    const aiResult = await resAI.json();
                    console.log("AI Result:", aiResult);
                    if (aiResult.text && aiResult.text.trim() !== "") {
                        setAiSummary(aiResult.text);
                        setExternalMessage(aiResult.text); // <-- Gửi sang ChatBox
                        setChatOpen(true);
                    } else {
                        console.warn("Không nhận được nội dung từ AI.");
                    }

                } catch (e) {
                    console.error("Không thể gửi tới AI:", e);
                }

                const numericCols = Object.keys(result.data[0]).filter((key) =>
                    result.data.every((row) => !isNaN(parseFloat(row[key])) && row[key] !== "")
                );
                setNumericColumns(numericCols);

                if (numericCols.length > 0) {
                    setSelectedNumericCol(numericCols[0]);
                }

                setSnackbar({
                    open: true,
                    message: "Import file thành công.",
                    severity: "success",
                });
                setLoading(false);
            } else {
                setSnackbar({
                    open: true,
                    message: result.message || "Không có dữ liệu để hiển thị.",
                    severity: "error",
                });
            }
        } catch (err) {
            console.error("Lỗi khi upload:", err);
            setSnackbar({
                open: true,
                message: "Lỗi hệ thống khi upload file.",
                severity: "error",
            });
        } finally {
            setLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setFile(null);
        }
    };


    return (
        <DashboardLayout>
            <ChatBox open={chatOpen} onClose={() => setChatOpen(false)} externalMessage={aiSummary} />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <MuiAlert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    elevation={6}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </MuiAlert>
            </Snackbar>
            <Card>
                <VuiBox p={2} width="100%">
                    <VuiTypography variant="h5" fontWeight="bold">Import File (CSV hoặc Excel)</VuiTypography>
                    <VuiBox mt={2} display="flex" flexWrap="wrap" gap={2} alignItems="center" flexDirection="column">
                        {/* Tên bảng */}
                        <div className="upload-container">
                            <Box sx={{ minWidth: 200 }}>
                                <div className="input-group">
                                    <label htmlFor="tableName">Tên bảng</label>
                                    <input
                                        type="text"
                                        id="tableName"
                                        className="custom-input"
                                        value={tableName}
                                        onChange={(e) => setTableName(e.target.value)}
                                        required
                                    />
                                </div>
                            </Box>

                            {/* File */}
                            <Box>
                                <input
                                    type="file"
                                    accept=".csv,.xlsx"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
                                />
                            </Box>

                            {/* Checkbox ghi đè */}
                            <Box>
                                <div className="input-group checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="overwrite"
                                        checked={overwrite}
                                        onChange={(e) => setOverwrite(e.target.checked)}
                                    />
                                    <label htmlFor="overwrite">Ghi đè bảng nếu đã tồn tại</label>
                                </div>
                            </Box>
                        </div>

                        {/* Nút tải */}
                        <Box>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleUpload}
                                disabled={loading}
                                sx={{
                                    color: "white !important",
                                    backgroundColor: loading ? "#0091ff" : "primary.main",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    height: "40px",
                                    "&:disabled": {
                                        backgroundColor: "#ccc",
                                        color: "#fff",
                                        cursor: "not-allowed",
                                    },
                                }}
                            >
                                {loading ? "Đang tải..." : "Tải lên"}
                            </Button>
                        </Box>
                    </VuiBox>


                    {paginatedData.length > 0 && (
                        <VuiBox mt={4}>
                            <table className="table-list">
                                <thead>
                                    <tr>
                                        {/* Cột STT */}
                                        <th><strong>STT</strong></th>
                                        {/* Các cột còn lại */}
                                        {columns.map((col) => (
                                            <th key={col}><strong>{col}</strong></th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((row, i) => (
                                        <tr key={i}>
                                            <td>{(currentPage - 1) * rowsPerPage + i + 1}</td>
                                            {columns.map((col) => (
                                                <td key={col}>{row[col]}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>

                            </table>


                            {totalPages > 1 && (
                                <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", gap: "10px" }}>
                                    <button
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        ← Prev
                                    </button>
                                    <span style={{ color: "black" }}>
                                        Page {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}


                        </VuiBox>
                    )}
                </VuiBox>
                {numericColumns.length > 0 && (
                    <VuiBox mt={4}>
                        <VuiTypography variant="h6" sx={{
                            fontWeight: "bold",
                            color: "black",
                            textAlign: "center",
                            fontSize: "20px",
                            fontFamily: "Noto Sans, sans-serif",
                        }}>Biểu đồ cột cho dữ liệu số</VuiTypography>


                        <FormControl
                            variant="outlined"
                            sx={{
                                minWidth: 200,
                                width: '100%',
                                backgroundColor: '#fff',
                                borderRadius: 2,
                                border: '1px solid #ccc',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                fontSize: 18,
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#444',
                                    borderWidth: 2,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#000',
                                },
                                '& .MuiSelect-icon': {
                                    color: '#444',
                                }
                            }}
                        >
                            <InputLabel id="select-numeric-col-label" sx={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>
                                Chọn cột
                            </InputLabel>

                            <Select
                                labelId="select-numeric-col-label"
                                value={selectedNumericCol}
                                label="Chọn cột"
                                onChange={(e) => setSelectedNumericCol(e.target.value)}
                                IconComponent={ArrowDropDownIcon}
                                sx={{
                                    fontSize: 15,
                                    paddingY: 1,
                                    '& .MuiSelect-select': {
                                        paddingRight: '32px',  // chừa chỗ cho icon
                                    },
                                }}
                            >
                                {numericColumns.map((col) => (
                                    <MenuItem key={col} value={col}>
                                        <Box component="span" sx={{ fontSize: 15 }}>
                                            {col}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>


                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={tableData.slice(0, 20)} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey={columns[0]}
                                    tick={{ fontSize: 10 }}                     // font nhỏ hơn
                                    interval={0}                                // hiển thị hết tất cả nhãn
                                    angle={-30}                                 // xoay nhãn 30 độ để không chồng
                                    textAnchor="end"                            // neo chữ cuối vào trục
                                    height={60}                                 // tăng height để chứa chữ xoay
                                />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey={selectedNumericCol} fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </VuiBox>
                )}

            </Card>
        </DashboardLayout>
    );
}

export default ImportData;
