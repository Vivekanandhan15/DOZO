from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship, backref
from app.database.database import Base

class Students(Base):
    __tablename__ = "students"
    student_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    roll_no = Column(String(20))
    parent_contact = Column(String(15))
    admission_date = Column(Date)

    user = relationship("Users")
    enrollments = relationship("Enrollment", back_populates="student")
