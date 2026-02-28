from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from database import SessionLocal
from typing import List
import schemas
import models

router = APIRouter(
    prefix="/sales",
    tags=["Sales"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def create_sale(
    sale_data: schemas.SaleCreate,
    db: Session = Depends(get_db)
):
    medicine = db.query(models.Medicine).filter(
        models.Medicine.id == sale_data.medicine_id
    ).first()

    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    if medicine.quantity < sale_data.quantity_sold:
        raise HTTPException(status_code=400, detail="Not enough stock")

    medicine.quantity -= sale_data.quantity_sold

    if medicine.expiry_date < date.today():
        medicine.status = "Expired"
    elif medicine.quantity == 0:
        medicine.status = "Out of Stock"
    elif medicine.quantity < 10:
        medicine.status = "Low Stock"
    else:
        medicine.status = "Active"

    total_amount = sale_data.quantity_sold * medicine.mrp

    sale = models.Sale(
        invoice_no=f"INV-{sale_data.medicine_id}-{sale_data.quantity_sold}",
        medicine_id=sale_data.medicine_id,
        quantity_sold=sale_data.quantity_sold,
        total_amount=total_amount,
        sale_date=date.today()
    )

    db.add(sale)
    db.commit()
    db.refresh(sale)

    return {
        "message": "Sale recorded",
        "remaining_stock": medicine.quantity,
        "total_amount": total_amount
    }


@router.get("/", response_model=List[schemas.SaleResponse])
def get_sales(db: Session = Depends(get_db)):
    sales = db.query(models.Sale).order_by(
        models.Sale.sale_date.desc()
    ).all()

    result = []

    for sale in sales:
        medicine = db.query(models.Medicine).filter(
            models.Medicine.id == sale.medicine_id
        ).first()

        result.append({
            "id": sale.id,
            "invoice_no": sale.invoice_no,
            "customer_name": "Customer",
            "items_count": sale.quantity_sold,
            "payment_method": "Cash",
            "total_amount": sale.total_amount,
            "sale_date": sale.sale_date,
            "medicine_name": medicine.name if medicine else "Unknown"
        })

    return result