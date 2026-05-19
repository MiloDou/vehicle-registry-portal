# AutoRegistro GT - National Vehicle Registry & Fleet Management System

An enterprise-grade, dockerized full-stack application engineered for official vehicle registration and *Tarjeta de Circulación* management. The user interface features a custom visual aesthetic inspired by the geometric modernism of Guatemalan artist Carlos Mérida, blending clean corporate data structures with minimalist typography and precise layout composition.

## 🚀 Overview

This repository hosts a multi-container application that digitizes the workflow of vehicle identification and legal ownership tracking. Built specifically to meet structural normalization standards, the platform eliminates bureaucratic friction through immediate validation pipelines, multi-step entry wizardization, and responsive inventory dashboards.

---

## 🛠️ Architecture & Tech Stack

The system is fully containerized using **Docker** and **Docker Compose**, separating concerns across isolated, network-connected environments:

* **Frontend:** React 18 + Vite, styled with custom design tokens mapped via utilities, utilizing Lucide React icons and Sonner for descriptive push notifications.
* **Backend:** Node.js + Express REST API handling object-relational mapping validations and payload routing.
* **Database:** PostgreSQL (relational instance hosting strict constraint validation tables, indexes, and automated timestamps).
* **Deployment & Orchestration:** Docker containers isolating environments for reproducible local development.

---

## 🗺️ Port Mapping & Services

When the environment boots, the following services are provisioned and bound to your local interface:

| Service | Technology | Port Map | Context |
| :--- | :--- | :--- | :--- |
| **`frontend`** | React + Vite | `5173:5173` | Core Client Portal (`http://localhost:5173`) |
| **`backend`** | Node.js + Express | `5000:5000` | REST API Layer (`http://localhost:5000/api`) |
| **`database`** | PostgreSQL | `5433:5432` | Relational Storage (Internal maps to standard `5432`) |

---

## 📦 Project Structure

- `backend/`: Express API server and backend logic.
- `frontend/`: React + Vite client application.
- `Documentación/`: ER and relational models.
- `init.sql`: Database setup script with schema and sample inserts.
- `docker-compose.yml`: Docker service orchestration for local development.

## ⚙️ Installation

1. Install Docker and Docker Compose.
2. Clone this repository.
3. Run `docker-compose up --build` from the project root.

## ▶️ How to Run

- Start the full stack with:

  ```bash
  docker-compose up --build
  ```

- Access the frontend at `http://localhost:5173`.
- The backend API is available at `http://localhost:5000/api`.

## 🔐 Credentials

- PostgreSQL user: `sat_agente`
- PostgreSQL password: `sat_password123`
- Database name: `sat_vehiculos`

## 🌐 Ports Used

- Frontend: `5173`
- Backend: `5000`
- PostgreSQL host port: `5434` (container port `5432`)

## 🗄️ Database

- Database name: `sat_vehiculos`
- The main SQL file used for the project is `init.sql`.
- Los datos y el esquema SQL principales se encuentran en `init.sql`: es el archivo con el esquema y los inserts usados por el contenedor.

