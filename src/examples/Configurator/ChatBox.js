// ChatBox.js
import React, { useState, useEffect, useRef } from "react";
import {
    Drawer,
    Box,
    Typography,
    TextField,
    IconButton,
    CircularProgress,
    InputAdornment,
    Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { getUserFromToken } from "../../utils/auth.js";
const ChatBox = ({ open, onClose, externalMessage }) => {
    const [aiInput, setAiInput] = useState("");
    const user = getUserFromToken();
    console.log("user:", user);

    const [messages, setMessages] = useState(() => {
        if (!user || !user.id) return []; // user chưa login
        const saved = localStorage.getItem(`chatMessages_${user.id}`);
        return saved ? JSON.parse(saved) : [];
    });

    // [{from: "user"|"ai", text: "..."}]
    const [loading, setLoading] = useState(false);
    const lastExternalRef = useRef("");
   


    // Scroll xuống cuối
    const bottomRef = useRef(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Hiển thị lời chào khi mở ChatBox lần đầu
    useEffect(() => {
        if (open && messages.length === 0) {
            setMessages([{ from: "ai", text: "Xin chào! Tôi có thể giúp gì cho bạn?" }]);
        }
    }, [open]);

    // Khi nhận externalMessage mới, lưu vào ref tạm
    useEffect(() => {
        if (externalMessage && externalMessage !== lastExternalRef.current) {
            console.log("externalMessage changed:", externalMessage);
            console.log("lastExternalRef:", lastExternalRef.current);
            console.log("open:", open);

            const newMessages = [...messages, { from: "ai", text: externalMessage }];
            setMessages(newMessages);

            // Cập nhật localStorage ngay lập tức
            if (user?.id) {
                localStorage.setItem(`chatMessages_${user.id}`, JSON.stringify(newMessages));
            }

            lastExternalRef.current = externalMessage;
        }
    }, [externalMessage]);

 
    useEffect(() => {
        if (open && user?.id) {
            const storedMessages = localStorage.getItem(`chatMessages_${user.id}`);
            if (storedMessages) {
                setMessages(JSON.parse(storedMessages));
                console.log("Loaded chat messages from localStorage:", storedMessages);
            }
        }
    }, [open, user?.id]);

    useEffect(() => {
        if (user?.id) {
            localStorage.setItem(`chatMessages_${user.id}`, JSON.stringify(messages));
        }
    }, [messages]);




    const handleAskAI = async () => {
        const question = aiInput.trim();
        if (!question) return;

        const newMessages = [...messages, { from: "user", text: question }];
        setMessages(newMessages);
        setAiInput("");
        setLoading(true);

        try {
            // Giới hạn context (ví dụ: 10 tin nhắn gần nhất)
            const MAX_CONTEXT = 10;
            const contextMessages = newMessages.slice(-MAX_CONTEXT);

            const formattedMessages = contextMessages.map((msg) => ({
                role: msg.from === "user" ? "user" : "assistant",
                content: msg.text,
            }));

            const res = await fetch("http://localhost:3001/api/ai/ask-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: formattedMessages,
                }),
            });

            const data = await res.json();

            setMessages((prev) => [...prev, { from: "ai", text: data.text || "Không có phản hồi từ AI" }]);
        } catch (error) {
            setMessages((prev) => [...prev, { from: "ai", text: "Đã xảy ra lỗi khi gửi tới AI." }]);
        }

        setLoading(false);
    };


    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAskAI();
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: 420,
                    height: "calc(100vh - 30px)", // Giảm chiều cao để cách đáy
                    marginTop: "auto",            // Đẩy lên phía trên
                    marginBottom: "30px",         // Cách đáy 30px
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    borderTopLeftRadius: "16px",  // Thêm nếu bạn muốn góc bo trên
                    borderBottomLeftRadius: "16px", // Thêm nếu bạn muốn góc bo dưới
                },
            }}
        >



            <Box height="100%" display="flex" flexDirection="column" flexGrow={1}>
                {/* Header */}
                <Box
                    p={2}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ background: "linear-gradient(to right, #6a11cb, #2575fc)", color: "white" }}
                >
                    <Typography variant="h6" color="white !important"
                        fontWeight="bold"
                        sx={{ flexGrow: 1 }}
                        fontSize="1.2rem"
                        fontFamily="'Noto sans', sans-serif"
                    >
                        💬 Hỗ trợ AI</Typography>
                    <IconButton onClick={onClose} sx={{ color: "white !important" }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider />

                {/* Messages */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        overflowX: "hidden",
                        bgcolor: "#f4f6f8",
                        padding: 2,
                    }}
                >

                    {messages.length === 0 && (
                        <Typography variant="body1" color="textSecondary">
                            Hỏi tôi bất cứ điều gì...
                        </Typography>
                    )}

                    {messages.map((msg, idx) => (
                        <Box
                            key={idx}
                            display="flex"
                            justifyContent={msg.from === "user" ? "flex-end" : "flex-start"}
                            mb={1.5}
                        >
                            <Box
                                px={2}
                                py={1}
                                maxWidth="75%"
                                borderRadius={2}
                                bgcolor={msg.from === "user" ? "#1976d2" : "#e0e0e0"}
                                color={msg.from === "user" ? "white!important" : "black"}
                                sx={{
                                    whiteSpace: "pre-wrap",
                                    fontFamily: "'Noto sans', sans-serif",
                                    fontSize: "0.9rem",
                                }}

                            >
                                {msg.text}
                            </Box>
                        </Box>
                    ))}

                    {loading && (
                        <Box display="flex" alignItems="center" gap={1}>
                            <CircularProgress size={18} />
                            <Typography variant="body2" color="textSecondary">
                                Đang xử lý...
                            </Typography>
                        </Box>
                    )}
                    <div ref={bottomRef} />
                </Box>

                {/* Input */}
                <Box
                    p={2} borderTop="1px solid black" bgcolor="#2575fc !important"
                    display="flex"
                    width="100%"
                    
                    alignItems="center"
                >
                    <TextField
                        sx={{
                            backgroundColor: "#fff",
                            borderRadius: 2,
                            width: '100% !important', // ← override lại width
                            "& .MuiOutlinedInput-root": {
                                paddingRight: "48px",
                            },
                            "& .MuiOutlinedInput-inputMultiline": {
                                padding: "10px 12px",
                                width: '100% !important', 
                                overflow: "auto !important", // ← override class nội bộ css-12ox7py
                               
                            },
                            "& .MuiInputBase-input": {
                                width: '100% !important', // ← override class nội bộ css-12ox7py
                            }
                        }}

                        fullWidth
                        multiline
                        minRows={1}
                        maxRows={4}
                        placeholder="Nhập câu hỏi..."
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={handleKeyDown}
           
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end"
                                   
                                >
                                    <IconButton onClick={handleAskAI} disabled={loading || !aiInput.trim()}>
                                        <SendIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </Box>
        </Drawer>
    );
};

export default ChatBox;
