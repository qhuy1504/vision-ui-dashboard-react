import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import "../css/JobDetail.css";

const JobDetailPage = () => {
    const { jobId } = useParams();
    const [variables, setVariables] = useState({});
    const [jobInfo, setJobInfo] = useState({});
    const [flowRuns, setFlowRuns] = useState([]);
    const [taskRunsByFlowRun, setTaskRunsByFlowRun] = useState({});
    const [logsByFlowRun, setLogsByFlowRun] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedFlowRunId, setExpandedFlowRunId] = useState(null);
    const [error, setError] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const pageSize = 12;
    const totalPages = Math.ceil(flowRuns.length / pageSize);
    const paginatedFlowRuns = flowRuns.slice((page - 1) * pageSize, page * pageSize);

    const toggleFlowRun = (id) => {
        setExpandedFlowRunId((prev) => (prev === id ? null : id));
    };

    const fetchAll = async () => {
        try {
            setLoading(true);

            const infoRes = await fetch(
                `${process.env.REACT_APP_API_URL}/api/jobs/${jobId}/info`,
                {
                    method: "GET",
                    headers: {
                        "X-API-KEY": process.env.REACT_APP_ADMIN_API_KEY,
                      
                    },
                }
            );

            const info = await infoRes.json();
            console.log("Job Info fetched:", info);
            setJobInfo(info);

            const varRes = await fetch(
                `${process.env.REACT_APP_API_URL}/api/jobs/${jobId}/variables`,
                {
                    method: "GET",
                    headers: {
                        "X-API-KEY": process.env.REACT_APP_ADMIN_API_KEY,
                    },
                }
            );

            const vars = await varRes.json();
            setVariables(vars);

            const flowsRes = await fetch(
                `${process.env.REACT_APP_API_URL}/api/jobs/${info.deployment_id}/flow-runs`,
                {
                    method: "GET",
                    headers: {
                        "X-API-KEY": process.env.REACT_APP_ADMIN_API_KEY,
                    },
                }
            );

            const flows = await flowsRes.json();
            setFlowRuns(flows);

            const taskRes = await fetch(
                `${process.env.REACT_APP_API_URL}/api/jobs/${info.deployment_id}/task-runs`,
                {
                    method: "GET",
                    headers: {
                        "X-API-KEY": process.env.REACT_APP_ADMIN_API_KEY,
                    },
                }
            );

            const tasks = await taskRes.json();
            // console.log("Tasks fetched:", tasks);
            const taskMap = {};
            tasks.forEach((task) => {
                if (!taskMap[task.flow_run_id]) taskMap[task.flow_run_id] = [];
                taskMap[task.flow_run_id].push(task);
            });
            setTaskRunsByFlowRun(taskMap);

            const logRes = await fetch(`${process.env.REACT_APP_API_URL}/api/jobs/logs`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-API-KEY": process.env.REACT_APP_ADMIN_API_KEY },
                body: JSON.stringify({ flow_run_ids: flows.map((f) => f.id) }),
            });
            const logData = await logRes.json();
            console.log("Logs fetched:", logData);
            setLogsByFlowRun(logData);
        } catch (err) {
            setError(err.message || "Đã xảy ra lỗi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [jobId]);

    const handleSyncLogs = async () => {
        try {
            setIsSyncing(true);
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/jobs/${jobId}/logs/sync`, {
                method: "POST",
                headers: {
                    "X-API-KEY": process.env.REACT_APP_ADMIN_API_KEY,
                },
            });
            const data = await res.json();
            alert(data.message || "Đồng bộ xong");
            await fetchAll();
        } catch (err) {
            alert("Lỗi khi đồng bộ logs");
        } finally {
            setIsSyncing(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <VuiTypography color="black">Đang tải dữ liệu...</VuiTypography>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <VuiTypography color="error">Lỗi: {error}</VuiTypography>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <VuiBox className="job-detail-container">
                <VuiButton color="success" size="small" onClick={handleSyncLogs} disabled={isSyncing}>
                    {isSyncing ? "Đang đồng bộ..." : "Đồng bộ Logs"}
                </VuiButton>

                <VuiTypography variant="h4" fontWeight="bold" color="black" mb={3}>
                    Chi tiết Job #{jobId}
                </VuiTypography>

                {/* Variables */}
                <Card variant="outlined" sx={{ backgroundColor: "#1e1e2f", color: "#fff", borderRadius: "12px" }} mb={3}>
                    <CardContent>
                        <VuiTypography variant="h5" fontWeight="bold" color="white">
                            Prefect Variables
                        </VuiTypography>
                        <Grid container spacing={1}>
                            {Object.entries(variables).map(([key, val]) => (
                                <React.Fragment key={key}>
                                    <Grid item xs={12} sm={4} md={3}>
                                        <Typography variant="subtitle2" color="white" fontWeight="bold">
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
                                                WebkitLineClamp: 5,
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

                {/* Flow Runs with pagination */}
                {paginatedFlowRuns.map((run) => {
                    console.log("Flow Run:", run);
                    const isOpen = expandedFlowRunId === run.id;
                    const taskList = taskRunsByFlowRun[run.id] || [];
                    const logList = logsByFlowRun[run.id] || [];
                   
                    console.log("logList:", logList);

                    return (
                        <VuiBox key={run.id} mt={4}>
                            <VuiBox className={`flow-run-card ${run.state_type?.toLowerCase()}`} mb={2}>
                                <VuiBox className="flow-run-header">
                                    <VuiTypography variant="button" className="flow-run-name">
                                        {jobInfo.flow_name} ›{" "}
                                        <VuiTypography variant="button" color="success" sx={{ fontSize: "1.25rem" }}>
                                            {run.name}
                                        </VuiTypography>
                                    </VuiTypography>

                                    <VuiBox className="flow-run-tags">
                                        <span className={`tag ${run.state_type?.toLowerCase()}`}>{run.state_type}</span>
                                        <span className="tag">{new Date(run.start_time).toLocaleString()}</span>
                                        <span className="tag">{taskList.length} Task runs</span>
                                    </VuiBox>
                                </VuiBox>

                                <VuiBox className="flow-run-meta" color="white">
                                    <p>
                                        <strong>Deployment:</strong> {jobInfo.deployment_name}
                                    </p>
                                    <p>
                                        <strong>Work Pool:</strong> {jobInfo.work_pool_name}
                                    </p>
                                </VuiBox>
                            </VuiBox>

                            <VuiButton color="success" size="large" onClick={() => toggleFlowRun(run.id)}>
                                {isOpen ? "Ẩn" : "Hiển thị"} chi tiết
                            </VuiButton>

                            {isOpen && (
                                <>
                                    {/* Task Table */}
                                    <VuiBox mt={2}>
                                        <VuiTypography variant="h6" color="black">
                                            Task Runs
                                        </VuiTypography>
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
                                                        const isScheduled = (task.state_type || "").toUpperCase() === "SCHEDULED";
                                                        return {
                                                            ...task,
                                                            state: task.state_type || "SCHEDULED",
                                                            isScheduled,
                                                            startTimeObj: task.start_time ? new Date(task.start_time) : new Date(0),
                                                        };
                                                    })
                                                    .sort((a, b) => b.startTimeObj - a.startTimeObj)
                                                    .map((task) => (
                                                        <tr key={task.id}>
                                                            <td>{task.isScheduled ? "-" : task.name}</td>
                                                            <td>
                                                                <span className={`task-status ${task.state.toLowerCase()}`}>{task.state}</span>
                                                            </td>
                                                            <td>{task.start_time ? new Date(task.start_time).toLocaleString() : "-"}</td>
                                                            <td>{task.end_time ? new Date(task.end_time).toLocaleString() : "-"}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </VuiBox>

                                    {/* Logs */}
                                    <VuiBox mt={3}>
                                        <VuiTypography variant="h6" color="black" mb={1}>
                                            Logs
                                        </VuiTypography>
                                        <div className="log-terminal">
                                            {logList.length > 0 ? (
                                                logList.map((log, idx) => (
                                                    <div key={idx} className={`log-line ${log.level.toLowerCase()}`}>
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

                {/* Pagination controls */}
                <VuiBox className="pagination"  display="flex" justifyContent="center" alignItems="center" mt={5} gap={2}>
                    <VuiButton
                        variant="contained"
                        color="primary"
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                    >
                        &laquo;
                    </VuiButton>
                    {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        return (
                            <VuiButton
                                key={pageNum}
                                variant={page === pageNum ? "contained" : "outlined"}
                                color="error"
                                onClick={() => setPage(pageNum)}
                            >
                                {pageNum}
                            </VuiButton>
                        );
                    })}
                    <VuiButton
                        variant="contained"
                        color="primary"
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                    >
                        &raquo;
                    </VuiButton>
                </VuiBox>
            </VuiBox>
        </DashboardLayout>
    );
};

export default JobDetailPage;
