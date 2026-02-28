import { useEffect,useState } from "react";
import { useNavigate ,useLocation} from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import API from "../services/api";
import SummaryCard from "../components/SummaryCard";
import "./Sales.css";

const Sales = () => {
  
  const [recentSales, setRecentSales] = useState([]);
  
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await API.get("/sales");
        setRecentSales(res.data);
      } catch (err) {
        console.error("Error fetching sales:",err);
      }
    };

    fetchSales();
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
 const [sales, setSales] = useState(0);
 const [itemsSold, setItemsSold] = useState(0);
 const [lowStock, setLowStock] = useState([]);
 const [summary, setSummary] = useState({});
 const [showModal, setShowModal] = useState(false);
 const [medicines, setMedicines] = useState([]);
 const [search, setSearch] = useState("");
 const [selectedMedicine, setSelectedMedicine] = useState(null);
 const [saleQuantity, setSaleQuantity] = useState(1);
 const [patientId, setPatientId] = useState("");
 const [newMedicine, setNewMedicine] = useState({
   name: "",
   generic_name: "",
   category: "",
   manufacturer: "",
   supplier: "",
   batch_no: "",
   expiry_date: "",
   quantity: "",
   cost_price: "",
   mrp: "",
 });

 const filteredMedicines = medicines.filter((med) =>
   med.name.toLowerCase().includes(search.toLowerCase()),
 );

 const handleEnter = () => {
   if (filteredMedicines.length > 0) {
     setSelectedMedicine(filteredMedicines[0]);
   } else {
     alert("No medicine found");
   }
 };

 const handleBill = async () => {
   if (!selectedMedicine) {
     alert("Select a medicine first");
     return;
   }

   try {
     await API.post("/sales", {
       medicine_id: selectedMedicine.id,
       quantity_sold: saleQuantity,
     });

     alert("Sale recorded successfully!");

     setSelectedMedicine(null);
     setSearch("");
     setSaleQuantity(1);
     setPatientId("");

     await fetchData(); // refresh dashboard + medicines

     const updatedSales = await API.get("/sales");
     setRecentSales(updatedSales.data);
   } catch (error) {
     alert(error.response?.data?.detail || "Error creating sale");
   }
 };

 /* ================= FETCH DATA ================= */
 const fetchData = async () => {
   try {
     const s1 = await API.get("/dashboard/today-sales");
     const s2 = await API.get("/dashboard/items-sold");
     const s3 = await API.get("/dashboard/low-stock");
     const s4 = await API.get("/dashboard/summary");
      const m1 = await API.get("/medicines/");
     setSales(s1.data.total_sales || 0);
     setItemsSold(s2.data.items_sold || 0);
     setLowStock(s3.data || []);
     setSummary(s4.data || {});
     setMedicines(m1.data || []);
   } catch (error) {
     console.error("Error fetching dashboard data:", error);
   }
 };

 useEffect(() => {
   const load = async () => {
     await fetchData();
   };

   load();
 }, []);

