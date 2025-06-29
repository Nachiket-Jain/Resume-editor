from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import os
from datetime import datetime
import google.generativeai as genai
import logging
import asyncio
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

SAVE_DIR = "saved_resume"
os.makedirs(SAVE_DIR, exist_ok=True)

# Initialize FastAPI app
app = FastAPI(title="Resume Editor API", version="1.0.0",
              description="API for creating, editing, saving resumes and AI content enhancement.")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Define MOCK AI Responses
MOCK_AI_RESPONSES = {
    "summary": "This is a brilliantly optimized professional summary, showcasing unparalleled skills and experience, crafted by mock AI.",
    "experience": "Successfully led complex projects, delivering innovative solutions that exceeded client expectations and improved operational efficiency by 30%. (Mock AI Enhancement)",
    "custom": "Here's an expertly rephrased custom section, highlighting key achievements and contributions with remarkable clarity. (Mock AI Enhancement)"
}

# In-memory storage for saved resumes (for quick retrieval and startup loading)
saved_resumes_in_memory = []

class PersonalInfo(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    summary: str = ""

class Experience(BaseModel):
    id: int
    title: str = ""
    company: str = ""
    duration: str = ""
    description: str = ""

class Education(BaseModel):
    id: int
    degree: str = ""
    institution: str = ""
    year: str = ""

class CustomSectionItem(BaseModel):
    id: Optional[int] = None
    content: str = ""

class CustomSectionEntry(BaseModel):
    id: int
    title: str = ""
    subtitle: str = ""
    description: str = ""

class CustomSection(BaseModel):
    id: int
    title: str = ""
    type: str = "text" # 'text', 'list', 'entries'
    content: str = "" # Used for 'text' type
    items: List[str] = [] # Used for 'list' type
    entries: List[CustomSectionEntry] = [] # Used for 'entries' type

class Resume(BaseModel):
    id: Optional[int] = None
    personalInfo: PersonalInfo = PersonalInfo()
    experience: List[Experience] = []
    education: List[Education] = []
    skills: List[str] = []
    customSections: List[CustomSection] = []
    timestamp: Optional[str] = None

@app.on_event("startup")
async def load_saved_resumes_on_startup():
    logging.info(f"Attempting to load saved resumes from '{SAVE_DIR}' directory...")
    try:
        if not os.path.exists(SAVE_DIR) or not os.path.isdir(SAVE_DIR):
            logging.warning(f"SAVE_DIR '{SAVE_DIR}' does not exist or is not a directory. Creating it.")
            os.makedirs(SAVE_DIR)
            return

        loaded_count = 0
        for filename in os.listdir(SAVE_DIR):
            if filename.endswith(".json"):
                filepath = os.path.join(SAVE_DIR, filename)
                try:
                    with open(filepath, "r") as f:
                        resume_data = json.load(f)
                        # Validate the loaded resume against the Pydantic model
                        # This catches issues if files are manually corrupted/malformed
                        Resume(**resume_data)
                        saved_resumes_in_memory.append(resume_data)
                        loaded_count += 1
                except json.JSONDecodeError:
                    logging.error(f"Skipping malformed JSON file: {filename}")
                except Exception as e:
                    logging.error(f"Error loading resume from {filename} on startup: {e}", exc_info=True)
        logging.info(f"Loaded {loaded_count} resumes from '{SAVE_DIR}' directory on startup.")
    except FileNotFoundError:
        logging.warning(f"SAVE_DIR '{SAVE_DIR}' not found on startup. No resumes to load.")
    except Exception as e:
        logging.critical(f"Critical error during startup resume loading from '{SAVE_DIR}': {e}", exc_info=True)


async def get_gemini_response(prompt: str, section: str, use_mock_ai: bool) -> str:
    if use_mock_ai:
        logging.info("Using mock AI response as requested by frontend.")
        # Determine which mock response to use based on the section
        if "summary" in section.lower():
            return MOCK_AI_RESPONSES["summary"]
        elif "experience" in section.lower():
            return MOCK_AI_RESPONSES["experience"]
        elif "custom" in section.lower():
            return MOCK_AI_RESPONSES["custom"]
        else:
            return "Mock enhanced content for: " + prompt # Fallback mock

    if not GEMINI_API_KEY:
        logging.error("GEMINI_API_KEY not set. Cannot use Gemini AI.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API key not configured. Please set GEMINI_API_KEY environment variable or choose mock AI."
        )

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = await asyncio.to_thread(model.generate_content, prompt)
        return response.text
    except Exception as e:
        logging.error(f"Error calling Gemini AI: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error enhancing content with AI: {e}"
        )

@app.post("/ai-enhance")
async def ai_enhance(
    data: Dict[str, str],
    use_mock: Optional[bool] = Query(False, description="Use mock AI response instead of actual Gemini AI")
):
    section = data.get("section")
    content = data.get("content")

    if not section or content is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Section and content are required.")

    # Generate a more specific prompt for the AI based on the section
    prompt = ""
    if section == "summary":
        prompt = f"Enhance the following professional summary, making it more impactful and concise: \"{content}\""
    elif section.startswith("experience-"):
        prompt = f"Rewrite the following job responsibility/achievement to be more action-oriented and quantifiable for a resume: \"{content}\""
    elif section.startswith("custom-"):
        prompt = f"Improve the clarity and impact of this resume section content: \"{content}\""
    else:
        # Fallback for other potential sections, or if the section name isn't recognized for a specific prompt
        prompt = f"Enhance the following resume content: \"{content}\""
    
    try:
        enhanced_content = await get_gemini_response(prompt, section, use_mock)
        return {"enhanced_content": enhanced_content}
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.error(f"Unhandled error during AI enhancement: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred during AI enhancement.")


@app.get("/resumes")
async def get_saved_resumes():
    # Re-read from disk to ensure latest state, or use in-memory if preferred
    # For now, re-reading is safer if files can be added/removed externally
    resumes = []
    loaded_count = 0
    if os.path.exists(SAVE_DIR):
        for filename in os.listdir(SAVE_DIR):
            if filename.endswith(".json"):
                filepath = os.path.join(SAVE_DIR, filename)
                try:
                    with open(filepath, "r") as f:
                        resume_data = json.load(f)
                        # Basic validation
                        if "id" in resume_data and "personalInfo" in resume_data:
                            resumes.append(resume_data)
                            loaded_count += 1
                except json.JSONDecodeError:
                    logging.warning(f"Skipping malformed JSON file: {filename}")
                except Exception as e:
                    logging.error(f"Error loading resume from {filename} for GET request: {e}")
    logging.info(f"Retrieved {loaded_count} resumes for GET request.")
    return {"resumes": resumes}


@app.post("/save-resume")
async def save_resume(resume: Resume):
    global saved_resumes_in_memory # MOVED THIS LINE TO THE TOP OF THE FUNCTION
    try:
        # Generate a unique ID if not already present (e.g., for initial save)
        if resume.id is None:
            # Find the maximum existing ID and add 1, or start from 1
            max_id = 0
            for r_data in saved_resumes_in_memory:
                if isinstance(r_data.get("id"), int):
                    max_id = max(max_id, r_data["id"])
            new_id = max_id + 1
            resume.id = new_id
        
        # Update timestamp
        resume.timestamp = datetime.now().isoformat()

        # Update in-memory storage (remove old version if exists, add new)
        saved_resumes_in_memory = [r for r in saved_resumes_in_memory if r.get("id") != resume.id]
        saved_resumes_in_memory.append(resume.dict()) # Store as dict

        filename = f"resume_{resume.id}.json"
        filepath = os.path.join(SAVE_DIR, filename)
        with open(filepath, "w") as f:
            json.dump(resume.dict(), f, indent=2)
        logging.info(f"Resume ID {resume.id} saved successfully to {filepath}")
        return {"message": "Resume saved successfully!", "id": resume.id, "timestamp": resume.timestamp}
    except Exception as e:
        logging.error(f"Error saving resume: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to save resume: {e}")


@app.get("/")
async def read_root():
    return {"message": "Welcome to the Resume Editor API! Visit /docs for API documentation."}


if __name__ == "__main__":
    import uvicorn
    logging.info("Starting Resume Editor API...")
    logging.info("To use Gemini AI, set the GEMINI_API_KEY environment variable.")
    logging.info("Frontend can pass 'use_mock=true' to the /ai-enhance endpoint to force mock AI.")
    logging.info("API will be available at: http://localhost:8000")
    logging.info("API documentation at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
