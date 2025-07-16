// pages/AdminAssignPage.jsx
import { useEffect, useState } from "react";
import {
    Button, Card, Typography, Select, MenuItem,
    Grid, FormControl, InputLabel, Tabs, Tab, Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,

} from "@mui/material";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import "../css/UserGroupTable.css";
function TabPanel({ children, value, index }) {
    return value === index && <Box sx={{ pt: 3 }}>{children}</Box>;
}

export default function AdminAssignPage() {
    const [tabIndex, setTabIndex] = useState(0);

    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [roles, setRoles] = useState([]);
    const [menus, setMenus] = useState([]);

    const [selectedUser, setSelectedUser] = useState("");
    const [selectedGroups, setSelectedGroups] = useState([]);

    const [selectedGroup, setSelectedGroup] = useState("");
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [selectedRolesForEdit, setSelectedRolesForEdit] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");

    const [selectedMenus, setSelectedMenus] = useState([]);
    const [selectedRoleForEdit, setSelectedRoleForEdit] = useState(null);
    const [selectedMenusForEdit, setSelectedMenusForEdit] = useState([]);

 

    const [assignedGroups, setAssignedGroups] = useState([]);
    const [assignedRoles, setAssignedRoles] = useState([]);
    const [assignedMenus, setAssignedMenus] = useState([]);

    //DIAGLOG HỎI
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [pendingDeleteRoleId, setPendingDeleteRoleId] = useState(null);
    

  

    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [checkedRoles, setCheckedRoles] = useState([]); // danh sách role_id đã chọn

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success", // "error" | "info" | "warning"
    });
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [openRoleConfirmDialog, setRoleOpenConfirmDialog] = useState(false);
    const [selectedRoleToDelete, setSelectedRoleToDelete] = useState(null);

    const [openDialogRole, setOpenDialogRole] = useState(false);
    const [openDialogMenu, setOpenDialogMenu] = useState(false);
  


    const fetchUsers = async () => {
        const res = await fetch("http://localhost:3001/api/admin/users");
        return res.json();
    };

    const fetchGroups = async () => {
        const res = await fetch("http://localhost:3001/api/admin/groups");
        return res.json();
    };

    const fetchRoles = async () => {
        const res = await fetch("http://localhost:3001/api/admin/roles");
        return res.json();
    };

    const fetchMenus = async () => {
        const res = await fetch("http://localhost:3001/api/admin/menus");
        return res.json();
    };

    const fetchAll = async () => {
        try {
            const [usersData, groupsData, rolesData, menusData] = await Promise.all([
                fetchUsers(),
                fetchGroups(),
                fetchRoles(),
                fetchMenus()
            ]);

            setUsers(usersData);
            setGroups(groupsData);
            setRoles(rolesData);
            setMenus(menusData);
        } catch (error) {
            console.error("Lỗi khi fetch dữ liệu:", error);
        }
    };

    const getUserGroups = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/admin/user-groups`);
            const data = await res.json();
          
            if (!res.ok) return alert("Lấy nhóm của user thất bại: " + (data.error || "Không xác định"));
            setAssignedGroups(data);
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lấy nhóm của user.");
        }
    };
    useEffect(() => {
        fetchAll();
        getUserGroups();
    }, []);

    const handleAssignGroups = async () => {
        if (!selectedUser || selectedGroups.length === 0) {
            return setSnackbar({
                open: true,
                message: "Vui lòng chọn user và ít nhất một nhóm.",
                severity: "warning",
            });
        }
        try {
            const res = await fetch(`http://localhost:3001/api/admin/user-group/${selectedUser}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ groupIds: selectedGroups }),
            });

            const data = await res.json();
            if (!res.ok) return alert("Gán nhóm thất bại: " + (data.error || "Không xác định"));
            getUserGroups();
            setSnackbar({
                open: true,
                message: "Gán nhóm cho user thành công!",
                severity: "success",
            });
            setSelectedUser("");
            setSelectedGroups([]);


        } catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                message: "Lỗi khi gán nhóm cho user.",
                severity: "error",
            });
        }
    };

    const handleOpenDialog = (item) => {
        setSelectedItem(item);
        setOpenDialog(true);
    };

  

    const handleConfirmDelete = async () => {
        if (!selectedItem) return;

        try {
            const res = await fetch("http://localhost:3001/api/admin/user-group/remove", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: selectedItem.user_id,
                    group_id: selectedItem.group_id,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setSnackbar({
                    open: true,
                    message: "Xóa thất bại: " + (data.error || "Không xác định"),
                    severity: "error",
                });
            } else {
                getUserGroups(selectedItem.user_id);
                setSnackbar({
                    open: true,
                    message: "Đã xóa user khỏi nhóm!",
                    severity: "success",
                });
            }
        } catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                message: "Lỗi khi xóa user khỏi nhóm.",
                severity: "error",
            });
        } finally {
            setOpenDialog(false);
            setSelectedItem(null);
        }
    };

    //START GROUP ROLE

    const getGroupRoles = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/admin/group-roles`);
            const data = await res.json();
           
            if (!res.ok) return alert("Lấy nhóm của user thất bại: " + (data.error || "Không xác định"));
            setAssignedRoles(data);
        } catch (err) {
            console.error(err);
           setSnackbar({
               open: true,
               message: "Lỗi khi lấy nhóm của user.",
               severity: "error",
              });
        }
    };
    useEffect(() => {
        fetchAll();
        getGroupRoles();
       
    }, []);

    const handleAssignRoles = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/admin/group-roles/${selectedGroups}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roleIds: selectedRoles.map(id => String(id)), }),
            });

            const data = await res.json();

            if (!res.ok) {
                setSnackbar({
                    open: true,
                    message: data.error || "Gán vai trò thất bại",
                    severity: "error",
                });
                return;
            }

            setSnackbar({
                open: true,
                message: data.message || "Gán vai trò thành công!",
                severity: "success",
            });

            setSelectedGroup("");
            setSelectedRoles([]);
            getGroupRoles();

        } catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                message: "Lỗi khi gán vai trò.",
                severity: "error",
            });
        }
    };
    
    const handleOpenDeleteRole = (item) => {
        setSelectedRoleToDelete(item);
        setRoleOpenConfirmDialog(true);
    };

    const handleConfirmDeleteRole = async () => {
        try {
            const item = selectedRoleToDelete;
            console.log("Xoá vai trò khỏi nhóm:", item);
            const res = await fetch("http://localhost:3001/api/admin/group-role/remove", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    group_id: item.group_id,
                    
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setSnackbar({
                    open: true,
                    message: "Xóa thất bại: " + (data.error || "Không xác định"),
                    severity: "error",
                });
                return;
            }

            setSnackbar({
                open: true,
                message: "Xoá vai trò khỏi nhóm thành công!",
                severity: "success",
            });

            getGroupRoles(item.group_id); // refresh danh sách
            setRoleOpenConfirmDialog(false);
            setSelectedRoleToDelete(null);
        } catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                message: "Lỗi khi xóa vai trò.",
                severity: "error",
            });
        }
    };

    //END GROUP ROLE
      
    // SET MENU TO ROLE

    const getRoleMenus = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/admin/role-menus`);
            const data = await res.json();
            
            if (!res.ok) return alert("Lấy menu của role thất bại: " + (data.error || "Không xác định"));
            setAssignedMenus(data);
        } catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                message: "Lỗi khi lấy menu của role.",
                severity: "error",
            });
        }
    };
    useEffect(() => {
        fetchAll();
        getRoleMenus();

    }, []);


    const handleAssignMenus = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/admin/role-menu/${selectedRoles}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ menuIds: selectedMenus }),
            });

            const data = await res.json();
            if (!res.ok) {
                setSnackbar({
                    open: true,
                    message: "Phân quyền thất bại, " + (data.error || "Không xác định"),
                    severity: "error",
                });
                return; 
            }
           
           
            setSnackbar({
                open: true,
                message: "Phân quyền menu thành công",
                severity: "success",
            });
            getRoleMenus();
            setSelectedRoles("");
            setSelectedMenus([]);
        } catch (err) {
            console.error(err);
          
            setSnackbar({
                open: true,
                message: "Lỗi khi phân quyền menu.",
                severity: "error",
            });
        }
    };