const exportCSV = () => {
  if (!medicines.length) {
    alert("No data to export");
    return;
  }

  const headers = [
    "Name",
    "Generic Name",
    "Category",
    "Batch No",
    "Expiry Date",
    "Quantity",
    "Cost Price",
    "MRP",
    "Supplier",
    "Status",
  ];

  const rows = medicines.map((med) => [
    med.name,
    med.generic_name,
    med.category,
    med.batch_no,
    med.expiry_date,
    med.quantity,
    med.cost_price,
    med.mrp,
    med.supplier,
    med.status,
  ]);

  const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "inventory.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

   const handleAddMedicine = async () => {
     try {
       await API.post("/medicines", {
         ...newMedicine,
         quantity: Number(newMedicine.quantity),
         cost_price: Number(newMedicine.cost_price),
         mrp: Number(newMedicine.mrp),
       });

       setShowModal(false);

       setNewMedicine({
         name: "",
         generic_name: "",
         category: "",
         manufacturer: "",
         supplier: "",
         batch_no: "",
         expiry_date: "",
         quantity: "",
         cost_price: "",
         mrp: "",
       });

       fetchData();
     } catch (error) {
       console.error("Error adding medicine:", error);
     }
   };





  return (
    <MainLayout>
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Pharmacy CRM</h1>
            <p>Manage inventory, sales, and purchase orders</p>
          </div>

          <div className="header-actions">
            <button className="export-btn" onClick={exportCSV}>
              Export
            </button>

            <button className="add-btn" onClick={() => setShowModal(true)}>
              Add Medicine
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="card-grid">
          <SummaryCard
            title="Today's Sales"
            value={`₹${sales}`}
            color="green"
            icon="$"
          />
          <SummaryCard
            title="Items Sold Today"
            value={itemsSold}
            color="blue"
            icon="🛒"
          />
          <SummaryCard
            title="Low Stock Items"
            value={lowStock.length}
            color="orange"
            icon="⚠"
          />
          <SummaryCard
            title="Inventory Value"
            value={`₹${summary.total_inventory_value || 0}`}
            color="purple"
            icon="📦"
          />
        </div>
        <div className="bottomsection">
          <div className="section-bar">
            <div className="section-tabs">
              <button
                onClick={() => navigate("/sales")}
                className={`tab ${location.pathname === "/sales" ? "active" : ""}`}>
                🛒 Sales
              </button>

              <button
                onClick={() => navigate("/purchase")}
                className={`tab ${location.pathname === "/purchase" ? "active" : ""}`}>
                📦 Purchase
              </button>

              <button
                onClick={() => navigate("/")}
                className={`tab ${location.pathname === "/" ? "active" : ""}`}>
                📋 Inventory
              </button>
            </div>

            <div className="section-actions">
              <button className="outline-btn">＋ New Sale</button>
              <button className="outline-btn">＋ New Purchase</button>
            </div>
          </div>

          <div className="make-sale-card">
            <div className="sale-header">
              <h3>Make a Sale</h3>
              <p>Select medicines from inventory</p>
            </div>

            <div className="sale-input-row">
              <input
                type="text"
                placeholder="Patient Id"
                className="sale-input"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />

              <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search medicines..."
                  className="sale-input search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button className="enter-btn" onClick={handleEnter}>
                Enter
              </button>

              <button className="bill-btn" onClick={handleBill}>
                Bill
              </button>
            </div>

            <div className="sale-table-header">
              <span>MEDICINE NAME</span>
              <span>GENERIC NAME</span>
              <span>BATCH NO</span>
              <span>EXPIRY DATE</span>
              <span>QUANTITY</span>
              <span>MRP / PRICE</span>
              <span>SUPPLIER</span>
              <span>STATUS</span>
              <span>ACTIONS</span>
            </div>

            <div className="sale-table-body">
              {selectedMedicine && (
                <div className="sale-row">
                  <span>{selectedMedicine.name}</span>
                  <span>{selectedMedicine.generic_name}</span>
                  <span>{selectedMedicine.batch_no}</span>
                  <span>{selectedMedicine.expiry_date}</span>

                  <span>
                    <input
                      type="number"
                      min="1"
                      value={saleQuantity}
                      onChange={(e) => setSaleQuantity(Number(e.target.value))}
                      className="qty-input"
                    />
                  </span>

                  <span>₹{selectedMedicine.mrp}</span>
                  <span>{selectedMedicine.supplier}</span>
                  <span>{selectedMedicine.status}</span>
                  <span>-</span>
                </div>
              )}
            </div>
          </div>

          {/* INVENTORY SECTION */}
          <div className="inventory-section">
            <div className="recent-sales">
              <h3 className="recent-title">Recent Sales</h3>

              {recentSales.map((sale) => (
                <div key={sale.id} className="sale-card-item">
                  {/* Left Icon */}
                  <div className="sale-icon">🛒</div>

                  {/* Middle Info */}
                  <div className="sale-info">
                    <h4>{sale.invoice_no}</h4>
                    <p>
                      {sale.customer_name} • {sale.items_count} items •{" "}
                      {sale.payment_method}
                    </p>
                  </div>

                  {/* Right Side */}
                  <div className="sale-right">
                    <div className="sale-amount">₹{sale.total_amount}</div>
                    <div className="sale-date">{sale.sale_date}</div>
                    <div className="status-badge completed">Completed</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* ADD MEDICINE MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Medicine</h3>

            <input
              placeholder="Name"
              value={newMedicine.name}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, name: e.target.value })
              }
            />

            <input
              placeholder="Generic Name"
              value={newMedicine.generic_name}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, generic_name: e.target.value })
              }
            />

            <input
              placeholder="Category"
              value={newMedicine.category}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, category: e.target.value })
              }
            />

            <input
              placeholder="Manufacturer"
              value={newMedicine.manufacturer}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, manufacturer: e.target.value })
              }
            />

            <input
              placeholder="Supplier"
              value={newMedicine.supplier}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, supplier: e.target.value })
              }
            />

            <input
              placeholder="Batch No"
              value={newMedicine.batch_no}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, batch_no: e.target.value })
              }
            />

            <input
              type="date"
              value={newMedicine.expiry_date}
              onChange={(e) =>
                setNewMedicine({ ...newMedicine, expiry_date: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Quantity"
              value={newMedicine.quantity}
              onChange={(e) =>
                setNewMedicine({
                  ...newMedicine,
                  quantity: Number(e.target.value),
                })
              }
            />

            <input
              type="number"
              placeholder="Cost Price"
              value={newMedicine.cost_price}
              onChange={(e) =>
                setNewMedicine({
                  ...newMedicine,
                  cost_price: Number(e.target.value),
                })
              }
            />

            <input
              type="number"
              placeholder="MRP"
              value={newMedicine.mrp}
              onChange={(e) =>
                setNewMedicine({
                  ...newMedicine,
                  mrp: Number(e.target.value),
                })
              }
            />

            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleAddMedicine}>Save</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Sales;
