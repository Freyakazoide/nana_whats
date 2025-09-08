// public/gerador.js
document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const generateBtn = document.getElementById('generateBtn');
    const linksContainer = document.getElementById('linksContainer');

    generateBtn.addEventListener('click', () => {
        const linhas = inputText.value.trim().split('\n').filter(linha => linha.trim() !== '');
        
        if (linhas.length === 0) {
            linksContainer.innerHTML = '<p class="placeholder">Nenhum dado inserido.</p>';
            return;
        }

        linksContainer.innerHTML = '';

        linhas.forEach((linha, index) => {
            const colunas = linha.split('\t');
            const cliente = {
                telefone: colunas[0] || '',
                nome: colunas[1] || '',
                doc: colunas[2] || '',
                produto: colunas[3] || '',
                validade: colunas[4] || '',
                id: `cliente-${index}`
            };

            const link = gerarLinkWhatsapp(cliente);
            const elementoCliente = document.createElement('div');
            elementoCliente.className = 'cliente-item';
            elementoCliente.id = cliente.id;

            elementoCliente.innerHTML = `
                <div class="cliente-info">
                    <strong>${cliente.nome}</strong><br>
                    <span>${cliente.produto} - Vence em: ${cliente.validade}</span><br>
                    <a href="${link}" target="_blank" rel="noopener noreferrer">Abrir conversa</a>
                </div>
                <button class="contact-btn">Salvar Contato</button>
            `;
            linksContainer.appendChild(elementoCliente);

            elementoCliente.querySelector('.contact-btn').addEventListener('click', (e) => {
                marcarComoContatado(e.target, cliente);
            });
        });
    });

    // *** FUNÇÃO CORRIGIDA ***
    function gerarLinkWhatsapp(cliente) {
        // Agora todos os dados do objeto cliente são usados corretamente.
        const mensagem = `Bom dia, tudo bem? Aqui é o Nailton, entrando em contato para informar que seu serviço *${cliente.produto}* com os dados *${cliente.doc}* - *${cliente.nome}*, com vencimento em *${cliente.validade}* está prestes a vencer.\n\nAssim, gostaria de saber se podemos providenciar a renovação para continuar com a utilização normal!\n\nMuito obrigado!`;
        const numeroLimpo = cliente.telefone.replace(/\D/g, '');
        const numeroFinal = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
        return `https://wa.me/${numeroFinal}?text=${encodeURIComponent(mensagem)}`;
    }

    async function marcarComoContatado(botao, cliente) {
        botao.disabled = true;
        botao.textContent = 'Salvando...';
        try {
            const response = await fetch('/api/historico', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cliente)
            });
            if (!response.ok) throw new Error('Falha na API');
            botao.textContent = 'Salvo!';
            document.getElementById(cliente.id).classList.add('contatado');
        } catch (error) {
            console.error("Erro:", error);
            alert("Falha ao salvar o contato.");
            botao.disabled = false;
            botao.textContent = 'Salvar Contato';
        }
    }
});