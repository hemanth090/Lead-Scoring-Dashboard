# AI Lead Scoring Dashboard

A web-based lead scoring dashboard that predicts lead intent using a machine learning model and a rule-based LLM Re-ranker, delivering scores via a FastAPI endpoint.

## 🚀 Live Demo

- **Frontend:** https://your-app.netlify.app
- **Backend API:** https://your-backend.vercel.app
- **API Documentation:** https://your-backend.vercel.app/docs

## 📋 Features

- **Machine Learning Model**: Uses a Gradient Boosting Classifier to predict lead intent based on various features
- **LLM-Inspired Re-ranker**: Adjusts the initial ML scores based on keywords extracted from lead comments
- **Interactive Dashboard**: React-based frontend with form submission, lead table, and statistics visualization
- **Real-time Scoring**: Instantly score leads and see results in the dashboard
- **Data Persistence**: Leads are stored in memory on the backend and in localStorage on the frontend
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Comprehensive Validation**: Input validation on both frontend and backend
- **Compliance Ready**: DPDP Act compliant with mandatory consent management

## 🏗️ Project Structure

```
lead-scoring-dashboard/
├── backend/
│   ├── data/                   # Generated synthetic data
│   │   └── leads_data.csv     # 10,000 synthetic lead records
│   ├── model/                 # Trained ML model files
│   │   ├── lead_scoring_model.pkl
│   │   └── feature_columns.pkl
│   ├── src/
│   │   ├── generate_data.py   # Script to generate synthetic data
│   │   ├── train_model.py     # Script to train the ML model
│   │   ├── setup_model.py     # Script to automate data generation and model training
│   │   ├── main.py           # FastAPI application
│   │   └── test_api.py       # Script to test the API endpoints
│   ├── requirements.txt       # Python dependencies
│   └── vercel.json           # Vercel deployment config
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── LeadForm.tsx
│   │   │   ├── LeadsTable.tsx
│   │   │   └── StatsCard.tsx
│   │   ├── services/         # API services
│   │   │   └── api.ts
│   │   ├── types/           # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── App.tsx          # Main application component
│   │   └── main.tsx         # Entry point
│   ├── index.html           # HTML template
│   ├── package.json         # Frontend dependencies
│   ├── netlify.toml         # Netlify deployment config
│   └── vite.config.js       # Vite configuration
└── README.md                # Project documentation
```

## 🛠️ Local Development Setup

### Prerequisites

- Python 3.8+ for the backend
- Node.js 14+ for the frontend
- npm or yarn for package management

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Generate data and train the model:**
   ```bash
   cd src
   python setup_model.py
   ```

5. **Start the FastAPI server:**
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at http://localhost:8000

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The frontend will be available at http://localhost:3000

## 🚀 Deployment

### Backend Deployment (Vercel)

1. **Deploy to Vercel:**
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect the `vercel.json` configuration
   - The build process will install dependencies and setup the model

2. **Environment Variables:**
   - No additional environment variables required for basic setup

3. **Health Check:**
   - Use `/health` endpoint for health checks

### Frontend Deployment (Netlify)

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Set environment variable `VITE_API_URL` to your Vercel backend URL

3. **Environment Configuration:**
   - The API base URL in `src/services/api.ts` will automatically use the environment variable

## 📊 API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check endpoint
- `POST /score` - Score a lead using the ML model and LLM-inspired re-ranker
- `GET /leads` - Get all scored leads
- `GET /leads/stats` - Get statistics about the leads
- `GET /docs` - Interactive API documentation (Swagger UI)

## 🧪 Testing

### Backend Testing

```bash
cd backend/src
python test_api.py
```

### Frontend Testing

```bash
cd frontend
npm test
```

## 📈 Model Performance

- **Accuracy:** 96.7%
- **Precision:** 98.2%
- **Recall:** 84.6%
- **F1-Score:** 90.9%
- **ROC-AUC:** 99.7%

### Feature Importance

1. **response_time_minutes (35.1%):** Fastest responders show highest intent
2. **income (25.2%):** Higher income correlates with purchase readiness
3. **time_on_market (16.7%):** Newer listings generate more interest
4. **credit_score (14.8%):** Better credit indicates financial readiness
5. **previous_inquiries (7.7%):** Fewer inquiries suggest focused interest

## 🔒 Compliance & Privacy

- **DPDP Act Compliant:** Mandatory consent checkbox and clear data processing purpose
- **Data Minimization:** Only collects necessary fields for lead scoring
- **Synthetic Data:** Training data is completely synthetic with no real PII
- **Secure Storage:** In-memory storage with no permanent data persistence
- **Input Validation:** Comprehensive validation on both frontend and backend

## 🎯 LLM Re-ranker Logic

### High-Intent Keywords (+5 to +20 points)
- "urgent", "ready to purchase", "cash buyer"
- "pre-approved loan", "financing ready"
- "very interested", "perfect match"
- "immediately", "asap", "today"

### Low-Intent Keywords (-5 to -20 points)
- "just browsing", "not interested"
- "maybe next year", "not ready"
- "need to think", "not sure yet"
- "too expensive", "out of budget"

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support create an issue in the GitHub repository.

## 🙏 Acknowledgments

- Built with FastAPI, React, and scikit-learn
- Styled with Tailwind CSS
- Charts powered by Chart.js
- Deployed on Netlify and Vercel