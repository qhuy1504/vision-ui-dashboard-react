import { jwtDecode } from "jwt-decode";
import allRoutes from "../routes";

export const getUserFromToken = () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return null;

        const decoded = jwtDecode(token);
        // console.log("Decoded token:", decoded);
        if (!decoded || !decoded.id || !decoded.username) {
            return null;
        }
        return decoded; // chứa id, username, iat, exp
    } catch (err) {
        console.error("Lỗi giải mã token:", err);
        return null;
    }
};

export const logoutUser = () => {
    try {
        localStorage.removeItem("token"); // Xóa token khỏi localStorage
        console.log("Đã đăng xuất: token đã bị xóa");
    } catch (err) {
        console.error("Lỗi khi đăng xuất:", err);
    }
};
export const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // thời gian hiện tại tính bằng giây
       
        return decoded.exp > currentTime; // kiểm tra xem token còn hiệu lực không
    } catch (err) {
        console.error("Lỗi khi kiểm tra xác thực:", err);
        return false;
    }
};

const publicPathPrefixes = ["/jobs/"]; // Cho phép tất cả path bắt đầu bằng /jobs/

export const getFilteredRoutes = () => {
    // Lấy user từ token
    const user = getUserFromToken();
    console.log("User from token:", user);

    // Nếu là admin thì trả tất cả routes
    if (user && user.username === "admin") {
        console.log("User is admin, returning all routes");
        return allRoutes;
    }

    // Nếu không phải admin thì lọc theo menus
    let allowedPaths = [];

    try {
        const menus = JSON.parse(localStorage.getItem("menus") || "[]");
        allowedPaths = menus.map((m) => m.path);
    } catch (err) {
        console.error("Lỗi khi lấy menus từ localStorage:", err);
        return allRoutes; // fallback an toàn
    }

    return allRoutes.filter((route) => {
        const routePath = route.route;
        if (!routePath) return true;

        const isAuthRoute = routePath.startsWith("/authentication");
        const isAllowedByMenu = allowedPaths.includes(routePath);
        const isPublicPrefix = publicPathPrefixes.some((prefix) => routePath.startsWith(prefix));

        return isAuthRoute || isAllowedByMenu || isPublicPrefix;
    });
};



  
