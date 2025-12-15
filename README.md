# AutoTicket – IT Service Ticket Classification

AutoTicket is an end-to-end machine learning project designed to automatically classify IT service tickets by **queue (department)** and **priority**, based on the textual description provided by the user.

The goal of this project is to simulate a real-world ITSM (IT Service Management) scenario, combining **machine learning**, **API design**, and **modern web development** into a single, deployable system.

---
### Tecnologias utilizadas
![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-API-009688?logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-Frontend-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-TS-blue?logo=typescript)
![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-F7931E?logo=scikitlearn)
![Status](https://img.shields.io/badge/status-in%20progress-yellow)
![Frontend CI](https://github.com/Eduardo-Ve/autoticket/actions/workflows/nextjs.yml/badge.svg)


## Project Overview

The system takes a free-text ticket description and returns:

- Suggested IT queue (e.g. Hardware, Access, HR Support, etc.)
- Confidence score for the prediction
- Top-3 predicted classes with probabilities
- Automatic review routing when confidence is low

The architecture is intentionally split into two services to reflect production best practices.

---

## Architecture

```
[ Next.js Frontend ]
        |
        | (POST /api/classify)
        v
[ FastAPI ML Service ]
        |
        | (Sentence Embeddings + Classifier)
        v
[ Trained ML Models ]
```

### Frontend (Next.js + TypeScript)
- User interface for entering ticket descriptions
- Server-side API route acting as a proxy to the ML service
- Confidence visualization and human-review warnings
- Tailwind CSS for UI styling

### Backend (FastAPI + Python)
- Loads trained machine learning models
- Performs inference using text embeddings
- Applies confidence thresholds
- Returns structured prediction results

---

## Machine Learning Approach

### Dataset
**IT Service Ticket Classification Dataset**

- ~47,000 tickets
- 8 IT-related categories:
  - Hardware
  - HR Support
  - Access
  - Administrative rights
  - Storage
  - Purchase
  - Internal Project
  - Miscellaneous

### Model Pipeline
- **Text Embeddings:** SentenceTransformer  
  (`paraphrase-multilingual-MiniLM-L12-v2`)
- **Classifier:** Logistic Regression
- **Multi-class classification**
- **Probability-based decision logic**

### Why Logistic Regression?
- Interpretable probabilities
- Fast inference
- Stable confidence scores
- Suitable for production-like routing logic

---

## Confidence-Based Routing

Instead of blindly trusting predictions, the system applies **confidence thresholds**:

- High confidence → automatic assignment
- Low confidence → routed to manual review

Example:
```json
{
  "queue": "REVIEW_QUEUE",
  "queue_label": "Hardware",
  "queue_confidence": 0.38,
  "queue_top3": [
    ["Hardware", 0.38],
    ["Access", 0.31],
    ["Miscellaneous", 0.29]
  ]
}
```

This mimics real-world ITSM workflows and avoids overconfident misclassification.

---

## Model Performance (Queue Classification)

```
Accuracy: 86.5%
Macro F1-score: 0.866
Weighted F1-score: 0.865
```

The model performs well across all categories, with stronger performance on well-defined classes and honest uncertainty on broader ones (e.g. Hardware).

---

## Technologies Used

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Fetch API

### Backend
- FastAPI
- scikit-learn
- SentenceTransformers
- Joblib
- Uvicorn

### ML / Data
- Pandas
- NumPy
- Logistic Regression
- Sentence Embeddings

---

## Current Status

This project is **actively under development**.

Planned improvements:
- Further model calibration and threshold tuning
- Active learning from low-confidence samples
- Deployment of ML API to cloud (Docker / VPS)
- Full production deployment on Vercel
- Logging and monitoring for predictions

---

## Purpose

This project was built as:
- A learning exercise in **applied machine learning**
- A demonstration of **ML system design**
- A portfolio project showcasing **full-stack + ML integration**

It focuses on **realistic constraints**, not just model accuracy.

---

## Author

Developed by **Eduardo Velásquez**  
Computer Engineering Student  
Focus on Machine Learning, Backend Systems, and Applied AI
