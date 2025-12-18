from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

from app.database.database import engine, Base
from app.models import (
    users, students, batches, enrollment,
    assignments, submissions, attendance,
    leaves, announcements
)

from app.routers.users import router as user_router
from app.routers.students import router as student_router
from app.routers.batches import router as batches_router
from app.routers.enrollment import router as enrollment_router
from app.routers.assignments import router as assignments_router
from app.routers.submissions import router as submissions_router
from app.routers.attendance import router as attendance_router
from app.routers.leaves import router as leaves_router
from app.routers.announcements import router as announcements_router
from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(user_router)
app.include_router(student_router)
app.include_router(batches_router)
app.include_router(enrollment_router)
app.include_router(assignments_router)
app.include_router(submissions_router)
app.include_router(attendance_router)
app.include_router(leaves_router)
app.include_router(announcements_router)
app.include_router(auth_router)
app.include_router(dashboard_router)




app.mount(
    "/static",
    StaticFiles(directory="Frontend"),
    name="static"
)


templates = Jinja2Templates(directory="Frontend")


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request}
    )

@app.get("/attendance", response_class=HTMLResponse)
def attendance_page(request: Request):
    return templates.TemplateResponse(
        "pages/attendance.html",
        {"request": request}
    )

@app.get("/admin", response_class=HTMLResponse)
def admin_page(request: Request):
    return templates.TemplateResponse("pages/Admin_page.html", {"request": request})

@app.get("/admin/students", response_class=HTMLResponse)
def admin_student_page(request: Request):
    return templates.TemplateResponse("pages/Admin_student_page.html", {"request": request})

@app.get("/admin/students/add", response_class=HTMLResponse)
def add_student_page(request: Request):
    return templates.TemplateResponse("pages/add_student.html", {"request": request})

@app.get("/admin/batches", response_class=HTMLResponse)
def batch_management_page(request: Request):
    return templates.TemplateResponse("pages/batch_management.html", {"request": request})

@app.get("/student", response_class=HTMLResponse)
def student_dashboard(request: Request):
    return templates.TemplateResponse("pages/student_page.html", {"request": request})

@app.get("/student/profile", response_class=HTMLResponse)
def student_profile_page(request: Request):
    return templates.TemplateResponse(
        "pages/student_profile.html",
        {"request": request}
    )