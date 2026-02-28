from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from typing import List
from database import SessionLocal
import models, schemas

router = APIRouter(
    prefix="/medicines",
    tags=["Medicines"]
)

# ================= DATABASE DEPENDENCY =================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ================= STATUS CALCULATION =================

def calculate_status(quantity: int, expiry_date: date):
    if expiry_date and expiry_date < date.today():
        return "Expired"
    if quantity == 0:
        return "Out of Stock"
    if quantity < 50:
        return "Low Stock"
    return "Active"


# ================= CREATE MEDICINE =================

@router.post("/", response_model=schemas.MedicineResponse)
def create_medicine(
    medicine: schemas.MedicineCreate,
    db: Session = Depends(get_db)
):
    status = calculate_status(medicine.quantity, medicine.expiry_date)

    db_medicine = models.Medicine(
        name=medicine.name,
        generic_name=medicine.generic_name,
        category=medicine.category,
        manufacturer=medicine.manufacturer,
        supplier=medicine.supplier,
        batch_no=medicine.batch_no,
        expiry_date=medicine.expiry_date,
        quantity=medicine.quantity,
        cost_price=medicine.cost_price,
        mrp=medicine.mrp,
        status=status
    )

    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)

    return db_medicine


# ================= GET MEDICINES =================

@router.get("/", response_model=List[schemas.MedicineResponse])
def get_medicines(
    search: str = None,
    status: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Medicine)

    if search:
        query = query.filter(
            models.Medicine.name.ilike(f"%{search}%")
        )

    if status:
        query = query.filter(
            models.Medicine.status == status
        )

    return query.all()


# ================= UPDATE MEDICINE =================

@router.put("/{medicine_id}", response_model=schemas.MedicineResponse)
def update_medicine(
    medicine_id: int,
    medicine: schemas.MedicineCreate,
    db: Session = Depends(get_db)
):
    db_medicine = db.query(models.Medicine).filter(
        models.Medicine.id == medicine_id
    ).first()

    if not db_medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    status = calculate_status(medicine.quantity, medicine.expiry_date)

    db_medicine.name = medicine.name
    db_medicine.generic_name = medicine.generic_name
    db_medicine.category = medicine.category
    db_medicine.manufacturer = medicine.manufacturer
    db_medicine.supplier = medicine.supplier
    db_medicine.batch_no = medicine.batch_no
    db_medicine.expiry_date = medicine.expiry_date
    db_medicine.quantity = medicine.quantity
    db_medicine.cost_price = medicine.cost_price
    db_medicine.mrp = medicine.mrp
    db_medicine.status = status

    db.commit()
    db.refresh(db_medicine)

    return db_medicine


# ================= DELETE MEDICINE (BONUS PROFESSIONAL FEATURE) =================

@router.delete("/{medicine_id}")
def delete_medicine(medicine_id: int, db: Session = Depends(get_db)):
    db_medicine = db.query(models.Medicine).filter(
        models.Medicine.id == medicine_id
    ).first()

    if not db_medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    db.delete(db_medicine)
    db.commit()

    return {"message": "Medicine deleted successfully"}