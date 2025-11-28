/**
 * Lógica da página de cadastro
 */

document.addEventListener('DOMContentLoaded', async function() {
    // Elementos do formulário
    const form = document.getElementById('form-cadastro');
    const btnLimpar = document.getElementById('btn-limpar');
    const btnCadastrar = document.getElementById('btn-cadastrar');

    // Campos
    const campoNome = document.getElementById('nome');
    const campoSobrenome = document.getElementById('sobrenome');
    const campoCPF = document.getElementById('cpf');
    const campoCEP = document.getElementById('cep');
    const campoLogradouro = document.getElementById('logradouro');
    const campoBairro = document.getElementById('bairro');
    const campoEstado = document.getElementById('estado');
    let campoCidade = document.getElementById('cidade');
    const cepIcone = document.getElementById('cep-icone');

    // Elementos de foto
    const fotoPreview = document.getElementById('foto-preview');
    const btnCamera = document.getElementById('btn-camera');
    const btnGaleria = document.getElementById('btn-galeria');
    const btnRemoverFoto = document.getElementById('btn-remover-foto');
    const inputFotoCamera = document.getElementById('input-foto-camera');
    const inputFotoGaleria = document.getElementById('input-foto-galeria');

    // Cache de estados e cidades
    let estadosCache = [];
    let cidadesCache = {};

    // Foto do usuário (base64)
    let fotoUsuario = null;

    // ========================================
    // INICIALIZAÇÃO
    // ========================================

    // Carregar estados no select
    await carregarEstados();

    // ========================================
    // EVENT LISTENERS
    // ========================================

    // === FOTO DO USUÁRIO ===
    btnCamera.addEventListener('click', () => inputFotoCamera.click());
    btnGaleria.addEventListener('click', () => inputFotoGaleria.click());

    inputFotoCamera.addEventListener('change', handleFotoSelecionada);
    inputFotoGaleria.addEventListener('change', handleFotoSelecionada);

    btnRemoverFoto.addEventListener('click', removerFoto);

    // Estado de validação do CPF
    let cpfValidacaoEmAndamento = false;
    let cpfUltimoValidado = '';

    // Máscara de CPF
    campoCPF.addEventListener('input', async function(e) {
        e.target.value = mascaraCPF(e.target.value);
        // Validação básica durante digitação
        await validarCampoCPFBasico();
    });

    // Validação completa no blur (com API)
    campoCPF.addEventListener('blur', async function() {
        await validarCampoCPFCompleto();
    });

    // Máscara e busca de CEP
    campoCEP.addEventListener('input', function(e) {
        e.target.value = mascaraCEP(e.target.value);
    });

    campoCEP.addEventListener('blur', async function() {
        const cep = this.value.replace(/\D/g, '');
        if (cep.length === 8) {
            await buscarEnderecoPorCEP(cep);
        }
    });

    // Quando o estado mudar, carregar cidades
    campoEstado.addEventListener('change', async function() {
        const uf = this.value;
        if (uf) {
            await carregarCidades(uf);
        } else {
            // Restaurar select se necessário
            garantirCidadeComoSelect();
            campoCidade = document.getElementById('cidade');
            campoCidade.innerHTML = '<option value="">Selecione primeiro o estado</option>';
            campoCidade.disabled = true;
            document.getElementById('cidade-ajuda').textContent = 'Cidades disponíveis após selecionar o estado';
        }
    });

    // Validação em tempo real dos campos obrigatórios
    campoNome.addEventListener('blur', () => validarCampoObrigatorio(campoNome, 'nome'));
    campoSobrenome.addEventListener('blur', () => validarCampoObrigatorio(campoSobrenome, 'sobrenome'));

    // Limpar formulário
    btnLimpar.addEventListener('click', function() {
        mostrarConfirmacao(
            'Limpar Formulário',
            'Tem certeza que deseja limpar todos os campos do formulário?',
            () => {
                form.reset();
                limparErros();
                // Restaurar select de cidade se necessário
                garantirCidadeComoSelect();
                campoCidade = document.getElementById('cidade');
                campoCidade.innerHTML = '<option value="">Selecione primeiro o estado</option>';
                campoCidade.disabled = true;
                document.getElementById('cidade-ajuda').textContent = 'Cidades disponíveis após selecionar o estado';
                // Limpar foto
                removerFoto();
                mostrarNotificacao('Formulário limpo com sucesso', 'info');
            }
        );
    });

    // Submissão do formulário
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (await validarFormulario()) {
            const usuario = coletarDadosFormulario();

            mostrarConfirmacao(
                'Confirmar Cadastro',
                `Deseja cadastrar o usuário ${usuario.nome} ${usuario.sobrenome}?`,
                async () => {
                    // Debug: dados antes de salvar
                    console.log('Dados do usuário a salvar:', usuario);

                    // Salvar usuário
                    const usuarioSalvo = await Storage.salvarUsuario(usuario);

                    // Debug: verificar se salvou
                    console.log('Usuário salvo:', usuarioSalvo);

                    if (usuarioSalvo) {
                        // Mostrar modal de aniversário
                        const nomeCompleto = `${usuario.nome} ${usuario.sobrenome}`;
                        mostrarModalAniversarioComRedirect(nomeCompleto, usuario.dataNascimento);
                    } else {
                        mostrarErroFormulario('Erro ao salvar usuário. Tente novamente.');
                    }
                }
            );
        }
    });

    // ========================================
    // FUNÇÕES
    // ========================================

    async function carregarEstados() {
        try {
            if (estadosCache.length === 0) {
                estadosCache = await buscarEstados();
            }

            campoEstado.innerHTML = '<option value="">Selecione o estado</option>';
            estadosCache.forEach(estado => {
                const option = document.createElement('option');
                option.value = estado.sigla;
                option.textContent = estado.nome;
                campoEstado.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar estados:', error);
            mostrarNotificacao('Erro ao carregar estados', 'erro');
        }
    }

    async function carregarCidades(uf, cidadePreenchida = '') {
        const cidadeAjuda = document.getElementById('cidade-ajuda');
        cidadeAjuda.textContent = 'Carregando cidades...';
        campoCidade.disabled = true;

        try {
            if (!cidadesCache[uf]) {
                cidadesCache[uf] = await buscarCidadesPorEstado(uf);
            }

            const resultado = cidadesCache[uf];

            // Se a API falhou, converter select para input de texto
            if (!resultado.sucesso || resultado.cidades.length === 0) {
                converterCidadeParaInput(cidadePreenchida);
                cidadeAjuda.textContent = 'Digite o nome da cidade';
                return;
            }

            // Se há cidades, manter como select
            garantirCidadeComoSelect();
            campoCidade = document.getElementById('cidade'); // Re-obter referência

            campoCidade.innerHTML = '<option value="">Selecione a cidade</option>';
            resultado.cidades.forEach(cidade => {
                const option = document.createElement('option');
                option.value = cidade.nome;
                option.textContent = cidade.nome;
                campoCidade.appendChild(option);
            });

            // Se tem cidade pré-preenchida, selecionar
            if (cidadePreenchida) {
                campoCidade.value = cidadePreenchida;
            }

            campoCidade.disabled = false;
            cidadeAjuda.textContent = `${resultado.cidades.length} cidades disponíveis`;
        } catch (error) {
            console.error('Erro ao carregar cidades:', error);
            converterCidadeParaInput(cidadePreenchida);
            cidadeAjuda.textContent = 'Digite o nome da cidade';
        }
    }

    // Converter campo cidade de select para input de texto
    function converterCidadeParaInput(valorInicial = '') {
        const cidadeContainer = campoCidade.parentElement;
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'cidade';
        input.name = 'cidade';
        input.className = 'campo-input';
        input.placeholder = 'Digite o nome da cidade';
        input.value = valorInicial;

        campoCidade.replaceWith(input);
        campoCidade = input;
    }

    // Garantir que cidade seja um select
    function garantirCidadeComoSelect() {
        if (campoCidade.tagName === 'INPUT') {
            const cidadeContainer = campoCidade.parentElement;
            const select = document.createElement('select');
            select.id = 'cidade';
            select.name = 'cidade';
            select.className = 'campo-select';

            campoCidade.replaceWith(select);
            campoCidade = select;
        }
    }

    async function buscarEnderecoPorCEP(cep) {
        const erroSpan = document.getElementById('cep-erro');
        erroSpan.textContent = '';

        // Mostrar loading
        cepIcone.textContent = '⏳';
        cepIcone.classList.add('carregando');

        try {
            const endereco = await buscarCEP(cep);

            // Preencher campos
            campoLogradouro.value = endereco.logradouro;
            campoBairro.value = endereco.bairro;

            // Selecionar estado e carregar cidades (passando a cidade do CEP)
            if (endereco.estado) {
                campoEstado.value = endereco.estado;
                await carregarCidades(endereco.estado, endereco.cidade);

                // Atualizar referência do campo cidade (pode ter mudado de select para input)
                campoCidade = document.getElementById('cidade');

                // Garantir que a cidade está preenchida
                if (endereco.cidade && campoCidade) {
                    campoCidade.value = endereco.cidade;
                }
            }

            campoCEP.classList.add('valido');
            campoCEP.classList.remove('invalido');
            mostrarNotificacao('Endereço encontrado!', 'sucesso');
        } catch (error) {
            erroSpan.textContent = error.message;
            campoCEP.classList.add('invalido');
            campoCEP.classList.remove('valido');
        } finally {
            cepIcone.textContent = '🔍';
            cepIcone.classList.remove('carregando');
        }
    }

    // Validação básica do CPF (apenas matemática, durante digitação)
    async function validarCampoCPFBasico() {
        const cpf = campoCPF.value;
        const erroSpan = document.getElementById('cpf-erro');

        if (!cpf) {
            erroSpan.textContent = '';
            campoCPF.classList.remove('valido', 'invalido');
            return false;
        }

        const cpfLimpo = cpf.replace(/\D/g, '');

        if (cpfLimpo.length < 11) {
            erroSpan.textContent = 'CPF incompleto';
            campoCPF.classList.add('invalido');
            campoCPF.classList.remove('valido');
            return false;
        }

        if (!validarCPF(cpfLimpo)) {
            erroSpan.textContent = 'CPF inválido. Verifique o número digitado.';
            campoCPF.classList.add('invalido');
            campoCPF.classList.remove('valido');
            return false;
        }

        // Verificar se CPF já existe no sistema
        const usuarios = await Storage.getUsuarios();
        const cpfExiste = usuarios.some(u => u.cpf.replace(/\D/g, '') === cpfLimpo);

        if (cpfExiste) {
            erroSpan.textContent = 'Este CPF já está cadastrado no sistema.';
            campoCPF.classList.add('invalido');
            campoCPF.classList.remove('valido');
            return false;
        }

        // CPF passou na validação básica
        erroSpan.textContent = '';
        campoCPF.classList.remove('invalido');
        return true;
    }

    // Validação completa do CPF (com API, no blur)
    async function validarCampoCPFCompleto() {
        const cpf = campoCPF.value;
        const erroSpan = document.getElementById('cpf-erro');
        const cpfAjuda = document.getElementById('cpf-ajuda');

        if (!cpf) {
            return false;
        }

        const cpfLimpo = cpf.replace(/\D/g, '');

        // Se CPF incompleto ou já validado, pular
        if (cpfLimpo.length < 11) {
            return false;
        }

        // Evitar validação duplicada
        if (cpfLimpo === cpfUltimoValidado) {
            return campoCPF.classList.contains('valido');
        }

        // Primeiro fazer validação básica
        if (!(await validarCampoCPFBasico())) {
            return false;
        }

        // Marcar que validação está em andamento
        cpfValidacaoEmAndamento = true;
        cpfAjuda.textContent = 'Verificando CPF...';
        campoCPF.classList.add('validando');

        try {
            // Chamar API de validação
            const resultado = await validarCPFReal(cpfLimpo);

            cpfUltimoValidado = cpfLimpo;

            if (!resultado.valido) {
                erroSpan.textContent = resultado.mensagem || 'CPF não encontrado na base de dados.';
                campoCPF.classList.add('invalido');
                campoCPF.classList.remove('valido');
                cpfAjuda.textContent = 'CPF não verificado';
                return false;
            }

            // CPF válido e verificado
            erroSpan.textContent = '';
            campoCPF.classList.add('valido');
            campoCPF.classList.remove('invalido');

            // Mostrar fonte da validação
            if (resultado.fonte === 'api') {
                cpfAjuda.textContent = '✓ CPF verificado com sucesso';
                mostrarNotificacao('CPF verificado e válido!', 'sucesso');
            } else {
                cpfAjuda.textContent = '✓ CPF válido (validação local)';
                if (resultado.aviso) {
                    console.info(resultado.aviso);
                }
            }

            return true;

        } catch (error) {
            console.error('Erro na validação do CPF:', error);
            // Em caso de erro, aceitar com validação local
            erroSpan.textContent = '';
            campoCPF.classList.add('valido');
            campoCPF.classList.remove('invalido');
            cpfAjuda.textContent = '✓ CPF válido (verificação offline)';
            return true;

        } finally {
            cpfValidacaoEmAndamento = false;
            campoCPF.classList.remove('validando');
        }
    }

    function validarCampoObrigatorio(campo, nome) {
        const erroSpan = document.getElementById(`${nome}-erro`);
        const valor = campo.value.trim();

        if (!valor) {
            erroSpan.textContent = 'Este campo é obrigatório';
            campo.classList.add('invalido');
            campo.classList.remove('valido');
            return false;
        }

        if (valor.length < 2) {
            erroSpan.textContent = 'Mínimo de 2 caracteres';
            campo.classList.add('invalido');
            campo.classList.remove('valido');
            return false;
        }

        erroSpan.textContent = '';
        campo.classList.add('valido');
        campo.classList.remove('invalido');
        return true;
    }

    async function validarFormulario() {
        let valido = true;

        // Validar nome
        if (!validarCampoObrigatorio(campoNome, 'nome')) {
            valido = false;
        }

        // Validar sobrenome
        if (!validarCampoObrigatorio(campoSobrenome, 'sobrenome')) {
            valido = false;
        }

        // Validar CPF
        if (!campoCPF.value.trim()) {
            document.getElementById('cpf-erro').textContent = 'Este campo é obrigatório';
            campoCPF.classList.add('invalido');
            valido = false;
        } else {
            // Aguardar validação completa do CPF (com API)
            const cpfValido = await validarCampoCPFCompleto();
            if (!cpfValido) {
                valido = false;
            }
        }

        // Validar Data de Nascimento
        const campoDataNascimento = document.getElementById('dataNascimento');
        const dataNascimentoErro = document.getElementById('dataNascimento-erro');
        if (!campoDataNascimento.value) {
            dataNascimentoErro.textContent = 'Data de nascimento é obrigatória';
            campoDataNascimento.classList.add('invalido');
            valido = false;
        } else {
            const dataNasc = new Date(campoDataNascimento.value + 'T00:00:00');
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            if (dataNasc > hoje) {
                dataNascimentoErro.textContent = 'Data de nascimento não pode ser no futuro';
                campoDataNascimento.classList.add('invalido');
                valido = false;
            } else {
                dataNascimentoErro.textContent = '';
                campoDataNascimento.classList.remove('invalido');
                campoDataNascimento.classList.add('valido');
            }
        }

        if (!valido) {
            // Mostrar erro com vibração no mobile
            mostrarErroFormulario('Por favor, corrija os erros no formulário');
            // Focar no primeiro campo com erro
            const primeiroErro = document.querySelector('.campo-input.invalido, .campo-select.invalido');
            if (primeiroErro) {
                primeiroErro.focus();
                primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        return valido;
    }

    function coletarDadosFormulario() {
        return {
            nome: campoNome.value.trim(),
            sobrenome: campoSobrenome.value.trim(),
            cpf: campoCPF.value,
            dataNascimento: document.getElementById('dataNascimento').value,
            cep: campoCEP.value,
            logradouro: campoLogradouro.value.trim(),
            numero: document.getElementById('numero').value.trim(),
            complemento: document.getElementById('complemento').value.trim(),
            bairro: campoBairro.value.trim(),
            estado: campoEstado.value,
            cidade: campoCidade.value,
            foto: fotoUsuario
        };
    }

    function limparErros() {
        document.querySelectorAll('.campo-erro').forEach(span => {
            span.textContent = '';
        });
        document.querySelectorAll('.campo-input').forEach(input => {
            input.classList.remove('valido', 'invalido');
        });
    }

    // ========================================
    // FUNÇÕES DE FOTO
    // ========================================

    function handleFotoSelecionada(event) {
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
        redimensionarImagem(file, 300, 300, (base64) => {
            fotoUsuario = base64;
            exibirFotoPreview(base64);
            mostrarNotificacao('Foto adicionada com sucesso!', 'sucesso');
        });

        // Limpar input para permitir selecionar a mesma foto novamente
        event.target.value = '';
    }

    function redimensionarImagem(file, maxWidth, maxHeight, callback) {
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

    function exibirFotoPreview(base64) {
        fotoPreview.innerHTML = `<img src="${base64}" alt="Foto do usuário">`;
        btnRemoverFoto.style.display = 'inline-flex';
    }

    function removerFoto() {
        fotoUsuario = null;
        fotoPreview.innerHTML = '<span class="foto-placeholder" aria-hidden="true">👤</span>';
        btnRemoverFoto.style.display = 'none';
        mostrarNotificacao('Foto removida', 'info');
    }
});
