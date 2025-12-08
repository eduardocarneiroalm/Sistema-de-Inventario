import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import loginRoutes from "./routes/login.js";
import inventarioRoutes from "./routes/inventario.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3030;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "front", "public")));

// Rotas
app.use("/login", loginRoutes);
app.use("/inventario", inventarioRoutes);

// Página inicial = login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "front", "public", "login", "index.html"));
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});