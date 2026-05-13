# CareMate - Hospital Management System

CareMate is a comprehensive healthcare platform consisting of two integrated components:

1. **CareMate Frontend** (Next.js) - Hospital Management System
2. **MediGenius** (Python) - AI-Powered Medical Chatbot

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CareMate Platform                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────┐    ┌─────────────────────────────┐ │
│  │   Frontend (Next.js)   │    │   Backend (Next.js API)     │ │
│  │                         │    │   + MongoDB                  │ │
│  │  - User Dashboard       │    │  - User Management          │ │
│  │  - Doctor Dashboard     │    │  - Doctor Management        │ │
│  │  - Admin Dashboard     │    │  - Appointment Booking      │ │
│  │  - Appointments         │    │  - Prescriptions             │ │
│  │  - Prescriptions        │    │  - Reminders                 │ │
│  │  - Virtual Doctor       │    │                             │ │
│  │  - Analytics            │    │                             │ │
│  └───────────┬─────────────┘    └──────────────┬──────────────┘ │
│              │                                │                 │
│              │      ┌──────────────────────────┘                 │
│              │      │                                            │
│              ▼      ▼                                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │           MediGenius Python Chatbot (Port 5000)             ││
│  │  - Flask API + LangGraph Multi-Agent System                  ││
│  │  - RAG Pipeline (ChromaDB + Medical PDFs)                   ││
│  │  - Fallback: Wikipedia + DuckDuckGo                         ││
│  │  - SQLite Memory                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 1: CareMate Frontend (Next.js)

A full-stack Hospital Management System built with Next.js 15 (App Router), MongoDB, and Tailwind CSS.

### Features

| Feature | Description |
|---------|-------------|
| **Role-based Access** | Three user roles: Admin, Doctor, Patient |
| **Authentication** | JWT tokens stored in HttpOnly cookies |
| **Doctor Approval Workflow** | Admin must approve registered doctors |
| **Appointment System** | Booking with conflict prevention |
| **Prescriptions** | Doctors can create prescriptions for patients |
| **Medicine Reminders** | Scheduled reminders (email stub) |
| **Virtual Doctor** | AI-powered symptom prediction (mock ML adapter) |
| **Health Analytics** | Dashboard with metrics, predictions, and tips |
| **Responsive UI** | Mobile-friendly design with dark mode support |

### User Roles

| Role | Capabilities |
|------|--------------|
| **Admin** | Approve doctors, view analytics, manage users, system stats |
| **Doctor** | Manage schedule, view patients, create prescriptions, today's appointments |
| **Patient** | Book appointments, view prescriptions, health metrics, AI chat |

### Pages Structure

```
app/
├── page.tsx                      # Landing page
├── auth/
│   ├── login/page.tsx            # Login
│   ├── register/page.tsx        # Patient registration
│   └── register-doctor/page.tsx # Doctor registration
├── dashboard/
│   ├── page.tsx                  # Redirects based on role
│   ├── user/page.tsx            # Patient dashboard
│   ├── doctor/page.tsx          # Doctor dashboard
│   ├── doctor/profile/page.tsx  # Doctor profile
│   └── admin/page.tsx            # Admin dashboard
├── admin/
│   └── approve-doctors/page.tsx # Doctor approval
├── doctors/
│   ├── page.tsx                  # Doctor listing
│   └── [id]/page.tsx            # Doctor details
├── appointments/page.tsx         # Appointment booking
├── prescriptions/page.tsx        # View prescriptions
├── virtual-doctor/page.tsx       # AI symptom predictor
├── analytics/page.tsx            # Health analytics
└── settings/page.tsx             # User settings
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | Patient registration |
| `/api/auth/register-doctor` | POST | Doctor registration |
| `/api/auth/me` | GET | Current user info |
| `/api/admin/create` | POST | Create admin (requires secret) |
| `/api/admin/approve-doctor` | POST | Approve a doctor |
| `/api/doctors` | GET | List doctors |
| `/api/appointments` | POST/GET | Create/list appointments |
| `/api/prescriptions` | POST/GET | Create/list prescriptions |
| `/api/reminders` | GET | Get user reminders |
| `/api/virtual-doctor/predict` | POST | Symptom prediction |

### Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: SWR for data fetching
- **Forms**: React Hook Form + Zod validation
- **Database**: MongoDB with Mongoose
- **Auth**: JWT (HttpOnly cookies)
- **Charts**: Recharts
- **Icons**: Lucide React

### Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/caremate
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
ADMIN_CREATION_SECRET=your_admin_secret
FRONTEND_URL=http://localhost:3000
SENDGRID_API_KEY=optional_for_emails
```

---

## Part 2: MediGenius (Python Chatbot)

An AI-powered multi-agent medical assistant built with LangGraph, achieving 90%+ factual accuracy.

### Performance Metrics

