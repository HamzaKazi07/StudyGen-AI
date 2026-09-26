# StudyGen AI

<p align="center">
  <strong>AI-Powered Study Assistant</strong>
</p>

<p align="center">
  An AI-powered study platform designed to help students understand, organize, and interact with educational content.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active%20Development-orange" alt="Status">
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB" alt="Frontend">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688" alt="Backend">
  <img src="https://img.shields.io/badge/AI-Google%20Gemini-4285F4" alt="AI">
  <img src="https://img.shields.io/badge/Development-Graft%20%2B%20Agency%20Agents-purple" alt="Development">
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Clone the Repository](#clone-the-repository)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
  - [Docker Setup](#docker-setup)
- [Development Tools](#-development-tools)
  - [Graft](#-graft)
  - [Agency Agents](#-agency-agents)
- [AI Coding Workflow](#-ai-coding-workflow)
- [Screenshots](#-screenshots)
- [Project Status](#-project-status)
- [Future Improvements](#-future-improvements)
- [Development Philosophy](#-development-philosophy)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Overview

**StudyGen AI** is an AI-powered study assistant being developed to help students interact with educational content through a modern web application and conversational AI.

The project focuses on creating a centralized learning environment where students can:

- Interact with an AI Tutor
- Work with study material
- Organize educational content
- Ask educational questions
- Explore AI-assisted learning workflows
- Progress toward document-aware learning

StudyGen AI is currently under active development, with the architecture designed to support additional AI and learning capabilities in future iterations.

---

## ✨ Features

### 🤖 AI Tutor

- Conversational AI-powered study assistance
- Educational explanations and answers
- Dedicated AI Tutor interface
- Google Gemini integration
- Prompt/system-instruction based AI behavior

### 📚 Study Material

- Document-oriented learning workflow
- Upload and manage study material
- Foundation for document-aware AI interactions

### 🧠 AI-Powered Learning

- AI-assisted explanations
- Context-aware learning workflows
- Planned document-aware question answering
- Foundation for future Retrieval-Augmented Generation (RAG)

### 🎨 Modern Web Interface

- React-based frontend
- Vite development environment
- Tailwind CSS styling
- Component-based architecture
- Responsive interface

### 🔧 AI-Assisted Development

StudyGen AI also uses an AI-assisted software development workflow based on:

- Graft codebase context graph
- Agency Agents
- GitHub Copilot
- Codex
- Antigravity

These tools are used to provide project-specific context and specialized development workflows.

---

## 🛠️ Tech Stack

### Frontend

| Technology   | Purpose                            |
|--------------|-------------------------------------|
| React        | User interface                     |
| Vite         | Frontend development/build tooling |
| Tailwind CSS | Styling                            |
| JavaScript   | Application logic                  |
| Axios        | API communication                  |
| React Router | Client-side routing                |

### Backend

| Technology | Purpose                          |
|------------|-----------------------------------|
| Python     | Backend language                  |
| FastAPI    | REST API framework                |
| REST API   | Frontend/backend communication    |

### AI

| Technology         | Purpose                              |
|---------------------|---------------------------------------|
| Google Gemini API   | AI Tutor / generative AI             |
| Prompt Engineering  | AI behavior and response design      |
| RAG Architecture    | Planned document-aware learning      |

### Development & Infrastructure

| Technology      | Purpose                             |
|------------------|---------------------------------------|
| Git              | Version control                      |
| GitHub           | Source-code hosting                  |
| Docker           | Containerization                     |
| Docker Compose   | Multi-service development            |
| Graft            | Codebase context graph               |
| Agency Agents    | Specialized AI development workflows |
| GitHub Copilot   | AI-assisted development              |
| Codex            | AI-assisted development              |
| Antigravity      | AI-assisted development              |

---

## 🏗️ Architecture

The current high-level application architecture follows a frontend → backend → AI-service workflow.

```text
                         STUDYGEN AI
                              │
                              ▼
                     ┌─────────────────┐
                     │  React Frontend │
                     │   Vite + UI     │
                     └────────┬────────┘
                              │
                              │ HTTP / API
                              ▼
                     ┌─────────────────┐
                     │ FastAPI Backend │
                     │  REST Services  │
                     └────────┬────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
             Application Logic      AI Services
                                        │
                                        ▼
                                Google Gemini API
                                        │
                                        ▼
                                AI Tutor Response
                                        │
                                        ▼
                                React Frontend
```

### Planned Document-Aware Architecture

Future document-aware learning can extend the system toward a RAG workflow:

```text
                  Study Document
                        │
                        ▼
                 Text Extraction
                        │
                        ▼
                    Chunking
                        │
                        ▼
                   Embeddings
                        │
                        ▼
                Vector Database
                        │
                        ▼
                    Retriever
                        │
                        ▼
                 Relevant Context
                        │
                        ▼
                  Gemini / LLM
                        │
                        ▼
                Educational Answer
```

> The RAG workflow above represents planned/future architecture and should not be interpreted as a claim that every component is already implemented.

---

## 📁 Project Structure

```text
StudyGen-AI/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   ├── services/
│   ├── models/
│   └── ...
│
├── docs/
│
├── graft/
│   └── ...
│
├── .github/
│   └── ...
│
├── .gemini/
│   └── ...
│
├── .claude/
│   └── ...
│
├── docker-compose.yml
├── README.md
└── ...
```

> The exact repository structure may evolve as development continues.

---

## 🔄 How It Works

### AI Tutor Flow

```text
Student
   │
   ▼
AI Tutor Interface
   │
   ▼
Frontend API Request
   │
   ▼
FastAPI Backend
   │
   ▼
AI Service
   │
   ▼
Google Gemini
   │
   ▼
Generated Educational Response
   │
   ▼
Backend Response
   │
   ▼
AI Tutor Interface
   │
   ▼
Student
```

The frontend communicates with the backend through API requests. The backend coordinates application logic and AI service interactions, while the Gemini API provides generative AI capabilities.

---

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

- Git
- Node.js
- npm
- Python
- pip
- Docker Desktop *(optional, for containerized development)*

You will also need a Google Gemini API key for AI functionality.

---

### Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd StudyGen-AI
```

> Replace `<YOUR_REPOSITORY_URL>` with the actual GitHub repository URL.

---

### Backend Setup

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the environment:

```bash
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables (see [Environment Variables](#environment-variables)).

Then start the backend using the project's current backend entry point:

```bash
python <backend-entry-file>
```

> Replace `<backend-entry-file>` with the actual entry file used by the current project (e.g. `main.py` or `app/main.py`).

---

### Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

---

### Environment Variables

Create the required environment configuration based on the project's environment example files.

Example:

```env
GEMINI_API_KEY=your_gemini_api_key
VITE_API_BASE_URL=http://localhost:<PORT>
```

Depending on the current project configuration, additional variables may be required.

#### 🔐 Important

Never commit secrets to GitHub. Do not commit:

```text
.env
.env.local
API keys
Access tokens
Passwords
Private credentials
```

Use environment variables or an appropriate secret-management solution instead.

---

### Docker Setup

If the project is configured for Docker Compose:

```bash
docker compose up -d
```

To view running containers:

```bash
docker compose ps
```

To stop the services:

```bash
docker compose down
```

> Docker configuration may evolve as the project's services and deployment architecture develop.

---

## 🧰 Development Tools

StudyGen AI includes a dedicated AI-assisted development environment.

The development setup separates two concepts:

```text
Graft
  ↓
"What is the structure and relationship of this codebase?"

Agency Agents
  ↓
"How should the AI approach this type of development task?"
```

Together, they provide project-specific context and specialized development workflows.

### 🌐 Graft

Graft is used as a **codebase context graph**. It helps AI coding agents understand relationships between files, functions, and components instead of repeatedly rediscovering the repository structure.

Useful commands include:

```bash
graft map
graft ask
graft grep
graft callers
graft blast
```

#### Common Commands

| Command | Purpose |
|---|---|
| `graft map` | Displays the structural organization of the repository |
| `graft ask` | Allows structural questions to be asked about the codebase (e.g. *"Where is the AI Tutor request flow implemented?"*) |
| `graft grep` | Helps locate relevant code |
| `graft callers` | Helps identify which functions call another function |
| `graft blast` | Helps investigate the potential impact of changing a component or function |

> Graft is a development-time context layer and is not part of the application's runtime functionality.

### 🤝 Agency Agents

StudyGen AI uses specialized AI development agents for different engineering responsibilities.

| Agent | Primary Responsibility |
|---|---|
| **AI Engineer** | AI/ML features and integrations |
| **Backend Architect** | APIs, services, backend architecture |
| **Code Reviewer** | Code quality, bugs, security and regressions |
| **Codebase Onboarding Engineer** | Understanding the project architecture |
| **DevOps Automator** | Docker, CI/CD and deployment |
| **Frontend Developer** | React, UI and frontend development |
| **Minimal Change Engineer** | Small, targeted changes |
| **Prompt Engineer** | System prompts and AI behavior |
| **RAG Pipeline Engineer** | RAG, retrieval and document pipelines |

These agents provide specialized instructions and workflows. They are not separate AI models by themselves.

---

## 🧑‍💻 AI Coding Workflow

The development workflow combines:

- StudyGen-AI source code
- Graft project context
- Specialized Agency Agents
- AI coding tools

```text
                       STUDYGEN-AI
                            │
                            ▼
                          GRAFT
                            │
                    Codebase Context
                            │
                            ▼
                   Specialized Agent
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
         Copilot          Codex        Antigravity
            │               │               │
            └───────────────┼───────────────┘
                            ▼
                       Development
```

### Recommended Development Cycle

```text
Understand → Plan → Implement → Test → Review → Fix → Test Again
```

### Example: AI Tutor Feature

```text
Codebase Onboarding Engineer → Trace current AI flow
              ↓
        AI Engineer → Implement AI changes
              ↓
       Code Reviewer → Review the changes
              ↓
Minimal Change Engineer → Targeted corrections
              ↓
                Tests
```

---

## 📸 Screenshots

Screenshots can be added here as the project UI evolves.

| Screenshot | Path |
|---|---|
| AI Tutor interface | `docs/screenshots/ai-tutor.png` |
| Dashboard | `docs/screenshots/dashboard.png` |
| Study Material interface | `docs/screenshots/study-material.png` |
| Agency Agents workflow (VS Code) | `docs/screenshots/agency-agents.png` |

---

## 📊 Project Status

### 🚧 Active Development

Current development areas include:

- [x] React/Vite frontend foundation
- [x] Tailwind CSS interface
- [x] FastAPI backend foundation
- [x] AI Tutor integration
- [x] Google Gemini integration
- [x] Frontend/backend API communication
- [x] Document management foundation
- [x] Graft codebase context setup
- [x] Agency Agents integration
- [x] GitHub Copilot agent configuration
- [ ] Advanced document-aware AI tutoring
- [ ] Full RAG pipeline
- [ ] Vector database integration
- [ ] Production deployment

> The checklist represents the current project direction and should be updated as implementation progresses.

---

## 🔮 Future Improvements

### AI & Learning

- 📄 Advanced document-aware AI tutoring
- 🧠 Retrieval-Augmented Generation (RAG)
- 🔎 Semantic document search
- 📚 Automatic study-material summarization
- ❓ AI-generated quizzes
- 🃏 AI-generated flashcards
- 📊 Personalized learning progress

### Platform

- 🔐 Authentication and user accounts
- 💾 Persistent user data
- 🗄️ Vector database integration
- 📱 Improved mobile experience
- 🎯 Personalized study plans

### Engineering

- 🧪 Expanded automated testing
- 🔄 CI/CD improvements
- 🐳 Production-ready containerization
- 🚀 Cloud deployment
- 📈 Monitoring and observability
- 🔒 Additional security hardening

---

## 🧭 Development Philosophy

StudyGen AI is being developed incrementally with an emphasis on maintainability and controlled changes.

The project prioritizes:

- Clear architecture
- Maintainable code
- Reusable components
- Secure configuration
- AI-assisted development
- Testing and code review
- Minimal and focused changes
- Scalable future architecture

The development philosophy can be summarized as:

```text
Understand → Plan → Implement → Test → Review → Improve
```

---

## 🔐 Security

Security is an important part of the development workflow.

### Never commit

- API keys
- Access tokens
- Passwords
- Private credentials
- Production secrets
- `.env` files containing sensitive values

### Recommended practices

- Store secrets in environment variables
- Keep `.env` files out of version control
- Use `.gitignore`
- Validate API inputs
- Keep dependencies updated
- Review AI-generated code before merging
- Run tests before deployment

---

## 🤝 Contributing

StudyGen AI is currently under active personal/academic development. For future contributions:

1. Fork the repository.
2. Create a feature branch:
```bash
   git checkout -b feature/your-feature
```
3. Make focused changes.
4. Test the changes locally.
5. Review the implementation.
6. Commit your changes:
```bash
   git add .
   git commit -m "Add your change description"
```
7. Push your branch:
```bash
   git push origin feature/your-feature
```
8. Open a pull request.

---

## 📄 License

This project is currently being developed as a personal/academic project. License information will be added when the project is formally licensed.

---

## ⭐ Project

If you find the project interesting, consider following its development and exploring the repository.

**StudyGen AI — AI-Powered Study Assistant**

> Built to explore how AI can be integrated into modern educational software and how AI-assisted development workflows can support complex application development.