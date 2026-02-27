from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from typing import List
from database import SessionLocal
import models, schemas

router = APIRouter(
    prefix="/medicines",
    tags=["Medicines"]
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Status calculation logic
def calculate_status(quantity, expiry_date):
    if expiry_date < date.today():
        return "Expired"
    if quantity == 0:
        return "Out of Stock"
    if quantity < 10:
        return "Low Stock"
    return "Active"

@router.post("/", response_model=schemas.MedicineResponse)
def create_medicine(medicine: schemas.MedicineCreate, db: Session = Depends(get_db)):
    
    status = calculate_status(medicine.quantity, medicine.expiry_date)

    db_medicine = models.Medicine(
        name=medicine.name,
        generic_name=medicine.generic_name,
        manufacturer=medicine.manufacturer,
        batch_no=medicine.batch_no,
        expiry_date=medicine.expiry_date,
        quantity=medicine.quantity,
        price=medicine.price,
        status=status
    )

    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)

    return db_medicine

@router.get("/", response_model=List[schemas.MedicineResponse])
def get_medicines(
    search: str = None,
    status: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Medicine)

    if search:
        query = query.filter(models.Medicine.name.ilike(f"%{search}%"))

    if status:
        query = query.filter(models.Medicine.status == status)

    medicines = query.all()
    return medicines


@router.put("/{medicine_id}", response_model=schemas.MedicineResponse)
def update_medicine(medicine_id: int, medicine: schemas.MedicineCreate, db: Session = Depends(get_db)):
    
    db_medicine = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()

    if not db_medicine:
        return {"error": "Medicine not found"}

    # Recalculate status
    status = calculate_status(medicine.quantity, medicine.expiry_date)

    db_medicine.name = medicine.name
    db_medicine.generic_name = medicine.generic_name
    db_medicine.manufacturer = medicine.manufacturer
    db_medicine.batch_no = medicine.batch_no
    db_medicine.expiry_date = medicine.expiry_date
    db_medicine.quantity = medicine.quantity
    db_medicine.price = medicine.price
    db_medicine.status = status

    db.commit()
    db.refresh(db_medicine)

    return db_medicine