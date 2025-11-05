# 🚀 LabTracker - Complete Setup Walkthrough

This guide will take you from zero to running LabTracker in about 5 minutes!

---

## Step 1: Check Prerequisites ✅

**You need:**
- Node.js v18 or higher
- npm v9 or higher
- A terminal/command prompt

**Check if you have them:**

```bash
# Check Node.js version
node --version
# Should show: v18.x.x or higher

# Check npm version
npm --version
# Should show: 9.x.x or higher
```

**Don't have them?** Download Node.js (includes npm): https://nodejs.org/

---

## Step 2: Clone or Navigate to Repository 📂

If you already have the code:
```bash
cd path/to/Confocal
```

If cloning from GitHub:
```bash
git clone <your-repo-url>
cd Confocal
git checkout claude/build-labtracker-app-011CUqCBvEEktspc4GSnrRYF
```

---

## Step 3: Install Dependencies 📦

This installs all required packages for both frontend and backend:

```bash
# From the Confocal root directory
npm install
```

**What's happening:**
- Installing backend packages (Express, Prisma, Socket.io, etc.)
- Installing frontend packages (React, Tailwind, Recharts, etc.)
- This takes 1-2 minutes

**You should see:**
```
added 770 packages, and audited 773 packages in 1m
```

---

## Step 4: Set Up the Database 🗄️

LabTracker uses SQLite - no PostgreSQL installation needed!

```bash
cd server

# Generate Prisma client
npx prisma generate

# Create database and tables
npx prisma migrate dev --name init

# Add sample data (5 users, projects, reagents, equipment, etc.)
npx prisma db seed
```

**What's happening:**
- Creating SQLite database file (`dev.db`)
- Creating 14 tables with relationships
- Adding test data with demo accounts

**You should see:**
```
✓ Generated Prisma Client
✓ Migrations applied
✓ Seed completed successfully!

Test accounts:
PI/Lab Manager: sarah.chen@biolab.edu / password123
Postdoc: michael.rodriguez@biolab.edu / password123
Grad Student: emily.zhang@biolab.edu / password123
```

---

## Step 5: Start the Application 🚀

**Option A: Run Both Together (Recommended)**

```bash
# From the root Confocal directory
npm run dev
```

**Option B: Run Separately (More Control)**

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

---

## Step 6: Open LabTracker in Your Browser 🌐

**Wait for these messages:**

Backend (Terminal 1):
```
Server is running on port 5000
Environment: development
```

