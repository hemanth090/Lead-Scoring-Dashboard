from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, validator
import joblib
import os
import pandas as pd
import numpy as np
from typing import List, Dict, Optional, Any
import re

# Initialize FastAPI app
app = FastAPI(
    title="Lead Scoring API",
    description="API for scoring real estate leads using ML and LLM-inspired re-ranking",
    version="1.0.0"
)

# Add CORS middleware with proper origins for deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000", 
        "https://*.netlify.app",
        "https://*.github.io",
        "*"  # For development - remove in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to model and feature columns
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../model/lead_scoring_model.pkl')
FEATURE_COLUMNS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../model/feature_columns.pkl')

# In-memory storage for leads
leads_storage = []

# Load model and feature columns
try:
    model = joblib.load(MODEL_PATH)
    feature_columns = joblib.load(FEATURE_COLUMNS_PATH)
    print("Model and feature columns loaded successfully")
except FileNotFoundError:
    model = None
    feature_columns = None
    print("Model or feature columns not found. Please run setup_model.py first.")

# LLM Re-ranker class
class LLMReranker:
    def __init__(self):
        # Keywords that indicate high intent
        self.positive_keywords = {
            'urgent': 10,
            'need immediately': 15,
            'ready to purchase': 20,
            'pre-approved loan': 15,
            'cash buyer': 20,
            'looking to close quickly': 15,
            'very interested': 10,
            'perfect match': 10,
            'dream home': 8,
            'must have': 12,
            'excited': 5,
            'ideal': 5,
            'love': 5,
            'perfect': 8,
            'asap': 12,
            'immediately': 10,
            'today': 8,
            'tomorrow': 5,
            'this week': 5,
            'approved': 10,
            'financing ready': 15,
            'down payment ready': 15,
            'serious buyer': 15,
            'ready to move': 10,
            'ready to sign': 20,
            'ready to commit': 15,
            'ready to make an offer': 20,
        }
        
        # Keywords that indicate low intent
        self.negative_keywords = {
            'just browsing': -15,
            'not sure yet': -10,
            'might consider': -8,
            'too expensive': -12,
            'not interested': -20,
            'just checking': -10,
            'maybe next year': -15,
            'not ready': -15,
            'need to think': -10,
            'too small': -5,
            'too big': -5,
            'maybe': -5,
            'possibly': -5,
            'someday': -10,
            'in the future': -8,
            'not now': -12,
            'just looking': -10,
            'just curious': -10,
            'out of budget': -15,
            'too far': -8,
            'too close': -5,
            'not what I want': -12,
            'not what I need': -12,
            'not convinced': -10,
            'need more options': -8,
            'need more time': -10,
            'need to discuss': -5,
        }
        
        # Neutral keywords (minimal impact)
        self.neutral_keywords = {
            'information': 2,
            'details': 2,
            'question': 0,
            'wondering': -2,
            'considering': 0,
            'thinking about': 0,
            'interested in': 3,
            'looking for': 2,
            'searching': 2,
            'exploring': 0,
            'options': 0,
            'alternatives': -2,
            'features': 2,
            'specifications': 2,
            'price': 0,
            'cost': 0,
            'budget': 0,
            'location': 0,
            'area': 0,
            'neighborhood': 0,
            'size': 0,
            'space': 0,
            'rooms': 0,
            'bedrooms': 0,
            'bathrooms': 0,
        }
    
    def rerank(self, initial_score: float, comments: str) -> float:
        """
        Adjust the initial ML score based on keywords in the comments.
        
        Args:
            initial_score: The initial score from the ML model (0-100)
            comments: The lead's comments text
            
        Returns:
            Adjusted score (0-100)
        """
        if not comments:
            return initial_score
        
        # Convert to lowercase for case-insensitive matching
        comments_lower = comments.lower()
        
        # Initialize adjustment
        score_adjustment = 0
        
        # Check for positive keywords
        for keyword, value in self.positive_keywords.items():
            if keyword.lower() in comments_lower:
                score_adjustment += value
        
        # Check for negative keywords
        for keyword, value in self.negative_keywords.items():
            if keyword.lower() in comments_lower:
                score_adjustment += value  # Value is already negative
        
        # Check for neutral keywords
        for keyword, value in self.neutral_keywords.items():
            if keyword.lower() in comments_lower:
                score_adjustment += value
        
        # Apply adjustment to initial score
        adjusted_score = initial_score + score_adjustment
        
        # Ensure score is within 0-100 range
        adjusted_score = max(0, min(100, adjusted_score))
        
        return adjusted_score

# Initialize re-ranker
reranker = LLMReranker()

