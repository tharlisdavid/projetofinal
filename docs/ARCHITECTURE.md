# Arquitetura do Sistema de Cadastro de Usuários

## Visão Geral

Este documento descreve a arquitetura técnica do **Sistema de Cadastro de Usuários**, uma aplicação web fullstack para gerenciamento de perfis de usuários brasileiros com funcionalidades completas de CRUD (Create, Read, Update, Delete).

O sistema integra-se de forma fluida com APIs externas para garantir a validação e consistência dos dados:

| API | Finalidade | URL |
|-----|------------|-----|
| **ViaCEP** | Busca automática de endereço por CEP | https://viacep.com.br/ |
| **IBGE** | Lista de estados e cidades brasileiras | https://servicodados.ibge.gov.br/ |
| **Invertexto** | Validação de CPF em base de dados real | https://api.invertexto.com/ |

### Principais Características

- **Frontend**: HTML5, CSS3 e JavaScript vanilla (sem frameworks)
- **Backend**: Python 3.x com servidor HTTP nativo
- **Persistência**: Arquivo JSON (sem banco de dados externo)
- **Validações**: Em tempo real com feedback visual
- **Responsividade**: Design mobile-first com adaptação para desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│                           NAVEGADOR                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  index.html │  │ lista.html  │  │   CSS/JS    │                 │
│  │  (Cadastro) │  │  (Listagem) │  │  (Assets)   │                 │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘                 │
│         │                │                                          │
│         └────────┬───────┘                                          │
│                  │ HTTP Requests                                    │
└──────────────────┼──────────────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        SERVIDOR PYTHON                               │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    APIHandler (HTTP Server)                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │ │
│  │  │ Arquivos     │  │   API REST   │  │   CORS Handler       │ │ │
│  │  │ Estáticos    │  │  /api/*      │  │   (Cross-Origin)     │ │ │
│  │  └──────────────┘  └──────┬───────┘  └──────────────────────┘ │ │
│  └───────────────────────────┼────────────────────────────────────┘ │
│                              │                                       │
│  ┌───────────────────────────┼────────────────────────────────────┐ │
│  │                     Camada de Dados                             │ │
│  │  ┌──────────────┐  ┌──────┴───────┐  ┌──────────────────────┐ │ │
│  │  │ ler_usuarios │  │salvar_usuarios│  │     gerar_id        │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        ARMAZENAMENTO                                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    usuarios.json                                │ │
│  │  [                                                              │ │
│  │    {                                                            │ │
│  │      "id": "19ac6854bbf...",                                    │ │
│  │      "nome": "João",                                            │ │
│  │      "sobrenome": "Silva",                                      │ │
│  │      "cpf": "123.456.789-00",                                   │ │
│  │      "dataNascimento": "1990-05-15",                            │ │
│  │      ...                                                        │ │
│  │    }                                                            │ │
│  │  ]                                                              │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Pastas

```
projetofinal/
│
├── frontend/                    # Camada de apresentação (Cliente)
│   ├── index.html              # Página de cadastro de usuários
│   ├── lista.html              # Página de listagem de usuários
│   ├── css/
│   │   └── styles.css          # Estilos globais da aplicação
│   └── js/
│       ├── utils.js            # Funções utilitárias e Storage API
│       ├── cadastro.js         # Lógica da página de cadastro
│       └── lista.js            # Lógica da página de listagem
│
├── backend/                     # Camada de servidor (API)
│   └── server.py               # Servidor HTTP + API REST
│
├── dados/                       # Camada de persistência
│   └── usuarios.json           # Banco de dados JSON
│
├── docs/                        # Documentação
│   └── ARCHITECTURE.md         # Este arquivo
│
└── README.md                    # Documentação principal
```

---

## Componentes do Sistema

### 1. Frontend (Camada de Apresentação)

O frontend é composto por páginas HTML estáticas com JavaScript vanilla, sem dependências de frameworks.

#### 1.1 Páginas HTML

| Arquivo | Descrição |
|---------|-----------|
| `index.html` | Formulário de cadastro com validações, upload de foto e busca de CEP |
| `lista.html` | Tabela/cards responsivos com ações de editar e excluir |

#### 1.2 JavaScript

| Arquivo | Responsabilidade |
|---------|------------------|
| `utils.js` | Funções compartilhadas: validação de CPF, máscaras, busca de CEP, Storage API, notificações |
| `cadastro.js` | Gerencia o formulário de cadastro, validações e submissão |
| `lista.js` | Renderiza a lista, gerencia modais de edição e exclusão |

#### 1.3 CSS

Design responsivo com:
- **Mobile-first**: Cards para dispositivos móveis
- **Desktop**: Tabela para telas maiores
- **Acessibilidade**: ARIA labels, foco visível, cores com contraste adequado

### 2. Backend (Servidor Python)

Servidor HTTP simples que serve arquivos estáticos e expõe uma API REST.

#### 2.1 Tecnologias

- **Python 3.x** (biblioteca padrão, sem dependências externas)
- `http.server.HTTPServer` para servidor HTTP
- `SimpleHTTPRequestHandler` para arquivos estáticos
- JSON para serialização de dados

#### 2.2 API REST

| Método | Endpoint | Descrição | Status Codes |
|--------|----------|-----------|--------------|
| `GET` | `/api/usuarios` | Lista todos os usuários | 200 |
| `GET` | `/api/usuarios/:id` | Busca usuário por ID | 200, 404 |
| `POST` | `/api/usuarios` | Cria novo usuário | 201 |
| `PUT` | `/api/usuarios/:id` | Atualiza usuário | 200, 404 |
| `DELETE` | `/api/usuarios/:id` | Remove usuário | 200, 404 |

#### 2.3 Formato dos Dados

```json
{
  "id": "19ac6854bbfvivjhzdp",
  "nome": "João",
  "sobrenome": "Silva",
  "cpf": "123.456.789-00",
  "dataNascimento": "1990-05-15",
  "cep": "01310-100",
  "logradouro": "Avenida Paulista",
  "numero": "1000",
  "complemento": "Sala 101",
  "bairro": "Bela Vista",
  "estado": "SP",
  "cidade": "São Paulo",
  "foto": "data:image/jpeg;base64,...",
  "criadoEm": "2025-11-27T18:13:35.000Z",
  "atualizadoEm": "2025-11-27T19:00:00.000Z"
}
```

### 3. Camada de Dados

Persistência em arquivo JSON (`usuarios.json`):
- Leitura/escrita síncrona
- Formatação com indentação para legibilidade
- Suporte a caracteres UTF-8 (acentos)

---

## Fluxos de Dados

### Fluxo de Cadastro

```
┌─────────┐     ┌──────────┐     ┌────────┐     ┌──────────┐
│ Usuário │────▶│ Validação│────▶│  POST  │────▶│  Salvar  │
│ preenche│     │ Frontend │     │  /api/ │     │  JSON    │
│ form    │     │          │     │usuarios│     │          │
└─────────┘     └──────────┘     └────────┘     └──────────┘
                     │                               │
                     ▼                               ▼
              ┌──────────┐                    ┌──────────┐
              │  Modal   │◀───────────────────│ Resposta │
              │Aniversário│                   │   201    │
              └──────────┘                    └──────────┘
```

### Fluxo de Edição

```
┌─────────┐     ┌──────────┐     ┌────────┐     ┌──────────┐
│ Usuário │────▶│   GET    │────▶│ Modal  │────▶│   PUT    │
│ clica   │     │/api/:id  │     │ Edição │     │ /api/:id │
│ Editar  │     │          │     │        │     │          │
└─────────┘     └──────────┘     └────────┘     └──────────┘
                                      │               │
                                      ▼               ▼
                               ┌──────────┐    ┌──────────┐
                               │Confirmação│◀──│ Atualizar│
                               │          │    │  JSON    │
                               └──────────┘    └──────────┘
```

---

## Funcionalidades do Sistema

### 1. Cadastro de Usuários

| Funcionalidade | Descrição |
|----------------|-----------|
| **Formulário completo** | Campos para nome, sobrenome, CPF, data de nascimento, endereço completo e foto |
| **Validação em tempo real** | Feedback visual instantâneo nos campos (válido/inválido/validando) |
| **Upload de foto** | Suporte a imagens com redimensionamento automático para 300x300px |
| **Busca automática de CEP** | Preenchimento automático de endereço ao digitar o CEP |
| **Máscaras de input** | Formatação automática de CPF (XXX.XXX.XXX-XX) e CEP (XXXXX-XXX) |
| **Modal de aniversário** | Exibe mensagem personalizada calculando tempo até o próximo aniversário |

### 2. Listagem de Usuários

| Funcionalidade | Descrição |
|----------------|-----------|
| **Visualização responsiva** | Cards em mobile, tabela em desktop |
| **Busca/filtro** | Pesquisa por nome, CPF ou cidade |
| **Edição inline** | Modal de edição com todos os campos |
| **Exclusão com confirmação** | Dialog de confirmação antes de excluir |
| **Paginação** | Navegação entre páginas de resultados |

### 3. Validações

| Campo | Validação |
|-------|-----------|
| **Nome/Sobrenome** | Mínimo 2 caracteres, apenas letras e espaços |
| **CPF** | Algoritmo de dígitos verificadores + validação via API |
| **Data de Nascimento** | Data válida, não futura, idade entre 0-150 anos |
| **CEP** | 8 dígitos numéricos |
| **Estado/Cidade** | Seleção obrigatória de dropdowns populados via API |
| **Foto** | Arquivo de imagem (jpg, png, gif, webp), max 5MB |

### 4. Feedback ao Usuário

| Tipo | Implementação |
|------|---------------|
| **Notificações toast** | Mensagens de sucesso, erro e informação |
| **Estados visuais** | Classes CSS `.valido`, `.invalido`, `.validando` |
| **Vibração em erro** | Feedback háptico em dispositivos móveis |
| **Ícones de status** | Indicadores visuais nos campos do formulário |

---

## Integrações Externas (APIs)

### 1. ViaCEP (Busca de Endereço)

**Objetivo**: Autocompletar campos de endereço a partir do CEP.

**Endpoint**:
```
GET https://viacep.com.br/ws/{cep}/json/
```

**Fluxo de Integração**:
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Usuário   │     │  Frontend   │     │   ViaCEP    │
│ digita CEP  │────▶│ buscarCEP() │────▶│    API      │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                          │                    │
                          │◀───────────────────┘
                          │  JSON Response
                          ▼
                   ┌─────────────┐
                   │ Preenche    │
                   │ logradouro, │
                   │ bairro,     │
                   │ cidade, UF  │
                   └─────────────┘
```

**Implementação** (`js/utils.js:170-193`):
```javascript
async function buscarCEP(cep) {
    cep = cep.replace(/\D/g, '');  // Remove não-numéricos
    if (cep.length !== 8) throw new Error('CEP deve ter 8 dígitos');

    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (data.erro) throw new Error('CEP não encontrado');

    return {
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || ''
    };
}
```

**Resposta da API**:
```json
{
  "cep": "01310-100",
  "logradouro": "Avenida Paulista",
  "complemento": "até 610 - lado par",
  "bairro": "Bela Vista",
  "localidade": "São Paulo",
  "uf": "SP",
  "ibge": "3550308"
}
```

**Tratamento de Erros**:
- CEP inválido: Retorna `{"erro": true}`
- API indisponível: Libera campos para preenchimento manual

---

### 2. IBGE (Estados e Cidades)

**Objetivo**: Popular dropdowns de estados e cidades com dados oficiais.

**Endpoints**:
```
GET https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome
GET https://servicodados.ibge.gov.br/api/v1/localidades/estados/{uf}/municipios?orderBy=nome
```

**Fluxo de Integração (Estados)**:
```
┌─────────────┐     ┌────────────────┐     ┌─────────────┐
│   Página    │     │    Frontend    │     │  IBGE API   │
│   carrega   │────▶│buscarEstados() │────▶│   Estados   │
└─────────────┘     └───────┬────────┘     └──────┬──────┘
                            │                     │
                            │◀────────────────────┘
                            │  Array de estados
                            ▼
                     ┌─────────────┐
                     │  Popula     │
                     │  <select>   │
                     │  estados    │
                     └─────────────┘
```

**Fluxo de Integração (Cidades)**:
```
┌─────────────┐     ┌───────────────────────┐     ┌─────────────┐
│   Usuário   │     │      Frontend         │     │  IBGE API   │
│ seleciona   │────▶│buscarCidadesPorEstado │────▶│  Municípios │
│   estado    │     │        (uf)           │     │             │
└─────────────┘     └───────────┬───────────┘     └──────┬──────┘
                                │                        │
                                │◀───────────────────────┘
                                │  Array de cidades
                                ▼
                         ┌─────────────┐
                         │  Popula     │
                         │  <select>   │
                         │  cidades    │
                         └─────────────┘
```

**Implementação** (`js/utils.js:227-249`):
```javascript
// Buscar estados
async function buscarEstados() {
    try {
        const response = await fetch(
            'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome'
        );
        if (!response.ok) throw new Error('API indisponível');
        return await response.json();
    } catch (error) {
        // Fallback para lista estática
        return ESTADOS_BRASIL;
    }
}

// Buscar cidades por estado
async function buscarCidadesPorEstado(uf) {
    const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
    );
    const data = await response.json();
    return { sucesso: true, cidades: data };
}
```

**Resposta da API (Estados)**:
```json
[
  { "id": 12, "sigla": "AC", "nome": "Acre" },
  { "id": 27, "sigla": "AL", "nome": "Alagoas" },
  ...
]
```

**Resposta da API (Cidades)**:
```json
[
  { "id": 3550308, "nome": "São Paulo" },
  { "id": 3509502, "nome": "Campinas" },
  ...
]
```

**Fallback**: Lista estática de 27 estados brasileiros definida em `ESTADOS_BRASIL` (`js/utils.js:196-224`).

---

### 3. Invertexto (Validação de CPF)

**Objetivo**: Validar se o CPF é matematicamente válido e existe na base de dados.

**Endpoint**:
```
GET https://api.invertexto.com/v1/validator?token={token}&value={cpf}&type=cpf
```

**Configuração** (`js/utils.js:10-19`):
```javascript
const CONFIG = {
    INVERTEXTO_TOKEN: 'seu-token-aqui',
    MODO_VALIDACAO_CPF: 'api'  // 'api' ou 'local'
};
```

**Fluxo de Integração**:
```
┌─────────────┐     ┌────────────────┐     ┌────────────────┐
│   Usuário   │     │   Frontend     │     │                │
│ digita CPF  │────▶│  validarCPF()  │────▶│ Validação      │
└─────────────┘     │   (local)      │     │ Matemática     │
                    └───────┬────────┘     └───────┬────────┘
                            │                      │
                            │ Se válido           │
                            ▼                      │
                    ┌────────────────┐             │
                    │ validarCPFReal │◀────────────┘
                    │    (API)       │
                    └───────┬────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
   ┌──────────┐      ┌──────────┐       ┌──────────┐
   │  Cache?  │      │ Token OK │       │ Modo     │
   │   Sim    │      │   Não    │       │  local   │
   └────┬─────┘      └────┬─────┘       └────┬─────┘
        │                 │                  │
        ▼                 ▼                  ▼
   Retorna           Fallback           Retorna
   do cache          para local         válido local
        │                 │                  │
        └────────┬────────┴──────────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │   Se não há     │
        │  cache/fallback │
        │  chama API      │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐     ┌─────────────────┐
        │   Invertexto    │────▶│    Resposta     │
        │      API        │     │  valid: true    │
        └─────────────────┘     └────────┬────────┘
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │ Armazena no │
                                  │   cache     │
                                  └─────────────┘
```

**Implementação** (`js/utils.js:61-144`):
```javascript
async function validarCPFReal(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');

    // 1. Validação matemática primeiro
    if (!validarCPF(cpf)) {
        return { valido: false, mensagem: 'CPF inválido', fonte: 'local' };
    }

    // 2. Se modo local, retorna
    if (CONFIG.MODO_VALIDACAO_CPF === 'local') {
        return { valido: true, mensagem: 'CPF válido', fonte: 'local' };
    }

    // 3. Verificar cache
    if (cpfValidadosCache.has(cpf)) {
        return cpfValidadosCache.get(cpf);
    }

    // 4. Chamar API
    const response = await fetch(
        `https://api.invertexto.com/v1/validator?token=${CONFIG.INVERTEXTO_TOKEN}&value=${cpf}&type=cpf`
    );
    const data = await response.json();

    const resultado = {
        valido: data.valid === true,
        mensagem: data.valid ? 'CPF válido' : 'CPF não encontrado',
        fonte: 'api'
    };

    // 5. Armazenar no cache
    cpfValidadosCache.set(cpf, resultado);

    return resultado;
}
```

**Resposta da API**:
```json
{
  "valid": true,
  "formatted": "123.456.789-00",
  "type": "cpf"
}
```

**Sistema de Cache**: CPFs validados são armazenados em um `Map()` para evitar chamadas repetidas à API durante a sessão.

**Tratamento de Erros**:
| Status Code | Tratamento |
|-------------|------------|
| 401 | Token inválido - fallback para validação local |
| 429 | Rate limit - fallback para validação local |
| Timeout | Fallback para validação local |

**Modos de Operação**:
- `api`: Validação completa via API (requer token)
- `local`: Apenas validação matemática (offline)

---

### 4. API REST Interna (Backend Python)

**Objetivo**: Persistência de dados dos usuários.

**Base URL**: `/api/usuarios`

**Fluxo de Comunicação**:
```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────────┐                                            │
│  │   Storage   │◀─────── Objeto wrapper para API            │
│  │   Object    │                                            │
│  └──────┬──────┘                                            │
│         │                                                    │
│         │  fetch() com JSON                                 │
└─────────┼────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVIDOR PYTHON                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    APIHandler                          │ │
│  │  GET /api/usuarios     → Lista todos                   │ │
│  │  GET /api/usuarios/:id → Busca por ID                  │ │
│  │  POST /api/usuarios    → Cria novo                     │ │
│  │  PUT /api/usuarios/:id → Atualiza                      │ │
│  │  DELETE /api/usuarios/:id → Remove                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                     PERSISTÊNCIA                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   usuarios.json                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Implementação do Storage** (`js/utils.js:257-335`):
```javascript
const Storage = {
    _cache: null,
    _cacheDuration: 5000, // 5 segundos

    async getUsuarios() {
        const response = await fetch('/api/usuarios');
        return await response.json();
    },

    async salvarUsuario(usuario) {
        const response = await fetch('/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario)
        });
        return await response.json();
    },

    async atualizarUsuario(id, dados) {
        const response = await fetch(`/api/usuarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        return await response.json();
    },

    async excluirUsuario(id) {
        await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
        return await this.getUsuarios();
    }
};
```

**Cache Local**: O objeto Storage mantém um cache interno que é invalidado após operações de escrita (POST, PUT, DELETE).

---

## Decisões de Arquitetura

### Por que Python sem frameworks?

1. **Simplicidade**: Sem dependências externas para instalar
2. **Portabilidade**: Funciona em qualquer sistema com Python 3
3. **Educacional**: Código simples e fácil de entender
4. **Leve**: Servidor inicia em milissegundos

### Por que JSON em vez de banco de dados?

1. **Sem instalação**: Não precisa de MySQL, PostgreSQL, etc.
2. **Legível**: Arquivo texto que pode ser editado manualmente
3. **Backup simples**: Basta copiar um arquivo
4. **Adequado**: Para volume pequeno de dados (< 10.000 registros)

### Por que JavaScript vanilla?

1. **Performance**: Sem overhead de frameworks
2. **Aprendizado**: Código puro, sem abstrações
3. **Manutenção**: Sem atualizações de dependências
4. **Compatibilidade**: Funciona em qualquer navegador moderno

---

## Segurança

### Implementado

- **CORS**: Headers configurados para permitir requisições cross-origin
- **Validação de CPF**: Algoritmo do dígito verificador
- **Sanitização HTML**: `escapeHtml()` previne XSS na listagem
- **Validação de tipos**: Arquivos de upload validados (imagens apenas)

### Recomendações para Produção

- Adicionar autenticação (JWT, sessions)
- Implementar HTTPS
- Rate limiting na API
- Validação de dados no backend
- Logs de auditoria
- Backup automático dos dados

---

## Performance

### Otimizações Implementadas

- **Cache de estados/cidades**: Evita requisições repetidas à API IBGE
- **Cache de CPFs validados**: Evita chamadas repetidas à API de validação
- **Redimensionamento de imagens**: Fotos são comprimidas antes do upload
- **Lazy loading**: Dados carregados sob demanda

### Métricas Esperadas

| Operação | Tempo Esperado |
|----------|----------------|
| Carregar página | < 500ms |
| Buscar CEP | < 1s |
| Salvar usuário | < 200ms |
| Listar 100 usuários | < 300ms |

---

## Extensibilidade

### Como adicionar novos campos

1. Adicionar input no HTML (`index.html` e `lista.html`)
2. Atualizar `coletarDadosFormulario()` em `cadastro.js`
3. Atualizar modal de edição em `lista.js`
4. (Opcional) Adicionar validação específica

### Como adicionar novos endpoints

1. Adicionar handler no `do_GET/do_POST/do_PUT/do_DELETE` em `server.py`
2. Criar função de processamento correspondente
3. Documentar no README

---

## Diagrama de Componentes

```
                    ┌────────────────────────────┐
                    │        FRONTEND            │
                    │                            │
    ┌───────────────┼───────────────┐            │
    │               │               │            │
    ▼               ▼               ▼            │
┌────────┐    ┌──────────┐    ┌─────────┐       │
│index.  │    │ lista.   │    │ styles. │       │
│  html  │    │   html   │    │   css   │       │
└───┬────┘    └────┬─────┘    └─────────┘       │
    │              │                             │
    │   ┌──────────┼──────────┐                 │
    │   │          │          │                 │
    ▼   ▼          ▼          │                 │
┌────────────┐ ┌─────────┐    │                 │
│cadastro.js │ │lista.js │    │                 │
└─────┬──────┘ └────┬────┘    │                 │
      │             │         │                 │
      └──────┬──────┘         │                 │
             │                │                 │
             ▼                │                 │
        ┌─────────┐           │                 │
        │utils.js │◀──────────┘                 │
        │         │                             │
        │ Storage │                             │
        │   API   │                             │
        └────┬────┘                             │
             │                                  │
             │ HTTP/REST                        │
             │                                  │
    ─────────┼──────────────────────────────────┘
             │
             │         ┌────────────────────────┐
             │         │        BACKEND         │
             ▼         │                        │
        ┌─────────┐    │                        │
        │server.py│◀───┤                        │
        │         │    │                        │
        │  API    │    │                        │
        │ Handler │    │                        │
        └────┬────┘    │                        │
             │         │                        │
             │         └────────────────────────┘
             │
             │         ┌────────────────────────┐
             │         │        DADOS           │
             ▼         │                        │
        ┌──────────┐   │                        │
        │usuarios. │◀──┤                        │
        │  json    │   │                        │
        └──────────┘   │                        │
                       └────────────────────────┘
```

---

## Tecnologias Utilizadas

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Frontend | HTML5 | - |
| Frontend | CSS3 | - |
| Frontend | JavaScript ES6+ | - |
| Backend | Python | 3.x |
| Dados | JSON | - |
| Fontes | Google Fonts (Inter) | - |

---

## Autor

**Tharlis David**

Sistema desenvolvido como projeto de estudo de arquitetura web fullstack.
