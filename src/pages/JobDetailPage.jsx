import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import "../css/JobDetail.css"; // Assuming you have a CSS file for styling

const JobDetailPage = () => {
    const { jobId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedFlowRunId, setExpandedFlowRunId] = useState(null);
    const itemsPerPage = 25;
    const [currentPage, setCurrentPage] = useState(1);
    const [isSyncing, setIsSyncing] = useState(false);


    useEffect(() => {
        const fetchJobDetail = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/jobs/${jobId}/tasks/detail?page=${currentPage}&limit=${itemsPerPage}`
                );
                if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message || "Lỗi khi lấy dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetail();
    }, [jobId, currentPage]);

    if (loading)
        return (
            <DashboardLayout>
                <VuiTypography variant="h4" color="white">Loading...</VuiTypography>
            </DashboardLayout>
        );

    if (error)
        return (
            <DashboardLayout>
                <VuiTypography color="error">Lỗi: {error}</VuiTypography>
            </DashboardLayout>
        );
    const handleSyncLogs = async () => {
        try {
            setIsSyncing(true);
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/jobs/${jobId}/logs/sync`, {
                method: 'POST'
            });
           
            const data = await res.json();
            console.log('ĐÃ ẤN ĐỒNG BỘ', data);
            alert(data.message || 'Đồng bộ xong');
            
        } catch (err) {
            alert('Lỗi khi đồng bộ logs');
        }finally {
            setIsSyncing(false);
        }
    };

    const {
        allFlowRuns,
        taskRunsByFlowRun,
        workPool,
        variables,
        deploymentName,
        flowName,
        logsByFlowRun,
        totalCount,
    } = data;

    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const toggleFlowRun = (id) => {
        setExpandedFlowRunId((prev) => (prev === id ? null : id));
    };

    return (
        <DashboardLayout>
            <VuiBox className="job-detail-container">
                <VuiButton
                    color="success"
                    size="small"
                    onClick={handleSyncLogs}
                    disabled={isSyncing}
                >
                    {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ Logs'}
                    {isSyncing && (
                        <div style={{ marginTop: 10 }}>
                            <progress style={{ width: '100%' }} />
                        </div>
                    )}
                </VuiButton>

                <VuiTypography variant="h4" fontWeight="bold" color="white">
                    Chi tiết Job #{jobId}
                </VuiTypography>

                <VuiBox mt={4}>
                    <Card variant="outlined" sx={{ backgroundColor: "#1e1e2f", color: "#fff", borderRadius: "12px" }}>
                        <CardContent>
                            <VuiTypography variant="h5" fontWeight="bold" color="white">
                                Prefect Variables
                            </VuiTypography>

                            <Grid container spacing={1}>
                                {Object.entries(variables).map(([key, val]) => (
                                    <React.Fragment key={key}>
                                        <Grid item xs={12} sm={4} md={3}>
                                            <Typography variant="subtitle2" color="primary" fontWeight="bold">
                                                {key}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={8} md={9}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    whiteSpace: "pre-wrap",
                                                    wordBreak: "break-word",
                                                    color: "#ccc",
                                                    backgroundColor: "#2a2a3b",
                                                    p: 1,
                                                    borderRadius: "8px",
                                                    fontFamily: "monospace",
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 5,      //Số dòng tối đa
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {typeof val === "string" ? val : JSON.stringify(val, null, 2)}
                                            </Typography>
                                        </Grid>
                                    </React.Fragment>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </VuiBox>

                {allFlowRuns.map((run) => {
                    const isOpen = expandedFlowRunId === run.id;
                    const taskList = taskRunsByFlowRun?.[run.id] || [];
                    const logList = logsByFlowRun?.[run.id] || [];

                    return (
                        <VuiBox key={run.id} mt={4}>
                            <VuiBox
                                className={`flow-run-card ${run.state_type?.toLowerCase()}`}
                                mb={2}
                            >
                                <VuiBox className="flow-run-header">
                                    <VuiTypography variant="button" className="flow-run-name">
                                        {flowName} › <VuiTypography variant="button" color="success" sx={{ fontSize: "1.25rem" }}>{run.name}</VuiTypography>
                                    </VuiTypography>

                                    <VuiBox className="flow-run-tags">
                                        <span className={`tag ${run.state_type?.toLowerCase()}`}>{run.state_type}</span>
                                        <span className="tag">{new Date(run.start_time).toLocaleString()}</span>
                                        <span className="tag">{taskRunsByFlowRun[run.id]?.length || 0} Task runs</span>
                                    </VuiBox>
                                </VuiBox>

                                <VuiBox className="flow-run-meta" color="white">
                                    <p><strong>Deployment:</strong> {deploymentName}</p>
                                    <p><strong>Work Pool:</strong> {workPool.name}</p>
                                </VuiBox>
                            </VuiBox>


                            <VuiButton color="success" size="small" onClick={() => toggleFlowRun(run.id)} mt={1}>
                                {isOpen ? "Ẩn" : "Hiển thị"} chi tiết
                            </VuiButton>

                            {isOpen && (
                                <>
                                    <VuiBox mt={2}>
                                        <VuiTypography variant="h6" color="white">Task Runs</VuiTypography>
                                        <table className="task-table">
                                            <thead>
                                                <tr>
                                                    <th>Tên Task</th>
                                                    <th>Trạng thái</th>
                                                    <th>Bắt đầu</th>
                                                    <th>Kết thúc</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {taskList
                                                    .map((task) => {
                                                        const isScheduled =
                                                            (task.state || "").toUpperCase() === "SCHEDULED";
                                                        return {
                                                            ...task,
                                                            state: task.state || "SCHEDULED",
                                                            isScheduled,
                                                            startTimeObj: task.start_time
                                                                ? new Date(task.start_time)
                                                                : new Date(0),
                                                        };
                                                    })
                                                    .sort((a, b) => b.startTimeObj - a.startTimeObj)
                                                    .map((task) => (
                                                        <tr key={task.id}>
                                                            <td>{task.isScheduled ? "-" : task.name}</td>
                                                            <td>
                                                                <span className={`task-status ${task.state.toLowerCase()}`}>
                                                                    {task.state}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                {task.isScheduled
                                                                    ? "-"
                                                                    : task.start_time
                                                                        ? new Date(task.start_time).toLocaleString()
                                                                        : "-"}
                                                            </td>
                                                            <td>
                                                                {task.isScheduled
                                                                    ? "-"
                                                                    : task.end_time
                                                                        ? new Date(task.end_time).toLocaleString()
                                                                        : "-"}
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </VuiBox>

                                    <VuiBox mt={3}>
                                        <VuiTypography variant="h6" color="white" mb={1}>Logs</VuiTypography>

                                        <div className="log-terminal">
                                            {logList.length > 0 ? (
                                                logList.map((log, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`log-line ${log.level.toLowerCase()}`}
                                                    >
                                                        <span className="log-time">[{new Date(log.ts).toLocaleTimeString()}]</span>{" "}
                                                        <span className="log-level">[{log.level.toUpperCase()}]</span>{" "}
                                                        <span className="log-logger">{log.logger}</span> — {log.msg}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="log-line empty">Không có log</div>
                                            )}
                                        </div>
                                    </VuiBox>

                                </>
                            )}
                        </VuiBox>
                    );
                })}

                {/* Pagination */}
                <VuiBox mt={4} className="pagination">
                    <VuiButton
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        color="error"
                    >
                        &laquo;
                    </VuiButton>

                    {(() => {
                        const pages = [];
                        const maxPagesToShow = 10;
                        const buffer = 2; // số trang trước/sau currentPage để giữ cân bằng
                        let start = Math.max(1, currentPage - buffer);
                        let end = start + maxPagesToShow - 1;

                        // Nếu vượt quá totalPages, điều chỉnh lại
                        if (end > totalPages) {
                            end = totalPages;
                            start = Math.max(1, end - maxPagesToShow + 1);
                        }

                        for (let page = start; page <= end; page++) {
                            pages.push(
                                <VuiButton
                                    key={page}
                                    variant={page === currentPage ? "contained" : "outlined"}
                                    onClick={() => setCurrentPage(page)}
                                    size="small"
                                    style={{ margin: '0 4px' }}
                                    color={page === currentPage ? "primary" : "default"}
                                >
                                    {page}
                                </VuiButton>
                            );
                        }

                        return pages;
                    })()}

                    <VuiButton
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        color="error"
                    >
                        &raquo;
                    </VuiButton>
                </VuiBox>

            </VuiBox>
        </DashboardLayout>
    );
};

export default JobDetailPage;
