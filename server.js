const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'escola_db'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados MySQL com sucesso!');
    }
});

app.post('/alunos', (req, res) => {
    const { nome, email, nota1, nota2 } = req.body;

    if (!nome) return res.status(400).json({ erro: "O nome é obrigatório." });
    if (!email) return res.status(400).json({ erro: "O email é obrigatório." });
    if (nota1 === undefined) return res.status(400).json({ erro: "A nota 1 é obrigatória." });
    if (nota2 === undefined) return res.status(400).json({ erro: "A nota 2 é obrigatória." });

    if (typeof nota1 !== 'number' || typeof nota2 !== 'number') {
        return res.status(400).json({ erro: "As notas devem ser valores numéricos." });
    }

    if (nota1 < 0 || nota1 > 10 || nota2 < 0 || nota2 > 10) {
        return res.status(400).json({ erro: "As notas devem estar entre 0 e 10." });
    }

    const notaFinal = nota1 + nota2;
    const status = notaFinal >= 7 ? 'Aprovado' : 'Reprovado';

    const sql = 'INSERT INTO alunos (nome, email, nota1, nota2, notaFinal, status) VALUES (?, ?, ?, ?, ?, ?)';

    db.query(sql, [nome, email, nota1, nota2, notaFinal, status], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: "Erro ao salvar o aluno no banco de dados." });
        }

        res.status(201).json({
            id: result.insertId,
            nome: nome,
            notaFinal: notaFinal,
            status: status
        });
    });
});

app.get('/alunos', (req, res) => {
    const sql = 'SELECT * FROM alunos';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ erro: "Erro ao buscar alunos." });
        }

        res.status(200).json(results);
    });
});

app.get('/alunos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM alunos WHERE id = ?';

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: "Erro ao buscar o aluno." });
        }

        if (results.length === 0) {
            return res.status(404).json({ erro: "Aluno não encontrado." });
        }

        res.status(200).json(results[0]);
    });
});

app.listen(3000, () => {
    console.log('Servidor da API rodando na porta 3000 (http://localhost:3000)');
});