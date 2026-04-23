# 🔗 SmartLink: Advanced URL Shortener & Analytics Platform

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20React%20%7C%20MongoDB-orange)

SmartLink is a high-performance, feature-rich URL shortener and analytics platform built with modern web technologies. It provides seamless URL redirection, detailed traffic analytics, and an industrial-grade API for enterprise integration.

---

## 🚀 Features

- **Lightning Fast Redirection**: Optimized redirection engine for minimal latency.
- **Advanced Analytics**: Track clicks, geographic location, user agents, and referrers.
- **Industrial API**: Robust RESTful API for programmatic link management.
- **Secure Authentication**: JWT-based authentication for user accounts and data protection.
- **Subscription Tiers**: Integrated payment processing for "Pro" and "Industrial" plans.
- **QR Code Generation**: Automatically generate QR codes for every shortened link.

---

## 🛠 Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: MongoDB (Motor)
- **Caching**: Redis
- **Security**: OAuth2 with JWT, Passlib (Bcrypt)
- **Deployment**: Docker, Gunicorn/Uvicorn

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Icons**: Lucide React

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB instance (local or Atlas)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure `.env` file (copy from `.env.example` if available).
5. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🐳 Docker Deployment

The project is fully containerized for easy deployment.

```bash
docker-compose up --build
```

---

## 🛡 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

*Built with ❤️ by [Adarsh](https://github.com/adarshgangareddy)*
