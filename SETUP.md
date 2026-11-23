# COMPLETE PRODUCTION DEPLOYMENT & OPERATION MANUAL (SETUP.md)
## High-End Electronics E-Commerce & Retail Management Platform

This document is the authoritative zero-to-production guide for configuring, provisioning, securing, and deploying the complete **Aura Luxe Electronics** enterprise ecosystem.

---

### TABLE OF CONTENTS
1. [System Requirements](#1-system-requirements)
2. [Required Software Installation](#2-required-software-installation)
3. [Project Installation](#3-project-installation)
4. [Folder Structure Explanation](#4-folder-structure-explanation)
5. [Environment Variables and .env.example](#5-environment-variables-and-envexample)
6. [Supabase Account Creation](#6-supabase-account-creation)
7. [Supabase Project Configuration](#7-supabase-project-configuration)
8. [Database Creation](#8-database-creation)
9. [SQL Migrations Execution](#9-sql-migrations-execution)
10. [Database Schema and RLS Setup](#10-database-schema-and-rls-setup)
11. [Supabase Authentication Configuration](#11-supabase-authentication-configuration)
12. [Storage Bucket Creation and Policies](#12-storage-bucket-creation-and-policies)
13. [Admin Account Creation and Secure Initialization](#13-admin-account-creation-and-secure-initialization)
14. [Staff Account Creation](#14-staff-account-creation)
15. [Payment Gateway Setup](#15-payment-gateway-setup)
16. [Razorpay Configuration and Webhooks](#16-razorpay-configuration-and-webhooks)
17. [Google Maps API Setup](#17-google-maps-api-setup)
18. [Delivery Integration Setup](#18-delivery-integration-setup)
19. [Email, SMS and WhatsApp Setup](#19-email-sms-and-whatsapp-setup)
20. [Local Development Commands](#20-local-development-commands)
21. [Production Build Commands](#21-production-build-commands)
22. [Vercel Deployment Instructions](#22-vercel-deployment-instructions)
23. [Custom Domain Connection](#23-custom-domain-connection)
24. [SSL and DNS Configuration](#24-ssl-and-dns-configuration)
25. [Database Backup Instructions](#25-database-backup-instructions)
26. [Data Import/Export Instructions](#26-data-importexport-instructions)
27. [Troubleshooting Common Errors](#27-troubleshooting-common-errors)
28. [Free-Tier Limitations and Expected Costs](#28-free-tier-limitations-and-expected-costs)
29. [Security Checklist Before Launch](#29-security-checklist-before-launch)
30. [Complete Testing Checklist](#30-complete-testing-checklist)

---

### 1. SYSTEM REQUIREMENTS
- **Operating System:** Linux (Ubuntu 20.04+ LTS / Debian 11+), macOS 13+, or Windows 10/11 with PowerShell 7 or WSL2.
- **Node.js:** Node.js v18.18.0 LTS or v20.x+ (Tested on v24.22.2).
- **RAM:** Minimum 4 GB RAM (8 GB recommended for local builds).
- **Disk Storage:** At least 2 GB of available storage for source, dependencies, and build caches.
- **Network:** Unrestricted outbound HTTPS access to Supabase (`*.supabase.co`), Razorpay (`api.razorpay.com`), and Google Maps APIs.

---

### 2. REQUIRED SOFTWARE INSTALLATION
Ensure Node.js and a package manager are installed:
```bash
# Verify Node.js
node -v   # Output should be >= v18.18.0

# Verify npm or pnpm
npm -v    # Output should be >= 9.x
```
If Node.js is not present on your system, install the current LTS from [nodejs.org](https://nodejs.org).

---

### 3. PROJECT INSTALLATION
Clone or navigate to the project directory:
```bash
cd electronics-ecommerce

# Install production and development dependencies
npm install
```

---

### 4. FOLDER STRUCTURE EXPLANATION
```
electronics-ecommerce/
├── app/
│   ├── (customer)/               # Customer Storefront (Home, Catalogue, Details, Cart, Checkout, Portal)
│   ├── admin/                    # Super Admin & Staff Corporate Terminal
│   ├── delivery/                 # Delivery Fleet Partner Mobile Terminal
│   ├── api/                      # Next.js Server-side Route Handlers (Checkout, Invoices, Webhooks, Export)
│   ├── globals.css               # Luxury Dark Theme & Styling System
│   └── layout.tsx                # Root Layout with Inter Font & Dynamic Branding
├── components/
│   ├── customer/                 # Storefront Components (Navbar, AnnouncementBar, ProductCard, PincodeChecker)
│   ├── admin/                    # Admin Components (AdminSidebar, AdminHeader)
│   └── delivery/                 # Fleet Mobile UI Components
├── lib/
│   ├── supabase/                 # Supabase Browser, Server (Cookies), and Admin (Service-Role) Clients
│   ├── gst/                      # Indian GST Engine (CGST, SGST, IGST, HSN, Tax Invoice Builder)
│   ├── rbac/                     # Staff Granular Permission Matrix & Server Middleware
│   ├── payments/                 # Razorpay HMAC-SHA256 Signature Verification
│   ├── inventory/                # Stock Reservation, Allocation & Serial/IMEI Tracking
│   ├── serviceability/           # Pincode Serviceability & Delivery Fee Engine
│   └── cms/                      # Dynamic Store Branding Loader
├── supabase/
│   ├── migrations/               # 7 Ordered SQL Migrations with RLS & Stored Procedures
│   └── seed/                     # Luxury Electronics Seed Script (iPhone 16 Pro, B&O, Devialet, Leica)
├── tests/                        # Verification Test Suite (GST, RBAC, Pincodes, Inventory)
├── .env.example                  # Environment Configuration Template
├── README.md                     # Architecture Overview
└── SETUP.md                      # Mandatory 30-Section Production Guide
```

---

### 5. ENVIRONMENT VARIABLES AND .ENV.EXAMPLE
Create your local environment file:
```bash
cp .env.example .env.local
```
Configure your actual Supabase credentials and Razorpay test/live keys in `.env.local`.

---

### 6. SUPABASE ACCOUNT CREATION
1. Navigate to [supabase.com](https://supabase.com).
2. Click **Sign In** and sign up via GitHub or Email.
3. Verify your email address.

---

### 7. SUPABASE PROJECT CONFIGURATION
1. In the Supabase Dashboard, click **New Project**.
2. Select your Organization.
3. Enter Project Name: `aura-luxe-electronics`.
4. Generate a strong Database Password and store it in your secrets vault.
5. Select Region: **Central India (Mumbai) - `ap-south-1`** for lowest latency.
6. Choose the Free tier. Click **Create new project** and allow ~2 minutes for provisioning.

---

### 8. DATABASE CREATION
Once provisioned:
1. Open **Project Settings** -> **API**.
2. Copy the **Project URL** -> paste as `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`.
3. Copy the **anon public** key -> paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
4. Copy the **service_role secret** -> paste as `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

---

### 9. SQL MIGRATIONS EXECUTION
In your Supabase project dashboard, navigate to the **SQL Editor** and run the migration scripts in numerical sequence:

1. Copy content of `supabase/migrations/001_initial_schema.sql` -> Paste into SQL Editor -> Click **Run**.
2. Copy content of `supabase/migrations/002_rbac_and_staff.sql` -> Click **Run**.
3. Copy content of `supabase/migrations/003_inventory_and_imei.sql` -> Click **Run**.
4. Copy content of `supabase/migrations/004_orders_and_gst.sql` -> Click **Run**.
5. Copy content of `supabase/migrations/005_delivery_and_pincodes.sql` -> Click **Run**.
6. Copy content of `supabase/migrations/006_cms_and_settings.sql` -> Click **Run**.
7. Copy content of `supabase/migrations/007_rls_and_security.sql` -> Click **Run**.
8. Copy content of `supabase/seed/seed.sql` -> Click **Run**.

---

### 10. DATABASE SCHEMA AND RLS SETUP
Migration `007_rls_and_security.sql` automatically enables PostgreSQL Row Level Security (RLS) on all tables:
- Anonymous public users can only read active products, categories, specs, and approved reviews.
- Authenticated patrons can only read/mutate their own addresses, orders, and support tickets.
- Delivery agents can only view deliveries assigned to their UID.
- Staff access is strictly governed by `has_staff_permission(module, action)`.
- Super Admins possess full system bypass.

---

### 11. SUPABASE AUTHENTICATION CONFIGURATION
1. In Supabase Dashboard, go to **Authentication** -> **Providers**.
2. Ensure **Email** provider is enabled.
3. Under **Email Templates**, customize confirmation and reset password templates.
4. Under **URL Configuration**, set:
   - Site URL: `https://yourdomain.com` (or `http://localhost:3000` for dev).
   - Redirect URLs: `http://localhost:3000/**`, `https://yourdomain.com/**`.

---

### 12. STORAGE BUCKET CREATION AND POLICIES
1. In Supabase Dashboard, navigate to **Storage**.
2. Click **Create New Bucket**:
   - Bucket name: `product-media` (Public: **Yes**).
   - Bucket name: `delivery-proofs` (Public: **No** - restricted to staff and delivery drivers).
   - Bucket name: `invoices` (Public: **No** - authenticated customer access only).
3. Apply RLS Storage policies allowing write access only to authenticated staff/drivers.

---

### 13. ADMIN ACCOUNT CREATION AND SECURE INITIALIZATION
1. In Supabase Dashboard, go to **Authentication** -> **Users** -> Click **Add User** -> **Create User**.
2. Enter email: `admin@auraluxe.com` and a temporary password.
3. Open **SQL Editor** and promote this user to Super Admin:
```sql
UPDATE public.profiles
SET role = 'super_admin', full_name = 'Executive Director', status = 'active'
WHERE email = 'admin@auraluxe.com';
```

---

### 14. STAFF ACCOUNT CREATION
To onboard a staff member (e.g. Warehouse Lead):
1. Create user in Supabase Auth: `warehouse@auraluxe.com`.
2. Link the user to the Warehouse Supervisor role in SQL:
```sql
-- 1. Set staff role on profile
UPDATE public.profiles SET role = 'staff', full_name = 'Vikram Malhotra' WHERE email = 'warehouse@auraluxe.com';

-- 2. Link to staff profile with role
INSERT INTO public.staff_profiles (user_id, role_id, employee_code, department)
SELECT id, '11111111-1111-1111-1111-111111111102', 'EMP-WH-001', 'Logistics'
FROM public.profiles WHERE email = 'warehouse@auraluxe.com';
```

---

### 15. PAYMENT GATEWAY SETUP
1. Register on [dashboard.razorpay.com](https://dashboard.razorpay.com).
2. Complete business KYC with company GSTIN and bank details.
3. Switch to **Test Mode** for staging verification.

---

### 16. RAZORPAY CONFIGURATION AND WEBHOOKS
1. Navigate to **Settings** -> **API Keys** -> Click **Generate Key**.
2. Copy `Key Id` and `Key Secret` into `.env.local`:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
   RAZORPAY_KEY_ID=rzp_live_...
   RAZORPAY_KEY_SECRET=...
   ```
3. Navigate to **Settings** -> **Webhooks** -> Click **Add New Webhook**:
   - Webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
   - Secret: Enter a random 32-character secret -> set as `RAZORPAY_WEBHOOK_SECRET`.
   - Active Events: `order.paid`, `payment.captured`, `payment.failed`, `refund.processed`.

---

### 17. GOOGLE MAPS API SETUP
1. Open [Google Cloud Console](https://console.cloud.google.com).
2. Create project `Aura-Luxe-Logistics`.
3. Enable APIs:
   - **Maps JavaScript API**
   - **Directions API**
   - **Geocoding API**
4. Under **Credentials**, create an API Key and restrict it to your production domain HTTP referrers.
5. Set `NEXT_PUBLIC_GOOGLE_MAPS_KEY` in `.env.local`.

---

### 18. DELIVERY INTEGRATION SETUP
- **In-House Fleet:** Configured by default. Drivers log into `/delivery/login` to see assigned runs.
- **Third-Party Couriers (Shiprocket / Delhivery):** In `app/admin/settings/general`, configure API tokens for automated air-waybill (AWB) generation when consignee is outside local fleet zones.

---

### 19. EMAIL, SMS AND WHATSAPP SETUP
1. **Email (Resend):**
   - Sign up at [resend.com](https://resend.com) -> Verify sending domain `yourdomain.com`.
   - Set `RESEND_API_KEY` and `EMAIL_FROM`.
2. **SMS (MSG91):**
   - Register on [msg91.com](https://msg91.com) -> Obtain DLT Principal Entity ID approved for TRAI compliance.
3. **WhatsApp Business:**
   - Create Meta Developer App -> WhatsApp Cloud API -> Configure Phone Number ID.

---

### 20. LOCAL DEVELOPMENT COMMANDS
```bash
# Start local development server with Turbopack / Next.js
npm run dev

# Open in browser
http://localhost:3000
```

---

### 21. PRODUCTION BUILD COMMANDS
```bash
# Run TypeScript type check and compile Next.js production bundle
npm run build

# Start production server
npm run start
```

---

### 22. VERCEL DEPLOYMENT INSTRUCTIONS
1. Push the repository to GitHub / GitLab.
2. Log into [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import the repository.
4. Framework Preset: **Next.js**.
5. Add all environment variables from `.env.example` in Vercel's Environment Variables panel.
6. Click **Deploy**. Vercel will build and assign a production URL.

---

### 23. CUSTOM DOMAIN CONNECTION
1. In Vercel Project Settings, navigate to **Domains**.
2. Enter your registered domain: `auraluxe.com` and `www.auraluxe.com`.
3. Vercel displays the required DNS A and CNAME records.

---

### 24. SSL AND DNS CONFIGURATION
At your Domain Registrar (e.g. Cloudflare, GoDaddy, Namecheap):
- **Type A Record:** `@` points to `76.76.21.21` (Vercel IP).
- **Type CNAME Record:** `www` points to `cname.vercel-dns.com`.
- Vercel automatically provisions and renews a free Let's Encrypt SSL/TLS certificate.

---

### 25. DATABASE BACKUP INSTRUCTIONS
1. **Automated Daily Backups:** Enabled automatically on Supabase projects.
2. **Manual Physical Dump via CLI:**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Take complete PostgreSQL dump
   supabase db dump --project-ref your-project-id -f backup_$(date +%Y%m%d).sql
   ```

---

### 26. DATA IMPORT/EXPORT INSTRUCTIONS
- **Exporting:** In Admin Portal, click **Export CSV** on any table (Orders, Inventory, Products, GST Invoices).
- **Bulk Importing:** Use the `/admin/products/bulk` screen to upload standard CSV/Excel catalogues.

---

### 27. TROUBLESHOOTING COMMON ERRORS
1. **`new row violates row-level security policy`:**
   - User does not have appropriate role or permission in `profiles` / `role_permissions`.
   - Ensure `public.has_staff_permission` or `super_admin` role is active.
2. **`Razorpay signature verification failed`:**
   - Mismatch in `RAZORPAY_KEY_SECRET`. Verify secret matches exactly without trailing whitespace.
3. **`Tax calculation mismatch`:**
   - Verify seller and buyer state codes. If both are `27` (Maharashtra), CGST (9%) + SGST (9%) apply. If different, IGST (18%) applies.

---

### 28. FREE-TIER LIMITATIONS AND EXPECTED COSTS
| Service | Free Tier Allocation | Estimated Cost at 100 Orders/Day (5,000 Products) |
|---|---|---|
| **Supabase** | 500 MB DB, 1 GB Storage, 50,000 MAU | **₹0 (Free)** (Expands to Pro at \$25/mo when DB > 500MB) |
| **Vercel** | 100 GB Bandwidth, Serverless Actions | **₹0 (Free)** (Hobby tier sufficient initially) |
| **Razorpay** | Zero setup / Zero maintenance fee | **2% standard transaction fee** per successful transaction |
| **Google Maps** | \$200 monthly free credit (~28,000 map loads) | **₹0 (Covered entirely by free monthly credit)** |
| **Resend Email** | 3,000 emails/month free | **₹0 - ₹1,200/mo** (Scale plan if >3,000 monthly transactional emails) |
| **Domain** | Purchased annually | **~₹800/year** |

---

### 29. SECURITY CHECKLIST BEFORE LAUNCH
- [x] All Supabase database tables have Row Level Security (RLS) enabled.
- [x] Service role key `SUPABASE_SERVICE_ROLE_KEY` is never exposed to the frontend.
- [x] Razorpay webhook signatures are cryptographically verified via HMAC-SHA256.
- [x] Payment verification is never trusted from client payloads alone.
- [x] No sensitive customer or business data stored in browser localStorage or sessionStorage.
- [x] HTTPS enforced across all endpoints with HTTP Strict Transport Security (HSTS).

---

### 30. COMPLETE TESTING CHECKLIST
- [x] Customer Registration, Login & Session persistence via secure HTTP cookies.
- [x] Product Catalogue browsing, search, and brand/category filtering.
- [x] Product Specifications and Variant rendering.
- [x] Real-time 6-digit Pincode serviceability & delivery schedule calculation.
- [x] Shopping Cart with quantity adjustments & statutory GST calculations.
- [x] Privilege Voucher coupon application & validation.
- [x] Checkout creation with Intra-state (CGST+SGST) vs Inter-state (IGST) tax logic.
- [x] Automatic Serial Number / IMEI reservation upon checkout.
- [x] Indian GST Tax Invoice generation (`/api/invoices/[id]`) with statutory INR words conversion.
- [x] Super Admin Executive Dashboard with real-time analytics & low-stock radar.
- [x] Multi-warehouse stock tracking and valuation.
- [x] Staff Role-Based Access Control (RBAC) permission matrix enforcement.
- [x] Delivery Partner Mobile Terminal with Google Maps direct navigation link.
- [x] OTP-based delivery handoff verification.
- [x] CSV Data Export for Orders, Products, and Inventory.
- [x] Dynamic CMS Branding Customizer without code modification.
