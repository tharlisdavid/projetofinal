/**
 * Lógica da página de listagem
 */

document.addEventListener('DOMContentLoaded', async function() {
    // Elementos
    const tabelaCorpo = document.getElementById('tabela-corpo');
    const listaCards = document.getElementById('lista-cards');
    const estadoVazio = document.getElementById('estado-vazio');
    const contadorUsuarios = document.getElementById('contador-usuarios');
    const tabelaContainer = document.getElementById('tabela-container');

    // Cache de estados
    let estadosCache = [];
    let cidadesCache = {};

    // ID do usuário sendo editado
    let usuarioEditandoId = null;

    // Foto do usuário sendo editado
    let fotoUsuarioEdicao = null;

    // ========================================
    // INICIALIZAÇÃO
    // ========================================

    await carregarEstados();
    await renderizarLista();

    // ========================================
    // FUNÇÕES DE RENDERIZAÇÃO
    // ========================================

    async function renderizarLista() {
        const usuarios = await Storage.getUsuarios();

        // Debug: verificar dados
        console.log('Usuários carregados:', usuarios);

        // Atualizar contador
        const total = usuarios.length;
        contadorUsuarios.textContent = total === 0
            ? 'Nenhum usuário cadastrado'
            : total === 1
                ? '1 usuário cadastrado'
                : `${total} usuários cadastrados`;

        // Mostrar/esconder elementos
        if (total === 0) {
            tabelaContainer.style.display = 'none';
            listaCards.style.display = 'none';
            estadoVazio.style.display = 'block';
            return;
        }

        // Mostrar containers e esconder estado vazio
        estadoVazio.style.display = 'none';
        tabelaContainer.style.display = '';  // Mostra tabela (desktop)
        listaCards.style.display = '';       // CSS controla visibilidade mobile/desktop

        // Renderizar tabela (desktop)
        renderizarTabela(usuarios);

        // Renderizar cards (mobile)
        renderizarCards(usuarios);
    }

    function renderizarTabela(usuarios) {
        tabelaCorpo.innerHTML = '';

        usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            const fotoHtml = usuario.foto
                ? `<img src="${usuario.foto}" alt="Foto de ${escapeHtml(usuario.nome)}" class="usuario-foto">`
                : `<div class="usuario-foto-placeholder" aria-label="Sem foto">👤</div>`;

            tr.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        ${fotoHtml}
                        <strong>${escapeHtml(usuario.nome)} ${escapeHtml(usuario.sobrenome)}</strong>
                    </div>
                </td>
                <td>${escapeHtml(usuario.cpf)}</td>
                <td>${formatarLocalizacao(usuario)}</td>
                <td>${formatarData(usuario.criadoEm)}</td>
                <td>
                    <div class="tabela-acoes">
                        <button
                            type="button"
                            class="btn btn-secundario btn-sm btn-editar"
                            data-id="${usuario.id}"
                            aria-label="Editar ${usuario.nome} ${usuario.sobrenome}"
                        >
                            <span aria-hidden="true">✏️</span>
                            Editar
                        </button>
                        <button
                            type="button"
                            class="btn btn-perigo btn-sm btn-excluir"
                            data-id="${usuario.id}"
                            data-nome="${escapeHtml(usuario.nome)} ${escapeHtml(usuario.sobrenome)}"
                            aria-label="Excluir ${usuario.nome} ${usuario.sobrenome}"
                        >
                            <span aria-hidden="true">🗑️</span>
                            Excluir
                        </button>
                    </div>
                </td>
            `;
            tabelaCorpo.appendChild(tr);
        });

        // Adicionar event listeners aos botões
        adicionarEventListenersBotoes();
    }

    function renderizarCards(usuarios) {
        listaCards.innerHTML = '';

        usuarios.forEach(usuario => {
            const card = document.createElement('article');
            card.className = 'lista-card';
            const fotoHtml = usuario.foto
                ? `<img src="${usuario.foto}" alt="Foto de ${escapeHtml(usuario.nome)}" class="lista-card-foto">`
                : `<div class="lista-card-foto-placeholder" aria-label="Sem foto">👤</div>`;

            card.innerHTML = `
                <div class="lista-card-header">
                    ${fotoHtml}
                    <div style="flex: 1;">
                        <h3 class="lista-card-nome">${escapeHtml(usuario.nome)} ${escapeHtml(usuario.sobrenome)}</h3>
                        <span class="badge badge-primario">${formatarData(usuario.criadoEm)}</span>
                    </div>
                </div>
                <div class="lista-card-info">
                    <p><strong>CPF:</strong> ${escapeHtml(usuario.cpf)}</p>
                    <p><strong>Localização:</strong> ${formatarLocalizacao(usuario)}</p>
                    ${usuario.logradouro ? `<p><strong>Endereço:</strong> ${formatarEndereco(usuario)}</p>` : ''}
                </div>
                <div class="lista-card-acoes">
                    <button
                        type="button"
                        class="btn btn-secundario btn-editar"
                        data-id="${usuario.id}"
                        aria-label="Editar ${usuario.nome}"
                    >
                        <span aria-hidden="true">✏️</span>
                        Editar
                    </button>
                    <button
                        type="button"
                        class="btn btn-perigo btn-excluir"
                        data-id="${usuario.id}"
                        data-nome="${escapeHtml(usuario.nome)} ${escapeHtml(usuario.sobrenome)}"
                        aria-label="Excluir ${usuario.nome}"
                    >
                        <span aria-hidden="true">🗑️</span>
                        Excluir
                    </button>
                </div>
            `;
            listaCards.appendChild(card);
        });

        // Adicionar event listeners aos botões
        adicionarEventListenersBotoes();
    }

    function adicionarEventListenersBotoes() {
        // Botões de editar
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                abrirModalEdicao(id);
            });
        });

        // Botões de excluir
        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                const nome = this.dataset.nome;
                confirmarExclusao(id, nome);
            });
        });
    }

    // ========================================
    // FUNÇÕES DE EXCLUSÃO
    // ========================================

    function confirmarExclusao(id, nome) {
        mostrarConfirmacao(
            'Excluir Usuário',
            `Tem certeza que deseja excluir o usuário "${nome}"? Esta ação não pode ser desfeita.`,
            async () => {
                await Storage.excluirUsuario(id);
                await renderizarLista();
                mostrarNotificacao(`Usuário "${nome}" excluído com sucesso`, 'sucesso');
            }
        );
    }

    // ========================================
    // FUNÇÕES DE EDIÇÃO
    // ========================================

    async function abrirModalEdicao(id) {
        const usuario = await Storage.getUsuarioPorId(id);
        if (!usuario) {
            mostrarNotificacao('Usuário não encontrado', 'erro');
            return;
        }

        usuarioEditandoId = id;

        // Criar modal a partir do template
        const template = document.getElementById('template-modal-edicao');
        const modalClone = template.content.cloneNode(true);
        document.body.appendChild(modalClone);

        const overlay = document.querySelector('.modal-overlay');
        const form = document.getElementById('form-edicao');

        // Carregar estados no select do modal
        const editEstado = document.getElementById('edit-estado');
        editEstado.innerHTML = '<option value="">Selecione o estado</option>';
        estadosCache.forEach(estado => {
            const option = document.createElement('option');
            option.value = estado.sigla;
            option.textContent = estado.nome;
            editEstado.appendChild(option);
        });

        // Preencher campos com dados do usuário
        document.getElementById('edit-id').value = usuario.id;
        document.getElementById('edit-nome').value = usuario.nome;
        document.getElementById('edit-sobrenome').value = usuario.sobrenome;
        document.getElementById('edit-cpf').value = usuario.cpf;
        document.getElementById('edit-dataNascimento').value = usuario.dataNascimento || '';
        document.getElementById('edit-cep').value = usuario.cep || '';
        document.getElementById('edit-logradouro').value = usuario.logradouro || '';
        document.getElementById('edit-numero').value = usuario.numero || '';
        document.getElementById('edit-complemento').value = usuario.complemento || '';
        document.getElementById('edit-bairro').value = usuario.bairro || '';

        // Preencher foto
        fotoUsuarioEdicao = usuario.foto || null;
        const fotoPreview = document.getElementById('edit-foto-preview');
        const btnRemoverFoto = document.getElementById('edit-btn-remover-foto');
        if (usuario.foto) {
            fotoPreview.innerHTML = `<img src="${usuario.foto}" alt="Foto do usuário">`;
            btnRemoverFoto.style.display = 'inline-flex';
        } else {
            fotoPreview.innerHTML = '<span class="foto-placeholder" aria-hidden="true">👤</span>';
            btnRemoverFoto.style.display = 'none';
        }

        // Se tiver estado, selecionar e carregar cidades
        if (usuario.estado) {
            editEstado.value = usuario.estado;
            await carregarCidadesModal(usuario.estado, usuario.cidade);
        }

        // Event listeners de foto
        const editBtnCamera = document.getElementById('edit-btn-camera');
        const editBtnGaleria = document.getElementById('edit-btn-galeria');
        const editInputCamera = document.getElementById('edit-input-foto-camera');
        const editInputGaleria = document.getElementById('edit-input-foto-galeria');

        editBtnCamera.addEventListener('click', () => editInputCamera.click());
        editBtnGaleria.addEventListener('click', () => editInputGaleria.click());

        editInputCamera.addEventListener('change', (e) => handleFotoEdicao(e, fotoPreview, btnRemoverFoto));
        editInputGaleria.addEventListener('change', (e) => handleFotoEdicao(e, fotoPreview, btnRemoverFoto));

        btnRemoverFoto.addEventListener('click', () => {
            fotoUsuarioEdicao = null;
            fotoPreview.innerHTML = '<span class="foto-placeholder" aria-hidden="true">👤</span>';
            btnRemoverFoto.style.display = 'none';
            mostrarNotificacao('Foto removida', 'info');
        });

        // Event listeners do modal
        const editCPF = document.getElementById('edit-cpf');
        const editCPFAjuda = document.getElementById('edit-cpf-ajuda');

        // Máscara de CPF durante digitação
        editCPF.addEventListener('input', function(e) {
            e.target.value = mascaraCPF(e.target.value);
            // Limpar erro ao digitar
            document.getElementById('edit-cpf-erro').textContent = '';
            editCPF.classList.remove('invalido');
        });

        const editCEP = document.getElementById('edit-cep');
        const editCEPIcone = document.getElementById('edit-cep-icone');
        const editCEPAjuda = document.getElementById('edit-cep-ajuda');
        const editCEPErro = document.getElementById('edit-cep-erro');

        editCEP.addEventListener('input', function(e) {
            e.target.value = mascaraCEP(e.target.value);
            editCEPErro.textContent = '';
            editCEP.classList.remove('invalido', 'valido');
        });

        editCEP.addEventListener('blur', async function() {
            const cep = this.value.replace(/\D/g, '');
            if (cep.length === 8) {
                // Mostrar loading
                editCEPIcone.textContent = '⏳';
                editCEPIcone.classList.add('carregando');
                editCEPAjuda.textContent = 'Buscando endereço...';

                try {
                    const endereco = await buscarCEP(cep);
                    document.getElementById('edit-logradouro').value = endereco.logradouro;
                    document.getElementById('edit-bairro').value = endereco.bairro;
                    if (endereco.estado) {
                        editEstado.value = endereco.estado;
                        await carregarCidadesModal(endereco.estado, endereco.cidade);
                    }
                    editCEP.classList.add('valido');
                    editCEP.classList.remove('invalido');
                    editCEPAjuda.textContent = 'Endereço encontrado!';
                    mostrarNotificacao('Endereço preenchido automaticamente!', 'sucesso');
                } catch (error) {
                    editCEPErro.textContent = error.message;
                    editCEP.classList.add('invalido');
                    editCEP.classList.remove('valido');
                    editCEPAjuda.textContent = 'Digite o CEP para buscar o endereço';
                } finally {
                    editCEPIcone.textContent = '🔍';
                    editCEPIcone.classList.remove('carregando');
                }
            }
        });

        editEstado.addEventListener('change', async function() {
            const uf = this.value;
            const editCidadeAjuda = document.getElementById('edit-cidade-ajuda');
            if (uf) {
                await carregarCidadesModal(uf);
            } else {
                garantirCidadeComoSelectModal();
                const editCidade = document.getElementById('edit-cidade');
                editCidade.innerHTML = '<option value="">Selecione primeiro o estado</option>';
                editCidade.disabled = true;
                editCidadeAjuda.textContent = '';
            }
        });

        // Botão cancelar
        const btnCancelar = document.getElementById('btn-cancelar-edicao');
        if (btnCancelar) {
            btnCancelar.onclick = function() {
                fecharModalEdicao();
            };
        }

        // Fechar ao clicar fora
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                fecharModalEdicao();
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') {
                fecharModalEdicao();
                document.removeEventListener('keydown', handler);
            }
        });

        // Submissão do formulário de edição
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (await validarFormularioEdicao()) {
                const dadosAtualizados = {
                    nome: document.getElementById('edit-nome').value.trim(),
                    sobrenome: document.getElementById('edit-sobrenome').value.trim(),
                    cpf: document.getElementById('edit-cpf').value,
                    dataNascimento: document.getElementById('edit-dataNascimento').value,
                    cep: document.getElementById('edit-cep').value,
                    logradouro: document.getElementById('edit-logradouro').value.trim(),
                    numero: document.getElementById('edit-numero').value.trim(),
                    complemento: document.getElementById('edit-complemento').value.trim(),
                    bairro: document.getElementById('edit-bairro').value.trim(),
                    estado: document.getElementById('edit-estado').value,
                    cidade: document.getElementById('edit-cidade').value,
                    foto: fotoUsuarioEdicao
                };

                mostrarConfirmacao(
                    'Confirmar Edição',
                    `Deseja salvar as alterações do usuário ${dadosAtualizados.nome} ${dadosAtualizados.sobrenome}?`,
                    async () => {
                        await Storage.atualizarUsuario(usuarioEditandoId, dadosAtualizados);
                        fecharModalEdicao();
                        await renderizarLista();
                        // Mostrar modal de aniversário
                        const nomeCompleto = `${dadosAtualizados.nome} ${dadosAtualizados.sobrenome}`;
                        mostrarModalAniversario(nomeCompleto, dadosAtualizados.dataNascimento);
                    }
                );
            }
        });

        // Focar no primeiro campo
        document.getElementById('edit-nome').focus();
    }

    async function carregarCidadesModal(uf, cidadeSelecionada = '') {
        let editCidade = document.getElementById('edit-cidade');
        const editCidadeAjuda = document.getElementById('edit-cidade-ajuda');

        // Se já foi convertido para input, apenas atualizar valor
        if (editCidade.tagName === 'INPUT') {
            editCidade.value = cidadeSelecionada;
            return;
        }

        editCidade.disabled = true;
        editCidade.innerHTML = '<option value="">Carregando...</option>';
        editCidadeAjuda.textContent = 'Carregando cidades...';

        try {
            if (!cidadesCache[uf]) {
                cidadesCache[uf] = await buscarCidadesPorEstado(uf);
            }

            const resultado = cidadesCache[uf];

            // Se API falhou ou não retornou cidades, converter para input
            if (!resultado.sucesso || resultado.cidades.length === 0) {
                converterCidadeParaInputModal(cidadeSelecionada);
                editCidadeAjuda.textContent = 'Digite o nome da cidade';
                return;
            }

            editCidade.innerHTML = '<option value="">Selecione a cidade</option>';
            resultado.cidades.forEach(cidade => {
                const option = document.createElement('option');
                option.value = cidade.nome;
                option.textContent = cidade.nome;
                if (cidade.nome === cidadeSelecionada) {
                    option.selected = true;
                }
                editCidade.appendChild(option);
            });

            editCidade.disabled = false;
            editCidadeAjuda.textContent = `${resultado.cidades.length} cidades disponíveis`;
        } catch (error) {
            // Em caso de erro, converter para input
            converterCidadeParaInputModal(cidadeSelecionada);
            editCidadeAjuda.textContent = 'Digite o nome da cidade';
        }
    }

    function converterCidadeParaInputModal(valorInicial = '') {
        const selectCidade = document.getElementById('edit-cidade');
        if (!selectCidade || selectCidade.tagName === 'INPUT') return;

        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'edit-cidade';
        input.name = 'cidade';
        input.className = 'campo-input';
        input.placeholder = 'Digite o nome da cidade';
        input.value = valorInicial;

        selectCidade.replaceWith(input);
    }

    function garantirCidadeComoSelectModal() {
        const editCidade = document.getElementById('edit-cidade');
        if (editCidade && editCidade.tagName === 'INPUT') {
            const select = document.createElement('select');
            select.id = 'edit-cidade';
            select.name = 'cidade';
            select.className = 'campo-select';
            select.disabled = true;
            select.innerHTML = '<option value="">Selecione primeiro o estado</option>';
            editCidade.replaceWith(select);
        }
    }

    async function validarFormularioEdicao() {
        let valido = true;

        const nome = document.getElementById('edit-nome');
        const sobrenome = document.getElementById('edit-sobrenome');
        const cpf = document.getElementById('edit-cpf');
        const cpfErro = document.getElementById('edit-cpf-erro');

        // Limpar erros anteriores
        document.querySelectorAll('.modal .campo-erro').forEach(span => {
            span.textContent = '';
        });
        document.querySelectorAll('.modal .campo-input').forEach(input => {
            input.classList.remove('invalido');
        });

        // Validar nome
        if (!nome.value.trim()) {
            document.getElementById('edit-nome-erro').textContent = 'Nome é obrigatório';
            nome.classList.add('invalido');
            valido = false;
        } else if (nome.value.trim().length < 2) {
            document.getElementById('edit-nome-erro').textContent = 'Mínimo de 2 caracteres';
            nome.classList.add('invalido');
            valido = false;
        }

        // Validar sobrenome
        if (!sobrenome.value.trim()) {
            document.getElementById('edit-sobrenome-erro').textContent = 'Sobrenome é obrigatório';
            sobrenome.classList.add('invalido');
            valido = false;
        } else if (sobrenome.value.trim().length < 2) {
            document.getElementById('edit-sobrenome-erro').textContent = 'Mínimo de 2 caracteres';
            sobrenome.classList.add('invalido');
            valido = false;
        }

        // Validar CPF
        const cpfLimpo = cpf.value.replace(/\D/g, '');
        if (!cpf.value.trim()) {
            cpfErro.textContent = 'CPF é obrigatório';
            cpf.classList.add('invalido');
            valido = false;
        } else if (cpfLimpo.length < 11) {
            cpfErro.textContent = 'CPF incompleto';
            cpf.classList.add('invalido');
            valido = false;
        } else if (!validarCPF(cpfLimpo)) {
            cpfErro.textContent = 'CPF inválido';
            cpf.classList.add('invalido');
            valido = false;
        } else {
            // Verificar se CPF já existe (exceto o usuário atual)
            const usuarios = await Storage.getUsuarios();
            const cpfExiste = usuarios.some(u =>
                u.cpf.replace(/\D/g, '') === cpfLimpo && u.id !== usuarioEditandoId
            );

            if (cpfExiste) {
                cpfErro.textContent = 'Este CPF já está cadastrado';
                cpf.classList.add('invalido');
                valido = false;
            } else {
                // Validar CPF via API (se o CPF mudou)
                const usuarioAtual = await Storage.getUsuarioPorId(usuarioEditandoId);
                const cpfMudou = usuarioAtual && usuarioAtual.cpf.replace(/\D/g, '') !== cpfLimpo;

                if (cpfMudou) {
                    cpfErro.textContent = 'Verificando CPF...';
                    cpf.classList.add('validando');

                    try {
                        const resultado = await validarCPFReal(cpfLimpo);

                        if (!resultado.valido) {
                            cpfErro.textContent = resultado.mensagem || 'CPF não encontrado na base de dados';
                            cpf.classList.add('invalido');
                            valido = false;
                        } else {
                            cpfErro.textContent = '';
                            if (resultado.fonte === 'api') {
                                mostrarNotificacao('CPF verificado com sucesso!', 'sucesso');
                            }
                        }
                    } catch (error) {
                        console.error('Erro ao validar CPF:', error);
                        // Em caso de erro, aceita com validação local
                        cpfErro.textContent = '';
                    } finally {
                        cpf.classList.remove('validando');
                    }
                }
            }
        }

        // Validar Data de Nascimento
        const dataNascimento = document.getElementById('edit-dataNascimento');
        const dataNascimentoErro = document.getElementById('edit-dataNascimento-erro');
        if (!dataNascimento.value) {
            dataNascimentoErro.textContent = 'Data de nascimento é obrigatória';
            dataNascimento.classList.add('invalido');
            valido = false;
        } else {
            const dataNasc = new Date(dataNascimento.value + 'T00:00:00');
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            if (dataNasc > hoje) {
                dataNascimentoErro.textContent = 'Data não pode ser no futuro';
                dataNascimento.classList.add('invalido');
                valido = false;
            } else {
                dataNascimentoErro.textContent = '';
                dataNascimento.classList.remove('invalido');
            }
        }

        if (!valido) {
            // Mostrar erro com vibração no mobile
            mostrarErroFormulario('Por favor, corrija os erros no formulário');
            // Focar no primeiro campo com erro
            const primeiroErro = document.querySelector('.modal .campo-input.invalido');
            if (primeiroErro) {
                primeiroErro.focus();
            }
        }

        return valido;
    }

    function fecharModalEdicao() {
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) {
            overlay.classList.add('modal-fade-out');
            setTimeout(() => overlay.remove(), 200);
        }
        usuarioEditandoId = null;
    }

    // ========================================
    // FUNÇÕES DE FOTO
    // ========================================

    function handleFotoEdicao(event, fotoPreview, btnRemoverFoto) {
        const file = event.target.files[0];
        if (!file) return;

        // Verificar se é uma imagem
        if (!file.type.startsWith('image/')) {
            mostrarErroFormulario('Por favor, selecione um arquivo de imagem válido.');
            return;
        }

        // Verificar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            mostrarErroFormulario('A imagem deve ter no máximo 5MB.');
            return;
        }

        // Redimensionar e converter para base64
        redimensionarImagemEdicao(file, 300, 300, (base64) => {
            fotoUsuarioEdicao = base64;
            fotoPreview.innerHTML = `<img src="${base64}" alt="Foto do usuário">`;
            btnRemoverFoto.style.display = 'inline-flex';
            mostrarNotificacao('Foto atualizada com sucesso!', 'sucesso');
        });

        // Limpar input
        event.target.value = '';
    }

    function redimensionarImagemEdicao(file, maxWidth, maxHeight, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calcular dimensões mantendo proporção
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Converter para base64 com qualidade reduzida
                const base64 = canvas.toDataURL('image/jpeg', 0.8);
                callback(base64);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // ========================================
    // FUNÇÕES AUXILIARES
    // ========================================

    async function carregarEstados() {
        try {
            if (estadosCache.length === 0) {
                estadosCache = await buscarEstados();
            }
        } catch (error) {
            console.error('Erro ao carregar estados:', error);
        }
    }

    function formatarLocalizacao(usuario) {
        if (usuario.cidade && usuario.estado) {
            return `${escapeHtml(usuario.cidade)}/${escapeHtml(usuario.estado)}`;
        }
        if (usuario.estado) {
            return escapeHtml(usuario.estado);
        }
        return '-';
    }

    function formatarEndereco(usuario) {
        const partes = [];
        if (usuario.logradouro) partes.push(usuario.logradouro);
        if (usuario.numero) partes.push(usuario.numero);
        if (usuario.bairro) partes.push(usuario.bairro);
        return escapeHtml(partes.join(', ')) || '-';
    }

    function formatarData(dataISO) {
        if (!dataISO) return '-';
        const data = new Date(dataISO);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
