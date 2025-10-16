🦇 Wayne Security — Sistema de Gerenciamento de Segurança 🦇

Um sistema full-stack para gerenciamento de segurança, desenvolvido com Python (Flask) no backend e Vanilla JS / HTML / CSS no frontend. Permite gerenciar usuários, áreas, recursos e logs de acesso com autenticação JWT.

🛠 Tecnologias utilizadas

- Backend: Python 3, Flask, Flask-JWT-Extended, Flask-Cors,Flask-SQLAlchemy, PyMySQL, python-dotenv, MySQL (ou SQLite para testes locais)
- Frontend: HTML5, CSS3, JavaScript (Vanilla JS), Servidor HTTP local para testes (python -m http.server)

⚡ Funcionalidades

- Autenticação JWT: login seguro com token

- Dashboard: resumo de usuários, recursos e dispositivos online

- Gerenciamento de Áreas: criar áreas restritas ou abertas, solicitar acesso

- Gerenciamento de Recursos: cadastrar e listar recursos

- Logs de acesso: visualizar as ações recentes dos usuários

🚀 Rodando o projeto localmente
1️⃣ Clonar o repositório

git clone <URL_DO_SEU_REPOSITORIO>
cd "backend wayne security"

2️⃣ Configurar variáveis de ambiente

Copie o arquivo de exemplo: copy env.example .env

Edite .env e defina suas chaves secretas e configurações do MySQL ou SQLite: JWT_SECRET_KEY=YOUR_SECRET_KEY_HERE, DATABASE_URL=mysql+pymysql://USER:PASSWORD@HOST:PORT/DB_NAME

3️⃣ Ativar ambiente virtual (venv)

.\venv\Scripts\Activate.ps1

4️⃣ Instalar dependências

pip install -r requirements.txt

5️⃣ Rodar o backend

python app.py
O backend estará disponível em: http://127.0.0.1:5000

6️⃣ Rodar o frontend

cd "frontend wayne security"
python -m http.server 8080
Acesse o frontend no navegador: http://localhost:8080

🔑 Usuário de teste (seed)

Usuário: bruce
Senha: wayne123

📁 Estrutura do projeto

backend wayne security/
│ app.py
│ models.py
│ database.py
│ requirements.txt
│ env.example # usado como referência
├── routes/
├── utils/
├── venv/
└── pycache/
frontend wayne security/
│ index.html
│ app.js
│ styles.css

⚙️ Observações

- Projeto desenvolvido para propósitos educacionais e testes locais.

- Para produção, recomenda-se usar um servidor WSGI (ex: Gunicorn) e banco de dados robusto.

- O backend utiliza MySQL ou SQLite; configure .env conforme seu banco local.

💡 Dicas de uso

- Não feche o PowerShell do backend nem do frontend enquanto estiver testando

- Todas as ações no frontend (login, criação de áreas, recursos) dependem do backend ativo

- Logs e ações são simulados para teste; áreas restritas não têm autenticação avançada neste MVP

Feito com 🦇 por Bruno Lima
