# Product Billing Management System

A modern, full-stack web-based billing application tailored for retail stores, optimizing point-of-sale operations. Designed specifically to handle weight-based pricing (e.g., spices, loose goods), the system simplifies product management, auto-generates barcodes, enables real-time scanning, and manages sales dashboards with dynamic customer pricing.

## 🚀 Features

- **Admin Product Management (CRUD):** 
  Easily add, view, update, and remove products. Assign prices (e.g., per 50g) and custom barcode IDs or let the system auto-generate standard 1D CODE-128 barcodes.
- **Webcam Barcode Scanner:** 
  Utilize real-time, highly-optimized webcam scanning for quick product addition to the cart. Instantly fetches product details from the database.
- **Manual & Dynamic Billing:** 
  In case of missing barcodes, manually select products from a dynamic dropdown. Enter product weights (in grams or kilograms) to calculate prices automatically based on base rates.
- **Customer-Wise Dynamic Pricing:** 
  Supports dynamic pricing per customer, manual price overrides in the cart, and detailed tracking for personalized billing experiences.
- **Sales & Bills Dashboard:** 
  Track all historical bills, view monthly aggregated revenue, and access itemized past transactions in a clean modal view. Maintains a robust three-month data retention policy for financial reports.
- **Professional Invoicing:** 
  Generates clean, print-ready invoices containing unique invoice numbers, itemized lists, and grand totals.

## 🛠️ Technology Stack

**Frontend:**
- [React.js (Vite)](https://vitejs.dev/) - Fast, modern UI framework.
- [React Router](https://reactrouter.com/) - Client-side routing.
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) - Robust webcam barcode scanning.
- [react-barcode](https://github.com/kciter/react-barcode) - Barcode visual generation.
- [Lucide React](https://lucide.dev/) - Beautiful, consistent iconography.
- [Axios](https://axios-http.com/) - Promise-based HTTP client.

**Backend:**
- [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) - Scalable RESTful API server.
- [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/) - NoSQL database and object modeling.

## 📦 Project Structure

```text
├── backend/            # Express.js server and API routes
│   ├── models/         # Mongoose schemas (Bill, Product, etc.)
│   ├── routes/         # Express routes
│   ├── package.json
│   └── index.js
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── App.jsx     # Main entry point
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── QR images/          # Generated QR code assets
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB running locally or a MongoDB Atlas connection string.

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (create a `.env` file based on `.env.example` if available, typically containing `MONGO_URI` and `PORT`).
4. Start the server:
   ```bash
   npm start
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 💡 Workflow Overview
1. **Adding Inventory:** Admins log in, add products with prices, and print generated barcodes to attach to store items.
2. **Scanning:** Cashiers scan products via webcam during checkout. The cart populates instantly.
3. **Weight & Price:** The cashier enters the exact weight. The system dynamically computes the cost.
4. **Checkout:** Complete the transaction to save it to the database and print a professional invoice.
5. **Review:** Store owners can view historical sales and aggregated monthly data in the Admin dashboard.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!


