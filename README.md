    

---

## 📌 About The Project

Vocanta is a full-stack AI-powered recruitment and job-matching system designed to connect candidates with relevant jobs using semantic search and embeddings.

It consists of:

* **Next.js client (**``**)** – Frontend for users and recruiters
* **Python server (**``**)** – Backend API with Docker, PostgreSQL, and Weaviate integration

The system enables intelligent job-candidate matching using vector search and structured relational data.

---

## ⚙️ Built With

* Next.js
* React
* Python
* FastAPI / Flask
* PostgreSQL
* Weaviate
* Docker
* Docker Compose

---

## 📁 Project Structure

```text
Vocanta/
├── client/        # Next.js frontend
├── server/        # Python backend (API + Docker + DB)
│   ├── docker-compose.yml
│   ├── .env.example
│   └── ...
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* Python 3.10+
* Docker & Docker Compose
* Git

---

## 🔧 Installation

### 1. Clone repository

```bash
git clone https://github.com/KKIvanov22/Vocanta.git
cd Vocanta
```

---

### 2. Setup client

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

### 3. Setup server

```bash
cd server
cp .env.example .env
docker-compose up --build
```

This starts:

* Backend API
* PostgreSQL database
* Weaviate vector database

---

## 🧠 Environment Variables

Create `server/.env` from `.env.example`:

```env
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=vocanta

WEAVIATE_URL=http://weaviate:8080
```

---

## ▶️ Usage

Start frontend:

```bash
cd client
npm run dev
```

Start backend:

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
2. Create branch

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
5. Open PR

---

## 📄 License

GNU GPL v3.0 – see LICENSE file.

---

## 📬 Contact

GitHub: [https://github.com/KKIvanov22](https://github.com/KKIvanov22) Project: [https://github.com/KKIvanov22/Vocanta](https://github.com/KKIvanov22/Vocanta)

---
