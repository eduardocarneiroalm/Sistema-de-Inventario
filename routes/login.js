import express from "express";
import db from "../db/db.js";

const router = express.Router();

router.post("/", (req, res) => {
  const { usuario, senha } = req.body;

  console.log("REQ BODY:", req.body);

  if (!usuario || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos." });
  }

  const sql = "SELECT * FROM perfis WHERE usuario = ? AND senha = ?";

  db.query(sql, [usuario, senha], (err, resultado) => {
    if (err) {
      console.error("ERRO SQL:", err);
      return res.status(500).json({ erro: "Erro no servidor" });
    }

    if (resultado.length === 0) {
      return res.status(401).json({ erro: "Usuário ou senha inválidos" });
    }

    const user = resultado[0];

    return res.json({
      mensagem: "Login realizado com sucesso",
      tipo: user.tipo,
      usuario: user.usuario
    });
  });
});

export default router;