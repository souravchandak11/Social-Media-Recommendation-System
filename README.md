# 🎯 SocialAI Recommender

An end-to-end **social media account recommendation system** that uses machine learning to suggest relevant accounts to follow based on interests, engagement patterns, and user behavior.

![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-ML-F7931E?logo=scikit-learn)

## ✨ Features

- **Hybrid Recommendation Engine** - Combines cosine similarity (60%) + Jaccard similarity (40%) for high-quality recommendations
- **K-Means User Segmentation** - Automatically clusters 10K+ users into behavioral segments
- **Dual Dashboard System**:
  - 🚀 **React Dashboard** - Premium UI with animations, engagement radar, global user map
  - 📊 **Streamlit Dashboard** - Interactive analytics with filter controls
- **FastAPI Backend** - REST API serving real ML pipeline data

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **ML Pipeline** | Python, Scikit-learn, Pandas, NumPy |
| **Backend API** | FastAPI, Uvicorn, CORS |
| **React Frontend** | React 18, Vite, Framer Motion, Recharts |
| **Streamlit App** | Streamlit, Plotly |

## 📈 ML Pipeline

1. **Data Generation** - 10,000 synthetic user profiles with realistic distributions
2. **Preprocessing** - Outlier removal, normalization, data cleaning
3. **Feature Engineering** - TF-IDF interests, engagement metrics, influence scores
4. **Segmentation** - K-Means clustering with optimal K selection (Elbow + Silhouette)
5. **Recommendations** - Hybrid similarity-based recommendations with explanations

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/souravchandak11/Social-Media-Recommendation-System.git
cd Social-Media-Recommendation-System

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
cd app && npm install && cd ..

# Run ML pipeline (generates data + trains models)
python run_pipeline.py

# Start all servers
python -m uvicorn api.main:app --port 8000 &
streamlit run app/streamlit_app.py --server.port 8501 &
cd app && npm run dev
```

## 📌 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| **React Dashboard** | http://localhost:5173 | Premium animated UI |
| **FastAPI Docs** | http://localhost:8000/docs | Interactive API docs |
| **Streamlit** | http://localhost:8501 | Analytics dashboard |

## 📁 Project Structure

```
Social-Media-Recommendation-System/
├── src/                    # ML Pipeline modules
│   ├── data_generator.py   # Synthetic data generation
│   ├── data_preprocessing.py
│   ├── feature_engineering.py
│   ├── segmentation.py     # K-Means clustering
│   └── recommendation.py   # Hybrid recommendation engine
├── api/
│   └── main.py             # FastAPI backend
├── app/
│   ├── streamlit_app.py    # Streamlit dashboard
│   └── src/                # React frontend
├── data/
│   ├── raw/                # Generated data
│   ├── processed/          # Cleaned data
│   └── models/             # Trained models
├── run_pipeline.py         # End-to-end pipeline runner
└── requirements.txt
```

## 🎯 Use Cases

- **Data Science Portfolio** - Demonstrates end-to-end ML project
- **Interview Preparation** - Full-stack + ML architecture showcase
- **Learning Resource** - Recommendation system implementation
- **Template** - Starting point for similar projects

## 📊 Results

- **10,000 users** clustered into behavioral segments
- **2 optimal segments** identified (Micro-Influencers, Engaged Creators)
- **Hybrid recommendations** with explanation generation
- **Real-time API** serving ML predictions

---

Built with ❤️ using Python, React & Machine Learning
