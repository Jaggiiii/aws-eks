import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth } from "./auth";
import cors from "cors";




const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());


const JWT_SECRET = process.env.JWT_SECRET as string;

/* ---------------- Signup ---------------- */
app.post("/api/v1/user/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.trim(), password: hashedPassword },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    return res.json({
      message: "User created",
      userId: user.id,
      token,
    });
  } catch (e: any) {
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

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(403).json({ message: "Wrong password" });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET);

  return res.json({ token });
});

/* ---------------- Balance ---------------- */
app.get("/api/v1/account/balance", auth, async (req: any, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });

  return res.json({ balance: user?.balance });
});

/* ---------------- Transfer ---------------- */
app.post("/api/v1/account/transfer", auth, async (req: any, res) => {
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
app.get("/api/v1/user/bulk", auth, async (req, res) => {
  const filter = (req.query.filter as string) || "";

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
