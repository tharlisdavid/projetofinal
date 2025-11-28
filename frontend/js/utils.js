/**
 * Utilitários para validação e formatação
 */

// ========================================
// CONFIGURAÇÃO DA API
// ========================================
// Para obter seu token gratuito, cadastre-se em: https://api.invertexto.com
// Após o cadastro, vá em "Tokens" e copie seu token
const CONFIG = {
    // Substitua pelo seu token da API Invertexto
    INVERTEXTO_TOKEN: '23192|NMAManftvgevFF0MA742rrBMus5dRM0q',

    // Modo de validação: 'api' para usar API real, 'local' para apenas validação matemática
    MODO_VALIDACAO_CPF: 'api',

    // URL base da API do servidor
    API_URL: '/api/usuarios'
};

// Cache de CPFs já validados (evita chamadas repetidas à API)
const cpfValidadosCache = new Map();

// ========================================
// VALIDAÇÃO DE CPF
// ========================================

// Validação matemática de CPF (algoritmo dos dígitos verificadores)
function validarCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;

    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
}

// Validação de CPF via API (verifica se é um CPF real/existente)
async function validarCPFReal(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');

    // Primeiro, validação matemática
    if (!validarCPF(cpf)) {
        return {
            valido: false,
            mensagem: 'CPF inválido (falha na validação matemática)',
            fonte: 'local'
        };
    }

    // Se modo for local, retorna apenas validação matemática
    if (CONFIG.MODO_VALIDACAO_CPF === 'local') {
        return {
            valido: true,
            mensagem: 'CPF válido (validação local)',
            fonte: 'local'
        };
    }

    // Verificar cache
    if (cpfValidadosCache.has(cpf)) {
        return cpfValidadosCache.get(cpf);
    }

    // Verificar se token está configurado
    if (CONFIG.INVERTEXTO_TOKEN === 'SEU_TOKEN_AQUI') {
        console.warn('Token da API Invertexto não configurado. Usando validação local.');
        return {
            valido: true,
            mensagem: 'CPF válido (token não configurado, usando validação local)',
            fonte: 'local',
            aviso: 'Configure o token da API para validação completa'
        };
    }

    try {
        const response = await fetch(
            `https://api.invertexto.com/v1/validator?token=${CONFIG.INVERTEXTO_TOKEN}&value=${cpf}&type=cpf`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Token inválido ou expirado');
            }
            if (response.status === 429) {
                throw new Error('Limite de requisições excedido. Tente novamente mais tarde.');
            }
            throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();

        const resultado = {
            valido: data.valid === true,
            mensagem: data.valid ? 'CPF válido e verificado' : 'CPF não encontrado ou inválido na base de dados',
            fonte: 'api',
            dados: data
        };

        // Armazenar no cache
        cpfValidadosCache.set(cpf, resultado);

        return resultado;

    } catch (error) {
        console.error('Erro ao validar CPF via API:', error);

        // Em caso de erro na API, faz fallback para validação local
        return {
            valido: true,
            mensagem: 'CPF válido (validação local - API indisponível)',
            fonte: 'local',
            erro: error.message
        };
    }
}

// Limpar cache de CPFs validados
function limparCacheCPF() {
    cpfValidadosCache.clear();
}

// Máscara de CPF
function mascaraCPF(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.substring(0, 11);
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return valor;
}

// Máscara de CEP
function mascaraCEP(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.substring(0, 8);
    valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
    return valor;
}

// Buscar endereço pelo CEP (ViaCEP)
async function buscarCEP(cep) {
    cep = cep.replace(/\D/g, '');
    if (cep.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            throw new Error('CEP não encontrado');
        }

        return {
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || ''
        };
    } catch (error) {
        throw new Error('Erro ao buscar CEP: ' + error.message);
    }
}

// Lista estática de estados brasileiros (fallback para quando a API falhar)
const ESTADOS_BRASIL = [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' }
];

// Buscar estados do Brasil (IBGE com fallback)
async function buscarEstados() {
    try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
        if (!response.ok) throw new Error('API indisponível');
        return await response.json();
    } catch (error) {
        console.warn('Usando lista estática de estados (API IBGE indisponível):', error.message);
        return ESTADOS_BRASIL;
    }
}

// Buscar cidades por estado (IBGE)
async function buscarCidadesPorEstado(uf) {
    try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
        if (!response.ok) throw new Error('API indisponível');
        const data = await response.json();
        return { sucesso: true, cidades: data };
    } catch (error) {
        console.warn('Erro ao buscar cidades (API IBGE):', error.message);
        return { sucesso: false, cidades: [] };
    }
}

