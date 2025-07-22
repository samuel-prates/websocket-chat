# Backend da Aplicação de Chat em Tempo Real

Este é o backend da aplicação de chat em tempo real, desenvolvido com Node.js (Express) e MongoDB. O backend fornece APIs para gerenciamento de usuários e mensagens, além de suporte para comunicação em tempo real via Socket.IO.

## Arquitetura

O projeto segue uma arquitetura limpa (Clean Architecture) com:

- **Entidades de Domínio**: `src/application/domain`
- **Casos de Uso**: `src/application/usecases`
- **Portas (Interfaces)**: `src/application/ports`
- **Adaptadores (Implementações)**: `src/infrastructure/adapters`

Esta arquitetura promove a separação de preocupações e facilita a testabilidade do código.

## Funcionalidades

- Cadastro e autenticação de usuários
- Gerenciamento de status online/offline
- Envio e recebimento de mensagens em tempo real
- Persistência de mensagens no MongoDB
- Suporte a clustering para melhor desempenho
- Integração com Redis para escalabilidade horizontal do Socket.IO

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- MongoDB (local ou Atlas)
- Redis (opcional, para escalabilidade horizontal)
- Docker e Docker Compose (opcional, para rodar com contêineres)

## Instalação

1. Clone o repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>  # Substitua <URL_DO_REPOSITORIO> pela URL real do repositório
   cd ixc-test/backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configure a conexão com o MongoDB em `src/config/database.js`.

## Execução

Para iniciar o servidor em modo de desenvolvimento:

```bash
npm start
# ou
yarn start
```

O servidor será iniciado na porta 5000 (http://localhost:5000).

## Execução com Docker

1. Certifique-se de ter o Docker e o Docker Compose instalados.

2. Execute o seguinte comando para construir e iniciar os contêineres:
   ```bash
   docker-compose up --build
   ```

3. Para parar os contêineres:
   ```bash
   docker-compose down
   ```

## Scripts Disponíveis

- `npm test` - Executa os testes unitários
- `npm run test:cov` - Executa os testes unitários com cobertura
- `npm run test:integration` - Executa os testes de integração

## API Endpoints

### Usuários

- `POST /users/register` - Registra um novo usuário
  - Body: `{ "name": "Nome", "username": "usuario", "password": "senha" }`
  - Response: `{ "msg": "User registered successfully", "user": {...} }`

- `POST /users/login` - Autentica um usuário
  - Body: `{ "username": "usuario", "password": "senha" }`
  - Response: `{ "msg": "Successfully Authenticated", "user": {...} }`

- `GET /users/logout` - Desconecta um usuário
  - Response: `{ "msg": "Successfully logged out" }`

- `GET /users` - Obtém todos os usuários
  - Response: `[{ "id": "...", "name": "...", "username": "...", "online": true/false }, ...]`

### Mensagens

- `POST /messages` - Envia uma mensagem
  - Body: `{ "from": "userId1", "to": "userId2", "message": "Texto da mensagem" }`
  - Response: `{ "id": "...", "from": "...", "to": "...", "message": "...", "timestamp": "..." }`

- `GET /messages/:user1Id/:user2Id` - Obtém mensagens entre dois usuários
  - Response: `[{ "id": "...", "from": "...", "to": "...", "message": "...", "timestamp": "..." }, ...]`

## Comunicação em Tempo Real (Socket.IO)

O backend utiliza Socket.IO para comunicação em tempo real. Os principais eventos são:

- `connection` - Quando um cliente se conecta
- `disconnect` - Quando um cliente se desconecta
- `join` - Quando um usuário entra em uma sala de chat
- `message` - Quando uma mensagem é enviada
- `typing` - Quando um usuário está digitando
- `stop-typing` - Quando um usuário para de digitar

## Estrutura do Projeto

```
backend/
├── src/
│   ├── application/
│   │   ├── domain/       # Entidades de domínio
│   │   ├── ports/        # Interfaces (portas)
│   │   └── usecases/     # Casos de uso
│   ├── config/           # Configurações
│   ├── infrastructure/
│   │   └── adapters/     # Implementações de adaptadores
│   │       ├── auth/     # Adaptadores de autenticação
│   │       ├── http/     # Rotas e controladores HTTP
│   │       ├── persistence/ # Repositórios e modelos
│   │       └── realtime/ # Adaptadores para comunicação em tempo real
│   └── index.js          # Ponto de entrada da aplicação
├── tests/
│   ├── integration/      # Testes de integração
│   └── unit/             # Testes unitários
├── docker-compose.yml    # Configuração do Docker Compose
├── Dockerfile            # Configuração do Docker
└── package.json          # Dependências e scripts
```

## Testes

O projeto segue uma estratégia de testes abrangente, com testes unitários e de integração.

### Testes Unitários

Os testes unitários estão localizados no diretório `tests/unit` e testam componentes individuais isoladamente.

Para executar os testes unitários:

```bash
npm test
```

Para executar os testes unitários com cobertura:

```bash
npm run test:cov
```

### Testes de Integração

Os testes de integração estão localizados no diretório `tests/integration` e testam a interação entre componentes.

Para executar os testes de integração:

```bash
npm run test:integration
```

## Requisitos de Cobertura

O projeto visa alta cobertura de testes para garantir qualidade e confiabilidade:
- Declarações: 95%
- Ramificações: 95%
- Funções: 95%
- Linhas: 95%

## Escalabilidade

O backend suporta clustering usando o módulo `cluster` do Node.js para aproveitar múltiplos núcleos da CPU. Além disso, utiliza Redis como adaptador para o Socket.IO, permitindo escalabilidade horizontal em múltiplas instâncias.