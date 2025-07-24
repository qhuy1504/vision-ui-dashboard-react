import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TableHead,
    Paper,
    Chip
} from "@mui/material";
import { format } from "date-fns";
import VuiTypography from "components/VuiTypography";
import VuiBox from "components/VuiBox";
import "./TaskRunListTable.css"; // Import your custom CSS for styling
const getColorByState = (state) => {
    switch (state) {
        case "COMPLETED":
            return "success";
        case "FAILED":
            return "error";
        case "RUNNING":
            return "info";
        case "SCHEDULED":
            return "warning";
        default:
            return "default";
    }
};

const formatDateTime = (isoString) => {
    if (!isoString) return "—";
    try {
        return format(new Date(isoString), "dd-MM-yyyy HH:mm:ss");
    } catch {
        return "Invalid";
    }
};

const TaskRunListTable = ({ jobId }) => {
    const [taskRuns, setTaskRuns] = useState([]);
    const [page, setPage] = useState(0);
    const rowsPerPage = 25;
    const paginatedTasks = taskRuns
        .map((task) => {
            const isScheduled = (task.state || "").toUpperCase() === "SCHEDULED";
            return {
                ...task,
                state: task.state || "SCHEDULED",
                isScheduled,
                startTimeObj: task.start_time ? new Date(task.start_time) : new Date(0),
            };
        })
        .sort((a, b) => b.startTimeObj - a.startTimeObj)
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


    useEffect(() => {
        async function fetchData() {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/jobs/${jobId}/tasks/detail`);

            // Flatten tất cả các task từ các flow_run_id
            const allTasks = Object.values(data.taskRunsByFlowRun || {}).flat();
            console.log("All Task Runs:", allTasks);

            setTaskRuns(allTasks);
        }

        fetchData();
    }, [jobId]);

    return (
        <Box sx={{ backgroundColor: "#0f172a", borderRadius: 2, p: 2, width: "100%", height: "100%" }}>
            <VuiTypography variant="h4" color="white" mb={2}>
                Danh sách các Task Run
            </VuiTypography>
            <TableContainer
                component={Paper}
                className="task-run-table-container"
                sx={{ backgroundColor: "#1e293b", width: "100%" }}
            >
                <VuiBox mt={2}>
                    
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
                            {paginatedTasks
                                .map((task) => {
                                    const isScheduled = (task.state || "").toUpperCase() === "SCHEDULED";
                                    return {
                                        ...task,
                                        state: task.state || "SCHEDULED",
                                        isScheduled,
                                        startTimeObj: task.start_time ? new Date(task.start_time) : new Date(0),
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
                    <div className="pagination" style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                        <button class="page-btn prev"
                            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                            disabled={page === 0}
                            style={{ marginRight: "8px" }}
                        >
                            Trang trước
                        </button>
                        <span style={{ color: "white", alignSelf: "center" }}>
                            Trang {page + 1} / {Math.ceil(taskRuns.length / rowsPerPage)}
                        </span>
                        <button class="page-btn next"
                            onClick={() => setPage((prev) => (prev + 1 < Math.ceil(taskRuns.length / rowsPerPage) ? prev + 1 : prev))}
                            disabled={(page + 1) * rowsPerPage >= taskRuns.length}
                            style={{ marginLeft: "8px" }}
                        >
                            Trang sau
                        </button>
                    </div>

                </VuiBox>

            </TableContainer>

        </Box>
    );
};

export default TaskRunListTable;