// Gerar ID único
function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Gerenciamento de dados via API
const Storage = {
    // Cache local para evitar requisições repetidas
    _cache: null,
    _cacheTimestamp: 0,
    _cacheDuration: 5000, // 5 segundos

    async getUsuarios() {
        try {
            const response = await fetch(CONFIG.API_URL);
            if (!response.ok) throw new Error('Erro ao buscar usuários');
            const usuarios = await response.json();
            this._cache = usuarios;
            this._cacheTimestamp = Date.now();
            return usuarios;
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            return this._cache || [];
        }
    },

    async salvarUsuario(usuario) {
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuario)
            });
            if (!response.ok) throw new Error('Erro ao salvar usuário');
            const novoUsuario = await response.json();
            this._cache = null; // Invalidar cache
            return novoUsuario;
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            return null;
        }
    },

    async atualizarUsuario(id, dadosAtualizados) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosAtualizados)
            });
            if (!response.ok) throw new Error('Erro ao atualizar usuário');
            const usuarioAtualizado = await response.json();
            this._cache = null; // Invalidar cache
            return usuarioAtualizado;
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return null;
        }
    },

    async excluirUsuario(id) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Erro ao excluir usuário');
            this._cache = null; // Invalidar cache
            return await this.getUsuarios();
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            return [];
        }
    },

    async getUsuarioPorId(id) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/${id}`);
            if (!response.ok) throw new Error('Usuário não encontrado');
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return null;
        }
    }
};

// Mostrar notificação toast
function mostrarNotificacao(mensagem, tipo = 'sucesso') {
    const container = document.getElementById('toast-container') || criarToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
        <span class="toast-icon" aria-hidden="true">${tipo === 'sucesso' ? '✓' : tipo === 'erro' ? '✕' : 'ℹ'}</span>
        <span class="toast-message">${mensagem}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function criarToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('aria-label', 'Notificações');
    document.body.appendChild(container);
    return container;
}

// Vibrar dispositivo mobile (feedback de erro)
function vibrarErro() {
    if ('vibrate' in navigator) {
        // Padrão de vibração: 100ms vibra, 50ms pausa, 100ms vibra
        navigator.vibrate([100, 50, 100]);
    }
}

// Mostrar erro com vibração e feedback visual
function mostrarErroFormulario(mensagem) {
    vibrarErro();
    mostrarNotificacao(mensagem, 'erro');
}

// Componente de Modal de Confirmação
function mostrarConfirmacao(titulo, mensagem, onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'modal-titulo');

    overlay.innerHTML = `
        <div class="modal">
            <h2 id="modal-titulo" class="modal-titulo">${titulo}</h2>
            <p class="modal-mensagem">${mensagem}</p>
            <div class="modal-acoes">
                <button type="button" class="btn btn-secundario" id="btn-cancelar">Cancelar</button>
                <button type="button" class="btn btn-perigo" id="btn-confirmar">Confirmar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const btnConfirmar = overlay.querySelector('#btn-confirmar');
    const btnCancelar = overlay.querySelector('#btn-cancelar');

    btnConfirmar.focus();

    const fecharModal = () => {
        overlay.classList.add('modal-fade-out');
        setTimeout(() => overlay.remove(), 200);
    };

    btnConfirmar.addEventListener('click', () => {
        fecharModal();
        if (onConfirm) onConfirm();
    });

    btnCancelar.addEventListener('click', () => {
        fecharModal();
        if (onCancel) onCancel();
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            fecharModal();
            if (onCancel) onCancel();
        }
    });

    document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape') {
            fecharModal();
            if (onCancel) onCancel();
            document.removeEventListener('keydown', handler);
        }
    });
}

// ========================================
// CÁLCULO DE ANIVERSÁRIO
// ========================================

// Calcula quantos meses e dias faltam para o próximo aniversário
function calcularProximoAniversario(dataNascimento) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const nascimento = new Date(dataNascimento + 'T00:00:00');
    const diaAniversario = nascimento.getDate();
    const mesAniversario = nascimento.getMonth();

    // Próximo aniversário neste ano
    let proximoAniversario = new Date(hoje.getFullYear(), mesAniversario, diaAniversario);

    // Se já passou, é no próximo ano
    if (proximoAniversario < hoje) {
        proximoAniversario = new Date(hoje.getFullYear() + 1, mesAniversario, diaAniversario);
    }

    // Verificar se é hoje
    const ehHoje = proximoAniversario.getTime() === hoje.getTime();

    if (ehHoje) {
        return { ehHoje: true, meses: 0, dias: 0 };
    }

    // Calcular diferença em meses e dias
    let meses = proximoAniversario.getMonth() - hoje.getMonth();
    let dias = proximoAniversario.getDate() - hoje.getDate();

    // Ajustar se o ano é diferente
    if (proximoAniversario.getFullYear() > hoje.getFullYear()) {
        meses += 12;
    }

    // Ajustar dias negativos
    if (dias < 0) {
        meses--;
        // Pegar último dia do mês anterior
        const ultimoDiaMesAnterior = new Date(proximoAniversario.getFullYear(), proximoAniversario.getMonth(), 0).getDate();
        dias += ultimoDiaMesAnterior;
    }

    // Ajustar meses negativos
    if (meses < 0) {
        meses += 12;
    }

    return { ehHoje: false, meses, dias };
}

