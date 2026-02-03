"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("./auth");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const JWT_SECRET = process.env.JWT_SECRET;
/* ---------------- Signup ---------------- */
app.post("/api/v1/user/signup", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields required" });
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    try {
        const user = await prisma.user.create({
            data: { name: name.trim(), email: email.trim(), password: hashedPassword },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET);
        return res.json({
            message: "User created",
            userId: user.id,
            token,
        });
    }
    catch (e) {
        console.log("Signup error:", e);
        if (e.code === "P2002") {
            return res.status(411).json({ message: "User already exists" });
        }
        return res.status(500).json({ message: "Signup failed" });
    }
});
/* ---------------- Signin ---------------- */
app.post("/api/v1/user/signin", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email & password required" });
    }
    const user = await prisma.user.findUnique({
        where: { email: email.trim() },
    });
    if (!user) {
        return res.status(403).json({ message: "User not found" });
    }
    const valid = await bcrypt_1.default.compare(password, user.password);
    if (!valid) {
        return res.status(403).json({ message: "Wrong password" });
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET);
    return res.json({ token });
});
/* ---------------- Balance ---------------- */
app.get("/api/v1/account/balance", auth_1.auth, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.userId },
    });
    return res.json({ balance: user?.balance });
});
/* ---------------- Transfer ---------------- */
app.post("/api/v1/account/transfer", auth_1.auth, async (req, res) => {
    const { toEmail, amount } = req.body;
    if (!toEmail || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid transfer details" });
    }
    const receiver = await prisma.user.findUnique({
        where: { email: toEmail.trim() },
    });
    if (!receiver) {
        return res.status(404).send("Receiver not found");
    }
    const sender = await prisma.user.findUnique({
        where: { id: req.userId },
    });
    if (!sender || sender.balance < amount) {
        return res.status(400).send("Insufficient balance");
    }
    await prisma.$transaction([
        prisma.user.update({
            where: { id: sender.id },
            data: { balance: { decrement: amount } },
        }),
        prisma.user.update({
            where: { id: receiver.id },
            data: { balance: { increment: amount } },
        }),
    ]);
    return res.send("Transfer successful");
});
/* ---------------- Get Users ---------------- */
app.get("/api/v1/user/bulk", auth_1.auth, async (req, res) => {
    const filter = req.query.filter || "";
    const users = await prisma.user.findMany({
        where: {
            name: {
                contains: filter,
                mode: "insensitive",
            },
        },
        select: {
            id: true,
            name: true,
            email: true,
            balance: true,
        },
    });
    return res.json({ users });
});
/* ---------------- Easy Testing Route ---------------- */
app.get("/users", async (req, res) => {
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, balance: true },
    });
    return res.json(users);
});
/* ---------------- Start Server ---------------- */
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
