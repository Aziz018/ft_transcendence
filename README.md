# ft_transcendence

# Project Structure

```
ft_transcendence
├── backend
│   ├── auth-service
│   │   ├── db/
│   │   ├── src
│   │   │   ├── plugins/
│   │   │   ├── routes/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── blockchain-service
│   │   ├── db/
│   │   ├── src
│   │   │   ├── contracts/
│   │   │   ├── routes/
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── chat-service
│   │   ├── db/
│   │   ├── src
│   │   │   ├── routes/
│   │   │   ├── websocket/
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── game-service
│   │   ├── db/
│   │   ├── src
│   │   │   ├── game/
│   │   │   ├── routes/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── monitoring
│   │   ├── elk
│   │   │   ├── certs/
│   │   │   ├── Data/
│   │   │   ├── elasticsearch
│   │   │   │   └── Dockerfile
│   │   │   ├── kibana
│   │   │   ├── docker-compose.yml
│   │   └── prometheus-grafana
│   │       ├── alertmanager
│   │       │   ├── config
│   │       │   │   └── alertmanager.yml
│   │       │   └── Dockerfile
│   │       ├── grafana
│   │       │   ├── setup-dashboards
│   │       │   │   ├── scripts\
│   │       │   │   └── Dockerfile
│   │       │   └── Dockerfile
│   │       ├── prometheus
│   │       │   ├── config\
│   │       │   └── Dockerfile
│   │       ├── docker-compose.yaml
│   ├── security
│   │   └── vault
│   │       ├── policies\
│   │       ├── config.hcl
│   │       └── Dockerfile
│   ├── server
│   │   ├── ssl\
│   │   ├── Dockerfile
│   │   └── nginx.config
│   └── user-service
│       ├── db\
│       ├── src
│       │   ├── routes\
│       │   ├── types\
│       │   └── index.ts
│       ├── Dockerfile
│       └── package.json
├── frontend
│   ├── public
│   ├── src
│   │   ├── components\
│   │   ├── services\
│   │   ├── types\
│   │   ├── utils\
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── docker-compose.yml
├── LICENSE
├── Makefile
└── README.md
```