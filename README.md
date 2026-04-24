# 🚗 CityPark Permit System

A modern, progressive web application for managing parking permits with role-based access control. Built with React, TypeScript, and Tailwind CSS.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [User Roles](#user-roles)
- [Getting Started](#getting-started)
- [Demo Credentials](#demo-credentials)
- [Architecture](#architecture)
- [Key Features by Role](#key-features-by-role)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)

## 🎯 Overview

CityPark is a comprehensive parking permit management system that enables cities to digitally manage residential, guest, and employee parking permits. The system features three distinct user roles with dedicated dashboards and workflows.

## ✨ Features

### 🎨 Modern UI/UX
- **Progressive Web Design**: Mobile-first, responsive design that works seamlessly across all devices
- **Smooth Animations**: Motion/Framer Motion animations for enhanced user experience
- **Gradient Themes**: Beautiful gradient colors and glassmorphism effects
- **Touch-Optimized**: Large buttons and inputs perfect for mobile devices
- **Real-time Feedback**: Toast notifications with descriptions for all actions

### 🔐 Security & Access Control
- **Role-Based Authentication**: Three distinct user roles (Resident, Admin, Officer)
- **Protected Routes**: Each role can only access their designated dashboard
- **Persistent Sessions**: Login state persists using localStorage

### 📱 Responsive Design
- **Mobile-First**: Optimized for smartphones and tablets
- **Adaptive Layouts**: Cards, tables, and forms that adapt to screen size
- **Sticky Navigation**: Always-accessible navigation with backdrop blur effect

## 👥 User Roles

### 1. 🏠 Resident (Self-Service Portal)
Residents can manage their vehicles and parking permits independently.

**Capabilities:**
- Enroll vehicles with license plate, make, model, and year
- Apply for parking permits (Residential, Guest, Employee)
- Upload residency proof documents (PDF)
- Complete secure payment processing with card details
- Track permit status in real-time
- View all enrolled vehicles and active permits

**Workflow:**
1. Enroll vehicle(s)
2. Apply for permit
3. Upload required documents
4. Submit payment with card details
5. Track application status (Incomplete → Pending → Active)

### 2. ⚙️ Admin (Administrative Dashboard)
City staff manage applications and maintain system control.

**Capabilities:**
- View all permit applications in a sortable queue
- Approve or reject permit applications
- Review uploaded residency documents
- Search and filter by resident name or license plate
- Monitor KPI metrics:
  - Active permits count
  - Pending applications
  - Total registered residents
  - Revenue tracking (Year-to-date)
- Instant sync with enforcement system upon approval

**Workflow:**
1. Review incoming applications
2. Verify residency documents
3. Approve/Reject applications
4. Monitor system-wide statistics

### 3. 👮 Officer (Verification Tool)
Field enforcement officers can verify permits in real-time.

**Capabilities:**
- Quick license plate search
- Real-time permit status verification
- Color-coded results (Green = Valid, Red = No Permit)
- Issue citations with detailed information:
  - Violation type selection
  - Location entry
  - Custom notes
  - Automated fine calculation
- Recent search history (last 5 plates)
- Mobile-optimized interface for field use

**Workflow:**
1. Enter license plate number
2. View instant verification results
3. Issue citation if no valid permit (optional)
4. Quick re-check via recent searches

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd citypark-permit-system
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open your browser and navigate to the local development URL (typically `http://localhost:5173`)

## 🔑 Demo Credentials

Use these credentials to test different user roles:

| Role | Email | Password |
|------|-------|----------|
| **Resident** | resident@example.com | password123 |
| **Admin** | admin@example.com | admin123 |
| **Officer** | officer@example.com | officer123 |

## 🏗️ Architecture

### Authentication Flow
1. **Login Page**: Select user role and enter credentials
2. **Role Validation**: System validates credentials against role
3. **Route Protection**: Redirects to role-specific dashboard
4. **Session Persistence**: Login state saved to localStorage

### Data Flow
1. **Context Providers**: 
   - `AuthContext`: Manages user authentication state
   - `DataContext`: Manages permits, vehicles, and searches
2. **Mock Data**: Simulates backend with in-memory state
3. **Real-time Updates**: State changes immediately reflect across components

### Payment Flow (Resident)
1. Click "Pay Now" button on incomplete permit
2. Enter card details in secure payment dialog:
   - Card number (auto-formatted: 1234 5678 9012 3456)
   - Cardholder name
   - Expiry date (MM/YY format)
   - CVV (3 digits)
   - Zip code
3. Form validation ensures all fields are complete
4. Simulated payment processing (2 seconds)
5. Status updates: Unpaid → Processing → Paid
6. Permit status changes: Incomplete → Pending

### Citation Flow (Officer)
1. Search license plate (no valid permit found)
2. Click "Issue Citation" button
3. Fill citation form:
   - Select violation type (auto-fills fine amount)
   - Enter location
   - Add optional notes
   - Review/adjust fine amount
4. Submit citation
5. System generates citation number
6. Toast notification confirms issuance

## 🛠️ Technology Stack

### Frontend Framework
- **React 18.3.1**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server

### Routing
- **React Router 7**: Declarative routing with data mode pattern

### Styling & UI
- **Tailwind CSS 4**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Motion (Framer Motion)**: Smooth animations and transitions
- **Lucide React**: Beautiful icon library

### State Management
- **React Context API**: Global state for auth and data
- **Local Storage**: Session persistence

### Forms & Validation
- **Custom form handling**: Controlled components
- **Real-time validation**: Instant feedback on user input

### Notifications
- **Sonner**: Beautiful toast notifications

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   └── Navbar.tsx       # Main navigation component
│   ├── contexts/
│   │   ├── AuthContext.tsx  # Authentication state
│   │   └── DataContext.tsx  # Application data state
│   ├── pages/
│   │   ├── Login.tsx        # Login & role selection
│   │   ├── ResidentPortal.tsx    # Resident dashboard
│   │   ├── AdminDashboard.tsx    # Admin dashboard
│   │   └── OfficerVerification.tsx  # Officer tool
│   ├── utils/
│   │   └── mockData.ts      # Mock data and types
│   ├── routes.tsx           # Route configuration
│   └── App.tsx              # Root component
├── styles/
│   ├── index.css            # Global styles
│   ├── tailwind.css         # Tailwind imports
│   └── theme.css            # Theme customization
└── ...
```

## 📊 Key Features by Role

### Resident Portal Features
✅ Vehicle enrollment with validation  
✅ Multi-step permit application  
✅ Document upload simulation  
✅ Secure payment processing with card details  
✅ Real-time status tracking  
✅ Responsive card-based layout  
✅ Color-coded permit types  

### Admin Dashboard Features
✅ Application queue with sorting  
✅ Advanced search and filtering  
✅ Document review modal  
✅ One-click approval/rejection  
✅ KPI metrics with trend indicators  
✅ Responsive table (desktop) and card (mobile) views  
✅ Real-time application counts  

### Officer Verification Features
✅ Fast license plate lookup  
✅ Large, color-coded results  
✅ Detailed citation form  
✅ Violation type selection with auto-calculated fines  
✅ Recent search history  
✅ Mobile-optimized interface  
✅ Real-time sync with admin approvals  

## 🎨 Design Highlights

### Color Coding
- **Blue/Indigo**: Resident portal and residential permits
- **Purple/Pink**: Admin dashboard
- **Green/Emerald**: Officer verification and valid permits
- **Red/Orange**: Violations and invalid permits
- **Yellow**: Pending/Under Review status

### Animations
- Entry animations for page elements
- Smooth transitions between states
- Scale and fade effects for modals
- Spring animations for interactive elements

### Accessibility
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliance
- Touch-friendly targets (44x44px minimum)

## 🔄 Workflow Examples

### Complete Permit Application (Resident)
1. Login as resident
2. Navigate to "Vehicles" tab
3. Enroll new vehicle
4. Go to "Apply" tab
5. Select vehicle and permit type
6. Upload residency document
7. Submit application
8. Return to "Permits" tab
9. Click "Pay Now" on new permit
10. Fill payment form with card details
11. Submit payment
12. Status updates to "Pending"

### Approve Permit (Admin)
1. Login as admin
2. View application queue
3. Click document icon to review
4. Click "Approve" button
5. Permit instantly syncs to enforcement system
6. Status changes to "Active"

### Verify & Citation (Officer)
1. Login as officer
2. Enter license plate number
3. View color-coded result
4. If no permit: Click "Issue Citation"
5. Select violation type
6. Enter location and notes
7. Review auto-calculated fine
8. Submit citation
9. Receive confirmation with citation number

## 📝 Notes

- **Mock Data**: Current implementation uses in-memory state. In production, this would connect to a real backend (e.g., Supabase, Firebase)
- **Payment Processing**: Simulated payment flow. Production would integrate with Stripe, PayPal, etc.
- **Document Upload**: Currently simulates file upload. Production would use cloud storage
- **Real-time Sync**: Achieved via React Context. Production would use WebSockets or similar

## 🚀 Future Enhancements

- Backend integration with database
- Real payment gateway integration
- Push notifications for permit status changes
- Email confirmations and reminders
- Permit expiration warnings
- Analytics dashboard for admins
- Export reports (PDF, CSV)
- Multi-language support
- Dark mode theme
- Progressive Web App (PWA) installation

## 📄 License

This project is built for demonstration purposes.

## 👨‍💻 Development

Built with modern web technologies and best practices:
- Component-based architecture
- Custom hooks for reusability
- Type-safe development with TypeScript
- Mobile-first responsive design
- Accessibility standards
- Performance optimizations

---

**CityPark Permit System** - Making parking management simple and efficient! 🚗✨