# Input validation models
class LeadInput(BaseModel):
    phone_number: str = Field(..., description="Phone number in format +91-XXXXXXXXXX")
    email: EmailStr = Field(..., description="Email address")
    credit_score: int = Field(..., ge=300, le=850, description="Credit score (300-850)")
    age_group: str = Field(..., description="Age group (18-25, 26-35, 36-50, 51+)")
    family_background: str = Field(..., description="Family background (Single, Married, Married with Kids, etc.)")
    income: int = Field(..., ge=100000, le=1000000, description="Annual income (100,000-1,000,000 INR)")
    property_type: str = Field(..., description="Property type (Apartment, House, Villa, etc.)")
    budget: int = Field(..., ge=0, description="Budget for property")
    location: str = Field(..., description="Location preference (Urban, Suburban, Rural)")
    previous_inquiries: int = Field(..., ge=0, description="Number of previous inquiries")
    time_on_market: int = Field(..., ge=1, description="Days property has been on market")
    response_time_minutes: int = Field(..., ge=1, description="Response time in minutes")
    comments: str = Field("", description="Additional comments or requirements")
    consent: bool = Field(..., description="Consent to data processing")
    
    @validator('phone_number')
    def validate_phone(cls, v):
        if not re.match(r'^\+91-[0-9]{10}$', v):
            raise ValueError('Phone number must be in format +91-XXXXXXXXXX')
        return v
    
    @validator('age_group')
    def validate_age_group(cls, v):
        valid_age_groups = ['18-25', '26-35', '36-50', '51+']
        if v not in valid_age_groups:
            raise ValueError(f'Age group must be one of {valid_age_groups}')
        return v
    
    @validator('family_background')
    def validate_family(cls, v):
        valid_backgrounds = ['Single', 'Married', 'Married with Kids', 'Divorced', 'Widowed']
        if v not in valid_backgrounds:
            raise ValueError(f'Family background must be one of {valid_backgrounds}')
        return v
    
    @validator('property_type')
    def validate_property(cls, v):
        valid_types = ['Apartment', 'House', 'Villa', 'Penthouse', 'Studio']
        if v not in valid_types:
            raise ValueError(f'Property type must be one of {valid_types}')
        return v
    
    @validator('location')
    def validate_location(cls, v):
        valid_locations = ['Urban', 'Suburban', 'Rural']
        if v not in valid_locations:
            raise ValueError(f'Location must be one of {valid_locations}')
        return v
    
    @validator('consent')
    def validate_consent(cls, v):
        if not v:
            raise ValueError('Consent to data processing is required')
        return v

class LeadScore(BaseModel):
    initial_score: float
    reranked_score: float
    lead_id: int

class LeadResponse(BaseModel):
    lead_id: int
    email: str
    initial_score: float
    reranked_score: float
    comments: str

class LeadStats(BaseModel):
    total_leads: int
    high_intent_leads: int
    avg_initial_score: float
    avg_reranked_score: float

# Dependency to check if model is loaded
async def get_model():
    if model is None or feature_columns is None:
        raise HTTPException(
            status_code=503, 
            detail="Model not loaded. Please run setup_model.py first."
        )
    return model, feature_columns

# Routes
@app.get("/")
async def root():
    return {"message": "Lead Scoring API is running", "status": "healthy"}

@app.post("/score", response_model=LeadScore)
async def score_lead(lead: LeadInput, model_data: tuple = Depends(get_model)):
    """
    Score a lead using the ML model and LLM-inspired re-ranker.
    
    Returns initial score from ML model and reranked score after applying
    keyword-based adjustments to the comments.
    """
    model, feature_columns = model_data
    
    # Check consent
    if not lead.consent:
        raise HTTPException(status_code=400, detail="Consent to data processing is required")
    
    # Prepare data for model
    lead_dict = lead.dict()
    
    # Remove fields not used by the model
    lead_dict.pop('consent', None)
    lead_dict.pop('comments', None)
    lead_dict.pop('phone_number', None)
    lead_dict.pop('email', None)
    
    # Convert to DataFrame
    lead_df = pd.DataFrame([lead_dict])
    
    # Get prediction probability
    try:
        # Get probability of high intent (class 1)
        initial_score = model.predict_proba(lead_df)[0, 1] * 100
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting score: {str(e)}")
    
    # Apply LLM-inspired re-ranking
    reranked_score = reranker.rerank(initial_score, lead.comments)
    
    # Store lead in memory
    lead_id = len(leads_storage) + 1
    lead_data = {
        "lead_id": lead_id,
        "email": lead.email,
        "phone_number": lead.phone_number,
        "initial_score": initial_score,
        "reranked_score": reranked_score,
        "comments": lead.comments,
        **{k: v for k, v in lead_dict.items()}
    }
    leads_storage.append(lead_data)
    
    return {
        "initial_score": round(initial_score, 2),
        "reranked_score": round(reranked_score, 2),
        "lead_id": lead_id
    }

@app.get("/leads", response_model=List[LeadResponse])
async def get_leads():
    """Get all scored leads."""
    if not leads_storage:
        return []
    
    return [
        {
            "lead_id": lead["lead_id"],
            "email": lead["email"],
            "initial_score": round(lead["initial_score"], 2),
            "reranked_score": round(lead["reranked_score"], 2),
            "comments": lead["comments"]
        }
        for lead in leads_storage
    ]

@app.get("/leads/stats", response_model=LeadStats)
async def get_lead_stats():
    """Get statistics about the leads."""
    if not leads_storage:
        return {
            "total_leads": 0,
            "high_intent_leads": 0,
            "avg_initial_score": 0.0,
            "avg_reranked_score": 0.0
        }
    
    total_leads = len(leads_storage)
    high_intent_leads = sum(1 for lead in leads_storage if lead["reranked_score"] >= 70)
    avg_initial_score = sum(lead["initial_score"] for lead in leads_storage) / total_leads
    avg_reranked_score = sum(lead["reranked_score"] for lead in leads_storage) / total_leads
    
    return {
        "total_leads": total_leads,
        "high_intent_leads": high_intent_leads,
        "avg_initial_score": round(avg_initial_score, 2),
        "avg_reranked_score": round(avg_reranked_score, 2)
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model_loaded": model is not None and feature_columns is not None,
        "leads_count": len(leads_storage)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)