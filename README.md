<div id="top">

<!-- HEADER STYLE: CLASSIC -->
<div align="center">

<img src="assets/cover.png" style="position: relative; top: 0; right: 0;" alt="Project Cover"/>

<em></em>

<!-- BADGES -->
<!-- local repository, no metadata badges. -->

<em>Built with the tools and technologies:</em>

<img src="https://img.shields.io/badge/Express-000000.svg?style=default&logo=Express&logoColor=white" alt="Express">
<img src="https://img.shields.io/badge/Fastify-000000.svg?style=default&logo=Fastify&logoColor=white" alt="Fastify">
<img src="https://img.shields.io/badge/JSON-000000.svg?style=default&logo=JSON&logoColor=white" alt="JSON">
<img src="https://img.shields.io/badge/Markdown-000000.svg?style=default&logo=Markdown&logoColor=white" alt="Markdown">
<img src="https://img.shields.io/badge/Lucide-F56565.svg?style=default&logo=Lucide&logoColor=white" alt="Lucide">
<img src="https://img.shields.io/badge/npm-CB3837.svg?style=default&logo=npm&logoColor=white" alt="npm">
<img src="https://img.shields.io/badge/TOML-9C4121.svg?style=default&logo=TOML&logoColor=white" alt="TOML">
<img src="https://img.shields.io/badge/Prettier-F7B93E.svg?style=default&logo=Prettier&logoColor=black" alt="Prettier">
<img src="https://img.shields.io/badge/esbuild-FFCF00.svg?style=default&logo=esbuild&logoColor=black" alt="esbuild">
<img src="https://img.shields.io/badge/.ENV-ECD53F.svg?style=default&logo=dotenv&logoColor=black" alt=".ENV">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=default&logo=JavaScript&logoColor=black" alt="JavaScript">
<img src="https://img.shields.io/badge/pino-687634.svg?style=default&logo=pino&logoColor=white" alt="pino">
<img src="https://img.shields.io/badge/EJS-B4CA65.svg?style=default&logo=EJS&logoColor=black" alt="EJS">
<img src="https://img.shields.io/badge/Vitest-6E9F18.svg?style=default&logo=Vitest&logoColor=white" alt="Vitest">
<img src="https://img.shields.io/badge/Nodemon-76D04B.svg?style=default&logo=Nodemon&logoColor=white" alt="Nodemon">
<img src="https://img.shields.io/badge/GNU%20Bash-4EAA25.svg?style=default&logo=GNU-Bash&logoColor=white" alt="GNU%20Bash">
<img src="https://img.shields.io/badge/Ajv-23C8D2.svg?style=default&logo=Ajv&logoColor=white" alt="Ajv">
<br>
<img src="https://img.shields.io/badge/React-61DAFB.svg?style=default&logo=React&logoColor=black" alt="React">
<img src="https://img.shields.io/badge/Docker-2496ED.svg?style=default&logo=Docker&logoColor=white" alt="Docker">
<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=default&logo=TypeScript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/tsnode-3178C6.svg?style=default&logo=ts-node&logoColor=white" alt="tsnode">
<img src="https://img.shields.io/badge/Prisma-2D3748.svg?style=default&logo=Prisma&logoColor=white" alt="Prisma">
<img src="https://img.shields.io/badge/Zod-3E67B1.svg?style=default&logo=Zod&logoColor=white" alt="Zod">
<img src="https://img.shields.io/badge/Vite-646CFF.svg?style=default&logo=Vite&logoColor=white" alt="Vite">
<img src="https://img.shields.io/badge/ESLint-4B32C3.svg?style=default&logo=ESLint&logoColor=white" alt="ESLint">
<img src="https://img.shields.io/badge/Axios-5A29E4.svg?style=default&logo=Axios&logoColor=white" alt="Axios">
<img src="https://img.shields.io/badge/CSS-663399.svg?style=default&logo=CSS&logoColor=white" alt="CSS">
<img src="https://img.shields.io/badge/Jest-C21325.svg?style=default&logo=Jest&logoColor=white" alt="Jest">
<img src="https://img.shields.io/badge/YAML-CB171E.svg?style=default&logo=YAML&logoColor=white" alt="YAML">
<img src="https://img.shields.io/badge/React%20Router-CA4245.svg?style=default&logo=React-Router&logoColor=white" alt="React%20Router">

