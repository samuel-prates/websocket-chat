# Frontend da Aplicação de Chat em Tempo Real

Este é o frontend da aplicação de chat em tempo real, desenvolvido com React e Next.js. O frontend fornece uma interface de usuário para registro, login e troca de mensagens em tempo real.

## Funcionalidades

- Registro de usuários
- Autenticação de usuários (login/logout)
- Lista de usuários online/offline
- Chat em tempo real com Socket.IO
- Armazenamento local de mensagens
- Notificações visuais de novas mensagens

## Tecnologias Utilizadas

- [Next.js](https://nextjs.org/) - Framework React para desenvolvimento web
- [React](https://reactjs.org/) - Biblioteca JavaScript para construção de interfaces
- [TypeScript](https://www.typescriptlang.org/) - Superset tipado de JavaScript
- [Socket.IO Client](https://socket.io/docs/v4/client-api/) - Cliente para comunicação em tempo real
- [Axios](https://axios-http.com/) - Cliente HTTP para requisições à API
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS para estilização
- [Jest](https://jestjs.io/) - Framework de testes

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

## Instalação

1. Clone o repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>  # Substitua <URL_DO_REPOSITORIO> pela URL real do repositório
   cd ixc-test/frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configure a conexão com o backend:
   
   O frontend se conecta ao backend na URL `http://localhost:5000` por padrão. Se o backend estiver rodando em uma URL diferente, você precisará ajustar as configurações nos arquivos de utilidades.

## Execução

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

O servidor frontend será iniciado na porta 3000 (http://localhost:3000).

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento com Turbopack
- `npm run build` - Compila o projeto para produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter para verificar o código
- `npm run test` - Executa os testes

## Estrutura do Projeto

```
frontend/
├── public/                # Arquivos estáticos
├── src/
│   ├── app/              # Páginas da aplicação (Next.js App Router)
│   │   ├── chat/         # Página de chat
│   │   ├── register/     # Página de registro
│   │   ├── page.tsx      # Página principal (login)
│   │   └── layout.tsx    # Layout da aplicação
│   ├── components/       # Componentes React
│   │   ├── chat/         # Componentes específicos do chat
│   │   │   ├── ChatHeader.tsx    # Cabeçalho do chat
│   │   │   ├── MessageForm.tsx   # Formulário de mensagens
│   │   │   ├── MessageList.tsx   # Lista de mensagens
│   │   │   └── UserList.tsx      # Lista de usuários
│   │   ├── ChatPage.tsx          # Página de chat
│   │   ├── LoginPage.tsx         # Página de login
│   │   └── RegisterPage.tsx      # Página de registro
│   └── utils/            # Utilitários
│       ├── authUtils.ts          # Utilitários de autenticação
│       ├── messageUtils.ts       # Utilitários de mensagens
│       ├── socketUtils.ts        # Utilitários de Socket.IO
│       ├── storageUtils.ts       # Utilitários de armazenamento local
│       └── __tests__/            # Testes unitários
└── package.json          # Dependências e scripts
```

## Comunicação com o Backend

O frontend se comunica com o backend através de:

1. **Requisições HTTP (Axios)** - Para operações como registro, login e obtenção de dados
2. **Socket.IO** - Para comunicação em tempo real (mensagens, status de usuários)

## Armazenamento Local

O frontend utiliza o localStorage do navegador para:

1. Armazenar o token de autenticação
2. Armazenar mensagens recentes para acesso offline
3. Armazenar preferências do usuário

## Testes

O projeto utiliza Jest para testes unitários. Os testes estão localizados no diretório `src/utils/__tests__`.

Para executar os testes:

```bash
npm test
# ou
yarn test
```

## Desenvolvimento

Para contribuir com o desenvolvimento do frontend:

1. Crie uma branch para sua feature ou correção
2. Implemente suas mudanças
3. Escreva testes para suas mudanças
4. Execute os testes para garantir que tudo está funcionando
5. Faça commit das suas mudanças
6. Envie um pull request