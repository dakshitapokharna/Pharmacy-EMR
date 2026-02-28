from pydantic import BaseModel
from datetime import date

class SaleResponse(BaseModel):
    id: int
    invoice_no: str
    customer_name: str
    items_count: int
    payment_method: str
    total_amount: float
    sale_date: date
    medicine_name: str

    class Config:
        from_attributes = True  # Pydantic v2

class MedicineBase(BaseModel):
    name: str
    generic_name: str | None = None
    category: str | None = None
    manufacturer: str | None = None
    supplier: str | None = None
    batch_no: str | None = None
    expiry_date: date | None = None
    quantity: int
    cost_price: float
    mrp: float
    status: str | None = None


class MedicineCreate(MedicineBase):
    pass


class MedicineResponse(MedicineBase):
    id: int

    class Config:
        orm_mode = True


class SaleCreate(BaseModel):
    medicine_id: int
    quantity_sold: int