Frontend (Terminal 2):
```
VITE v5.0.8  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Now open your browser and go to:**

```
http://localhost:5173
```

---

## Step 7: Login with Demo Account 🔐

You'll see a beautiful login page with a purple gradient!

**Try this demo account:**

```
Email: sarah.chen@biolab.edu
Password: password123
```

Or click one of the **Demo Account buttons** below the login form:
- **PI/Lab Manager** - Full access to everything
- **Postdoc** - Manage projects and orders
- **Grad Student** - Book equipment and request reagents

---

## Step 8: Explore LabTracker! 🎉

### Dashboard (First Page You'll See)

You should see:
- ✅ **4 Stat Cards**: Active Projects, Protocols, Low Stock Items, Pending Orders
- ✅ **Trend Indicators**: Green/red arrows showing changes
- ✅ **"Show/Hide Analytics" Button**: Click to see interactive charts!
- ✅ **Recent Projects**: With progress bars
- ✅ **Stock Alerts**: Orange cards showing low inventory
- ✅ **Today's Schedule**: Equipment bookings

**Try This:**
1. Click **"Show Analytics"** button
2. See beautiful charts appear:
   - Bar chart showing project progress
   - Pie chart showing order distribution
   - Budget overview chart

### Inventory (Left Sidebar → Inventory)

You should see:
- ✅ **10 Reagent Cards**: Each with details
- ✅ **Search Bar**: Try searching for "DMEM"
- ✅ **Low Stock Only** filter: Click to see only low stock items
- ✅ **Export Button**: Hover to see CSV/PDF options
- ✅ **QR Code Buttons**: On each reagent card

**Try This - Generate a QR Code:**
1. Find any reagent card (e.g., "DMEM High Glucose Media")
2. Click the **"QR Code"** button
3. See a modal with:
   - Large QR code
   - Reagent name and details
   - **Print** and **Download** buttons
4. Click **"Print"** to see print preview
5. Click **"Download"** to save as PNG

**Try This - Export to PDF:**
1. Click the **"Export"** button in the header
2. Hover over it to see dropdown menu
3. Click **"Export as PDF"**
4. A PDF file downloads automatically!
5. Open it to see professional formatted report

**Try This - Add a Reagent with AI:**
1. Click **"Add Reagent"** button
2. Fill in:
   - Name: "Anti-GFP Antibody"
   - Vendor: "Abcam"
   - Catalog Number: "ab290"
   - Quantity: "1"
   - Unit: "mL"
   - Low Stock Threshold: "0.5"
3. Click **"Get AI Suggestions"** button
4. Watch AI generate:
   - Optimal storage location
   - Temperature requirements
   - Handling notes
   - Expected shelf life
5. Click **"Add Reagent"**

### Projects (Left Sidebar → Projects)

You should see:
- ✅ **3 Project Cards**: CRISPR Study, Protein Expression, Cell Signaling
- ✅ **Progress Bars**: Visual completion percentage
- ✅ **Budget Info**: Money spent vs. total
- ✅ **Status Badges**: Green "active" badges

**Try This:**
1. Click on **"CRISPR Gene Editing Study"**
2. See detailed project page with stats
3. Check the progress percentage

### Equipment (Left Sidebar → Equipment)

You should see:
- ✅ **5 Equipment Items**: Confocal Microscope, PCR Thermocycler, etc.
- ✅ **Availability Status**: Green badges for available
- ✅ **Book Equipment** buttons
- ✅ **Training Required** badges (yellow)

**Try This:**
1. Click **"Book Equipment"** on any item
2. Fill in booking details
3. See conflict detection if time slot is taken

### Orders (Left Sidebar → Orders)

You should see:
- ✅ **Table View**: All orders with status
- ✅ **Color-Coded Status Badges**:
   - Yellow: REQUESTED
   - Blue: APPROVED
   - Purple: SHIPPED
   - Green: RECEIVED
- ✅ **Order Details**: Item, vendor, price

**Try This:**
1. Click **"New Order"** button
2. Fill in order details
3. See it appear in pending approvals

### Protocols (Left Sidebar → Protocols)

You should see:
- ✅ **5 Protocol Cards**: Western Blot, PCR, Cell Culture, etc.
- ✅ **Version Numbers**: v2.1, v1.5, etc.
- ✅ **Category Tags**: Purple badges
- ✅ **Tag Collections**: Bottom of each card

### Users (Left Sidebar → Users)

You should see:
- ✅ **5 User Cards**: With profile pictures
- ✅ **Role Badges**: Purple tags showing roles
- ✅ **Lab Affiliation**: Chen Molecular Biology Lab
- ✅ **Active Status**: Green badges

---

## Step 9: Test Real-Time Features ⚡

### Notifications

1. Look at the **bell icon** in the top right
2. You should see a **red badge** with a number (unread notifications)
3. Click the bell icon
4. See dropdown with notifications:
   - Low stock alerts
   - Order updates
   - Equipment reminders

### Dark Mode

1. Look for the **sun/moon icon** in the top right
2. Click it to toggle dark mode
3. Watch the entire app smoothly transition to dark theme!
4. All charts, cards, and modals adapt to dark mode

### Search

1. Click the **search bar** in the header
2. Type anything (e.g., "Western Blot")
3. See real-time search results (coming in future update)

---

## Step 10: Check Out the Charts 📊

Go back to Dashboard and explore the analytics:

### Project Progress Chart
- Bar chart showing progress % for each project
- Hover over bars to see exact values
- Purple gradient bars

### Order Status Distribution
- Colorful pie chart showing order breakdown
- Segments for REQUESTED, APPROVED, RECEIVED, etc.
- Interactive tooltips

### Budget Overview
- Multi-bar chart with 3 colors:
  - Blue: Total budget
  - Purple: Amount used
  - Green: Remaining
- Compare budgets across projects

---

## 🎯 Quick Feature Tour

### What to Try:

| Feature | Where | What to Do |
|---------|-------|------------|
| **QR Codes** | Inventory → Any reagent | Click "QR Code" → Print/Download |
| **Export CSV** | Inventory → Export button | Hover → "Export as CSV" |
| **Export PDF** | Inventory → Export button | Hover → "Export as PDF" |
| **AI Suggestions** | Inventory → Add Reagent | Fill name → "Get AI Suggestions" |
| **Charts** | Dashboard | Click "Show Analytics" |
| **Dark Mode** | Top right corner | Click moon icon |
| **Notifications** | Top right corner | Click bell icon |
| **Book Equipment** | Equipment → Any item | Click "Book Equipment" |
| **View Project** | Projects → Any card | Click card to see details |
| **Filter Inventory** | Inventory | Click "Low Stock Only" |
| **Search** | Top search bar | Type anything |

---

## 🎨 Visual Guide

### What You Should See:

**Login Page:**
```
┌────────────────────────────────────┐
│  🎨 Purple Gradient Background     │
│                                    │
│     🧬 LabTracker                  │
│  Modern Lab Management Platform    │
│                                    │
│  ┌──────────────────────────┐     │
│  │  Email: [___________]    │     │
│  │  Password: [________]    │     │
│  │  [ Sign In ]             │     │
│  └──────────────────────────┘     │
│                                    │
│  Demo Accounts: [Buttons...]      │
└────────────────────────────────────┘
```

**Dashboard:**
```
┌─────────────────────────────────────────┐
│  Dashboard                   🔔 🌙 👤   │
├─────────────────────────────────────────┤
│  Welcome back! Here's what's happening  │
│                    [Show Analytics]     │
├─────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │  3   │ │  5   │ │  5   │ │  2   │  │
│  │Active│ │Proto-│ │ Low  │ │Pend- │  │
│  │Proj. │ │cols  │ │Stock │ │ing   │  │
│  │+12% ↗│ │+5% ↗ │ │-3% ↘ │ │+8% ↗ │  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
├─────────────────────────────────────────┤
│  📊 Charts (if shown):                  │
│  ┌────────────┐ ┌────────────┐         │
│  │ Bar Chart  │ │ Pie Chart  │         │
│  │  Progress  │ │   Orders   │         │
│  └────────────┘ └────────────┘         │
├─────────────────────────────────────────┤
│  Recent Projects  │  Stock Alerts       │
│  Recent Protocols │  Today's Schedule   │
└─────────────────────────────────────────┘
```

**Inventory with QR Code:**
```
┌─────────────────────────────────────────┐
│  Inventory Management                   │
│  [Export▼] [Scan Barcode] [Add Reagent]│
├─────────────────────────────────────────┤
│  [Search...] [Low Stock Only]          │
├─────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐            │
│  │ DMEM     │ │ Taq DNA  │            │
│  │ ⚠️ Low   │ │ Poly...  │            │
│  │ 250 mL   │ │ 50 units │            │
│  │ [Update] │ │ [Update] │            │
│  │ [QR 📱]  │ │ [QR 📱]  │            │
│  └──────────┘ └──────────┘            │
└─────────────────────────────────────────┘