//Lọc trùng menus theo tên
    const uniqueMenusByName = Array.from(
        new Map(menus.map((m) => [m.name, m])).values()
    );


    const handleRemoveMenusFromRole = async (roleId) => {
        try {
            const res = await fetch(`http://localhost:3001/api/admin/role-menu/${roleId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role_id: roleId }),
            });

            const data = await res.json();

            if (!res.ok) {
                setSnackbar({
                    open: true,
                    message: data.error || "Xóa menu thất bại",
                    severity: "error",
                });
                return;
            }

            setSnackbar({
                open: true,
                message: "Đã xóa toàn bộ menu của role thành công",
                severity: "success",
            });

            getRoleMenus(); // gọi lại để cập nhật danh sách
        } catch (err) {
            console.error("Lỗi khi xóa menu của role:", err);
            setSnackbar({
                open: true,
                message: "Lỗi kết nối khi xóa menu",
                severity: "error",
            });
        }
    };

    const handleOpenConfirmDelete = (roleId) => {
        setPendingDeleteRoleId(roleId);
        setOpenConfirmDialog(true);
    };

    const confirmDeleteMenus = async () => {
        if (!pendingDeleteRoleId) return;

        await handleRemoveMenusFromRole(pendingDeleteRoleId);
        setOpenConfirmDialog(false);
        setPendingDeleteRoleId(null);
    };

    const handleEditMenus = (item) => {
        setSelectedRoleForEdit(item); // item: { role_id, role_name, menus: [...] }

        const matchedMenuIds = menus
            .filter((menu) => item.menus.includes(menu.name))
            .map((menu) => menu.id);

        setSelectedMenusForEdit(matchedMenuIds);
        setOpenDialogMenu(true);
    };

    const handleSaveEditedMenus = async () => {
        if (!selectedRoleForEdit || !selectedRoleForEdit.role_id || selectedMenusForEdit.length === 0) {
            setSnackbar({
                open: true,
                message: "Dữ liệu không hợp lệ",
                severity: "error",
            });
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/admin/role-menus/${selectedRoleForEdit.role_id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    menuIds: selectedMenusForEdit,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setSnackbar({
                    open: true,
                    message: data.error || "Cập nhật thất bại",
                    severity: "error",
                });
                return;
            }

            setSnackbar({
                open: true,
                message: data.message || "Cập nhật menu thành công",
                severity: "success",
            });

            setOpenDialogMenu(false);
            getRoleMenus(); // reload lại danh sách
        } catch (err) {
            console.error("Lỗi cập nhật menu:", err);
            setSnackbar({
                open: true,
                message: "Lỗi máy chủ khi cập nhật menu",
                severity: "error",
            });
        }
    };




    // END SET MENU TO ROLE



    const handleEditRoles = (item) => {
        setSelectedGroups(item);
        // Chuyển từ role name → id
        const roleNames = item.roles || [];
        const matchedRoleIds = roles
            .filter((r) => roleNames.includes(r.name))
            .map((r) => String(r.id)); // ép về string để dùng includes() sau này
        setSelectedRolesForEdit(matchedRoleIds);
        setOpenDialogRole(true);
    };


    const handleSaveEditedRoles = async () => {
        if (!selectedGroups || !selectedGroups.group_id || !Array.isArray(selectedRoles)) {
            setSnackbar({
                open: true,
                message: "Dữ liệu không hợp lệ khi lưu",
                severity: "error",
            });
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/admin/groupid-roles/${selectedGroups.group_id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    roleIds: selectedRolesForEdit.map(String), // Gửi đúng như backend yêu cầu
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setSnackbar({
                    open: true,
                    message: data.error || "Cập nhật thất bại",
                    severity: "error",
                });
                return;
            }

            setSnackbar({
                open: true,
                message: data.message || "Cập nhật vai trò thành công",
                severity: "success",
            });

            setOpenDialogRole(false);         // Đóng dialog
            getGroupRoles();    // Cập nhật lại danh sách (nếu có)
        } catch (err) {
            console.error("Lỗi khi gọi API cập nhật vai trò:", err);
            setSnackbar({
                open: true,
                message: "Lỗi máy chủ hoặc mạng",
                severity: "error",
            });
        }
    };


      
      




    return (
        <DashboardLayout>
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
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xóa{" "}
                        <strong>{selectedItem?.username}</strong> khỏi nhóm{" "}
                        <strong>{selectedItem?.group_name}</strong>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenDialog(false)}

                        variant="contained"
                        sx={{
                            backgroundColor: "red",
                            color: "white !important",

                            "&:hover": {
                                backgroundColor: "darkred",
                            },
                        }}
                    >
                        Hủy
                    </Button>

                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        sx={{
                            backgroundColor: "#43a047",
                            color: "white !important",

                            "&:hover": {
                                backgroundColor: "darkgreen",
                            },
                        }}
                    >
                        Xóa
                    </Button>
                </DialogActions>

            </Dialog>



            <Dialog open={openRoleConfirmDialog} onClose={() => setRoleOpenConfirmDialog(false)}>
                <DialogTitle>Xác nhận xoá vai trò</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xoá vai trò <strong>{selectedRoleToDelete?.role_name}</strong> khỏi nhóm{" "}
                        <strong>{selectedRoleToDelete?.group_name}</strong> không?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRoleOpenConfirmDialog(false)} color="error"
                        variant="contained"
                        sx={{
                            backgroundColor: "red",
                            color: "white !important",

                            "&:hover": {
                                backgroundColor: "darkred",
                            },
                        }}

                    >
                        Hủy
                    </Button>
                    <Button onClick={handleConfirmDeleteRole} color="success" variant="contained"
                        sx={{
                            backgroundColor: "#43a047",
                            color: "white !important",

                            "&:hover": {
                                backgroundColor: "darkgreen",
                            },
                        }}

                    >
                        Xoá
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth>
                <DialogTitle>Chỉnh sửa vai trò của nhóm</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Nhóm: <strong>{selectedGroup?.group_name}</strong>
                    </DialogContentText>

                    <FormGroup sx={{ mt: 2 }}>
                        {roles.map((role) => (
                            <FormControlLabel
                                key={role.id}
                                control={
                                    <Checkbox
                                        checked={checkedRoles.includes(role.id)}
                                        onChange={() => {
                                            setCheckedRoles((prev) =>
                                                prev.includes(role.id)
                                                    ? prev.filter((id) => id !== role.id)
                                                    : [...prev, role.id]
                                            );
                                        }}
                                    />
                                }
                                label={role.name}
                            />
                        ))}
                    </FormGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)} color="error">Hủy</Button>
                    <Button onClick={handleSaveEditedRoles} variant="contained" color="primary">Lưu</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDialogRole} onClose={() => setOpenDialogRole(false)} fullWidth maxWidth="sm">
               
                <DialogTitle>
                    SỬA ROLE CHO GROUP:
                    <strong style={{ color: "blue" }}>
                        {selectedGroups?.name || selectedGroups?.group_name}
                    </strong>
                </DialogTitle>
                <DialogContent>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        maxHeight: "250px",
                        overflowY: "auto",
                        border: "1px solid #ccc",
                        padding: "8px",
                        borderRadius: "4px",
                        backgroundColor: "#f9f9f9"
                    }}>
                        {roles.map((role) => {
                            const isChecked = (selectedRolesForEdit || []).includes(String(role.id));
                           

                            return (
                                <label key={role.id} style={{ display: "flex", alignItems: "center" }}>
                                    <input
                                        type="checkbox"
                                        value={role.id}
                                        checked={isChecked}
                                        onChange={(e) => {
                                            const value = String(role.id);
                                            if (e.target.checked) {
                                                setSelectedRolesForEdit(prev => [...prev, value]);
                                            } else {
                                                setSelectedRolesForEdit(prev => prev.filter((id) => id !== value));
                                            }
                                        }}
                                        style={{ marginRight: "8px" }}
                                    />
                                    {role.name}
                                </label>
                            );
                        })}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "red",
                            color: "white !important",
                            "&:hover": {
                                backgroundColor: "darkred",
                            },
                        }}
                        onClick={() => setOpenDialogRole(false)}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#43a047",
                            color: "white !important",
                            "&:hover": {
                                backgroundColor: "darkgreen",
                            },
                        }}
                        onClick={handleSaveEditedRoles}
                    >
                        Lưu
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
            >
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xóa tất cả menu được gán cho role này không?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmDialog(false)}
                        variant="contained"
                        sx={{
                            backgroundColor: "red",
                            color: "white !important",
                            "&:hover": {
                                backgroundColor: "darkred",
                            },
                            
                        }}
                    
                    >Hủy</Button>
                    <Button onClick={confirmDeleteMenus} color="error" variant="contained"
                        sx={{
                            backgroundColor: "#43a047",
                            color: "white !important",
                            "&:hover": {
                                backgroundColor: "darkgreen",
                            },
                        }}
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDialogMenu} onClose={() => setOpenDialogMenu(false)} fullWidth maxWidth="sm">
                <DialogTitle>
                    SỬA MENU CHO ROLE:
                    <strong style={{ color: "blue" }}>
                        {selectedRoleForEdit?.name || selectedRoleForEdit?.role_name}
                    </strong>
                </DialogTitle>

                <DialogContent>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        maxHeight: "250px",
                        overflowY: "auto",
                        border: "1px solid #ccc",
                        padding: "8px",
                        borderRadius: "4px",
                        backgroundColor: "#f9f9f9"
                    }}>
                        {uniqueMenusByName.map((menu) => {
                            const isChecked = selectedMenusForEdit.includes(menu.id);

                            return (
                                <label key={menu.id} style={{ display: "flex", alignItems: "center" }}>
                                    <input
                                        type="checkbox"
                                        value={menu.id}
                                        checked={isChecked}
                                        onChange={(e) => {
                                            const value = menu.id;
                                            if (e.target.checked) {
                                                setSelectedMenusForEdit(prev => [...prev, value]);
                                            } else {
                                                setSelectedMenusForEdit(prev => prev.filter(id => id !== value));
                                            }
                                        }}
                                        style={{ marginRight: "8px" }}
                                    />
                                    {menu.name} <span style={{ color: "red", marginLeft: 8 }}>({menu.path})</span>
                                </label>
                            );
                        })}
                    </div>
                </DialogContent>

                <DialogActions>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "red",
                            color: "white !important",
                            "&:hover": { backgroundColor: "darkred" },
                        }}
                        onClick={() => setOpenDialogMenu(false)}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#43a047",
                            color: "white !important",
                            "&:hover": { backgroundColor: "darkgreen" },
                        }}
                        onClick={handleSaveEditedMenus}
                    >
                        Lưu
                    </Button>
                </DialogActions>
            </Dialog>





            <Card sx={{ padding: 4, mt: 4 }}>
                <Typography variant="h5" mb={3}>QUẢN LÝ PHÂN QUYỀN</Typography>

                <Tabs value={tabIndex} onChange={(e, newVal) => setTabIndex(newVal)} indicatorColor="primary" textColor="primary"
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
                    <Tab label="GÁN USER VÀO GROUP" />
                    <Tab label="GÁN ROLE VÀO GROUP" />
                    <Tab label="PHÂN QUYỀN MENU THEO ROLE" />
                </Tabs>

                {/* Tab 0: Gán User vào Group */}
                <TabPanel value={tabIndex} index={0}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <label style={{ color: "black", display: "block", marginBottom: "8px" }}>
                                User
                            </label>
                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    backgroundColor: "#f0f0f0",
                                    color: "black",
                                    border: "1px solid gray",
                                    outline: "none",
                                    fontSize: "16px",
                                }}
                            >
                                <option value="" disabled hidden>-- Chọn user --</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.username}
                                    </option>
                                ))}
                            </select>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <label style={{ color: "black", display: "block", marginBottom: "8px" }}>
                                Group
                            </label>
                            <select
                                value={selectedGroups}
                                onChange={(e) => setSelectedGroups(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    backgroundColor: "#f0f0f0",
                                    color: "black",
                                    border: "1px solid gray",
                                    outline: "none",
                                    fontSize: "16px",
                                }}
                            >
                                <option value="" disabled hidden>-- Chọn Group --</option>
                                {groups.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    sx={{ color: "white !important", fontSize: "16px" }}
                                    onClick={handleAssignGroups}
                                >
                                    GÁN GROUP
                                </Button>
                            </Box>
                        </Grid>

                    </Grid>
                    <Grid item xs={12}>
                        <Box mt={4}>
                            <table className="table-list">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Username</th>
                                        <th>Group</th>
                                        <th style={{ textAlign: "center" }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignedGroups.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            <td>{item.username}</td>
                                            <td>{item.group_name}</td>
                                            <td style={{ textAlign: "center" }}>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleOpenDialog(item)}
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>


                        </Box>
                    </Grid>

                </TabPanel>

                {/* Tab 1: Gán Role cho Group */}
                <TabPanel value={tabIndex} index={1}>
                    <Grid container spacing={3}>
                        {/* Chọn Group */}
                        <Grid item xs={12} md={6}>
                            <label style={{ color: "black", display: "block", marginBottom: "8px" }}>
                                Group
                            </label>
                            <select
                                value={selectedGroups}
                                onChange={(e) => setSelectedGroups(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    backgroundColor: "#f0f0f0",
                                    color: "black",
                                    border: "1px solid gray",
                                    outline: "none",
                                    fontSize: "16px",
                                }}
                            >
                                <option value="" disabled hidden>-- Chọn Group --</option>
                                {groups.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </Grid>

                        {/* Chọn Roles */}
                        <Grid item xs={12} md={6}>
                            <label style={{ color: "black", display: "block", marginBottom: "8px" }}>
                                Role
                            </label>
                            {/* Container scroll cho danh sách checkbox */}
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                maxHeight: "200px",        // chiều cao tối đa
                                overflowY: "auto",         // bật thanh cuộn dọc nếu cần
                                border: "1px solid #ccc",  // tuỳ chọn, để phân biệt
                                padding: "8px",
                                borderRadius: "4px",
                                backgroundColor: "#f9f9f9" // nhẹ nhàng dễ nhìn
                            }}>
                                {roles.map((role) => (
                                    <label key={role.id} style={{ display: "flex", alignItems: "center" }}>
                                        <input
                                            type="checkbox"
                                            value={role.id}
                                            checked={selectedRoles.includes(role.id)}
                                            onChange={(e) => {
                                                const value = role.id;
                                                if (e.target.checked) {
                                                    setSelectedRoles([...selectedRoles, value]);
                                                } else {
                                                    setSelectedRoles(selectedRoles.filter((id) => id !== value));
                                                }
                                            }}
                                            style={{ marginRight: "8px" }}
                                        />
                                        {role.name}
                                    </label>
                                ))}
                            </div>
                        </Grid>



                        {/* Gán role */}
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="flex-end">
                                <Button variant="contained"
                                    sx={{ color: "white !important", fontSize: "16px" }}
                                    onClick={handleAssignRoles}>
                                    GÁN ROLE
                                </Button>
                            </Box>
                        </Grid>

                        {/* Danh sách Role đã gán */}
                        <Grid item xs={12}>
                            <Box mt={4}>
                                <table className="table-list">
                                    <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th>Group</th>
                                            <th>Role</th>
                                            <th style={{ textAlign: "center" }}>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignedRoles.map((item, index) => (
                                            <tr key={`${item.group_id}-${item.role_id}`}>
                                                <td>{index + 1}</td>
                                                <td>{item.group_name}</td>
                                                <td>{item.roles.join(", ")}</td>
                                                <td style={{ textAlign: "center" }}>
                                                    <button
                                                        className="btn-edit"
                                                        onClick={() => handleEditRoles(item)}
                                                        style={{ marginRight: 8 }}
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => handleOpenDeleteRole(item)}
                                                    >
                                                        Xóa
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Box>
                        </Grid>
                    </Grid>
                </TabPanel>


                {/* Tab 2: Phân quyền Menu theo Role */}
                <TabPanel value={tabIndex} index={2}>
                    <Grid container spacing={3}>
                        {/* Chọn Role */}
                        <Grid item xs={12} md={6}>
                            <label style={{ color: "black", display: "block", marginBottom: "8px" }}>
                                Role
                            </label>
                            <select
                                value={selectedRoles}
                                onChange={(e) => setSelectedRoles(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    backgroundColor: "#f0f0f0",
                                    color: "black",
                                    border: "1px solid gray",
                                    outline: "none",
                                    fontSize: "16px",
                                }}
                            >
                                <option value="" disabled hidden>-- Chọn Role --</option>
                                {roles.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </Grid>

                        {/* Chọn Menus */}
                        <Grid item xs={12} md={6}>
                            <label style={{ color: "black", display: "block", marginBottom: "8px" }}>
                                Menu
                            </label>
                            {/* Container scroll cho danh sách checkbox */}
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                maxHeight: "200px",        // chiều cao tối đa
                                overflowY: "auto",         // bật thanh cuộn dọc nếu cần
                                border: "1px solid #ccc",  // tuỳ chọn, để phân biệt
                                padding: "8px",
                                borderRadius: "4px",
                                backgroundColor: "#f9f9f9" // nhẹ nhàng dễ nhìn
                            }}>
                                {uniqueMenusByName.map((menu) => (
                                    <label key={menu.id} style={{ display: "flex", alignItems: "center" }}>
                                        <input
                                            type="checkbox"
                                            value={menu.id}
                                            checked={selectedMenus.includes(menu.id)}
                                            onChange={(e) => {
                                                const value = menu.id;
                                                if (e.target.checked) {
                                                    setSelectedMenus([...selectedMenus, value]);
                                                } else {
                                                    setSelectedMenus(selectedMenus.filter((id) => id !== value));
                                                }
                                            }}
                                            style={{ marginRight: "8px" }}
                                        />
                                        {menu.name}, <p style={{ color: "red" }}>path: {menu.path}</p>
                                    </label>
                                ))}
                            </div>
                        </Grid>

                        {/* Nút phân quyền */}
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="flex-end">
                                <Button variant="contained" onClick={handleAssignMenus}
                                    
                                    sx={{ color: "white !important", fontSize: "16px" }}
                                   >
                                    GÁN QUYỀN MENU
                                </Button>
                            </Box>
                        </Grid>

                        {/* Danh sách Menu đã gán cho Role */}
                        <Grid item xs={12}>
                            <Box mt={4}>
                                <table className="table-list">
                                    <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th>Role</th>
                                            <th>Menu</th>
                                            <th style={{ textAlign: "center" }}>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignedMenus.map((item, index) => (
                                            <tr key={item.role_id}>
                                                <td>{index + 1}</td>
                                                <td>{item.role_name}</td>
                                                <td>{item.menus.join(", ")}</td>
                                                <td style={{ textAlign: "center" }}>
                                                    <button
                                                        className="btn-edit"
                                                        onClick={() => handleEditMenus(item)}
                                                        style={{ marginRight: 8 }}
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => handleOpenConfirmDelete(item.role_id)}
                                                    >
                                                        Xóa
                                                    </button>

                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                            </Box>
                        </Grid>
                    </Grid>
                </TabPanel>

            </Card>
        </DashboardLayout>
    );
}
