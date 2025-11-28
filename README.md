# Sistema de Cadastro de Usuários

Um sistema web completo para gerenciamento de usuários, desenvolvido com HTML, CSS, JavaScript e Python.

![Python](https://img.shields.io/badge/Python-3.x-blue?logo=python)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## O que este sistema faz?

Este sistema permite **cadastrar, visualizar, editar e excluir usuários** de forma simples e intuitiva. Pense nele como uma agenda de contatos avançada, onde você pode:

- Cadastrar pessoas com nome, CPF, data de nascimento, endereço e foto
- Ver a lista de todas as pessoas cadastradas
- Editar as informações de qualquer pessoa
- Excluir pessoas da lista
- Receber uma mensagem especial de aniversário!

---

## Funcionalidades

### Cadastro de Usuários
- Formulário com validação em tempo real
- Upload de foto via câmera ou galeria
- Busca automática de endereço pelo CEP
- Seleção de estado e cidade com filtro dinâmico
- Validação de CPF (matemática e via API externa)
- Cálculo automático do próximo aniversário

### Listagem de Usuários
- Visualização em tabela (computadores) ou cards (celulares)
- Edição de usuários em modal
- Exclusão com confirmação
- Design responsivo para qualquer tamanho de tela

### Recursos Especiais
- Modal de aniversário ao cadastrar/editar usuário
- Notificações toast para feedback visual
- Vibração no celular em caso de erro
- Máscaras automáticas para CPF e CEP

---

## Como usar?

### Pré-requisitos

Você só precisa ter o **Python 3** instalado no seu computador.

Para verificar se você tem o Python instalado, abra o terminal e digite:

```bash
python --version
```

ou

```bash
python3 --version
```

Se aparecer algo como `Python 3.x.x`, você está pronto!

### Passo a Passo

#### 1. Baixe o projeto

Se você tem o Git instalado:
```bash
git clone <url-do-repositorio>
cd projetofinal
```

Ou simplesmente baixe e extraia o ZIP do projeto.

#### 2. Inicie o servidor

No terminal, entre na pasta `backend` e execute:

```bash
cd backend
python server.py
```

Você verá uma mensagem como esta:

```
╔═══════════════════════════════════════════════════════════╗
║       Sistema de Cadastro de Usuários - Backend          ║
╠═══════════════════════════════════════════════════════════╣
║  Servidor:  http://localhost:8000                        ║
║  Frontend:  /caminho/para/frontend                       ║
║  Dados:     /caminho/para/dados/usuarios.json            ║
╠═══════════════════════════════════════════════════════════╣
║  Endpoints da API REST:                                   ║
║  GET    /api/usuarios      → Listar todos os usuários    ║
║  POST   /api/usuarios      → Criar novo usuário          ║
║  PUT    /api/usuarios/:id  → Atualizar usuário           ║
║  DELETE /api/usuarios/:id  → Excluir usuário             ║
╠═══════════════════════════════════════════════════════════╣
║  Pressione Ctrl+C para encerrar o servidor               ║
╚═══════════════════════════════════════════════════════════╝
```

#### 3. Acesse o sistema

Abra seu navegador e vá para:

```
http://localhost:8000
```

Pronto! O sistema está funcionando.

#### 4. Para parar o servidor

Pressione `Ctrl + C` no terminal.

---

## Estrutura do Projeto

```
projetofinal/
│
├── frontend/                 # Interface do usuário (o que você vê)
│   ├── index.html           # Página de cadastro
│   ├── lista.html           # Página de listagem
│   ├── css/
│   │   └── styles.css       # Estilos visuais
│   └── js/
│       ├── utils.js         # Funções auxiliares
│       ├── cadastro.js      # Lógica do cadastro
│       └── lista.js         # Lógica da listagem
│
├── backend/                  # Servidor (o "motor" do sistema)
│   └── server.py            # Servidor Python
│
├── dados/                    # Onde os dados são salvos
│   └── usuarios.json        # "Banco de dados" dos usuários
│
├── docs/                     # Documentação técnica
│   └── ARCHITECTURE.md      # Arquitetura do sistema
│
└── README.md                 # Este arquivo que você está lendo
```

### Explicando cada pasta:

| Pasta | O que é? | Para quem? |
|-------|----------|------------|
| `frontend/` | As páginas web que você vê no navegador | Designers, desenvolvedores front-end |
| `backend/` | O servidor que processa as requisições | Desenvolvedores back-end |
| `dados/` | Arquivo JSON que guarda os usuários | Administradores, backup |
| `docs/` | Documentação técnica detalhada | Desenvolvedores, arquitetos |

---

## API REST

O sistema possui uma API que pode ser usada para integração com outros sistemas.

### Endpoints Disponíveis

| Ação | Método | URL | Descrição |
|------|--------|-----|-----------|
| Listar | `GET` | `/api/usuarios` | Retorna todos os usuários |
| Buscar | `GET` | `/api/usuarios/{id}` | Retorna um usuário específico |
| Criar | `POST` | `/api/usuarios` | Cadastra um novo usuário |
| Atualizar | `PUT` | `/api/usuarios/{id}` | Atualiza um usuário existente |
| Excluir | `DELETE` | `/api/usuarios/{id}` | Remove um usuário |

### Exemplos de Uso

#### Listar todos os usuários
```bash
curl http://localhost:8000/api/usuarios
```

#### Criar um novo usuário
```bash
curl -X POST http://localhost:8000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João",
    "sobrenome": "Silva",
    "cpf": "123.456.789-00",
    "dataNascimento": "1990-05-15"
  }'
```

#### Atualizar um usuário
```bash
curl -X PUT http://localhost:8000/api/usuarios/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Carlos"
  }'
```

#### Excluir um usuário
```bash
curl -X DELETE http://localhost:8000/api/usuarios/{id}
```

---

## Perguntas Frequentes (FAQ)

### O sistema precisa de internet?

**Parcialmente.** O sistema funciona offline para:
- Cadastrar usuários
- Listar e editar usuários
- Excluir usuários

Mas precisa de internet para:
- Buscar endereço pelo CEP (ViaCEP)
- Carregar lista de estados e cidades (IBGE)
- Validar CPF via API externa (opcional)

### Onde os dados são salvos?

Os dados são salvos no arquivo `dados/usuarios.json`. Este é um arquivo de texto que você pode abrir em qualquer editor.

### Posso fazer backup dos dados?

Sim! Basta copiar o arquivo `dados/usuarios.json` para outro local.

### O sistema funciona no celular?

Sim! O design é responsivo e se adapta a qualquer tamanho de tela.

### Preciso instalar algo além do Python?

Não! O sistema usa apenas a biblioteca padrão do Python, sem dependências externas.

### Posso usar em produção?

Este sistema foi desenvolvido para fins educacionais. Para uso em produção, recomendamos:
- Adicionar autenticação de usuários
- Usar HTTPS
- Substituir o arquivo JSON por um banco de dados real
- Implementar validações de segurança adicionais

---

## Tecnologias Utilizadas

### Frontend (Interface)
- **HTML5**: Estrutura das páginas
- **CSS3**: Estilização visual
- **JavaScript (ES6+)**: Interatividade e validações
- **Google Fonts (Inter)**: Tipografia moderna

### Backend (Servidor)
- **Python 3**: Linguagem de programação
- **http.server**: Servidor HTTP embutido
- **JSON**: Formato de dados

### APIs Externas (Opcionais)
- **ViaCEP**: Busca de endereço por CEP
- **IBGE**: Lista de estados e cidades brasileiras
- **Invertexto**: Validação de CPF

---

## Solução de Problemas

### "Erro ao conectar ao servidor"

1. Verifique se o servidor está rodando (`python server.py`)
2. Verifique se está acessando `http://localhost:8000`
3. Verifique se a porta 8000 não está sendo usada por outro programa

### "Porta já está em uso"

Execute no terminal:
```bash
# Linux/Mac
fuser -k 8000/tcp

# Windows
netstat -ano | findstr :8000
taskkill /PID <numero_do_pid> /F
```

### "Python não encontrado"

Instale o Python 3 em [python.org](https://www.python.org/downloads/)

### "Erro de permissão"

No Linux/Mac, tente executar como administrador:
```bash
sudo python server.py
```

---

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Reportar bugs
2. Sugerir melhorias
3. Enviar pull requests

---

## Licença

Este projeto é de código aberto e pode ser usado livremente para fins educacionais.

---

## Autor

**Tharlis David**

Desenvolvido como projeto de estudo de desenvolvimento web fullstack.

---

## Documentação Adicional

Para informações técnicas detalhadas sobre a arquitetura do sistema, consulte:

- [Documentação de Arquitetura](docs/ARCHITECTURE.md)
# projetofinal
