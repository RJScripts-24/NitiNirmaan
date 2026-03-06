# NitiNirmaan

**NitiNirmaan** is a cutting-edge platform designed for advanced policy making, impact planning, and logical framework analysis. It empowers organizations to design, simulate, and audit their social impact projects with precision using AI-driven insights and visual modeling tools.

![Architecture Diagram](./Architecture-NitiNirmaan.png)

## 🚀 Features

### Core Functionality
- **Impact Canvas**: A powerful, infinite canvas built with ReactFlow for visual logic modeling, enabling users to map out project goals, inputs, outputs, and outcomes.
- **Logical Framework Analysis (LFA)**: Automatically generates structured LFA matrices and stakeholder shift maps from your visual canvas.
- **Monte Carlo Simulations**: Advanced simulation engine to forecast project outcomes and calculate success probabilities based on defined variables.
- **AI Audit**: Intelligent auditing powered by **Groq** that analyzes project logic for gaps, inconsistencies, and suggests improvements.

### Productivity & Collaboration
- **Real-time Collaboration**: Seamless multi-user editing and synchronization via Supabase Realtime.
- **Document Generation**: One-click export of project reports to **PDF**, **Word**, and **PowerPoint** formats.
- **AI Companion (Bee Bot)**: Context-aware chat assistant to guide you through the planning process.
- **Organization Management**: Tools to manage teams, branding, and assets.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Shadcn/UI](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/)
- **Visuals**: [ReactFlow](https://reactflow.dev/) (Canvas), [Three.js](https://threejs.org/) (Visualizations)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: TypeScript
- **AI Integration**:
    - **Groq SDK** (LLM Inference)
    - **HuggingFace Inference** (Embeddings & Analysis)
- **Document Processing**: `docx`, `jspdf`, `pptxgenjs`

### Infrastructure
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Realtime Services**: Supabase Realtime

## 📦 Installation

To get the project up and running smoothly, follow these steps:

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### 1. Clone the Repository
```bash
git clone https://github.com/RJScripts-24/NitiNirmaan.git
cd NitiNirmaan
```

### 2. Setup Backend
```bash
cd backend
npm install
# Create a .env file based on .env.example
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
# Create a .env file based on .env.example
npm run dev
```

## 📜 License

This project is proprietary software.

**Copyright (c) 2026 Rishabh Kumar Jha. All Rights Reserved.**

See the [LICENSE](./License.md) file for details. You are **not** permitted to copy, distribute, or use this code without explicit permission.

## 👤 Author

**Rishabh Kumar Jha**
- GitHub: [@RJScripts-24](https://github.com/RJScripts-24)

---

## Process Flow

```mermaid
flowchart TD
    A[Start: User Logs In] --> B[Create/Open Project]
    B --> C{Canvas Mode?}
    C -->|Visual Mode| D[Design Logic Model on Canvas]
    C -->|Text Mode| E[Write/Edit Logical Framework]
    D --> F[Define Inputs, Outputs, Outcomes]
    E --> G[Generate LFA Matrix]
    F --> G
    G --> H[Run Monte Carlo Simulation]
    H --> I{Simulation Results}
    I -->|Success| J[Generate Reports]
    I -->|Needs Adjustment| K[Adjust Logic/Assumptions]
    K --> H
    J --> L[Export: PDF/PPT/DOCX]
    L --> M[Share & Collaborate]
    M --> N[End]
```
