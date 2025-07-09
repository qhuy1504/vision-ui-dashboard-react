
import React, { useState } from "react";
import { useHistory } from "react-router-dom";

// Vision UI layout và components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import VuiBox from "components/VuiBox";
import Card from "@mui/material/Card";
import VuiTypography from "components/VuiTypography";
import VuiInput from "components/VuiInput";
import VuiButton from "components/VuiButton";
import { toast } from "react-toastify";

const JobFormPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        concurrent: 1,
        schedule_type: "interval",
        schedule_value: "",
        schedule_unit: "minutes",
        tasks: [
            {
                task_name: "",
                script_type: "sql",
                script_content: "",
            },
        ],
    });

    const history = useHistory();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTaskChange = (index, e) => {
        const { name, value } = e.target;
        const updatedTasks = [...formData.tasks];
        updatedTasks[index][name] = value;

        setFormData((prev) => ({
            ...prev,
            tasks: updatedTasks,
        }));
    };

    const addTask = () => {
        setFormData((prev) => ({
            ...prev,
            tasks: [
                ...prev.tasks,
                { task_name: "", script_type: "sql", script_content: "" },
            ],
        }));
    };

    const removeTask = (index) => {
        setFormData((prev) => ({
            ...prev,
            tasks: prev.tasks.filter((_, i) => i !== index),
        }));
    };
    // Hàm mới để thêm task vào job đã có
    const addTasksToExistingJob = async (jobId, tasksToAdd) => {
       
        try {
            // Lặp qua và gọi API thêm từng task
            for (const task of tasksToAdd) {
                await fetch(`${process.env.REACT_APP_API_URL}/api/jobs/tasks/${jobId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(task)
                });
            }

            // Reset form sau khi thành công
            setFormData({
                name: "",
                concurrent: 1,
                schedule_type: "interval",
                schedule_value: "",
                schedule_unit: "minutes",
                tasks: [
                    {
                        task_name: "",
                        script_type: "sql",
                        script_content: "",
                    },
                ]
            });

            toast.success(`Thêm thành công ${tasksToAdd.length} tasks to Job ID: ${jobId}!`);
        } catch (error) {
            toast.error(`Failed to add tasks: ${error.message}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Bóc tách dữ liệu từ formData
        const { name, concurrent, schedule_type, schedule_value, schedule_unit, tasks } = formData;

        // 1. Chuẩn hóa schedulePayload
        let schedulePayload = null;
        if (schedule_type === "interval" && schedule_value) {
            schedulePayload = {
                type: "interval",
                value: parseInt(schedule_value, 10),
                unit: schedule_unit,
            };
        } else if (schedule_type === "cron" && schedule_value) {
            schedulePayload = {
                type: "cron",
                value: schedule_value,
            };
        }

        // 2. Build payload
        const jobData = {
            name,
            concurrent: parseInt(concurrent, 10),
            tasks: tasks.map((task) => ({
                name: task.task_name,
                script_type: task.script_type,
                script_content: task.script_content,
            })),
            schedule: schedulePayload,
        };

        console.log("Sending Job Data:", JSON.stringify(jobData, null, 2));

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/jobs/batch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(jobData),
            });

            const contentType = response.headers.get("content-type") || "";
            const result = contentType.includes("application/json") ? await response.json() : null;

            if (response.status === 409 && result?.error_code === "JOB_NAME_EXISTS") {
                toast.warn(
                    ({ closeToast }) => (
                        <div>
                            <p>{result.message}</p>
                            <p>Bạn có muốn thêm Task vào JOB đã tồn tại?</p>
                            <button
                                onClick={() => {
                                    addTasksToExistingJob(result.existing_job_id, jobData.tasks);
                                    closeToast();
                                }}
                            >
                                Có, thêm Task
                            </button>
                            <button onClick={closeToast} style={{ marginLeft: "10px" }}>
                                Không
                            </button>
                        </div>
                    ),
                    { autoClose: false, closeOnClick: false }
                );
                return;
            }

            if (!response.ok) {
                throw new Error(result?.error || "Thêm job thất bại");
            }

            toast.success(`Job "${name}" đã được tạo thành công!`);
            history.push("/jobs");

        } catch (error) {
            console.error("Submit error:", error);
            toast.error(error.message || "Đã có lỗi xảy ra khi tạo Job.");
        }
    };
      

    return (
        
        <DashboardLayout>

            <VuiBox py={3} >
                <Card sx={{
                    backgroundColor: "none",
                    color: "white",
                    borderRadius: "8px",
                    border: "3px solid rgb(0, 0, 0)", // màu xanh
                    transition: "0.3s ease",
                   
                }}
                >
                    <VuiBox px={3} py={2} >
                        <VuiTypography variant="h4" fontWeight="bold" color="white" textAlign="center" borderRadius="8px" backgroundColor="#1565c0" padding ="10px 0">
                            Thêm công việc mới
                        </VuiTypography>
                    </VuiBox>
                    <VuiBox component="form" px={3} pb={3} onSubmit={handleSubmit} >
                        {/* JOB INFO */}
                        <VuiBox mb={2}>
                            <VuiTypography variant="button" color="black">Tên Job</VuiTypography>
                            <VuiInput
                                placeholder="Tên công việc"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                fullWidth
                                inputProps={{
                                    placeholder: "Tên công việc",
                                    style: { color: "black" },
                                  }}
                                sx={{
                                    backgroundColor: "white !important",
                                    borderRadius: "8px",
                                    "& input::placeholder": {
                                        color: "black", // hoặc màu bạn muốn hiển thị placeholder
                                        opacity: 1,     // bắt buộc cho Chrome
                                    },
                                }}
                            />
                        </VuiBox>

                        <VuiBox mb={2}>
                            <VuiTypography variant="button" color="black">Số Concurrent</VuiTypography>
                            <VuiInput
                                type="number"
                                name="concurrent"
                                value={formData.concurrent}
                                onChange={handleChange}
                                fullWidth
                                inputProps={{
                                   
                                    style: { color: "black"},
                                }}
                                sx={{
                                    backgroundColor: "white !important",
                                    borderRadius: "8px",
                                    "& input::placeholder": {
                                        color: "black", // hoặc màu bạn muốn hiển thị placeholder
                                        opacity: 1,     // bắt buộc cho Chrome
                                    },
                                }}


                            />
                        </VuiBox>

                        <VuiBox mb={2}>
                            <VuiTypography variant="button" color="black">Loại lịch (Schedule Type)</VuiTypography>
                            <select
                                name="schedule_type"
                                value={formData.schedule_type}
                                onChange={handleChange}
                                style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
                            >
                                <option value="interval">Interval</option>
                                <option value="cron">Cron</option>
                            </select>
                        </VuiBox>

                        <VuiBox mb={2}>
                            <VuiTypography variant="button" color="black">Giá trị lịch (Schedule Value)</VuiTypography>
                            <VuiInput
                                name="schedule_value"
                                value={formData.schedule_value}
                                onChange={handleChange}
                                fullWidth
                                inputProps={{
                                    placeholder: "1 2 3, cron: 0 0 * * *",
                                    style: { color: "black" },
                                }}
                                sx={{
                                    backgroundColor: "white !important",
                                    borderRadius: "8px",
                                    "& input::placeholder": {
                                        color: "black", // hoặc màu bạn muốn hiển thị placeholder
                                        opacity: 1,     // bắt buộc cho Chrome
                                    },
                                }}
                            />
                        </VuiBox>

                        {formData.schedule_type === "interval" && (
                            <VuiBox mb={2}>
                                <VuiTypography variant="button" color="black">Đơn vị thời gian (Schedule Unit)</VuiTypography>
                                <select
                                    name="schedule_unit"
                                    value={formData.schedule_unit}
                                    onChange={handleChange}
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
                                >
                                    <option value="minutes">Minutes</option>
                                    <option value="hours">Hours</option>
                                    <option value="days">Days</option>
                                </select>
                            </VuiBox>
                        )}

                        {/* TASK LIST */}
                        <VuiBox mt={4}>
                            <VuiTypography variant="h5" fontWeight="bold" color="white" textAlign="center" borderRadius="8px" backgroundColor="#1565c0" padding="10px 0" marginBottom={3}>
                                Tasks của công việc 
                            </VuiTypography>

                            {formData.tasks.map((task, index) => (
                                <Card key={index} sx={{ p: 3, mb: 3, position: "relative", backgroundColor: "rgba(144, 144, 144, 0.4)", color: "white", borderRadius: "8px", transition: "0.3s ease"  }}>
                                    <VuiTypography variant="h6" fontWeight="bold" mb={1} color="black">
                                        Task #{index + 1}
                                    </VuiTypography>

                                    <VuiBox mb={2}>
                                        <VuiTypography variant="button" color="black">Task Name:</VuiTypography>
                                        <VuiInput
                                            name="task_name"
                                            value={task.task_name}
                                            onChange={(e) => handleTaskChange(index, e)}
                                            placeholder="Nhập vào task name"
                                            fullWidth
                                            inputProps={{
                                                placeholder: "Nhập vào Task Name",
                                                style: { color: "black" },
                                            }}
                                            sx={{
                                                backgroundColor: "white !important",
                                                borderRadius: "8px",
                                                "& input::placeholder": {
                                                    color: "black", // hoặc màu bạn muốn hiển thị placeholder
                                                    opacity: 1,     // bắt buộc cho Chrome
                                                },
                                            }}

                                        />
                                    </VuiBox>

                                    <VuiBox mb={2}>
                                        <VuiTypography variant="button" color="black">Script Type:</VuiTypography>
                                        <select
                                            name="script_type"
                                            value={task.script_type}
                                            onChange={(e) => handleTaskChange(index, e)}
                                            style={{
                                                width: "100%",
                                                padding: "10px",
                                                borderRadius: "8px",
                                                
                                            }}
                                        >
                                            <option value="sql">sql</option>
                                            <option value="python">python</option>
                                        </select>
                                    </VuiBox>

                                    <VuiBox mb={2}>
                                        <VuiTypography variant="button" color="black">Script Content:</VuiTypography>
                                        <textarea
                                            name="script_content"
                                            value={task.script_content}
                                            onChange={(e) => handleTaskChange(index, e)}
                                            rows={6}
                                            style={{
                                                width: "100%",
                                                padding: "10px",
                                                borderRadius: "8px",
                                                resize: "vertical",
                                            }}
                                            
                                        />
                                    </VuiBox>

                                    <VuiButton
                                        variant="contained"
                                        color="error"
                                        onClick={() => removeTask(index)}
                                        sx={{ position: "absolute", top: 16, right: 16 }}
                                    >
                                        Remove
                                    </VuiButton>
                                </Card>
                            ))}

                            <VuiButton color="success" variant="contained" onClick={addTask}>
                                Add New Task
                            </VuiButton>
                        </VuiBox>

                        {/* ACTION BUTTONS */}
                        <VuiBox display="flex" justifyContent="flex-end" gap={2} mt={4}>
                         
                            <VuiButton type="submit" color="info">
                                Lưu công việc
                            </VuiButton>
                        </VuiBox>
                    </VuiBox>
                </Card>
            </VuiBox>
        </DashboardLayout>
    );
};

export default JobFormPage;
