# 🚀 Placement Tracker Backend

A scalable backend API for managing placement activities, tracking job applications, and analyzing resumes using ATS scoring. Built with **Node.js, Express.js, MongoDB**, and **JWT Authentication**.

---

## 📌 Features

### 👤 Authentication
- User Registration
- User Login
- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes

### 📄 Resume Management
- Upload Resume (PDF)
- Resume Storage
- Resume Parsing
- ATS Resume Analysis
- Resume Score Generation

### 💼 Placement Tracking
- Add Job Applications
- Update Application Status
- Delete Applications
- View Application History
- Search Applications
- Filter by Status

### 📊 Dashboard
- Total Applications
- Interview Count
- Offer Count
- Rejected Applications
- Pending Applications
- Application Statistics

### ⚡ Background Processing
- Resume Processing using BullMQ
- Redis Queue
- Asynchronous ATS Analysis

### 🔒 Security
- JWT Authentication
- Password Encryption
- Request Validation
- Rate Limiting
- Environment Variables

---

## 🛠 Tech Stack

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- JWT
- bcrypt

### File Upload
- Multer

### Resume Parsing
- pdf-parse

### Queue
- BullMQ
- Redis

### Validation
- express-validator

### Utilities
- dotenv
- cors
- morgan

---

## 📁 Project Structure

```
Placement-Tracker-Backend
│
├── src
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── jobs
│   ├── utils
│   ├── validators
│   └── app.js
│
├── uploads
├── package.json
├── server.js
└── README.md
```

---

## 📦 Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/Placement-Tracker-Backend.git
```

```bash
cd Placement-Tracker-Backend
```

### Install Dependencies

```bash
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

REDIS_HOST=localhost
REDIS_PORT=6379

NODE_ENV=development
```

---

## ▶️ Run the Project

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint |
|---------|----------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| GET | /api/auth/profile |

---

### Resume

| Method | Endpoint |
|---------|----------|
| POST | /api/resume/upload |
| GET | /api/resume |
| DELETE | /api/resume/:id |

---

### Applications

| Method | Endpoint |
|---------|----------|
| POST | /api/applications |
| GET | /api/applications |
| GET | /api/applications/:id |
| PUT | /api/applications/:id |
| DELETE | /api/applications/:id |

---

### Dashboard

| Method | Endpoint |
|---------|----------|
| GET | /api/dashboard |

---

## 🔐 Authentication

All protected routes require a JWT token.

```
Authorization: Bearer <your_token>
```

---

## 📊 ATS Resume Analysis

The backend automatically:

- Extracts text from uploaded PDFs
- Processes resumes asynchronously
- Calculates ATS score
- Identifies missing keywords
- Stores analysis results

---

## 🚀 Future Improvements

- Email Notifications
- Interview Scheduling
- Company Management
- Job Recommendations
- Resume Versioning
- AI-powered Resume Suggestions
- Analytics Dashboard
- Swagger API Documentation

---

## 🧪 Testing

Run tests using:

```bash
npm test
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Pawan Bhagat**

- GitHub: https://github.com/yourusername
- LinkedIn: https://linkedin.com/in/yourprofile

---

## ⭐ Show Your Support

If you found this project useful, please consider giving it a ⭐ on GitHub!
