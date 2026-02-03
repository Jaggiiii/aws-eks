import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

const JWT_SECRET = "secret123";

/* ---------------- Signup ---------------- */
app.post("/api/v1/user/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    res.json({ message: "User created", userId: user.id });
  } catch {
    res.status(411).json({ message: "User already exists" });
  }
});

/* ---------------- Signin ---------------- */
app.post("/api/v1/user/signin", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.status(403).json({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(403).json({ message: "Wrong password" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET);

  res.json({ token });
});

/* ----------- Auth Middleware ----------- */
function auth(req: any, res: any, next: any) {
  const token = req.headers.authorization;

  if (!token) return res.status(403).json({ message: "No token" });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
}

/* ------------- Check Balance ------------ */
app.get("/api/v1/account/balance", auth, async (req: any, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });

  res.json({ balance: user?.balance });
});

/* -------------- Transfer Money ---------- */
app.post("/api/v1/account/transfer", auth, async (req: any, res) => {
  const { toEmail, amount } = req.body;

  const receiver = await prisma.user.findUnique({
    where: { email: toEmail },
  });

  if (!receiver) return res.status(404).send("Receiver not found");

  const sender = await prisma.user.findUnique({
    where: { id: req.userId },
  });

  if (!sender || sender.balance < amount)
    return res.status(400).send("Insufficient balance");

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

  res.send("Transfer successful");
});

app.listen(3000, () => console.log("Server running on port 3000"));
