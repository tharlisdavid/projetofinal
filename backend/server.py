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
import random
import string
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

# Configurações
PORT = 8000
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')
DADOS_DIR = os.path.join(BASE_DIR, 'dados')
DADOS_PATH = os.path.join(DADOS_DIR, 'usuarios.json')

def gerar_id():
    """Gera um ID único"""
    timestamp = hex(int(time.time() * 1000))[2:]
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"{timestamp}{random_str}"

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

class APIHandler(SimpleHTTPRequestHandler):
    """Handler que serve arquivos estáticos e API REST"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    def send_json(self, status_code, data):
        """Envia resposta JSON"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        """Handle GET requests"""
        parsed = urlparse(self.path)
        path = parsed.path

        # API de usuários
        if path == '/api/usuarios':
            usuarios = ler_usuarios()
            self.send_json(200, usuarios)
            return

        if path.startswith('/api/usuarios/'):
            user_id = path.split('/')[-1]
            usuarios = ler_usuarios()
            usuario = next((u for u in usuarios if u['id'] == user_id), None)
            if usuario:
                self.send_json(200, usuario)
            else:
                self.send_json(404, {'erro': 'Usuário não encontrado'})
            return

        # Servir arquivos estáticos
        super().do_GET()

    def do_POST(self):
        """Handle POST requests"""
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/api/usuarios':
            content_length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(content_length).decode('utf-8'))

            usuarios = ler_usuarios()
            novo_usuario = {
                **body,
                'id': gerar_id(),
                'criadoEm': time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
            }
            usuarios.append(novo_usuario)
            salvar_usuarios(usuarios)

            print(f"[+] Usuário criado: {novo_usuario.get('nome', '')} {novo_usuario.get('sobrenome', '')}")
            self.send_json(201, novo_usuario)
            return

        self.send_json(404, {'erro': 'Endpoint não encontrado'})

    def do_PUT(self):
        """Handle PUT requests"""
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith('/api/usuarios/'):
            user_id = path.split('/')[-1]
            content_length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(content_length).decode('utf-8'))

            usuarios = ler_usuarios()
            for i, usuario in enumerate(usuarios):
                if usuario['id'] == user_id:
                    usuarios[i] = {
                        **usuario,
                        **body,
                        'atualizadoEm': time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
                    }
                    salvar_usuarios(usuarios)
                    print(f"[~] Usuário atualizado: {usuarios[i].get('nome', '')} {usuarios[i].get('sobrenome', '')}")
                    self.send_json(200, usuarios[i])
                    return

            self.send_json(404, {'erro': 'Usuário não encontrado'})
            return

        self.send_json(404, {'erro': 'Endpoint não encontrado'})

    def do_DELETE(self):
        """Handle DELETE requests"""
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith('/api/usuarios/'):
            user_id = path.split('/')[-1]
            usuarios = ler_usuarios()

            for i, usuario in enumerate(usuarios):
                if usuario['id'] == user_id:
                    removido = usuarios.pop(i)
                    salvar_usuarios(usuarios)
                    print(f"[-] Usuário excluído: {removido.get('nome', '')} {removido.get('sobrenome', '')}")
                    self.send_json(200, {'mensagem': 'Usuário excluído com sucesso'})
                    return

            self.send_json(404, {'erro': 'Usuário não encontrado'})
            return

        self.send_json(404, {'erro': 'Endpoint não encontrado'})

    def log_message(self, format, *args):
        """Personaliza o log de mensagens"""
        try:
            request = str(args[0]) if args else ''
            status = str(args[1]) if len(args) > 1 else ''
            if '/api/' in request:
                print(f"[API] {request}")
            elif status and status != '200':
                print(f"[{status}] {request}")
        except:
            pass

def main():
    # Garantir que o diretório de dados existe
    if not os.path.exists(DADOS_DIR):
        os.makedirs(DADOS_DIR, exist_ok=True)

    # Garantir que o arquivo de dados existe
    if not os.path.exists(DADOS_PATH):
        with open(DADOS_PATH, 'w') as f:
            json.dump([], f)

    server = HTTPServer(('', PORT), APIHandler)

    print('')
    print('╔═══════════════════════════════════════════════════════════╗')
    print('║       Sistema de Cadastro de Usuários - Backend          ║')
    print('╠═══════════════════════════════════════════════════════════╣')
    print(f'║  Servidor:  http://localhost:{PORT}                        ║')
    print(f'║  Frontend:  {FRONTEND_DIR[:45]:<45} ║')
    print(f'║  Dados:     {DADOS_PATH[:45]:<45} ║')
    print('╠═══════════════════════════════════════════════════════════╣')
    print('║  Endpoints da API REST:                                   ║')
    print('║  ─────────────────────────────────────────────────────    ║')
    print('║  GET    /api/usuarios      → Listar todos os usuários    ║')
    print('║  GET    /api/usuarios/:id  → Buscar usuário por ID       ║')
    print('║  POST   /api/usuarios      → Criar novo usuário          ║')
    print('║  PUT    /api/usuarios/:id  → Atualizar usuário           ║')
    print('║  DELETE /api/usuarios/:id  → Excluir usuário             ║')
    print('╠═══════════════════════════════════════════════════════════╣')
    print('║  Pressione Ctrl+C para encerrar o servidor               ║')
    print('╚═══════════════════════════════════════════════════════════╝')
    print('')

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n[!] Servidor encerrado pelo usuário.')
        server.shutdown()

if __name__ == '__main__':
    main()
