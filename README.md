# Desafio Backend Node.js — Likes API

API REST desenvolvida em **NestJS + TypeScript** que simula a funcionalidade de likes em posts de uma rede social. O projeto implementa filas assíncronas, cache distribuído e persistência relacional, garantindo consistência dos dados mesmo sob alta concorrência.
 
---

## Sumário

- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Como executar](#como-executar)
- [Endpoints disponíveis](#endpoints-disponíveis)
- [Decisões técnicas](#decisões-técnicas)
- [Estrutura do projeto](#estrutura-do-projeto)
---

## Tecnologias utilizadas

| Tecnologia       | Finalidade                                      |
|------------------|-------------------------------------------------|
| NestJS           | Framework principal da API                      |
| TypeScript       | Tipagem estática e segurança em tempo de build  |
| Prisma ORM       | Acesso ao banco de dados                        |
| PostgreSQL       | Persistência relacional dos dados               |
| Redis            | Cache distribuído e backend da fila de jobs     |
| BullMQ           | Processamento assíncrono de likes via fila      |
| Docker Compose   | Orquestração dos serviços de infraestrutura     |
| Swagger          | Documentação interativa da API                  |
 
---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado no seu ambiente **WSL 2**:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) com integração WSL 2 habilitada
- Node.js `>= 20.11` (recomendado via [nvm](https://github.com/nvm-sh/nvm))
- npm `>= 10`
---

## Como executar

Todos os comandos abaixo devem ser executados **dentro do terminal da WSL 2**, no diretório raiz do projeto.

### 1. Clone o repositório e instale as dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/likes_api"
REDIS_URL="redis://localhost:6379"
REDIS_HOST="localhost"
REDIS_PORT=6379
```

### 3. Suba os serviços de infraestrutura (PostgreSQL e Redis)

```bash
docker compose up -d
```

Aguarde alguns segundos até que os healthchecks dos containers passem. Você pode verificar o status com:

```bash
docker compose ps
```

### 4. Execute as migrations do banco de dados

```bash
npx prisma migrate dev
```

### 5. (Opcional) Popule o banco com dados de exemplo

```bash
npx prisma db seed
```

Isso irá criar 3 posts iniciais com likes já definidos, úteis para testar o ranking e as rotas de listagem sem precisar criar dados manualmente.

### 6. Inicie a aplicação em modo de desenvolvimento

```bash
npm run start:dev
```

A API estará disponível em: `http://localhost:3000`

A documentação Swagger estará em: `http://localhost:3000/api/docs`
 
---

## Endpoints disponíveis

### Posts

| Método | Rota              | Descrição                                   |
|--------|-------------------|---------------------------------------------|
| GET    | `/posts`          | Lista todos os posts (com cache)            |
| GET    | `/posts/ranking`  | Retorna os posts com mais likes (com cache) |
| GET    | `/posts/:id`      | Busca um post específico por ID (com cache) |

### Likes

| Método | Rota                       | Descrição                                         |
|--------|----------------------------|---------------------------------------------------|
| POST   | `/posts/:postId/likes`     | Enfileira um like para processamento assíncrono   |
| GET    | `/posts/:postId/likes/count` | Retorna a contagem atual de likes de um post    |
 
---

## Decisões técnicas

### NestJS e TypeScript

NestJS foi escolhido por oferecer uma arquitetura modular e opinada, com suporte nativo a injeção de dependência, filtros de exceção e integração com Swagger — tudo essencial para uma API bem estruturada e de fácil manutenção. O TypeScript elimina categorias inteiras de bugs em tempo de compilação e torna o código mais legível e autodocumentado.

### Prisma ORM

O Prisma foi escolhido como ORM por sua excelente integração com TypeScript: ele gera tipos derivados diretamente do schema, eliminando a necessidade de manter DTOs de banco e modelos sincronizados manualmente. Além disso, oferece suporte a transações, migrações declarativas e uma API intuitiva para queries complexas.

### Docker Compose

O Docker Compose garante que qualquer desenvolvedor consiga subir o ambiente de infraestrutura (PostgreSQL e Redis) com um único comando, sem instalar nada localmente além do Docker. Isso elimina problemas do tipo "funciona na minha máquina" e torna o onboarding do projeto rápido e previsível.

### BullMQ + Redis como fila de likes

O requisito central do desafio é tratar múltiplas requisições simultâneas de like sem corromper o estado do banco. A solução adotada foi desacoplar o recebimento da requisição do seu processamento através de uma fila assíncrona. Quando um usuário envia um like, a requisição é aceita imediatamente (HTTP 202) e um job é adicionado à fila do BullMQ. O worker (`LikesProcessor`) consome os jobs sequencialmente e realiza a escrita no banco dentro de uma **transação atômica**, garantindo consistência sem condições de corrida. Caso o processamento falhe, o BullMQ reprocessa automaticamente com backoff exponencial (até 3 tentativas).

### Redis como cache distribuído

O Redis também é usado como camada de cache para as rotas de leitura mais acessadas (`/posts`, `/posts/ranking` e `/posts/:id`). Isso reduz significativamente a carga no banco para leituras repetidas. Sempre que um like é processado com sucesso, as chaves de cache relacionadas ao post afetado são invalidadas, garantindo que os dados exibidos permaneçam consistentes com o estado real do banco.

### Separação dos módulos `posts` e `likes`

Optou-se por criar dois módulos independentes — `PostsModule` e `LikesModule` — seguindo o **Princípio da Responsabilidade Única**. Posts são um agregado com sua própria lógica de leitura, cache e ranking. Likes possuem sua própria lógica de enfileiramento, processamento assíncrono e contagem. Mantê-los separados facilita testes unitários isolados, evita acoplamento desnecessário e deixa o código mais fácil de evoluir — por exemplo, extrair likes para um microsserviço no futuro exigiria apenas mover o módulo existente.

### Filtro global de exceções (`DomainErrorFilter`)

Em vez de tratar erros diretamente nos controllers ou lançar exceções HTTP do NestJS espalhadas pelo código, optou-se por criar exceções de domínio (`PostNotFoundException`, `DuplicatedUserLikeException`) que carregam semântica de negócio. O `DomainErrorFilter` intercepta essas exceções e as converte no HTTP status e payload corretos de forma centralizada. Isso mantém os services e o domínio da aplicação agnósticos ao protocolo HTTP, e facilita a adição de novos casos de erro no futuro sem alterar múltiplos pontos do código.

### Seed (`prisma/seed.ts`)

O seed foi criado para permitir que qualquer desenvolvedor consiga testar a API imediatamente após subir o ambiente, sem precisar criar dados manualmente via chamadas HTTP ou scripts SQL. Ele popula o banco com posts que já possuem contagens de likes diferentes, tornando o teste do endpoint `/ranking` imediatamente significativo.

### Índice `@@index([likesCount(sort: Desc)])` no schema do Prisma

A rota `/posts/ranking` ordena os posts pelo campo `likesCount` em ordem decrescente. Sem um índice, essa operação exigiria um full scan da tabela a cada requisição — inaceitável sob carga. O índice `@@index([likesCount(sort: Desc)])` instrui o PostgreSQL a manter uma estrutura de dados otimizada para exatamente essa consulta, tornando o ranking eficiente mesmo com milhões de posts. A direção `Desc` no índice é intencional: índices são direcionais, e um índice crescente teria que ser percorrido de trás para frente para servir uma query `ORDER BY DESC`, o que anula parte do benefício.
 
---

## Estrutura do projeto

```
src/
├── common/
│   ├── constants/
│   │   └── cache-keys.ts          # Chaves de cache centralizadas
│   ├── errors/
│   │   ├── post-not-found.exception.ts
│   │   └── duplicated-user-like.exception.ts
│   └── filters/
│       └── domain-error.filter.ts # Filtro global de exceções de domínio
├── modules/
│   ├── posts/
│   │   ├── dto/
│   │   ├── posts.controller.ts
│   │   ├── posts.service.ts
│   │   ├── posts.repository.ts
│   │   └── posts.module.ts
│   └── likes/
│       ├── dto/
│       ├── likes.controller.ts
│       ├── likes.service.ts
│       ├── likes.processor.ts     # Worker da fila BullMQ
│       ├── likes.repository.ts
│       └── likes.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
└── main.ts                        # Bootstrap e configuração do Swagger
prisma/
├── schema.prisma
└── seed.ts
docker-compose.yml
```
 
---
