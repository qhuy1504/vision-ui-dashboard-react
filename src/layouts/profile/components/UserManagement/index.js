// UserManagement.js
import React, { useEffect, useState } from "react";
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Avatar, IconButton, DialogContentText
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import "../../../../css/UserManagement.css";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [open, setOpen] = useState(false);

    //Diaglog Xóa user
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success", // "error" | "info" | "warning"
    });


    const fetchUsers = async () => {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
            headers: {
                "X-API-KEY": process.env.REACT_APP_ADMIN_API_KEY,
            },
        });

        const data = await res.json();
        setUsers(data);
    };


    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEdit = (user) => {
        setEditingUser(user);
        setPreviewAvatar(user.avatar);
        setOpen(true);
    };

    const handleDeleteClick = (id) => {
        setUserToDelete(id);
        setConfirmOpen(true);
    };



    const confirmDelete = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users/${userToDelete}`, {
                method: "DELETE",
                headers: {
                    "X-API-KEY": process.env.REACT_APP_ADMIN_API_KEY,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Xóa thất bại");
            }

            setSnackbar({ open: true, message: "Xóa người dùng thành công!", severity: "success" });
            setConfirmOpen(false);
            setUserToDelete(null);
            fetchUsers(); // Refresh danh sách
        } catch (err) {
            console.error("Xóa thất bại:", err);
            setSnackbar({ open: true, message: err.message || "Lỗi không xác định", severity: "error" });
        }
    };




    const handleSave = async () => {
        const formData = new FormData();
        formData.append("name", editingUser.name);
        formData.append("email", editingUser.email);
        if (editingUser.avatarFile) formData.append("avatar", editingUser.avatarFile);
        for (let [key, value] of formData.entries()) {
            console.log(`IN ${key}:`, value);
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users/${editingUser.id}`, {
                method: "PUT",
                body: formData,
                headers: {
                    "X-API-KEY": process.env.REACT_APP_ADMIN_API_KEY,
                },
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Cập nhật thất bại");
            }

            setSnackbar({
                open: true,
                message: "Cập nhật người dùng thành công!",
                severity: "success",
            });

            setOpen(false);
            setEditingUser(null);
            setPreviewAvatar(null);
            fetchUsers();
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message || "Cập nhật thất bại!",
                severity: "error",
            });
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditingUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditingUser((prev) => ({ ...prev, avatarFile: file }));
            setPreviewAvatar(URL.createObjectURL(file));
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Quản lý người dùng</h2>
            <table className="table-list">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Username</th>
                        <th>Avatar</th>
                        <th>Name</th>
                        <th>Email</th>
                        
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        console.log(user),
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td><Avatar src={user.avatar} /></td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            
                            <td>
                                <IconButton onClick={() => handleEdit(user)}><EditIcon /></IconButton>
                                    <IconButton onClick={() => handleDeleteClick(user.id)}><DeleteIcon /></IconButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
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

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xóa người dùng này không ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        sx={{
                            backgroundColor: "red",
                            color: "white !important",

                            "&:hover": {
                                backgroundColor: "darkred",
                            },
                        }}
                        onClick={() => setConfirmOpen(false)} variant="contained">
                        Hủy
                    </Button>
                    <Button
                        sx={{
                            backgroundColor: "#43a047",
                            color: "white !important",

                            "&:hover": {
                                backgroundColor: "darkgreen",
                            },
                        }}
                        onClick={confirmDelete} color="error" variant="contained">
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"
               
            >
                <DialogTitle variant="h6">Cập nhật người dùng</DialogTitle>
                <DialogContent
                >
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input
                            onChange={handleChange}
                            type="text"
                            id="name"
                            name="name"
                            value={editingUser?.name || ""}
                            class="form-control"
                            placeholder="Enter name"
                        />
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input
                            onChange={handleChange}
                            type="email"
                            id="email"
                            name="email"
                            value={editingUser?.email || ""}
                            class="form-control"
                            placeholder="Enter email"
                        />
                    </div>

                    <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ marginTop: 10 }} />
                    {previewAvatar && (
                        <img src={previewAvatar} alt="preview" style={{ width: 50, height: 50, borderRadius: "50%", marginTop: 10 }} />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        sx={{
                            borderRadius: "8px",
                            textTransform: "none",
                            fontWeight: "bold",
                            padding: "8px 16px",
                            borderColor: "#f44336", // đỏ nhẹ
                            color: "#f44336",
                            "&:hover": {
                                backgroundColor: "#fdecea",
                                borderColor: "#d32f2f",
                            },
                        }}
                        variant="outlined"
                        color="error"
                        
                        
                        onClick={() => setOpen(false)}>Hủy</Button>
                    <Button
                        sx={{
                            borderRadius: "8px",
                            textTransform: "none",
                            fontWeight: "bold",
                            padding: "8px 16px",
                            backgroundColor: "#00ac09ff", // đỏ nhẹ
                            color: "white !important",
                            "&:hover": {
                                backgroundColor: "darkgreen",
                               
                            },
                        }}
                        variant="contained" onClick={handleSave}>Lưu</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UserManagement;
