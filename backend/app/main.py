from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "UTRGV Degree Roadmap API running"}