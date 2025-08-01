# ft_transcendence

# Project Structure

```
ft_transcendence/
└── src/
    ├── backend/
    │   ├── controllers/
    │   ├── routes/
    │   ├── services/
    │   ├── middleware/
    │   ├── models/
    │   ├── utils/
    │   ├── config/
    │   ├── app.ts
    │   └── main.ts
    ├── frontend/
    │   ├── public/
    │   ├── src/
    │   │   ├── assets/
    │   │   ├── components/
    │   │   ├── views/
    │   │   ├── router/
    │   │   ├── store/
    │   │   ├── services/
    │   │   ├── utils/
    │   │   └── main.ts
    │   ├── tailwind.config.js
    │   └── tsconfig.json
    ├── database/              ◄◄◄ SHARED LOCATION
    │   ├── schema.sql
    │   ├── seed.sql
    │   ├── migrations/
    │   ├── prisma/
    │   └── utils.ts           # DB helper functions
    ├── pong/
    │   ├── engine/
    │   ├── graphics/
    │   ├── ai/                 # If we use AI module??
    │   └── game.ts
    ├── cli/
    │   └── cli.ts
    ├── docker/
    │   ├── Dockerfile.backend
    │   ├── Dockerfile.frontend
    │   └── nginx.conf          # As reverse proxy
    ├── docs/
    │   ├── README.md
    │   └── diagrams/
    ├── test/
    │   ├── backend/
    │   ├── frontend/
    │   └── pong/
    ├── .env
    ├── .gitignore
    ├── Makefile
    └── README.md
```