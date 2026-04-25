# 📖 CityPark Permit System - User Tutorial

Welcome to the CityPark Permit System! This application is designed to digitize and streamline the entire lifecycle of city parking permits and enforcement.

The platform uses **Role-Based Access Control**, meaning your experience changes based on who you are. This tutorial will walk you through how to access the system and what you can do depending on your role.

---

## 🚪 How to Access the Website

To get started, navigate to the website's login page. During this demonstration phase, you can use the following test credentials to explore the different dashboards:

| Role | Email | Password |
|------|-------|----------|
| **Resident** | `resident@example.com` | `password123` |
| **Admin** | `admin@example.com` | `admin123` |
| **Officer** | `officer@example.com` | `officer123` |

Enter the credentials for the role you wish to explore and click **Sign In**. The system will automatically route you to the correct dashboard.

---

## 👤 1. Resident (Self-Service Portal)

**Who uses this:** Everyday citizens who need to park in city zones.

**What you can do:**
*   **Manage Vehicles:** Enroll new vehicles to your account using their License Plate, Make, Model, and Year.
*   **Apply for Permits:** Request Residential, Guest, or Employee permits for your enrolled vehicles.
*   **Upload Documents:** Submit required proof of residency (e.g., PDF documents).
*   **Pay Fees Securely:** Process payments for new permits or pay off parking fines.
*   **Dispute Citations:** File a claim if you believe a parking citation was issued in error.

**How to use it (Workflow):**
1. Log in using the **Resident** credentials.
2. Navigate to the **Vehicles** tab and click "Enroll Vehicle" to add your car to the system.
3. Switch to the **Apply** tab, select your newly added vehicle, choose a permit type, select your start/end dates, and click "Submit Application".
4. Go to the **Permits** tab. You will see your new permit marked as "Unpaid". Click "Pay Now" to simulate a secure card payment.
5. Your permit status will now change to "Pending" while it awaits Admin approval.
6. If you receive a parking ticket, navigate to the **Fines** tab to either pay it or click "Dispute" to submit a claim to the city.

---

## 🏛️ 2. Admin (Administrative Dashboard)

**Who uses this:** City government staff and clerks who oversee the parking program.

**What you can do:**
*   **Review Applications:** View all incoming permit applications in a sortable, searchable queue.
*   **Verify Documents:** Review uploaded residency proofs from citizens.
*   **Approve/Reject Permits:** Grant active status to valid applications or reject invalid ones.
*   **Manage Disputes:** Review and approve/reject citation claims submitted by residents.
*   **Monitor KPIs:** Track system-wide metrics like Active Permits, Total Revenue, and Fines Allocated vs. Paid.

**How to use it (Workflow):**
1. Log in using the **Admin** credentials.
2. On the **Permits** tab, scroll down to the "Application Queue". You can search by name or license plate.
3. If an applicant uploaded a document, click the blue document icon to review it.
4. Click **Approve** (green button) to instantly sync the permit with the enforcement system, or **Reject** (red button) if it's invalid.
5. Switch to the **Citations** tab to view graphical analytics of city-wide parking violations and revenue collection.
6. Switch to the **Claims** tab to review any disputes raised by residents. You can choose to "Approve" (which refunds the citation) or "Reject" (which keeps the fine active).

---

## 👮 3. Officer (Enforcement Tool)

**Who uses this:** Field enforcement officers, police, or traffic wardens.

**What you can do:**
*   **Verify Permits:** Quickly search a license plate to see if it has an active permit.
*   **Issue Citations:** Generate a parking ticket if a vehicle is parked illegally.
*   **Track Hotspots:** View analytics on which locations have the most parking violations.

**How to use it (Workflow):**
1. Log in using the **Officer** credentials.
2. On the **Verification** tab, type a license plate into the search bar and press Enter (or click Search).
3. The system gives you instant, color-coded feedback:
    *   **Green (Valid Permit):** The vehicle is authorized to park.
    *   **Red (No Valid Permit):** The vehicle is parked illegally.
4. If the vehicle does not have a permit, click the **Issue Citation** button.
5. Fill out the form by selecting the Violation Type (which auto-calculates the fine), typing in the Location, and clicking "Issue Citation". 
6. The Admin and Resident dashboards are updated instantly in real-time.
7. Switch to the **Analytics** tab to view a breakdown of citations by location during your shift.

---

### 💡 Session Security
*For your security, the system will automatically log you out after 1 hour of inactivity. If this happens, simply return to the login screen and sign back in!*