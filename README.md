<a id="readme-top"></a>

<div align="center">

[![Contributors](https://img.shields.io/github/contributors/KKIvanov22/Vocanta?style=for-the-badge)](https://github.com/KKIvanov22/Vocanta/graphs/contributors)
[![Forks](https://img.shields.io/github/forks/KKIvanov22/Vocanta?style=for-the-badge)](https://github.com/KKIvanov22/Vocanta/network/members)
[![Stars](https://img.shields.io/github/stars/KKIvanov22/Vocanta?style=for-the-badge)](https://github.com/KKIvanov22/Vocanta/stargazers)
[![Issues](https://img.shields.io/github/issues/KKIvanov22/Vocanta?style=for-the-badge)](https://github.com/KKIvanov22/Vocanta/issues)
[![License](https://img.shields.io/github/license/KKIvanov22/Vocanta?style=for-the-badge)](https://github.com/KKIvanov22/Vocanta/blob/main/LICENSE)

</div>

<div align="center">

<h1>Vocanta</h1>

<p>
AI-powered job recommendation and HR assistant platform built with a modern full-stack AI architecture.
</p>

</div>

---

<div align="center">

## 🚀 Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-009688?style=for-the-badge&logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-316192?style=for-the-badge&logo=redis&logoColor=white)
![Weaviate](https://img.shields.io/badge/Weaviate-FF4D4D?style=for-the-badge&logo=weaviate&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker%20Compose-0db7ed?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## 📌 About The Project

Vocanta is a full-stack AI-powered recruitment and job-matching system that uses semantic search and embeddings to connect candidates with the most relevant opportunities.

It combines:

- ⚡ **Next.js frontend** for recruiters and candidates
- 🧠 **Python backend API** for business logic and AI processing
- 🗄️ **PostgreSQL** for structured relational data
- 🚗 **Redis** for caching
- 🔍 **Weaviate vector database** for semantic search and embeddings

---

## 📁 Project Structure

```text
Vocanta/
├── client/               # Next.js frontend
├── server/               # Python backend (API + Docker + DB)
│   ├── docker-compose.yml
│   ├── .env.example
│   └── ...
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- Git

---

## ⚙️ Installation

### 1. Clone repository

```bash
git clone https://github.com/KKIvanov22/Vocanta.git
cd Vocanta
```

---

### 2. Setup frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

### 3. Setup backend

```bash
cd server
cp .env.example .env
docker-compose up --build
```

This starts:

- Backend API
- PostgreSQL database
- Redis
- Weaviate vector database

---

## 🧠 Environment Variables

```env
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=vocanta

WEAVIATE_URL=http://weaviate:8080
```

---

## ▶️ Usage

Frontend:

```bash
cd client
npm run dev
```

Backend:

```bash
cd server
docker-compose up
```

Backend runs at:

```
http://localhost:8000
```

---


## 🤝 Contributing

1. Fork repo
2. Create feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit changes
   ```bash
   git commit -m "Add AmazingFeature"
   ```
4. Push branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open Pull Request

---

## 📄 License

Distributed under MIT license.

---

## 📬 Contact

GitHub: https://github.com/KKIvanov22
Project: https://github.com/KKIvanov22/Vocanta

---

<p align="center">⭐ If you like this project, consider starring it ⭐</p>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