Click QR Code:
┌─────────────────────┐
│  QR Code       [X]  │
├─────────────────────┤
│  DMEM High Glucose  │
│  ThermoFisher       │
│                     │
│  ┌───────────┐      │
│  │ ███ ███ █ │      │
│  │ █ ███ █ █ │      │
│  │ ███ ███ █ │      │
│  └───────────┘      │
│                     │
│  [Download] [Print]│
└─────────────────────┘
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
```bash
# Kill the process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port in server/.env:
PORT=5001
```

### Database Errors

**Error:** `Can't reach database server`

**Solution:**
```bash
cd server
rm dev.db
npx prisma migrate dev --name init
npx prisma db seed
```

### Module Not Found

**Error:** `Cannot find module 'recharts'`

**Solution:**
```bash
cd client
npm install
```

### Prisma Generate Fails

**Error:** `Failed to fetch engine`

**Solution:**
```bash
cd server
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

---

## 📱 Mobile Testing

Want to see it on your phone?

1. Find your computer's IP address:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Start the app with host flag:
   ```bash
   cd client
   npm run dev -- --host
   ```

3. On your phone's browser, go to:
   ```
   http://YOUR-IP-ADDRESS:5173
   ```

---

## 🎓 Next Steps

Now that LabTracker is running:

1. **Explore All Pages**: Click through every sidebar item
2. **Try the AI**: Add a reagent and use AI suggestions
3. **Generate QR Codes**: Create and print labels
4. **Export Reports**: Try CSV and PDF exports
5. **Toggle Dark Mode**: See the beautiful dark theme
6. **Check Charts**: View analytics on Dashboard
7. **Test Notifications**: Click the bell icon
8. **Book Equipment**: Try the booking system
9. **Create an Order**: Test the approval workflow
10. **Read FEATURES.md**: See all 50+ features

---

## 📚 Additional Resources

- **`README.md`** - Overview and installation
- **`SETUP.md`** - Detailed setup instructions
- **`FEATURES.md`** - Complete feature list
- **`server/.env.example`** - Configuration options
- **`server/prisma/schema.prisma`** - Database schema

---

## 💡 Pro Tips

1. **Enable AI Features**: Add `ANTHROPIC_API_KEY` to `server/.env` for smart storage suggestions
2. **Print QR Labels**: Use QR codes on freezer boxes for easy tracking
3. **Export Regularly**: Create weekly inventory reports
4. **Use Dark Mode**: Easier on eyes during long lab sessions
5. **Check Dashboard Daily**: Stay on top of alerts and tasks
6. **Filter Inventory**: Use "Low Stock Only" before ordering
7. **Book Equipment Early**: Avoid scheduling conflicts

---

## 🎉 You're Ready!

LabTracker is now running and you can:

✅ See real-time analytics with interactive charts
✅ Generate and print QR codes for reagents
✅ Export inventory reports to CSV/PDF
✅ Use AI-powered storage suggestions
✅ Track projects with progress bars
✅ Book equipment without conflicts
✅ Manage orders with approval workflow
✅ Switch between light and dark mode
✅ Get real-time notifications
✅ And 40+ more features!

**Enjoy your modern lab management platform!** 🧬🔬✨

---

## 🆘 Need Help?

If you run into issues:

1. Check the Troubleshooting section above
2. Review `SETUP.md` for detailed instructions
3. Check that all dependencies are installed
4. Make sure ports 5000 and 5173 are free
5. Verify database was seeded successfully

**Demo Account Not Working?**
- Make sure you ran `npm run prisma:seed`
- Check terminal for "Seed completed successfully" message

**Can't See Charts?**
- Scroll down on Dashboard
- Click "Show Analytics" button
- Make sure you have project/order data

**QR Codes Not Showing?**
- Check that qrcode.react is installed: `npm list qrcode.react`
- Reinstall if needed: `cd client && npm install qrcode.react`

---

**Happy Lab Managing!** 🎊
