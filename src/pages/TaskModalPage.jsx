import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import VuiBox from "components/VuiBox";
import Card from "@mui/material/Card";
import VuiTypography from "components/VuiTypography";
import VuiInput from "components/VuiInput";
import VuiButton from "components/VuiButton";
import { toast } from "react-toastify";
import "../css/TaskModalPage.css"; // Import your custom CSS for styling
const TaskModalPage = ({ job, onClose, onTasksUpdated }) => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [taskLogs, setTaskLogs] = useState([]);


    useEffect(() => {
        const fetchTasks = async () => {
            if (!job) return;
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/jobs/${job.id}/tasks`, {
                    method: 'GET',
                    headers: {
                        'X-API-KEY': process.env.REACT_APP_ADMIN_API_KEY
                    }
                });

                if (!response.ok) throw new Error("Failed to fetch tasks");
                const data = await response.json();
                setTasks(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasks();
    }, [job]);

    const handleFieldChange = (job_task_id, field, value) => {
        setTasks((currentTasks) =>
            currentTasks.map((t) =>
                t.job_task_id === job_task_id ? { ...t, [field]: value } : t
            )
        );
    };

    const handleSave = async (taskToSave) => {
        const isNew = String(taskToSave.job_task_id).startsWith("new-");
        const endpoint = isNew
            ? `${process.env.REACT_APP_API_URL}/api/jobs/tasks/${job.id}`
            : `${process.env.REACT_APP_API_URL}/api/jobs/tasks/${taskToSave.job_task_id}`;
        const method = isNew ? "POST" : "PUT";

        try {
            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json", "X-API-KEY": process.env.REACT_APP_ADMIN_API_KEY },
                body: JSON.stringify(taskToSave),
            });
            if (!response.ok) throw new Error("Failed to save task");

            setEditingTaskId(null);
            onTasksUpdated();

            const updated = await fetch(`${process.env.REACT_APP_API_URL}/api/jobs/${job.id}/tasks`, {
                method: "GET",
                headers: {
                    "X-API-KEY": process.env.REACT_APP_ADMIN_API_KEY,
                    "Content-Type": "application/json"
                }
            });

            setTasks(await updated.json());
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDelete = async (job_task_id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa task này không?")) return;
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/jobs/tasks/${job_task_id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": process.env.REACT_APP_ADMIN_API_KEY,
                },
            });
            if (response.status !== 204) throw new Error("Failed to delete task");
            setTasks(tasks.filter((t) => t.job_task_id !== job_task_id));
            onTasksUpdated();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleAddTask = () => {
        const newTask = {
            job_task_id: `new-${Date.now()}`,
            name: "",
            script_type: "sql",
            script_content: "",
            execution_order: tasks.length,
            status: "pending",
        };
        setTasks([...tasks, newTask]);
        setEditingTaskId(newTask.job_task_id);
    };

    const handleCancelEdit = () => {
        const taskToCancel = tasks.find((task) => task.job_task_id === editingTaskId);
        if (!taskToCancel) return setEditingTaskId(null);
        const isNew = String(taskToCancel.job_task_id).startsWith("new-");
        const isEmpty = !taskToCancel.name.trim() && !taskToCancel.script_content.trim();
        if (isNew && isEmpty) {
            setTasks((prev) => prev.filter((task) => task.job_task_id !== editingTaskId));
        }
        setEditingTaskId(null);
    };

    if (!job) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Tasks for Job: "{job.name}"</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p className="error">{error}</p>
                    ) : (
                        <ul>
                            {tasks.map((task) => {
                                const isEditing = editingTaskId === task.job_task_id;
                                const taskLog = taskLogs.find((log) => log.job_task_id === task.job_task_id);

                                return (
                                    <li key={task.job_task_id} className="task-list-item">
                                        {isEditing ? (
                                            <div className="task-edit-form">
                                                <VuiInput
                                                    placeholder="Task Name"
                                                    className="task-name-input"
                                                    value={task.name}
                                                    onChange={(e) =>
                                                        handleFieldChange(task.job_task_id, "name", e.target.value)
                                                    }
                                                    sx={{
                                                        backgroundColor: "#ffff !important", // nền trắng
                                                        color: "#000",           // chữ đen
                                                        input: {
                                                            color: "#000",         // chữ trong input
                                                            backgroundColor: "#fff !important", // nền input trắng
                                                        },
                                                      }}

                                                    
                                                />
                                                <select
                                                    value={task.script_type}
                                                    onChange={(e) =>
                                                        handleFieldChange(task.job_task_id, "script_type", e.target.value)
                                                    }
                                                >
                                                    <option value="sql">SQL</option>
                                                    <option value="python">Python</option>
                                                </select>
                                                <textarea
                                                    value={task.script_content}
                                                    onChange={(e) =>
                                                        handleFieldChange(task.job_task_id, "script_content", e.target.value)
                                                    }
                                                    rows="4"
                                                    placeholder="Enter script content"
                                                />
                                                <div className="edit-actions">
                                                    <VuiButton onClick={handleCancelEdit} variant="outlined" color="error">Cancel</VuiButton>
                                                    <VuiButton onClick={() => handleSave(task)} color="success" variant="outlined">Save</VuiButton>

                                                </div>
                                            </div>
                                        ) : (
                                            <div className="task-item">
                                                <span className="task-order">#{task.execution_order + 1}</span>
                                                <div className="task-details">
                                                    <strong>{task.name}</strong>
                                                    <p>Type: {task.script_type}</p>
                                                    <pre>{task.script_content}</pre>
                                                   
                                                    {taskLog?.log && (
                                                        <div className="task-log">
                                                            <strong>Error Log:</strong>
                                                            <pre>{taskLog.log}</pre>
                                                            <p>Last updated: {new Date(taskLog.updated_at).toLocaleString()}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="task-actions">
                                                        <VuiButton onClick={() => setEditingTaskId(task.job_task_id)} color="success">
                                                        Edit
                                                    </VuiButton>
                                                    <VuiButton onClick={() => handleDelete(task.job_task_id)} color="error">
                                                        Delete
                                                    </VuiButton>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    {!isLoading && <VuiButton onClick={handleAddTask} color="primary">Add New Task</VuiButton>}
                </div>
            </div>
        </div>
    );
};

export default TaskModalPage;
