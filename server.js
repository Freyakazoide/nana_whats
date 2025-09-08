// server.js (versão final para Vercel com Neon)
const express = require('express');
const path = require('path');
const { sql } = require('@vercel/postgres'); // Importa a biblioteca correta

const app = express();
const PORT = process.env.PORT || 3000;

// Função para criar a tabela se ela não existir
async function createTableIfNotExists() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS contatos_historico (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                telefone VARCHAR(20) NOT NULL,
                documento VARCHAR(20),
                produto VARCHAR(255),
                data_vencimento VARCHAR(20),
                status VARCHAR(20) DEFAULT 'Pendente',
                data_contato TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;
        console.log("Tabela 'contatos_historico' verificada/criada com sucesso.");
    } catch (error) {
        console.error("Erro ao criar a tabela:", error);
    }
}

// Executa a função de criação da tabela ao iniciar
createTableIfNotExists();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rota POST para salvar
app.post('/api/historico', async (req, res) => {
    try {
        const { nome, telefone, doc, produto, validade } = req.body;
        await sql`
            INSERT INTO contatos_historico (nome, telefone, documento, produto, data_vencimento) 
            VALUES (${nome}, ${telefone}, ${doc}, ${produto}, ${validade});
        `;
        res.status(201).json({ message: 'Contato salvo com sucesso' });
    } catch (error) {
        console.error('Erro ao inserir no banco:', error);
        res.status(500).json({ error: 'Falha ao salvar no banco de dados' });
    }
});

// Rota GET para buscar
app.get('/api/historico', async (req, res) => {
    try {
        const { rows } = await sql`SELECT * FROM contatos_historico ORDER BY data_contato DESC;`;
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar no banco:', error);
        res.status(500).json({ error: 'Falha ao buscar dados' });
    }
});

// Rota PATCH para atualizar
app.patch('/api/historico/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        await sql`UPDATE contatos_historico SET status = ${status} WHERE id = ${id};`;
        res.status(200).json({ message: 'Status atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ error: 'Falha ao atualizar o status' });
    }
});

// Rota DELETE
app.delete('/api/historico/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await sql`DELETE FROM contatos_historico WHERE id = ${id};`;
        res.status(200).json({ message: 'Contato deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar contato:', error);
        res.status(500).json({ error: 'Falha ao deletar o contato' });
    }
});

// Rotas para servir as páginas HTML
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });
app.get('/historico', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'historico.html')); });

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});