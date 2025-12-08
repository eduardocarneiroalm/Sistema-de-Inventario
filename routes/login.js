import express from "express";
import pool from "../db/db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { usuario, senha } = req.body;

  console.log("REQ BODY:", req.body);

  if (!usuario || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos." });
  }

  try {
    const sql = "SELECT * FROM perfis WHERE usuario = ? AND senha = ?";
    const [resultado] = await pool.query(sql, [usuario, senha]);

    if (resultado.length === 0) {
      return res.status(401).json({ erro: "Usuário ou senha inválidos" });
    }

    const user = resultado[0];

    return res.json({
      mensagem: "Login realizado com sucesso",
      tipo: user.tipo,
      usuario: user.usuario
    });

  } catch (err) {
    console.error("ERRO LOGIN:", err);
    return res.status(500).json({ erro: "Erro no servidor" });
  }
});

export default router;