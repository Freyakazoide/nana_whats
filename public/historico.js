// public/historico.js (versão final corrigida)
document.addEventListener('DOMContentLoaded', () => {
    const historyTableBody = document.getElementById('historyTableBody');
    const modal = document.getElementById('deleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    let contactIdToDelete = null;

    async function carregarHistorico() {
        try {
            const response = await fetch('/api/historico');
            if (!response.ok) throw new Error('Falha ao buscar histórico');
            const historico = await response.json();
            
            historyTableBody.innerHTML = '';
            if (historico.length === 0) {
                historyTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum contato salvo ainda.</td></tr>';
            } else {
                historico.forEach(item => {
                    const row = document.createElement('tr');
                    const dataContato = new Date(item.data_contato).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

                    row.innerHTML = `
                        <td>${item.nome}</td>
                        <td>${item.produto}</td>
                        <td>${dataContato}</td>
                        <td><span class="status-badge status-${item.status}">${item.status}</span></td>
                        <td class="actions-cell">
                            <select class="status-select" data-id="${item.id}">
                                <option value="Pendente" ${item.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                                <option value="Respondido" ${item.status === 'Respondido' ? 'selected' : ''}>Respondido</option>
                                <option value="Finalizado" ${item.status === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
                            </select>
                            <button class="delete-btn" data-id="${item.id}" title="Deletar Contato">🗑️</button>
                        </td>
                    `;
                    historyTableBody.appendChild(row);
                });
            }
        } catch (error) {
            console.error("Erro ao carregar o histórico:", error);
            historyTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red;">Falha ao carregar histórico.</td></tr>';
        }
    }

    async function atualizarStatus(id, novoStatus) {
        // ... (função sem alterações)
        try {
            const response = await fetch(`/api/historico/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: novoStatus })
            });
            if (!response.ok) throw new Error('Falha na API de atualização');
            carregarHistorico();
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            alert("Não foi possível atualizar o status.");
        }
    }

    async function deletarContato(id) {
        // ... (função sem alterações)
        try {
            const response = await fetch(`/api/historico/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha na API de deleção');
            closeModal();
            carregarHistorico();
        } catch (error) {
            console.error("Erro ao deletar contato:", error);
            alert("Não foi possível deletar o contato.");
        }
    }

    function openModal(id) {
        contactIdToDelete = id;
        modal.classList.add('visible');
    }

    function closeModal() {
        contactIdToDelete = null;
        modal.classList.remove('visible');
    }
    
    // --- LÓGICA DE EVENTOS ATUALIZADA ---
    historyTableBody.addEventListener('change', (event) => {
        if (event.target.classList.contains('status-select')) {
            const id = event.target.dataset.id;
            const novoStatus = event.target.value;
            atualizarStatus(id, novoStatus);
        }
    });

    historyTableBody.addEventListener('click', (event) => {
        // *** MUDANÇA IMPORTANTE AQUI ***
        // Usamos .closest() para garantir que pegamos o botão, mesmo que o clique seja no ícone dentro dele.
        const deleteButton = event.target.closest('.delete-btn');
        if (deleteButton) {
            const id = deleteButton.dataset.id;
            openModal(id);
        }
    });

    cancelDeleteBtn.addEventListener('click', closeModal);
    confirmDeleteBtn.addEventListener('click', () => {
        if (contactIdToDelete) {
            deletarContato(contactIdToDelete);
        }
    });

    carregarHistorico();
});