from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from database import SessionLocal
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
    medicine_id: int,
    quantity_sold: int,
    db: Session = Depends(get_db)
):
    medicine = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()

    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    if medicine.quantity < quantity_sold:
        raise HTTPException(status_code=400, detail="Not enough stock")

    # Reduce stock
    medicine.quantity -= quantity_sold

    # Recalculate status
    if medicine.expiry_date < date.today():
        medicine.status = "Expired"
    elif medicine.quantity == 0:
        medicine.status = "Out of Stock"
    elif medicine.quantity < 10:
        medicine.status = "Low Stock"
    else:
        medicine.status = "Active"

    total_amount = quantity_sold * medicine.price

    sale = models.Sale(
        invoice_no=f"INV-{medicine_id}-{quantity_sold}",
        medicine_id=medicine_id,
        quantity_sold=quantity_sold,
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