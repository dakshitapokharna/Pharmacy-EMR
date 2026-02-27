from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from database import SessionLocal
import models

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 1️⃣ Today's Sales Summary
@router.get("/today-sales")
def get_today_sales(db: Session = Depends(get_db)):
    today = date.today()

    total_sales = db.query(func.sum(models.Sale.total_amount))\
        .filter(models.Sale.sale_date == today)\
        .scalar()

    return {
        "date": str(today),
        "total_sales": total_sales or 0
    }


# 2️⃣ Total Items Sold Today
@router.get("/items-sold")
def get_items_sold(db: Session = Depends(get_db)):
    today = date.today()

    total_items = db.query(func.sum(models.Sale.quantity_sold))\
        .filter(models.Sale.sale_date == today)\
        .scalar()

    return {
        "date": str(today),
        "items_sold": total_items or 0
    }


# 3️⃣ Low Stock Items
@router.get("/low-stock")
def get_low_stock(db: Session = Depends(get_db)):
    medicines = db.query(models.Medicine)\
        .filter(models.Medicine.status == "Low Stock")\
        .all()

    return medicines


# 4️⃣ Overall Summary
@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):

    total_medicines = db.query(func.count(models.Medicine.id)).scalar()

    total_inventory_value = db.query(
        func.sum(models.Medicine.quantity * models.Medicine.price)
    ).scalar()

    return {
        "total_medicines": total_medicines or 0,
        "total_inventory_value": total_inventory_value or 0
    }