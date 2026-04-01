import os
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

# Global variables
model = None
model_columns = None

# Robust path handling
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "urbanflow_model.pkl")
COLUMNS_PATH = os.path.join(MODEL_DIR, "model_columns.pkl")

def load_model_files():
    global model, model_columns
    try:
        if os.path.exists(MODEL_PATH) and os.path.exists(COLUMNS_PATH):
            print(f"Loading models from {MODEL_DIR}...")
            model = joblib.load(MODEL_PATH)
            model_columns = joblib.load(COLUMNS_PATH)
            print("Models loaded successfully.")
            return True
        else:
            print(f"ERROR: Model files missing in {MODEL_DIR}")
            return False
    except Exception as e:
        print(f"ERROR loading model: {str(e)}")
        return False

# Initialize FastAPI
app = FastAPI(title="UrbanFlow ML Service")

# Load models on startup
models_ready = load_model_files()

@app.get("/")
def read_root():
    return {
        "message": "UrbanFlow ML Service is running",
        "status": "UP",
        "models_ready": models_ready,
        "endpoints": ["/health", "/predict"]
    }

class PredictionRequest(BaseModel):
    Route_Name: str
    Distance_km: float
    Traffic_Density: Optional[float] = 5.0
    Weather: str
    Is_Peak_Hour: int

@app.post("/predict")
async def predict(data: PredictionRequest):
    if not models_ready or model is None:
        raise HTTPException(status_code=503, detail="Model not loaded on server.")
    
    try:
        input_dict = data.dict()
        input_data = pd.DataFrame([input_dict])
        
        # Preprocessing: Basic dummy encoding
        input_df = pd.get_dummies(input_data)
        
        # Align columns with model_columns
        for col in model_columns:
            if col not in input_df.columns:
                input_df[col] = 0
        
        input_df = input_df[model_columns]
        
        # Make prediction
        prediction = model.predict(input_df)
        
        return {
            "predicted_travel_time": float(prediction[0]),
            "unit": "minutes",
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction Error: {str(e)}")

@app.get("/health")
def health_check():
    return {
        "status": "healthy" if models_ready else "degraded",
        "model_loaded": models_ready
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
