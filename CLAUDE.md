# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Brazilian User Registration Management System - a client-side web application for registering and managing user profiles. Built with vanilla HTML, CSS, and JavaScript with no external dependencies.

## How to Run

Open `index.html` directly in a web browser. No build process required - all features work client-side.

## Architecture

### File Structure
- `index.html` - Registration form page
- `lista.html` - User list/management page
- `css/styles.css` - Design system with CSS variables
- `js/utils.js` - Shared utilities, APIs, and Storage wrapper
- `js/cadastro.js` - Registration page logic
- `js/lista.js` - List page and edit modal logic

### Data Flow
- Data persisted in browser localStorage as JSON
- Photos stored as base64 strings (auto-resized to 300x300px)
- No backend server required

### Key Utilities in `js/utils.js`
- `Storage` object: CRUD operations for localStorage (`getUsuarios`, `salvarUsuario`, `atualizarUsuario`, `excluirUsuario`, `getUsuarioPorId`)
- `validarCPF()`: Mathematical CPF validation
- `validarCPFReal()`: API-based CPF verification (Invertexto API)
- `buscarCEP()`: Address lookup via ViaCEP API
- `buscarEstados()` / `buscarCidadesPorEstado()`: IBGE geographic data
- `mostrarNotificacao()`: Toast notifications
- `mostrarConfirmacao()`: Confirmation dialogs
- `mostrarErroFormulario()`: Error handling with mobile vibration

## External APIs

| API | Purpose | Endpoint |
|-----|---------|----------|
| Invertexto | CPF validation | `https://api.invertexto.com/v1/validator` |
| ViaCEP | Postal code lookup | `https://viacep.com.br/ws/{cep}/json/` |
| IBGE | States and cities | `https://servicodados.ibge.gov.br/api/v1/localidades/` |

## Configuration

In `js/utils.js`:
```javascript
const CONFIG = {
    INVERTEXTO_TOKEN: 'your-token-here',
    MODO_VALIDACAO_CPF: 'api'  // or 'local' for offline validation
};
```

Get your token at https://api.invertexto.com

## CSS Design System

CSS variables defined in `:root` for colors, spacing, typography, and shadows. Key classes:
- `.campo-input.valido` / `.invalido` / `.validando` - Form validation states
- `.btn-primario` / `.btn-secundario` / `.btn-perigo` - Button variants
- `.toast-sucesso` / `.toast-erro` / `.toast-info` - Notification types

## Code Patterns

- Forms use `novalidate` with custom JavaScript validation
- Async/await for all API calls with error handling
- Event delegation for dynamically created elements
- Image handling via FileReader and Canvas APIs
- Mobile-first responsive design with CSS media queries
