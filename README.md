# Aplicação de Chat em Tempo Real

Este projeto implementa uma aplicação de chat em tempo real com funcionalidades de cadastro, login e troca de mensagens. O backend é desenvolvido com Node.js (Express) e o frontend com React/Next.js. Os dados são armazenados em um banco de dados MongoDB.

## Funcionalidades

- Cadastro de Usuários
- Autenticação de Usuários (Login/Logout)
- Chat em Tempo Real com Socket.io
- Armazenamento de Mensagens no MongoDB
- Notificações de Novas Mensagens (visual)
- Lista de Usuários Online/Offline
- Suporte a Docker
- Suporte a Cluster (Node.js)

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- MongoDB (local ou Atlas)
- Docker e Docker Compose (opcional, para rodar com contêineres)

## Configuração e Execução

### 1. Clonar o Repositório

```bash
git clone <URL_DO_REPOSITORIO>  # Substitua <URL_DO_REPOSITORIO> pela URL real do repositório
cd ixc-test
```

### 2. Configurar o Backend

Navegue até o diretório `backend`:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
# ou
yarn install
```

Configure a conexão com o MongoDB em `backend/src/config/database.js`. Certifique-se de que `mongoURI` aponte para a sua instância do MongoDB.

Para iniciar o backend:

```bash
npm start
# ou
yarn start
```

O servidor backend será iniciado na porta 5000 (http://localhost:5000).

### 3. Configurar o Frontend

Navegue até o diretório `frontend`:

```bash
cd ../frontend
```

Instale as dependências:

```bash
npm install
# ou
yarn install
```

Para iniciar o frontend:

```bash
npm run dev
# ou
yarn dev
```

O servidor frontend será iniciado na porta 3000 (http://localhost:3000).

### 4. Execução com Docker (Opcional)

Certifique-se de ter o Docker e o Docker Compose instalados.

Navegue até o diretório `backend` (onde está o `docker-compose.yml`):

```bash
cd backend
```

Para construir as imagens e iniciar os contêineres (backend e MongoDB):

```bash
docker-compose up --build
```

Isso irá iniciar o backend na porta 5000 e o MongoDB na porta 27017. Você pode então iniciar o frontend separadamente (passo 3) e ele se conectará ao backend em execução no Docker.

Para parar os contêineres:

```bash
docker-compose down
```

## Estrutura do Projeto

```
ixc-test/
├── backend/             # Código do servidor Node.js (Express)
│   ├── src/
│   │   ├── config/      # Configurações (MongoDB, Passport)
│   │   ├── models/      # Modelos de dados (User, Message)
│   │   ├── routes/      # Rotas da API (users, messages)
│   │   └── index.js     # Ponto de entrada do servidor
│   ├── Dockerfile       # Dockerfile para o backend
│   └── docker-compose.yml # Configuração Docker Compose
├── frontend/            # Código da aplicação React/Next.js
│   ├── public/          # Arquivos estáticos
│   ├── src/
│   │   ├── app/         # Páginas da aplicação (login, chat, register)
│   │   └── components/  # Componentes reutilizáveis (LoginPage, ChatPage, RegisterPage)
│   └── ...              # Outros arquivos de configuração do Next.js
└── README.md            # Este arquivo
```

## Considerações Finais

- A aplicação backend utiliza o módulo `cluster` do Node.js para aproveitar múltiplos núcleos da CPU, melhorando a escalabilidade.
- As mensagens são persistidas no MongoDB, garantindo a durabilidade dos dados.
- As notificações de novas mensagens são visuais, indicando mensagens não lidas na lista de usuários.