</div>
<br>

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
    - [Project Index](#project-index)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Usage](#usage)
    - [Testing](#testing)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

**ft_transcendence** a comprehensive, real-time web application that brings the classic Pong experience into the modern era. Designed with a focus on concurrency, scalability, and user experience, this platform is more than just a game; it's a full-featured social ecosystem.

The project integrates real-time WebSockets for instantaneous gameplay and chat, secure authentication with 2FA, and a comprehensive monitoring stack to ensure 99.9% uptime and performance reliability.

---

## Features

**🎮 The Arena (Core Gameplay)**
- **Real-time Multiplayer:** Low-latency Pong matches powered by WebSockets.
- **Dual Mode Support:**
    - **Local Play:** Battle friends on the same machine.
    - **Remote Play:** Matchmaking system for global challenges.
- **AI Contender:** An intelligent bot system for solo practice and skill-building.
- **Live Game Synchronization:** Seamless state management across all connected clients.

**💬 Social Hub (Chat & Community)**
- **Dynamic Chat Rooms:** Create, join, and manage public or password-protected channels.
- **Direct Messaging (DMs):** Private, secure communication between users.
- **Moderation Tools:** Admin capabilities including kicking, banning, and promoting members.
- **Live Status Tracking:** Real-time "Online/Offline/In-Game" status indicators.
- **Friend System:** Manage relationships, block intruders, and invite friends to matches.

**🔐 Security & Identity**
- **Multi-Strategy Auth:** Support for traditional credentials and OAuth2 (42 & Google).
- **Advanced Protection:**
    - **Two-Factor Authentication (2FA):** Google Authenticator integration for account security.
    - **JWT Security:** Secure token-based sessions with refresh rotation.
- **Profile Customization:** Personalize your presence with avatars and unique handles.


**📊 Engine & Orchestration**
- **Scalar Interactive Docs:** Sleek, modern API documentation accessible at /docs.
- **Observation Stack:**
    - **ELK Stack:** Centralized logging for debugging and audit trails.
    - **Prometheus & Grafana:** Real-time performance metrics and visual dashboards.
- **Database Reliability:** Type-safe interactions using Prisma ORM with PostgreSQL.
- **Dockerized Environment:** Fully containerized services for consistent "one-command" deployment.

---

## Project Structure

<code>❯ *48 directories, 35 files* </code>

```sh
.
├── assets
│   └── cover.png
├── backend
│   ├── Dockerfile
│   ├── ecosystem.config.cjs
│   ├── ecosystem.config.js
│   ├── filebeat.yml
│   ├── nodemon.json
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── prisma
│   │   └── schema.prisma
│   ├── public
│   │   └── images
│   ├── src
│   │   ├── app.ts
│   │   ├── auth
│   │   ├── controllers
│   │   ├── generated
│   │   ├── hooks
│   │   ├── middleware
│   │   ├── models
│   │   ├── plugins
│   │   ├── routes
│   │   ├── schemas
│   │   ├── server.ts
│   │   ├── services
│   │   ├── tests
│   │   ├── types
│   │   └── utils
│   └── tsconfig.json
├── CONTRIBUTING.md
├── docker-compose.yml
├── frontend
│   ├── dist
│   │   ├── assets
│   │   └── index.html
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── src
│   │   ├── app.tsx
│   │   ├── assets
│   │   ├── components
│   │   ├── config
│   │   ├── context
│   │   ├── global
│   │   ├── lib
│   │   ├── main.tsx
│   │   ├── router.tsx
│   │   ├── screens
│   │   ├── services
│   │   ├── styles
│   │   ├── svg.d.ts
│   │   └── types
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── LICENSE
├── monitoring
│   ├── ELK-Stack
│   │   ├── docker-compose.yml
│   │   ├── filebeat
│   │   ├── logstash
│   │   ├── nginx
│   │   ├── setupDashboards
│   │   ├── setupDataCycleLife
│   │   ├── setupPassowrds
│   │   └── setupSSL
│   └── PrometheusGrafana
│       ├── alertmanager
│       ├── docker-compose.yaml
│       ├── grafana
│       ├── LICENSE
│       ├── Makefile
│       ├── prometheus
│       └── service-x
└── README.md
```

---

## Getting Started

### Prerequisites

This project requires the following dependencies:

- **Programming Language:** JavaScript
- **Package Manager:** Npm, Yarn
- **Container Runtime:** Docker

### Installation

Build  from the source and intsall dependencies:

1. **Clone the repository:**

    ```sh
    git clone ../
    ```

2. **Navigate to the project directory:**

    ```sh
    cd 
    ```

3. **Install the dependencies:**

    <br/>

    [![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

    **Using [docker](https://www.docker.com/):**

    ```sh
    docker build -t my-app .
    ```

    [![npm](https://img.shields.io/badge/npm-CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/)
	**Using [npm](https://www.npmjs.com/):**

	```sh
	npm install
	```

    [![yarn](https://img.shields.io/badge/Yarn-2C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white)](https://yarnpkg.com/)
	**Using [yarn](https://yarnpkg.com/):**

	```sh
	yarn install
	```

    [![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge\&logo=bun\&logoColor=white)](https://bun.sh/)
    **Using [bun](https://bun.sh/):**

    ```sh
    bun install
    ```

### Usage

Run the project with:

**Using [docker](https://www.docker.com/):**
```sh
docker run -it {image_name}
```
**Using [npm](https://www.npmjs.com/):**
```sh
npm start
```
**Using [yarn](https://yarnpkg.com/):**
```sh
yarn start
```

---

## Contributing

- **💬 [Join the Discussions](https://LOCAL///discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://LOCAL///issues)**: Submit bugs found or log feature requests for the `` project.
- **💡 [Submit Pull Requests](https://LOCAL///blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your LOCAL account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone .
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to LOCAL**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

---

## License

 is protected under the [LICENSE](https://choosealicense.com/licenses) License. For more details, refer to the [LICENSE](https://choosealicense.com/licenses/) file.

---

## Acknowledgments

- Credit `contributors`, `inspiration`, `references`, etc.

<div align="right">

[![][back-to-top]](#top)

</div>


[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square


---
