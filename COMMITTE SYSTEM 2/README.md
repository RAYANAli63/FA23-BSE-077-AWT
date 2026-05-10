# 🏦 Committee System — کمیٹی سسٹم
### MEAN Stack Money Committee Management App
https://frontend-flame-one-k0utwal056.vercel.app/

---

## 📖 Scenario (کمیٹی کیا ہے؟)

**Committee** Pakistan mein ek informal savings system hai:
- Ek group of people (e.g., 10 log) milke committee banate hain
- Har member har mahine **fixed amount** deta hai (e.g., PKR 5,000)
- Har mahine collected amount (PKR 50,000) ek member ko milti hai
- Jis member ki **"turn"** hoti hai woh poora amount le jaata hai
- Yeh cycle tab tak chalti hai jab tak sabki turn na aa jaye

---

## 🛠️ Tech Stack (MEAN)

```
M — MongoDB      → Database (members, committees, payments, payouts)
E — Express.js   → REST API backend  
A — Vanilla JS   → Frontend (SPA without Angular framework, same concept)
N — Node.js      → Runtime environment
```

---

## 📁 Project Structure

```
committee-system/
├── server.js          ← Express backend + MongoDB models + API routes
├── package.json       ← Dependencies
├── .env               ← Environment variables (create this)
└── public/
    └── index.html     ← Complete frontend SPA
```

---

## 🗄️ Database Models

### Member
```js
{ name, phone, cnic, email, createdAt }
```

### Committee
```js
{ name, monthlyAmount, totalMembers, startDate, status,
  members: [{ memberId, memberName, turnMonth, hasTaken }] }
```

### Payment
```js
{ committeeId, memberId, memberName, month, year, amount, status, paidDate }
```

### Payout
```js
{ committeeId, memberId, memberName, turnMonth, turnYear, totalAmount, status, givenDate }
```

---

## 🚀 Setup & Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Create .env file
```env
MONGO_URI=mongodb://localhost:27017/committee_system
PORT=5000
```

### 3. Start MongoDB
```bash
# Windows
mongod

# Or use MongoDB Atlas (cloud) — paste your connection string in .env
```

### 4. Run Server
```bash
node server.js
# or
npm start
```

### 5. Open Browser
```
http://localhost:5000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Stats overview |
| GET | /api/members | Get all members |
| POST | /api/members | Add member |
| DELETE | /api/members/:id | Delete member |
| GET | /api/committees | Get all committees |
| POST | /api/committees | Create committee (auto-generates payments & payouts) |
| GET | /api/committees/:id | Get single committee |
| GET | /api/payments/:committeeId | Get payments for a committee |
| PUT | /api/payments/:id/mark-paid | Mark payment as paid |
| GET | /api/payouts/:committeeId | Get payouts for a committee |
| PUT | /api/payouts/:id/mark-given | Mark payout as given |

---

## 💡 Features

- ✅ Add/manage committee members
- ✅ Create committees with turn assignment
- ✅ Auto-generate monthly payment records
- ✅ Auto-generate payout schedule
- ✅ Track who paid and who didn't
- ✅ Mark payouts as given
- ✅ Dashboard with stats
- ✅ Works in demo mode (without MongoDB)
- ✅ Pakistani context (PKR currency)

---

## 🌐 Deploy to MongoDB Atlas (Free)

1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Get connection string
4. Put in .env: `MONGO_URI=mongodb+srv://...`

---

Made with ❤️ for Pakistan Committee Management
