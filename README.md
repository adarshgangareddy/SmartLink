# 🔗 SmartLink Ultra: Enterprise Link Management & IoT Control

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-2.1.0-blue)
![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20React%20%7C%20MongoDB-orange)

**SmartLink Ultra** is a premium, full-stack platform designed for modern developers and industrial teams. Beyond high-performance URL shortening and analytics, it features a state-of-the-art **Industrial IoT Control Plane** for real-time fleet monitoring and automation.

---

## 🚀 Key Features

### 📡 Industrial IoT Control Plane (New)
*   **Fleet Management**: Monitor your IoT devices (ESP32, ESP8266, Arduino) with ease.
*   **Hardware-Free Simulation**: Test your dashboards immediately using our built-in software simulation endpoints—no hardware required.
*   **Real-time Analytics**: Live charts for Moisture, Temperature, and Humidity.
*   **Remote Control**: Manually toggle industrial hardware (like pumps or motors) directly from the dashboard.

### 🔗 Link & Traffic Engine
*   **Lightning Redirection**: Optimized engine for <50ms redirection latency.
*   **Pro Analytics**: Track geographic location, referral sources, and user-agent data.
*   **Custom Branding**: Create professional, trust-worthy short links.
*   **QR Ecosystem**: Instant high-resolution QR codes for every link.

### 🛡 Enterprise Security & API
*   **Pro Gating**: Advanced features protected by a Pro-tier subscription system.
*   **API Key Management**: Securely generate and revoke keys for system-to-system integration.
*   **Webhook Engine**: Trigger external actions automatically based on link clicks or IoT events.

---

## 🛠 Tech Stack

| Backend (Python) | Frontend (React) | Infrastructure |
| :--- | :--- | :--- |
| **FastAPI** (Async Core) | **Vite** (Performance Build) | **MongoDB** (NoSQL) |
| **Pydantic** (Validation) | **Tailwind CSS** (Premium UI) | **Docker** (Containerized) |
| **JWT** (Auth) | **Framer Motion** (Animations) | **Ngrok/LT** (Tunnels) |

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB instance (local or Atlas)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## ⚙️ Quick Start (Simulation Mode)

Want to see the IoT dashboard in action without hardware? Use our simulation endpoints!

1.  **Start Backend**: `cd backend && uvicorn app.main:app --reload`
2.  **Start Frontend**: `cd frontend && npm run dev`
3.  **Simulation Access**:
    *   `GET /api/industrial/devices/{id}/data` -> Get live random sensor readings.
    *   `POST /api/industrial/devices/{id}/control` -> Update pump status in memory.

---

## 🛡 License
MIT License. Built with precision for the next generation of connected applications.

---

*Built with ❤️ by [Adarsh](https://github.com/adarshgangareddy)*
