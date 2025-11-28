# Relatório de Boas Práticas

Este documento detalha as boas práticas de desenvolvimento aplicadas no Sistema de Cadastro de Usuários, tanto no Frontend quanto no Backend.

---

## Sumário

1. [Frontend - HTML](#1-frontend---html)
2. [Frontend - CSS](#2-frontend---css)
3. [Frontend - JavaScript](#3-frontend---javascript)
4. [Backend - Python](#4-backend---python)
5. [Segurança](#5-segurança)
6. [Performance](#6-performance)
7. [Arquitetura](#7-arquitetura)

---

## 1. Frontend - HTML

### 1.1 Semântica e Estrutura

| Prática | Implementação | Arquivo |
|---------|---------------|---------|
| **DOCTYPE e lang** | `<!DOCTYPE html>` e `<html lang="pt-BR">` para acessibilidade e SEO | `index.html:1-2` |
| **Meta tags** | Charset UTF-8, viewport responsivo e description | `index.html:4-6` |
| **Tags semânticas** | Uso de `<header>`, `<main>`, `<footer>`, `<nav>`, `<article>` | Todas as páginas |
| **Hierarquia de headings** | Estrutura correta h1 → h2 → h3 | `index.html`, `lista.html` |

### 1.2 Acessibilidade (WCAG)

```html
<!-- Skip link para navegação por teclado -->
<a href="#conteudo-principal" class="skip-link">Pular para o conteúdo principal</a>

<!-- Roles ARIA explícitos -->
<header class="cabecalho" role="banner">
<main id="conteudo-principal" class="principal" role="main">
<nav class="navegacao" role="navigation" aria-label="Menu principal">

<!-- Labels acessíveis -->
<label for="nome" class="campo-label">
    Nome <span class="campo-obrigatorio" aria-hidden="true">*</span>
    <span class="sr-only">(obrigatório)</span>
</label>

<!-- Mensagens de erro com aria-live -->
<span id="nome-erro" class="campo-erro" role="alert" aria-live="polite"></span>

<!-- Descrições de campos -->
<input aria-describedby="cpf-ajuda cpf-erro">
```

| Prática | Descrição |
|---------|-----------|
| **Skip links** | Permite pular navegação para o conteúdo principal |
| **ARIA roles** | `role="banner"`, `role="main"`, `role="navigation"`, `role="alert"` |
| **aria-hidden** | Oculta elementos decorativos de leitores de tela |
| **aria-label** | Descrições para botões com apenas ícones |
| **aria-current** | Indica página atual na navegação |
| **aria-live="polite"** | Anuncia mudanças dinâmicas sem interromper |
| **aria-describedby** | Vincula campos a mensagens de ajuda/erro |
| **sr-only** | Texto apenas para leitores de tela |

### 1.3 Formulários

```html
<!-- Formulário com validação customizada -->
<form id="form-cadastro" class="formulario" novalidate>

<!-- Inputs com atributos semânticos -->
<input
    type="text"
    id="cpf"
    name="cpf"
    required
    maxlength="14"
    inputmode="numeric"
    autocomplete="off"
    aria-describedby="cpf-ajuda cpf-erro"
>
```

| Atributo | Propósito |
|----------|-----------|
| `novalidate` | Desativa validação nativa para usar validação customizada |
| `inputmode="numeric"` | Mostra teclado numérico em mobile |
| `autocomplete` | Sugestões automáticas do navegador |
| `maxlength` | Limita quantidade de caracteres |
| `required` | Marca campos obrigatórios |

### 1.4 Performance de Carregamento

```html
<!-- Preconnect para fontes externas -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- CSS antes do JS -->
<link rel="stylesheet" href="css/styles.css">

<!-- Scripts no final do body -->
<script src="js/utils.js"></script>
<script src="js/cadastro.js"></script>
```

---

## 2. Frontend - CSS

### 2.1 Design System com CSS Variables

```css
:root {
    /* Cores principais */
    --cor-primaria: #6366f1;
    --cor-primaria-hover: #4f46e5;
    --cor-sucesso: #10b981;
    --cor-erro: #ef4444;

    /* Espaçamentos */
    --espacamento-sm: 0.5rem;
    --espacamento-md: 1rem;
    --espacamento-lg: 1.5rem;

    /* Tipografia */
    --fonte-principal: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --tamanho-base: 1rem;

    /* Transições */
    --transicao-rapida: 150ms ease;
    --transicao-normal: 250ms ease;
}
```

**Benefícios:**
- Consistência visual em todo o projeto
- Fácil manutenção e alteração de temas
- Redução de código duplicado
- Possibilidade de dark mode no futuro

### 2.2 Metodologia de Nomenclatura

O CSS segue uma convenção consistente em português:

```css
/* Componentes */
.cabecalho { }
.rodape { }
.formulario { }

/* Elementos */
.cabecalho-conteudo { }
.campo-input { }
.campo-label { }
.campo-erro { }

/* Modificadores */
.btn-primario { }
.btn-secundario { }
.btn-perigo { }

/* Estados */
.campo-input.valido { }
.campo-input.invalido { }
.campo-input.validando { }
```

### 2.3 Reset CSS Moderno

```css
*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html {
    font-size: 16px;
    scroll-behavior: smooth;
}
```

### 2.4 Acessibilidade em CSS

```css
/* Focus visible para navegação por teclado */
:focus-visible {
    outline: 3px solid var(--cor-primaria);
    outline-offset: 2px;
}

/* Remove outline para cliques de mouse */
:focus:not(:focus-visible) {
    outline: none;
}

/* Texto apenas para leitores de tela */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Respeita preferência de movimento reduzido */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}

/* Alto contraste para acessibilidade */
@media (prefers-contrast: high) {
    :root {
        --cor-borda: #000;
        --cor-texto-secundario: #333;
    }
    .campo-input,
    .campo-select {
        border-width: 3px;
    }
}
```

### 2.5 Responsividade Mobile-First

```css
/* Base (mobile) */
.grupo-campos {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--espacamento-md);
}

/* Tablet/Desktop */
@media (min-width: 768px) {
    .grupo-campos {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
}

/* Adaptação de componentes */
@media (max-width: 768px) {
    /* Mostra cards em vez de tabela */
    .tabela-container { display: none; }
    .lista-cards { display: flex; }
}
```

### 2.6 Feedback Visual

```css
/* Estados de validação */
.campo-input.valido {
    border-color: var(--cor-sucesso);
}

.campo-input.invalido {
    border-color: var(--cor-erro);
    background-color: var(--cor-erro-light);
    animation: shake 0.5s ease-in-out;
}

/* Animação de erro */
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* Loading spinner inline */
.campo-input.validando {
    border-color: var(--cor-info);
    background-image: url("data:image/svg+xml,...");
    background-repeat: no-repeat;
    background-position: right 10px center;
}
```

---

## 3. Frontend - JavaScript

### 3.1 Organização do Código

```javascript
// Estrutura consistente em todos os arquivos JS
document.addEventListener('DOMContentLoaded', async function() {
    // 1. Elementos do DOM
    const form = document.getElementById('form-cadastro');
    const campoNome = document.getElementById('nome');

    // 2. Cache de dados
    let estadosCache = [];
    let cidadesCache = {};

    // 3. Inicialização
    await carregarEstados();

    // 4. Event Listeners
    form.addEventListener('submit', handleSubmit);

    // 5. Funções
    async function carregarEstados() { }
    function validarFormulario() { }
});
```

### 3.2 Async/Await e Tratamento de Erros

```javascript
// Todas as chamadas de API usam async/await
async function buscarEnderecoPorCEP(cep) {
    try {
        const endereco = await buscarCEP(cep);
        // Sucesso
        campoLogradouro.value = endereco.logradouro;
        mostrarNotificacao('Endereço encontrado!', 'sucesso');
    } catch (error) {
        // Tratamento de erro
        erroSpan.textContent = error.message;
        campoCEP.classList.add('invalido');
    } finally {
        // Limpeza (sempre executa)
        cepIcone.classList.remove('carregando');
    }
}
```

### 3.3 Validação em Camadas

```javascript
// 1. Validação básica durante digitação
campoCPF.addEventListener('input', async function(e) {
    e.target.value = mascaraCPF(e.target.value);
    await validarCampoCPFBasico(); // Apenas matemática
});

// 2. Validação completa no blur
campoCPF.addEventListener('blur', async function() {
    await validarCampoCPFCompleto(); // Inclui API
});

// 3. Validação final antes de submeter
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (await validarFormulario()) {
        // Submete
    }
});
```

### 3.4 Cache de Dados

```javascript
// Cache de CPFs validados
const cpfValidadosCache = new Map();

async function validarCPFReal(cpf) {
    // Verificar cache antes de chamar API
    if (cpfValidadosCache.has(cpf)) {
        return cpfValidadosCache.get(cpf);
    }

    const resultado = await chamarAPI(cpf);

    // Armazenar no cache
    cpfValidadosCache.set(cpf, resultado);

    return resultado;
}

// Cache de estados e cidades
let estadosCache = [];
let cidadesCache = {};

async function carregarCidades(uf) {
    if (!cidadesCache[uf]) {
        cidadesCache[uf] = await buscarCidadesPorEstado(uf);
    }
    return cidadesCache[uf];
}
```

### 3.5 Feedback ao Usuário

```javascript
// Notificações toast
function mostrarNotificacao(mensagem, tipo = 'sucesso') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    // ...
}

// Vibração em dispositivos móveis
function vibrarErro() {
    if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
    }
}

// Feedback de erro completo
function mostrarErroFormulario(mensagem) {
    vibrarErro();
    mostrarNotificacao(mensagem, 'erro');
}
```

### 3.6 Sanitização de Dados

```javascript
// Prevenção de XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Uso na renderização
tr.innerHTML = `
    <td>${escapeHtml(usuario.nome)} ${escapeHtml(usuario.sobrenome)}</td>
    <td>${escapeHtml(usuario.cpf)}</td>
`;
```

### 3.7 Degradação Graciosa

```javascript
// Fallback quando API falha
async function buscarEstados() {
    try {
        const response = await fetch('https://servicodados.ibge.gov.br/...');
        if (!response.ok) throw new Error('API indisponível');
        return await response.json();
    } catch (error) {
        // Fallback para lista estática
        console.warn('Usando lista estática de estados');
        return ESTADOS_BRASIL;
    }
}

// Campo se adapta quando necessário
function converterCidadeParaInput(valorInicial = '') {
    // Se API falhar, converte select para input de texto
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'cidade';
    input.placeholder = 'Digite o nome da cidade';
    campoCidade.replaceWith(input);
}
```

### 3.8 Modularização

```
js/
├── utils.js      # Funções compartilhadas (Storage, validações, APIs)
├── cadastro.js   # Lógica específica da página de cadastro
└── lista.js      # Lógica específica da página de listagem
```

**utils.js exporta:**
- `CONFIG` - Configurações globais
- `Storage` - CRUD de usuários
- `validarCPF()`, `validarCPFReal()` - Validação
- `mascaraCPF()`, `mascaraCEP()` - Formatação
- `buscarCEP()`, `buscarEstados()`, `buscarCidadesPorEstado()` - APIs
- `mostrarNotificacao()`, `mostrarConfirmacao()`, `mostrarErroFormulario()` - UI

---

## 4. Backend - Python

### 4.1 Estrutura Limpa

```python
#!/usr/bin/env python3
"""
Servidor Python para o Sistema de Cadastro de Usuários

Para executar:
    cd backend
    python server.py

Acesse http://localhost:8000
"""

import json
import os
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Configurações centralizadas
PORT = 8000
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')
DADOS_DIR = os.path.join(BASE_DIR, 'dados')
DADOS_PATH = os.path.join(DADOS_DIR, 'usuarios.json')
```

### 4.2 Separação de Responsabilidades

```python
# Funções de dados (camada de persistência)
def ler_usuarios():
    """Lê usuários do arquivo JSON"""
    try:
        with open(DADOS_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def salvar_usuarios(usuarios):
    """Salva usuários no arquivo JSON"""
    os.makedirs(os.path.dirname(DADOS_PATH), exist_ok=True)
    with open(DADOS_PATH, 'w', encoding='utf-8') as f:
        json.dump(usuarios, f, ensure_ascii=False, indent=2)

def gerar_id():
    """Gera um ID único"""
    timestamp = hex(int(time.time() * 1000))[2:]
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"{timestamp}{random_str}"
```

### 4.3 API REST Padronizada

```python
class APIHandler(SimpleHTTPRequestHandler):
    """Handler que serve arquivos estáticos e API REST"""

    def send_json(self, status_code, data):
        """Envia resposta JSON padronizada"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def do_GET(self):
        if path == '/api/usuarios':
            usuarios = ler_usuarios()
            self.send_json(200, usuarios)
            return
        # Fallback para arquivos estáticos
        super().do_GET()

    def do_POST(self):
        # Criar usuário
        novo_usuario = {
            **body,
            'id': gerar_id(),
            'criadoEm': time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
        }
        self.send_json(201, novo_usuario)

    def do_PUT(self):
        # Atualizar usuário
        usuarios[i] = {
            **usuario,
            **body,
            'atualizadoEm': time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
        }
        self.send_json(200, usuarios[i])

    def do_DELETE(self):
        # Excluir usuário
        self.send_json(200, {'mensagem': 'Usuário excluído com sucesso'})
```

### 4.4 CORS Configurado

```python
def do_OPTIONS(self):
    """Handle CORS preflight"""
    self.send_response(204)
    self.send_header('Access-Control-Allow-Origin', '*')
    self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    self.end_headers()
```

### 4.5 Tratamento de Erros

```python
def ler_usuarios():
    try:
        with open(DADOS_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []  # Retorna lista vazia em caso de erro

def do_GET(self):
    usuario = next((u for u in usuarios if u['id'] == user_id), None)
    if usuario:
        self.send_json(200, usuario)
    else:
        self.send_json(404, {'erro': 'Usuário não encontrado'})
```

### 4.6 Logs Informativos

```python
def log_message(self, format, *args):
    """Personaliza o log de mensagens"""
    request = str(args[0]) if args else ''
    if '/api/' in request:
        print(f"[API] {request}")

# Logs de operações
print(f"[+] Usuário criado: {novo_usuario.get('nome')}")
print(f"[~] Usuário atualizado: {usuarios[i].get('nome')}")
print(f"[-] Usuário excluído: {removido.get('nome')}")
```

### 4.7 Inicialização Segura

```python
def main():
    # Garantir que o diretório de dados existe
    if not os.path.exists(DADOS_DIR):
        os.makedirs(DADOS_DIR, exist_ok=True)

    # Garantir que o arquivo de dados existe
    if not os.path.exists(DADOS_PATH):
        with open(DADOS_PATH, 'w') as f:
            json.dump([], f)

    # Interface informativa
    print('╔═══════════════════════════════════════════════════════════╗')
    print('║       Sistema de Cadastro de Usuários - Backend          ║')
    print('╠═══════════════════════════════════════════════════════════╣')
    print(f'║  Servidor:  http://localhost:{PORT}                        ║')
    # ...

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n[!] Servidor encerrado pelo usuário.')
        server.shutdown()
```

---

## 5. Segurança

### 5.1 Prevenção de XSS

```javascript
// Sanitização de output
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;  // Escapa automaticamente
    return div.innerHTML;
}

// Uso em todo HTML dinâmico
`<td>${escapeHtml(usuario.nome)}</td>`
```

### 5.2 Validação de Inputs

```javascript
// Validação de tipo de arquivo
if (!file.type.startsWith('image/')) {
    mostrarErroFormulario('Por favor, selecione um arquivo de imagem válido.');
    return;
}

// Validação de tamanho
if (file.size > 5 * 1024 * 1024) {
    mostrarErroFormulario('A imagem deve ter no máximo 5MB.');
    return;
}

// Validação matemática de CPF
function validarCPF(cpf) {
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false; // Dígitos repetidos
    // Algoritmo de validação...
}
```

### 5.3 Encoding Correto

```python
# UTF-8 em todo lugar
with open(DADOS_PATH, 'r', encoding='utf-8') as f:
    return json.load(f)

# ensure_ascii=False para caracteres especiais
json.dump(usuarios, f, ensure_ascii=False, indent=2)
```

---

## 6. Performance

### 6.1 Cache em Múltiplos Níveis

| Nível | O que é cacheado | Onde |
|-------|------------------|------|
| **API** | CPFs validados | `cpfValidadosCache` (Map) |
| **Dados** | Estados brasileiros | `estadosCache` (Array) |
| **Dados** | Cidades por UF | `cidadesCache` (Object) |
| **Storage** | Lista de usuários | `Storage._cache` |

### 6.2 Otimização de Imagens

```javascript
function redimensionarImagem(file, maxWidth, maxHeight, callback) {
    const canvas = document.createElement('canvas');
    // Redimensiona para 300x300
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    // Comprime para 80% de qualidade
    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    callback(base64);
}
```

### 6.3 Carregamento Eficiente

```html
<!-- Preconnect para recursos externos -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- CSS no head, JS no final do body -->
<link rel="stylesheet" href="css/styles.css">
...
<script src="js/utils.js"></script>
```

---

## 7. Arquitetura

### 7.1 Separação de Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                      APRESENTAÇÃO                            │
│  index.html │ lista.html │ styles.css                       │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                        LÓGICA                                │
│  cadastro.js │ lista.js │ utils.js                          │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                         API                                  │
│  server.py (REST endpoints)                                 │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                        DADOS                                 │
│  usuarios.json                                               │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Princípios Aplicados

| Princípio | Aplicação |
|-----------|-----------|
| **DRY** | Funções reutilizáveis em `utils.js` |
| **SRP** | Cada arquivo JS tem uma responsabilidade |
| **KISS** | Sem frameworks complexos, código simples |
| **Graceful Degradation** | Fallbacks quando APIs falham |

### 7.3 Convenções de Código

- **Português** para variáveis e funções de negócio
- **camelCase** para variáveis e funções JavaScript
- **snake_case** para funções Python
- **kebab-case** para classes CSS
- **Comentários** separando seções do código

---

## Checklist de Boas Práticas

### HTML
- [x] DOCTYPE e lang definidos
- [x] Meta tags (charset, viewport, description)
- [x] Tags semânticas (header, main, footer, nav)
- [x] Formulários com labels e validação
- [x] Atributos de acessibilidade (ARIA)
- [x] Skip links para navegação

### CSS
- [x] CSS Variables para design system
- [x] Nomenclatura consistente
- [x] Reset CSS moderno
- [x] Mobile-first responsive
- [x] Suporte a prefers-reduced-motion
- [x] Suporte a prefers-contrast
- [x] Focus visible para acessibilidade

### JavaScript
- [x] Código organizado em módulos
- [x] Async/await com try/catch
- [x] Cache de dados
- [x] Validação em múltiplas camadas
- [x] Sanitização de output (XSS)
- [x] Feedback visual ao usuário
- [x] Degradação graciosa

### Python
- [x] Docstrings descritivos
- [x] Separação de responsabilidades
- [x] API REST padronizada
- [x] CORS configurado
- [x] Tratamento de erros
- [x] Logs informativos
- [x] Encoding UTF-8

---

## Autor

**Tharlis David**

Relatório gerado como parte da documentação do Sistema de Cadastro de Usuários.
