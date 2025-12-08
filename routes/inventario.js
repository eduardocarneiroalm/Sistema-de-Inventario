import express from 'express';
import db from '../db/db.js';

const router = express.Router();


router.post('/adicionar', (req, res) => {
    const { equipamento, quantidade, local } = req.body;

    if (!equipamento || !quantidade || !local) {
        return res.status(400).json({ erro: 'Preencha todos os campos.' });
    }

    // 1. Primeiro: verificar se o local existe
    const buscarLocal = `SELECT id_locais FROM locais WHERE nome_locais = ?`;

    db.query(buscarLocal, [local], (err, resultadoLocal) => {
        if (err) return res.status(500).json({ erro: err });

        let idLocal;

        if (resultadoLocal.length > 0) {
            // Local encontrado
            idLocal = resultadoLocal[0].id_locais;
            cadastrarProduto();
        } else {
            // Local não existe → criar novo
            const criarLocal = `INSERT INTO locais (nome_locais) VALUES (?)`;

            db.query(criarLocal, [local], (erroCriar, resultadoCriar) => {
                if (erroCriar) return res.status(500).json({ erro: erroCriar });

                idLocal = resultadoCriar.insertId;
                cadastrarProduto();
            });
        }

        function cadastrarProduto() {
            const inserirProduto = `
                INSERT INTO produtos (nome, descricao, quantidade, id_local)
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                inserirProduto,
                [equipamento, 'Sem descrição', quantidade, idLocal],
                (erroProd) => {
                    if (erroProd) return res.status(500).json({ erro: erroProd });

                    res.json({ mensagem: 'Produto cadastrado com sucesso!' });
                }
            );
        }
    });
});


// ============================
// 2️⃣ LISTAR TODOS OS PRODUTOS
// ============================
router.get('/listar', (req, res) => {
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

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ erro: err });

        res.json(results);
    });
});


// ============================
// 3️⃣ EDITAR PRODUTO
// ============================
router.put('/editar/:id', (req, res) => {
    const id = req.params.id;
    const { nome, quantidade, local } = req.body;

    // 1 - Buscar id_local da tabela de produtos
    const sqlLocal = "SELECT id_local FROM produtos WHERE id_produtos = ?";

    db.query(sqlLocal, [id], (err, resultado) => {
        if (err) return res.status(500).json({ erro: err });

        const idLocal = resultado[0].id_local;

        // 2 - Atualizar o nome do local na tabela 'locais'
        const sqlUpdateLocal = "UPDATE locais SET nome_locais = ? WHERE id_locais = ?";

        db.query(sqlUpdateLocal, [local, idLocal], (err2) => {
            if (err2) return res.status(500).json({ erro: err2 });

            // 3 - Atualizar produto
            const sqlUpdateProd = `
                UPDATE produtos 
                SET nome = ?, quantidade = ? 
                WHERE id_produtos = ?
            `;

            db.query(sqlUpdateProd, [nome, quantidade, id], (err3) => {
                if (err3) return res.status(500).json({ erro: err3 });

                res.json({ mensagem: "Produto atualizado com sucesso!" });
            });
        });
    });
});


// ============================
// 4️⃣ DELETAR PRODUTO
// ============================
router.delete('/deletar/:id', (req, res) => {
    const id = req.params.id;

    const sql = `DELETE FROM produtos WHERE id_produtos = ?`;

    db.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ erro: err });
        res.json({ mensagem: 'Produto deletado!' });
    });
});


export default router;