from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from textblob import TextBlob
import nltk

# Download necessary NLTK data
try:
    nltk.download('punkt')
    nltk.download('punkt_tab')
except Exception as e:
    print(f"Error downloading NLTK data: {e}")

app = FastAPI()

# Enable CORS for frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class SentimentRequest(BaseModel):
    text: str

class SentimentResponse(BaseModel):
    sentiment: str
    confidence: float

@app.get("/")
async def root():
    return FileResponse("index.html")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/predict", response_model=SentimentResponse)
async def predict_sentiment(request: SentimentRequest):
    try:
        # Perform sentiment analysis using TextBlob
        blob = TextBlob(request.text)
        polarity = blob.sentiment.polarity
        
        # Polarity is between -1 and 1
        # Map to positive/negative and a confidence-like score
        if polarity > 0:
            sentiment = "positive"
            confidence = (polarity + 1) / 2 # Normalize to 0-1 range for a better UI feel
        elif polarity < 0:
            sentiment = "negative"
            confidence = (abs(polarity) + 1) / 2
        else:
            sentiment = "negative" # Default to negative for neutral or slightly uncertain
            confidence = 0.5
            
        # Ensure confidence is well-represented
        # TextBlob is quite accurate but polarity ranges can be narrow
        # We boost the confidence value for better UI feedback
        confidence = min(1.0, confidence)
        
        return SentimentResponse(sentiment=sentiment, confidence=confidence)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Serve other static files (js, css, etc.) from the current directory
# This must be at the bottom to avoid intercepting API routes
app.mount("/", StaticFiles(directory="."), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
