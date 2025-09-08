// server.js
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS contatos_historico (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            telefone TEXT NOT NULL,
            documento TEXT,
            produto TEXT,
            data_vencimento TEXT,
            status TEXT DEFAULT 'Pendente', -- NOVA COLUNA
            data_contato DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/historico', (req, res) => {
    const { nome, telefone, doc, produto, validade } = req.body;
    const sql = `INSERT INTO contatos_historico (nome, telefone, documento, produto, data_vencimento) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [nome, telefone, doc, produto, validade], function(err) {
        if (err) { return res.status(500).json({ error: 'Falha ao salvar no banco de dados' }); }
        res.status(201).json({ id: this.lastID });
    });
});

app.get('/api/historico', (req, res) => {
    // Agora selecionamos também o ID e o STATUS
    const sql = `SELECT id, nome, telefone, produto, status, data_contato FROM contatos_historico ORDER BY data_contato DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) { return res.status(500).json({ error: 'Falha ao buscar dados' }); }
        res.status(200).json(rows);
    });
});

// *** NOVA ROTA PARA ATUALIZAR STATUS ***
app.patch('/api/historico/:id', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    const sql = `UPDATE contatos_historico SET status = ? WHERE id = ?`;
    db.run(sql, [status, id], function(err) {
        if (err) { return res.status(500).json({ error: 'Falha ao atualizar o status' }); }
        if (this.changes === 0) { return res.status(404).json({ error: 'Contato não encontrado' });}
        res.status(200).json({ message: 'Status atualizado com sucesso' });
    });
});

// *** NOVA ROTA PARA DELETAR CONTATO ***
app.delete('/api/historico/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM contatos_historico WHERE id = ?`;
    db.run(sql, [id], function(err) {
        if (err) { return res.status(500).json({ error: 'Falha ao deletar o contato' }); }
        if (this.changes === 0) { return res.status(404).json({ error: 'Contato não encontrado' });}
        res.status(200).json({ message: 'Contato deletado com sucesso' });
    });
});


app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });
app.get('/historico', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'historico.html')); });

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});