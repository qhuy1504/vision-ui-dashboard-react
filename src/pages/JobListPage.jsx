import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import VuiBox from "components/VuiBox";
import Card from "@mui/material/Card";
import VuiTypography from "components/VuiTypography";
import VuiInput from "components/VuiInput";
import VuiButton from "components/VuiButton";
import { toast } from "react-toastify";
import TaskModalPage from "./TaskModalPage";
import "../css/JobList.css"; // Import your custom CSS for styling

const JobListPage = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const jobsRef = useRef([]);
    const history = useHistory();

    // State để quản lý việc mở modal chỉnh sửa
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [editData, setEditData] = useState({
        name: '',
        concurrent: '',
        status: '',
        schedule_type: '',
        schedule_value: '',
        schedule_unit: ''
    });

    const fetchJobs = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/jobs/`, {
                method: "GET", // mặc định là GET, nhưng nên khai rõ
                headers: {
                    "Content-Type": "application/json", // tùy chọn, nhưng thường nên có
                    "X-API-KEY": process.env.REACT_APP_ADMIN_API_KEY,
                },
            });

            if (!res.ok) throw new Error("Failed to fetch jobs");
            const data = await res.json();
            setJobs(data);
        } catch (err) {
            toast.error("Không thể tải danh sách jobs");
        }
    };
    function fetchWithTimeout(url, options = {}, ms = 5000) {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), ms);
        return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(t));
    }
    const refreshStatuses = async () => {
        const current = jobsRef.current;
        const updating = current.filter(
            j => j.flow_run_id && ["running", "pending", "scheduled", 'completed', 'failed', 'crashed'].includes(j.status?.toLowerCase())
        );
        if (!updating.length) return;

        const updates = await Promise.all(
            updating.map(async j => {
                try {
                    const res = await fetchWithTimeout(
                        `${process.env.REACT_APP_API_URL}/api/jobs/flow-run-status/${j.flow_run_id}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "X-API-KEY": process.env.REACT_APP_ADMIN_API_KEY,
                            },
                        },
                        5000
                    );

                    const json = await res.json();
                    return { id: j.id, status: json.status?.toLowerCase() };
                } catch (e) {
                    console.error("Status API error:", e.message);
                    return null;
                }
            })
        );

        setJobs(prev =>
            prev.map(job => {
                const u = updates.find(x => x && x.id === job.id);
                return u ? { ...job, status: u.status } : job;
            })
        );
    };
    useEffect(() => {
        fetchJobs();
        jobsRef.current = jobs;
    }, [jobs]);

    useEffect(() => {
        let timer, busy = false;
        const poll = async () => {
            if (busy) return;
            busy = true;
            try {
                await fetchJobs();      // luôn load DB list trước
                await refreshStatuses();// rồi update trạng thái Prefect
            } finally {
                busy = false;
            }
        };
        poll();
        timer = setInterval(poll, 5000);
        return () => clearInterval(timer);
    }, []);

    const openEditModal = (job) => {
        setSelectedJob(job);
        setEditData(job); // giữ nguyên dữ liệu để sửa
        setIsEditModalOpen(true);
    };
    useEffect(() => {
        if (!isEditModalOpen) return;

        setEditData((prev) => {
            let updated = { ...prev };

            if (!updated.schedule_type) {
                updated.schedule_type = "interval";
                updated.schedule_unit = "minutes";
            } else if (updated.schedule_type === "interval" && !updated.schedule_unit) {
                updated.schedule_unit = "minutes";
            } else if (updated.schedule_type === "cron") {
                updated.schedule_unit = "";
            }

            return updated;
        });
    }, [isEditModalOpen, editData.schedule_type]);




    const handleViewTasks = (job) => setSelectedTask(job);
    const handleCloseModal = () => setSelectedTask(null);

    const handleDelete = async (jobId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa Job ID: ${jobId}?`)) return;
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/jobs/${jobId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": process.env.REACT_APP_ADMIN_API_KEY,
                },
            });
            if (res.status !== 204) {
                const errData = await res.json();
                throw new Error(errData.error || "Xóa thất bại");
            }
            toast.success(`Đã xóa Job ID: ${jobId}`);
            fetchJobs();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleTrigger = async (jobId) => {
        toast.info(`Triggering Job ID: ${jobId}...`);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/jobs/${jobId}/trigger`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': process.env.REACT_APP_ADMIN_API_KEY
                }
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to trigger job');
            }
            const result = await response.json();
            console.log('Trigger result:', result);
           

            toast.success(`Job ID: ${jobId} triggered successfully!`);
            // Gọi fetchJobs để cập nhật lại status của job (vd: từ 'pending' -> 'running')
            setTimeout(fetchJobs, 1000); // Chờ 1s để backend kịp xử lý
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        //Kiểm tra hợp lệ nếu là interval nhưng chưa chọn đơn vị
        if (editData.schedule_type === "interval" && !editData.schedule_unit) {
            toast.error("Vui lòng chọn Schedule Unit (minutes/hours/days)");
            return;
        }

        // Xử lý payload để tránh lỗi constraint ở DB
        const payload = {
            ...editData,
            schedule_unit: editData.schedule_type === "cron" ? null : editData.schedule_unit,
        };
        console.log('Payload gửi đi:', payload);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/jobs/${selectedJob.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': process.env.REACT_APP_ADMIN_API_KEY
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Cập nhật thành công:', result);
            toast.success("Cập nhật thành công!");
            setIsEditModalOpen(false);
            fetchJobs(); // Reload danh sách
        } catch (error) {
            console.error("Cập nhật thất bại:", error);
            toast.error("Cập nhật thất bại");
        }
    };

    return (
        <DashboardLayout>
            <VuiBox py={3}>
                <Card sx={{ padding: 3, backgroundColor: "white", color: "black", borderRadius: "8px", border: "3px solid rgb(0, 0, 0)"}} >
                    <VuiTypography variant="h4" fontWeight="bold" color="white" textAlign="center" borderRadius="8px" backgroundColor="#1565c0" padding="10px 0">
                        Danh sách công việc
                    </VuiTypography>

                    {jobs.length === 0 ? (
                        <VuiTypography variant="button" color="text">
                            No jobs found.
                        </VuiTypography>
                    ) : (
                        <table className="job-table" style={{
                            width: "100%", borderCollapse: "collapse", color: "black", fontSize: "14px"
                            , textAlign: "center", marginTop: "20px", lineHeight: "3"
                        }}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Tasks</th>
                                    <th>Concurrency</th>
                                    <th>Schedule</th>
                                    <th>Flow Run ID</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job) => (
                                    <tr key={job.id}>
                                        <td>{job.id}</td>
                                        <td>
                                            <span
                                                style={{ cursor: "pointer", color: "blue" }}
                                                onClick={() => history.push(`/jobs/${job.id}`)}
                                            >
                                                {job.name}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${job.status?.toLowerCase()}`}>
                                                {job.status?.toUpperCase()}
                                            </span>
                                        </td>

                                        <td>
                                            <VuiButton
                                                color="info"
                                                size="small"
                                                onClick={() => handleViewTasks(job)}
                                            >
                                                {job.tasks.length} Tasks
                                            </VuiButton>
                                        </td>
                                        <td>{job.concurrent}</td>
                                        <td>
                                            {job.schedule_type} <br />
                                            {job.schedule_value} {job.schedule_type === 'interval' && job.schedule_unit}
                                        </td>

                                        <td>{job.flow_run_id}</td>
                                       
                                        <td>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <VuiButton
                                                    color="success"
                                                    size="small"
                                                    onClick={() => openEditModal(job)}
                                                >
                                                    Edit
                                                </VuiButton>
                                                <VuiButton
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleDelete(job.id)}
                                                >
                                                    Delete
                                                </VuiButton>
                                                <VuiButton
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => handleTrigger(job.id)}
                                                >
                                                    Trigger
                                                </VuiButton>
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>
            </VuiBox>
            {isEditModalOpen && selectedJob && (
                <div
                    className="modal-overlay"
                    onClick={(e) => {
                        // Nếu người dùng click vào overlay (không phải bên trong modal), đóng modal
                        if (e.target.classList.contains("modal-overlay")) {
                            setIsEditModalOpen(false);
                        }
                    }}
                >
                    <div className="modal" style={{ backgroundColor: "#8f93a1", padding: 16, borderRadius: 8 }}>
                        <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <VuiTypography variant="h4" color="white">Edit Job</VuiTypography>
                            <button className="close-button" onClick={() => setIsEditModalOpen(false)}>×</button>
                        </div>

                        <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, backgroundColor: "#8f93a1", padding: 16, borderRadius: 8 }}>
                            <VuiBox>
                                <VuiTypography variant="caption" color="white">Tên Job:</VuiTypography>
                                <VuiInput
                                    placeholder="Job Name"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                />
                            </VuiBox>

                            <VuiBox>
                                <VuiTypography variant="caption" color="white">Số concurrent:</VuiTypography>
                                <VuiInput
                                    type="number"
                                    placeholder="Concurrent"
                                    value={editData.concurrent}
                                    onChange={(e) => setEditData({ ...editData, concurrent: e.target.value })}
                                />
                            </VuiBox>

                            <VuiBox>
                                <VuiTypography variant="caption" color="white">Schedule Type:</VuiTypography>
                                <select
                                    value={editData.schedule_type}
                                    onChange={(e) => setEditData({ ...editData, schedule_type: e.target.value })}
                                    style={{ padding: 8, borderRadius: 8, width: "100%", border: "1px solid #ccc" }}
                                >
                                    <option value="interval">Interval</option>
                                    <option value="cron">Cron</option>
                                </select>
                            </VuiBox>

                            <VuiBox>
                                <VuiTypography variant="caption" color="white">Schedule Value:</VuiTypography>
                                <VuiInput
                                    placeholder="Schedule Value"
                                    value={editData.schedule_value}
                                    onChange={(e) => setEditData({ ...editData, schedule_value: e.target.value })}
                                />
                            </VuiBox>

                            <VuiBox>
                                <VuiTypography variant="caption" color="white">Schedule Unit (nếu chọn interval):</VuiTypography>
                                <select
                                    value={editData.schedule_unit}
                                    onChange={(e) => setEditData({ ...editData, schedule_unit: e.target.value })}
                                    disabled={editData.schedule_type !== "interval"}
                                    style={{
                                        padding: 8,
                                        borderRadius: 8,
                                        width: "100%",
                                        border: "1px solid #ccc",
                                        backgroundColor: editData.schedule_type !== "interval" ? "#f0f0f0" : "#fff",
                                    }}
                                >
                                    <option disabled value="">-- Choose unit --</option>
                                    <option value="minutes">Minutes</option>
                                    <option value="hours">Hours</option>
                                    <option value="days">Days</option>
                                </select>
                            </VuiBox>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
                                <VuiButton color="error" onClick={() => setIsEditModalOpen(false)}>Cancel</VuiButton>
                                <VuiButton type="submit" color="success">Save</VuiButton>
                            </div>
                        </form>
                    </div>

                </div>
            )}

            {/* Modal hiển thị task */}
            {selectedTask && (

                <TaskModalPage
                    job={selectedTask}
                    onClose={handleCloseModal}
                    onTasksUpdated={fetchJobs}
                />
            )}
        </DashboardLayout>
    );
};

export default JobListPage;
