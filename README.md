# 🚀 Krish Bhingradiya — Projects Repository

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/CI_Pipeline-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="CI" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

<p align="center">
  A multi-project monorepo housing two independent production-grade software applications: a <b>Full-Stack Task Manager REST API with Gemini AI</b> and a <b>Modern Personal Portfolio Single-Page Application</b>. Each project is completely decoupled with its own dependencies, runtime scripts, configuration, and documentation.
</p>

---

## 📑 Repository Structure

```text
API-Testing/
│
├── 📁 API-Testing-Project/          # Project 1: REST API + AI Task Manager + Test Suite
│   ├── src/                         # Express routes, controllers, middleware, models
│   ├── frontend/                    # Vite + React frontend dashboard
│   ├── tests/                       # Automated Jest & Supertest integration test suite
│   ├── docs/                        # Practical lab reports and verification screenshots
│   ├── postman/                     # Postman workspace & collections
│   ├── Dockerfile & docker-compose  # Containerization configurations
│   ├── package.json                 # Backend dependencies & test scripts
│   └── README.md                    # Dedicated API-Testing documentation
│
├── 📁 Portfolio-Web/                # Project 2: Modern React 19 Portfolio SPA
│   ├── src/                         # Components, pages, routing, CSS styling, assets
│   ├── public/                      # Static assets & resume
│   ├── index.html                   # HTML entry point
│   ├── vite.config.js               # Vite build configuration
│   ├── package.json                 # Frontend dependencies & scripts
│   └── README.md                    # Dedicated Portfolio documentation
│
├── 📁 .github/                      # CI/CD Workflows
│   └── workflows/ci.yml             # Dual-pipeline automated testing & build validation
│
├── .gitignore                       # Global git ignore rules
└── README.md                        # Master repository documentation
```

---

## 🧭 Projects Overview

| Feature / Detail | 🛡️ Project 1: API-Testing-Project | 🌐 Project 2: Portfolio-Web |
| :--- | :--- | :--- |
| **Directory** | [`API-Testing-Project/`](./API-Testing-Project) | [`Portfolio-Web/`](./Portfolio-Web) |
| **Domain** | Backend REST API & Task Automation | Frontend Single-Page Application (SPA) |
| **Primary Stack** | Node.js 20 LTS, Express.js, MongoDB, Mongoose | React 19, Vite 8, React Router DOM 7 |
| **Secondary Stack** | Google Gemini AI, Docker, Jest, Supertest | Vanilla CSS (Zero CSS frameworks), Oxlint |
| **Testing / CI** | Automated Jest & Supertest test suite | Oxlint static analysis & Vite production build |
| **Key Capability** | Intelligent AI task generator, CRUD, rate limiting | GitHub REST API integration, theme persistence |
| **Documentation** | [API-Testing README](./API-Testing-Project/README.md) | [Portfolio-Web README](./Portfolio-Web/README.md) |

---

## 🚀 Independent Execution Guides

Each project is designed to run independently without interfering with the other.

### 🔷 Project 1: Running `API-Testing-Project`

#### 1. Navigate to the project directory
```bash
cd API-Testing-Project
```

#### 2. Install dependencies
```bash
npm install
npm --prefix frontend install
```

#### 3. Configure environment variables
Copy the example environment file and configure your variables:
```bash
cp .env.example .env
```
*(Optionally provide your `GEMINI_API_KEY` for AI task generation and `MONGODB_URI` if connecting to local/cloud MongoDB).*

#### 4. Run tests
```bash
npm test
```

#### 5. Start the development server
```bash
npm run dev
```
* **Backend API:** `http://localhost:5001`
* **Frontend UI:** `http://localhost:5173`

*(Alternatively, run using Docker: `docker compose up --build -d`)*

---

### 🔶 Project 2: Running `Portfolio-Web`

#### 1. Navigate to the project directory
```bash
cd Portfolio-Web
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Run the development server
```bash
npm run dev
```
* **Portfolio Web Application:** `http://localhost:5173`

#### 4. Run lint and production build
```bash
npm run lint
npm run build
```

---

## ⚙️ Automated Continuous Integration (CI)

This repository includes a unified GitHub Actions workflow in [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) that automatically executes on every push and pull request to `main`:

1. **`test-api` job**: Sets up Node.js 20 LTS, installs dependencies, and executes the complete Jest test suite for `API-Testing-Project`.
2. **`test-portfolio` job**: Sets up Node.js 20 LTS, installs dependencies, executes `oxlint` checks, and builds the production bundle for `Portfolio-Web`.

---

## 👨‍💻 Author & Academic Information

- **Student Name:** Krish Bhingradiya
- **Degree:** Bachelor of Technology (B.Tech) — Information Technology
- **University:** Charotar University of Science and Technology (CHARUSAT)
- **GitHub:** [@krishbhingradiya](https://github.com/krishbhingradiya)
- **Email:** [krishbhingradiya05@gmail.com](mailto:krishbhingradiya05@gmail.com)

---

## 📄 License

This repository is licensed under the [MIT License](LICENSE).