| Metric | MediGenius | LLaMA 3.1 70B |
|--------|------------|---------------|
| Success Rate | 80-94% | 79-90% |
| Response Time | 7.23s | 22.8s |
| Medical Alignment | 82% | - |

### Features

- **Multi-Agent System**: Planner, Retriever, Executor, Explanation agents
- **RAG Pipeline**: Medical knowledge from PDFs using ChromaDB
- **Fallback Search**: Wikipedia + DuckDuckGo for up-to-date info
- **Long-term Memory**: SQLite-based conversation history
- **Empathetic Responses**: Doctor-like medical communication
- **REST API**: Easy integration with external systems

### Agent Architecture

```
User Query → Memory Agent (SQLite) → Planner Agent (Intent Detection)
                                          ↓
                    ┌─────────────────────┼─────────────────────┐
                    ↓                     ↓                     ↓
            Retriever Agent        LLM Agent            Fallback Agents
            (RAG Pipeline)        (Reasoning)          (Wikipedia/DuckDuckGo)
                    ↓                     ↓                     ↓
                    └─────────────────────┴─────────────────────┘
                                          ↓
                                    Executor Agent
                                          ↓
                                  Explanation Agent
                                          ↓
                                    Final Response
                                          ↓
                                  Memory Agent (Store)
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Send medical question |
| `/sessions` | GET | Get all conversation sessions |
| `/session/{id}` | GET/DELETE | Load/delete session |
| `/new-chat` | POST | Start new conversation |
| `/clear` | POST | Clear current conversation |

### Tech Stack

- **Framework**: LangChain, LangGraph
- **LLM**: Groq (GPT-OSS-120B via ChatGroq)
- **Embeddings**: HuggingFace (all-MiniLM-L6-v2)
- **Vector DB**: ChromaDB
- **Backend**: Flask
- **Frontend**: Custom HTML, CSS, JavaScript
- **Database**: SQLite

### Running the Chatbot

```bash
cd ../CaremateChatbot

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables in .env
# GROQ_API_KEY=your_groq_key

# Run the application
python app.py
```

The chatbot runs on `http://localhost:5000`

---

## Integration

The Next.js frontend connects to the Python chatbot via:

1. **Chat API** (`lib/chat.js`): `http://localhost:5000/api/chat`
2. **Model API**: For disease prediction endpoints
3. **Dashboard Stats**: Recent predictions and doctor recommendations

### Chat Integration Flow

```
Frontend (sendMessage) → Flask API (/api/chat)
                              ↓
                    LangGraph Workflow
                    - Memory Check
                    - Planner Agent
                    - RAG + Fallbacks
                              ↓
                    SQLite (store conversation)
                              ↓
                    Response to Frontend
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)
- Groq API key (for chatbot)

### Setup Frontend

```bash
# Install dependencies
npm install
# or
pnpm install

# Configure environment variables
# Edit .env file

# Run development server
npm run dev
```

### Setup Chatbot

```bash
cd ../CaremateChatbot
pip install -r requirements.txt
# Configure .env with GROQ_API_KEY
python app.py
```

---

## Project Structure

```
CareMate/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Role-based dashboards
│   └── ...                # Feature pages
├── components/            # React components
│   ├── Dashboard/         # Dashboard components
│   │   ├── Admin/         # Admin-specific components
│   │   ├── Doctor/        # Doctor-specific components
│   │   └── User/          # User-specific components
│   ├── ui/                # Reusable UI components
│   └── ...                # Other components
├── lib/                   # Utility functions
│   ├── auth.ts            # Authentication helpers
│   ├── db.ts              # MongoDB connection
│   ├── chat.js            # Chatbot API integration
│   └── ...                # Other utilities
├── models/                # Mongoose models
│   ├── User.ts
│   ├── Appointment.ts
│   ├── Prescription.ts
│   └── ...
├── services/              # External services
│   ├── ml/                # ML/Disease prediction
│   └── email.ts           # Email service
└── public/                # Static assets

CaremateChatbot/           # Python Chatbot
├── agents/                # Multi-agent system
│   ├── planner_agent.py
│   ├── retriever_agent.py
│   ├── llm_agent.py
│   └── ...
├── core/                  # LangGraph workflow
│   ├── langgraph_workflow.py
│   └── state.py
├── tools/                 # Tool integrations
│   ├── llm_client.py
│   ├── pdf_loader.py
│   └── vector_store.py
├── templates/             # Frontend templates
├── static/                # CSS/JS assets
├── app.py                 # Main Flask app
└── requirements.txt       # Python dependencies
```

---

## License

MIT License - See individual project READMEs for details.

---

## Additional Resources

- **MediGenius Live Demo**: [https://medigenius.onrender.com/](https://medigenius.onrender.com/)
- **Groq API**: [https://console.groq.com/](https://console.groq.com/)
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **LangGraph Docs**: [https://langchain-ai.github.io/langgraph/](https://langchain-ai.github.io/langgraph/)