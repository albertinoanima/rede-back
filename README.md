# Rede Back

API em TypeScript e Fastify para uma plataforma de publicacao de dados sobre audiovisual e artes nos paises PALOP.

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Rotas iniciais

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/request-password-reset`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `GET /api/v1/profiles`
- `GET /api/v1/profiles/:id`
- `PATCH /api/v1/profiles/me`
- `POST /api/v1/files`
- `GET /api/v1/files`
- `GET /api/v1/files/:id`
- `PATCH /api/v1/files/:id`
- `POST /api/v1/news`
- `GET /api/v1/news`
- `GET /api/v1/news/:id`
- `PATCH /api/v1/news/:id`
- `POST /api/v1/opportunities`
- `GET /api/v1/opportunities`
- `GET /api/v1/opportunities/:id`
- `PATCH /api/v1/opportunities/:id`

Os repositórios atuais estao em memoria para acelerar o arranque. A estrutura ja separa dominios, serviços e repositorios para facilitar trocar por PostgreSQL/Prisma depois.
