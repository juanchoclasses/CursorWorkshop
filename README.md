# Bank Backend - Client/Server Application

A TypeScript-based bank management system built for students to experiment with Cursor AI. This project features a React frontend with Material-UI and an Express.js backend with a RESTful API.

## 🏗️ Project Structure

```
bank-backend/
├── src/
│   ├── client/          # React + TypeScript + Material-UI frontend
│   │   ├── src/
│   │   │   └── App.tsx  # Main application component
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── server/          # Express + TypeScript backend
│       ├── src/
│       │   └── index.ts # Main server file with API routes
│       ├── package.json
│       └── tsconfig.json
├── package.json         # Root package.json with scripts
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start both client and server in development mode:**
   ```bash
   npm run dev
   ```

This will start:
- Backend server on http://localhost:5000
- Frontend client on http://localhost:5173

### Individual Commands

**Server only:**
```bash
npm run server:dev
```

**Client only:**
```bash
npm run client:dev
```

**Install dependencies separately:**
```bash
npm run server:install
npm run client:install
```

## 🏦 API Endpoints

### Accounts
- `GET /api/accounts` - Get all accounts
- `GET /api/accounts/:id` - Get account by ID  
- `GET /api/accounts/:id/balance` - Get account balance
- `POST /api/accounts` - Create new account

### Transactions
- `GET /api/accounts/:id/transactions` - Get account transactions
- `POST /api/accounts/:id/transactions` - Create transaction (deposit/withdrawal)
- `POST /api/transfer` - Transfer funds between accounts

### Example API Usage

**Create Account:**
```bash
curl -X POST http://localhost:5000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{"accountHolder": "John Doe", "initialBalance": 1000, "accountType": "checking"}'
```

**Make Deposit:**
```bash
curl -X POST http://localhost:5000/api/accounts/1/transactions \
  -H "Content-Type: application/json" \
  -d '{"type": "deposit", "amount": 500, "description": "Salary deposit"}'
```

## 🎯 Features

### Frontend (React + Material-UI)
- **Account Management:** View all accounts with balances
- **Transaction History:** View transaction history for each account
- **Deposit/Withdrawal:** Create deposits and withdrawals
- **Fund Transfers:** Transfer money between accounts
- **Real-time Updates:** Automatic balance updates
- **Responsive Design:** Mobile-friendly interface

### Backend (Express + TypeScript)
- **RESTful API:** Clean API design with proper HTTP methods
- **TypeScript:** Full type safety and interfaces
- **In-memory Storage:** Easy to understand data management
- **Error Handling:** Comprehensive error responses
- **CORS Support:** Frontend-backend communication
- **Request Logging:** Morgan middleware for debugging

## 🧪 Sample Data

The application comes with pre-loaded sample data:

**Accounts:**
1. John Doe - Account #1234567890 (Checking) - $1,500.00
2. Jane Smith - Account #0987654321 (Savings) - $2,750.50

**Transactions:**
- John Doe: Salary deposit (+$500.00)
- John Doe: ATM withdrawal (-$100.00)

## 🛠️ Development

### Technologies Used

**Frontend:**
- React 19
- TypeScript
- Material-UI (MUI)
- Vite
- Axios

**Backend:**
- Express.js
- TypeScript
- CORS
- Morgan (logging)
- Nodemon (development)

### Code Structure

**Server (`src/server/src/index.ts`):**
- Interfaces for Account and Transaction types
- RESTful API endpoints
- In-memory data storage
- Error handling middleware

**Client (`src/client/src/App.tsx`):**
- React components with Material-UI
- State management with hooks
- API integration with Axios
- Form handling and validation

## 📝 Assignment Ideas for Students

1. **Database Integration:** Replace in-memory storage with MongoDB or PostgreSQL
2. **Authentication:** Add user authentication with JWT tokens
3. **Account Types:** Add more account types (credit, loan, investment)
4. **Interest Calculation:** Implement interest calculation for savings accounts
5. **Transaction Categories:** Add categories and spending analysis
6. **Email Notifications:** Send email notifications for transactions
7. **Mobile App:** Create a React Native mobile version
8. **Testing:** Add unit and integration tests
9. **Deployment:** Deploy to cloud platforms (Heroku, Vercel, AWS)
10. **Real-time Updates:** Add WebSocket support for real-time updates

## 🎓 Learning Objectives

- **Full-stack Development:** Understanding client-server architecture
- **TypeScript:** Type-safe programming in both frontend and backend
- **RESTful APIs:** Designing and consuming REST APIs
- **React Development:** Modern React with hooks and Material-UI
- **Express.js:** Backend development with middleware and routing
- **State Management:** Managing application state in React
- **Error Handling:** Proper error handling in both client and server
- **Development Tools:** Using modern development tools (Vite, Nodemon, TypeScript)

## 🔧 Customization

The project is designed to be easily customizable:

- **Styling:** Modify Material-UI theme in the client
- **API Routes:** Add new endpoints in `src/server/src/index.ts`
- **Data Models:** Extend interfaces for new features
- **UI Components:** Create new React components
- **Business Logic:** Add validation and business rules

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)

Happy coding! 🚀 

https://cursorworkshopclient.onrender.com/
https://cursorworkshopserver.onrender.com/