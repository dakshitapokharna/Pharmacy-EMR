from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from database import Base

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    generic_name = Column(String)
    manufacturer = Column(String)
    batch_no = Column(String)
    expiry_date = Column(Date)
    quantity = Column(Integer)
    price = Column(Float)
    status = Column(String)


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    invoice_no = Column(String)
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    quantity_sold = Column(Integer)
    total_amount = Column(Float)
    sale_date = Column(Date)