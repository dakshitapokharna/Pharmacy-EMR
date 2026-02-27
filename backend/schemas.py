from pydantic import BaseModel
from datetime import date

class MedicineCreate(BaseModel):
    name: str
    generic_name: str
    manufacturer: str
    batch_no: str
    expiry_date: date
    quantity: int
    price: float

class MedicineResponse(MedicineCreate):
    id: int
    status: str

    class Config:
        orm_mode = True