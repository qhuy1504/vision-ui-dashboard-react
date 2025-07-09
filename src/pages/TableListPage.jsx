// TableListPage.jsx
import React, { useEffect, useState } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import VuiBox from "components/VuiBox";
import Card from "@mui/material/Card";
import VuiTypography from "components/VuiTypography";
import axios from "axios";
import { Tabs, Tab, Box } from "@mui/material";
import "../css/TableListPage.css";

const rowsPerPage = 20;

const TableListPage = () => {
    // Dữ liệu
    const [tableList, setTableList] = useState([]);
    const [tableSize, setTableSize] = useState([]);
    const [etlLogs, setEtlLogs] = useState([]);
    // Trang hiện tại cho mỗi bảng
    const [etlPage, setEtlPage] = useState(1);
    const [sizePage, setSizePage] = useState(1);
    const [listPage, setListPage] = useState(1);
    // Lọc
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTableName, setSelectedTableName] = useState("");
    // Tab hiện tại: 0 = ETL Log, 1 = Table Size, 2 = Table List
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [res1, res2, res3] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL}/api/jobs/table-list`),
                axios.get(`${process.env.REACT_APP_API_URL}/api/jobs/table-size`),
                axios.get(`${process.env.REACT_APP_API_URL}/api/jobs/table-etl-log`),
            ]);
            setTableList(res1.data || []);
            setTableSize(res2.data || []);
            setEtlLogs(res3.data || []);
        } catch (error) {
            console.error("Error fetching table data:", error);
        }
    };

    const paginate = (data, page) => {
        const start = (page - 1) * rowsPerPage;
        return data.slice(start, start + rowsPerPage);
    };

    // Lọc và phân trang ETL Log
    const filteredLogs = etlLogs.filter(item => {
        const byTable = selectedTableName ? item.table_name === selectedTableName : true;
        const byDate = selectedDate ? item.data_date === selectedDate : true;
        return byTable && byDate;
    });
    const paginatedLogs = paginate(filteredLogs, etlPage);

    // Phân trang Table Size
    const filteredSize = selectedTableName
        ? tableSize.filter(item => item.table_name === selectedTableName)
        : tableSize;
    const paginatedSize = paginate(filteredSize, sizePage);

    // Phân trang Table List
    const paginatedList = paginate(tableList, listPage);
    const hasSizeResult = selectedTableName && filteredSize.length > 0;
    const hasLogResult = selectedTableName && filteredLogs.length > 0;

    const renderPagination = (page, setPage, total) => {
  

        const totalPages = Math.ceil(total / rowsPerPage);
        if (totalPages <= 1) return null;

        return (
            <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", gap: "10px" }}>
                <button className="pagination-btn" onClick={() => setPage(page - 1)} disabled={page === 1}>
                    &#8592; Prev
                </button>
                <span style={{ color: "black" }}>
                    Page {page} / {totalPages}
                </span>
                <button className="pagination-btn" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                    Next &#8594;
                </button>
            </div>
        );
    };

    return (
        <DashboardLayout>
            <VuiBox py={3}>
                <Card sx={{ mb: 3, backgroundColor: "none", color: "white" }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, v) => setActiveTab(v)}
                        textColor="inherit"
                        indicatorColor="secondary"

                        variant="fullWidth"
                        sx={{ backgroundColor: "black !important" }}
                    >
                        <Tab className="tab" label="Table List" sx={{ color: "white !important", fontSize: "1.2rem", fontWeight: "bold" }} />
                        <Tab className="tab" label={`Table Size${hasSizeResult ? " ✔" : ""}`} sx={{ color: "white !important", fontSize: "1.2rem", fontWeight: "bold", color: hasSizeResult ? "#00e676 !important" : "white" }} />
                        <Tab className="tab" label={`ETL Log${hasLogResult ? " ✔" : ""}`} sx={{ color: "white !important", fontSize: "1.2rem", fontWeight: "bold", color: hasLogResult ? "#00e676 !important" : "white" }} />

                    </Tabs>
                </Card>

                {/* Tab panels */}
                {activeTab === 0 && (
                    <Card sx={{ mb: 4, p: 3, backgroundColor: "none", color: "white" }}>
                        {(selectedTableName || selectedDate) && (
                            <button
                                onClick={() => {
                                    setSelectedTableName("");
                                    setSelectedDate("");
                                    fetchData();
                                    setEtlPage(1);
                                    setSizePage(1);
                                }}
                                style={{
                                    marginBottom: "10px",
                                    backgroundColor: "#ff5252",
                                    color: "white",
                                    border: "none",
                                    padding: "10px 5px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    transition: "background-color 0.3s",
                                }}
                            >
                                BỎ LỌC {selectedTableName && `TABLE: ${selectedTableName}`}{" "}
                                {selectedDate && `| DATE: ${selectedDate}`}
                            </button>
                        )}
                        <table className="table-list">

                            <thead>
                                <tr>
                                    <th>STT</th><th>TABLE_NAME</th><th>SCD_TYPE</th><th>DATE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedList.map((item, i) => (
                                    <tr key={i} onClick={() => setSelectedTableName(item.table_name)}>
                                        <td>{(listPage - 1) * rowsPerPage + i + 1}</td>
                                        <td>{item.table_name}</td>
                                        <td
                                            className={`scd-cell ${item.scd_type.toLowerCase()}`}
                                        >
                                            <span className={`scd-badge ${item.scd_type.toLowerCase()}`}>
                                                {item.scd_type}
                                            </span>
                                        </td>

                                        <td>{item.data_date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {renderPagination(listPage, setListPage, tableList.length)}
                    </Card>
                )}


                {activeTab === 1 && (
                    <Card sx={{ mb: 4, p: 3, backgroundColor: "none", color: "white" }}>
                        <table className="table-list">
                            <thead>
                                <tr>
                                    <th>STT</th><th>TABLE_NAME</th><th>RECORDS</th><th>SIZE_MB</th><th>DATE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedSize.map((item, i) => (
                                    <tr key={i}>
                                        <td>{(sizePage - 1) * rowsPerPage + i + 1}</td>
                                        <td>{item.table_name}</td>
                                        <td>{item.records}</td>
                                        <td>{item.size_mb}</td>
                                        <td>{item.data_date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {renderPagination(sizePage, setSizePage, filteredSize.length)}
                    </Card>
                )}
                {activeTab === 2 && (
                    <Card sx={{ mb: 4, p: 3, backgroundColor: "none", color: "white" }}>
                        {/* Select ngày */}
                        <Box sx={{ mb: 2 }}>
                            <label style={{ color: "black", marginRight: 8 }}>Chọn ngày:</label>
                            <select
                                value={selectedDate}
                                onChange={e => { setSelectedDate(e.target.value); setEtlPage(1); }}
                                style={{ padding: 4, borderRadius: 4 }}
                            >
                                <option value="">All</option>
                                {[...new Set(etlLogs.map(i => i.data_date))].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </Box>
                        <table className="table-list">
                            <thead>
                                <tr>
                                    <th>STT</th><th>TABLE_NAME</th><th>DATE</th><th>CNT_ROW</th><th>UPDATE_TIME</th><th>PROCESS_SECOND</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLogs.map((item, i) => (
                                    <tr key={i} >
                                        <td>{(etlPage - 1) * rowsPerPage + i + 1}</td>
                                        <td>{item.table_name}</td>
                                        <td>{item.data_date}</td>
                                        <td>{item.cnt_row}</td>
                                        <td>{item.update_time}</td>
                                        <td>{item.process_second}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {renderPagination(etlPage, setEtlPage, filteredLogs.length)}
                    </Card>
                )}


            </VuiBox>
        </DashboardLayout>
    );
};

export default TableListPage;
