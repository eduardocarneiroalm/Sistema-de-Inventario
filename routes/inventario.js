import express from "express";
import pool from "../db/db.js";

const router = express.Router();

// ============================
// 1️⃣ ADICIONAR PRODUTO
// ============================
router.post("/adicionar", async (req, res) => {
    const { equipamento, quantidade, local } = req.body;

    if (!equipamento || !quantidade || !local) {
        return res.status(400).json({ erro: "Preencha todos os campos." });
    }

    try {
        // Verificar se local existe
        const buscarLocal = `SELECT id_locais FROM locais WHERE nome_locais = ?`;
        const [resultadoLocal] = await pool.query(buscarLocal, [local]);

        let idLocal;

        if (resultadoLocal.length > 0) {
            idLocal = resultadoLocal[0].id_locais;
        } else {
            // Criar local
            const criarLocal = `INSERT INTO locais (nome_locais) VALUES (?)`;
            const [resultadoCriar] = await pool.query(criarLocal, [local]);
            idLocal = resultadoCriar.insertId;
        }

        // Cadastrar produto
        const inserirProduto = `
            INSERT INTO produtos (nome, descricao, quantidade, id_local)
            VALUES (?, ?, ?, ?)
        `;

        await pool.query(inserirProduto, [
            equipamento,
            "Sem descrição",
            quantidade,
            idLocal
        ]);

        return res.json({ mensagem: "Produto cadastrado com sucesso!" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: "Erro ao adicionar produto." });
    }
});


// ============================
// 2️⃣ LISTAR PRODUTOS
// ============================
router.get("/listar", async (req, res) => {
    try {
        const sql = `
            SELECT 
                p.id_produtos,
                p.nome,
                p.descricao,
                p.quantidade,
                l.nome_locais AS local
            FROM produtos p
            JOIN locais l ON p.id_local = l.id_locais
        `;

        const [results] = await pool.query(sql);
        res.json(results);

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao listar produtos." });
    }
});


// ============================
// 3️⃣ EDITAR PRODUTO
// ============================
router.put("/editar/:id", async (req, res) => {
    const id = req.params.id;
    const { nome, quantidade, local } = req.body;

    try {
        // Buscar id_local
        const sqlLocal = "SELECT id_local FROM produtos WHERE id_produtos = ?";
        const [resultado] = await pool.query(sqlLocal, [id]);
        const idLocal = resultado[0].id_local;

        // Atualizar local
        const sqlUpdateLocal = "UPDATE locais SET nome_locais = ? WHERE id_locais = ?";
        await pool.query(sqlUpdateLocal, [local, idLocal]);

        // Atualizar produto
        const sqlUpdateProd = `
            UPDATE produtos 
            SET nome = ?, quantidade = ?
            WHERE id_produtos = ?
        `;

        await pool.query(sqlUpdateProd, [nome, quantidade, id]);

        res.json({ mensagem: "Produto atualizado com sucesso!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao editar produto." });
    }
});


// ============================
// 4️⃣ DELETAR PRODUTO
// ============================
router.delete("/deletar/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const sql = `DELETE FROM produtos WHERE id_produtos = ?`;
        await pool.query(sql, [id]);

        res.json({ mensagem: "Produto deletado!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao deletar produto." });
    }
});

export default router;