// Modal de Parabéns pelo Aniversário
function mostrarModalAniversario(nomeCompleto, dataNascimento) {
    const resultado = calcularProximoAniversario(dataNascimento);

    let mensagem;
    let icone;

    if (resultado.ehHoje) {
        mensagem = `Hoje é o dia especial de <strong>${nomeCompleto}</strong>!<br><br>Desejamos um dia repleto de alegrias, realizações e muitas felicidades!`;
        icone = '🎂';
    } else {
        let tempoRestante = '';
        if (resultado.meses > 0 && resultado.dias > 0) {
            tempoRestante = `${resultado.meses} ${resultado.meses === 1 ? 'mês' : 'meses'} e ${resultado.dias} ${resultado.dias === 1 ? 'dia' : 'dias'}`;
        } else if (resultado.meses > 0) {
            tempoRestante = `${resultado.meses} ${resultado.meses === 1 ? 'mês' : 'meses'}`;
        } else {
            tempoRestante = `${resultado.dias} ${resultado.dias === 1 ? 'dia' : 'dias'}`;
        }

        mensagem = `Olá, <strong>${nomeCompleto}</strong>, o seu aniversário será em <strong>${tempoRestante}</strong>!<br><br>Estamos ansiosos para celebrar esse dia especial com você!`;
        icone = '🎉';
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'modal-aniversario-titulo');

    overlay.innerHTML = `
        <div class="modal modal-aniversario">
            <div class="modal-aniversario-icone">${icone}</div>
            <h2 id="modal-aniversario-titulo" class="modal-titulo">
                ${resultado.ehHoje ? 'Feliz Aniversário!' : 'Parabéns pelo Cadastro!'}
            </h2>
            <p class="modal-mensagem" style="text-align: center; line-height: 1.6;">
                ${mensagem}
            </p>
            <div class="modal-acoes" style="justify-content: center;">
                <button type="button" class="btn btn-primario btn-lg" id="btn-ok-aniversario">
                    ${resultado.ehHoje ? '🎈 Obrigado!' : '👍 OK'}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const btnOk = overlay.querySelector('#btn-ok-aniversario');
    btnOk.focus();

    const fecharModal = () => {
        overlay.classList.add('modal-fade-out');
        setTimeout(() => overlay.remove(), 200);
    };

    btnOk.addEventListener('click', fecharModal);
}

// Modal de Parabéns pelo Aniversário com redirecionamento
function mostrarModalAniversarioComRedirect(nomeCompleto, dataNascimento, redirectUrl = 'lista.html') {
    const resultado = calcularProximoAniversario(dataNascimento);

    let mensagem;
    let icone;

    if (resultado.ehHoje) {
        mensagem = `Hoje é o dia especial de <strong>${nomeCompleto}</strong>!<br><br>Desejamos um dia repleto de alegrias, realizações e muitas felicidades!`;
        icone = '🎂';
    } else {
        let tempoRestante = '';
        if (resultado.meses > 0 && resultado.dias > 0) {
            tempoRestante = `${resultado.meses} ${resultado.meses === 1 ? 'mês' : 'meses'} e ${resultado.dias} ${resultado.dias === 1 ? 'dia' : 'dias'}`;
        } else if (resultado.meses > 0) {
            tempoRestante = `${resultado.meses} ${resultado.meses === 1 ? 'mês' : 'meses'}`;
        } else {
            tempoRestante = `${resultado.dias} ${resultado.dias === 1 ? 'dia' : 'dias'}`;
        }

       mensagem = `Olá, <strong>${nomeCompleto}</strong>, o seu aniversário será em <strong>${tempoRestante}</strong>!<br><br>Estamos ansiosos para celebrar esse dia especial com você!`;
        icone = '🎉';
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'modal-aniversario-titulo');

    overlay.innerHTML = `
        <div class="modal modal-aniversario">
            <div class="modal-aniversario-icone">${icone}</div>
            <h2 id="modal-aniversario-titulo" class="modal-titulo">
                ${resultado.ehHoje ? 'Feliz Aniversário!' : 'Cadastro Realizado!'}
            </h2>
            <p class="modal-mensagem" style="text-align: center; line-height: 1.6;">
                ${mensagem}
            </p>
            <div class="modal-acoes" style="justify-content: center;">
                <button type="button" class="btn btn-primario btn-lg" id="btn-ok-aniversario">
                    ${resultado.ehHoje ? '🎈 Obrigado!' : '👍 OK'}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const btnOk = overlay.querySelector('#btn-ok-aniversario');
    btnOk.focus();

    btnOk.addEventListener('click', () => {
        overlay.classList.add('modal-fade-out');
        setTimeout(() => {
            overlay.remove();
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        }, 200);
    });
}
