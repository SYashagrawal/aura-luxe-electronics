# Aura Luxe Electronics — Enterprise E-Commerce & Retail Management Platform

A complete, production-ready luxury electronics shopping and business management ecosystem built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL with Row Level Security)**.

---

## Key Business Capabilities

1. **Customer-Facing Haute Électronique Storefront**
   - Editorial, minimal luxury aesthetic designed specifically for high-end electronics.
   - Dynamic catalogue with category, brand, price filtering, and sorting.
   - Real-time 6-digit Indian postal code (Pincode) serviceability & estimated delivery date checker.
   - Full statutory Indian GST calculation (CGST, SGST, IGST) with HSN code tracking.
   - Comprehensive customer account portal with order history, live status tracking, and downloadable tax invoices.

2. **Super Admin Executive Terminal**
   - Real-time revenue analytics, Average Order Value (AOV), fulfillment stream, and low-stock radar.
   - Complete Product CRUD with variants, specifications, HSN tax classifications, and IMEI-tracking toggles.
   - Multi-warehouse inventory valuation across regional distribution centers and physical retail boutiques.
   - Serial number & IMEI lifecycle management (In Stock, Reserved, Sold, Returned, Defective).

3. **Enterprise Role-Based Access Control (RBAC)**
   - Granular permission matrix across 15 business modules and 7 action verbs (`View`, `Create`, `Edit`, `Delete`, `Approve`, `Export`, `Manage`).
   - Enforced at both database policy level (PostgreSQL RLS) and backend server middleware.

4. **White-Glove Fleet Delivery Terminal**
   - Mobile-optimized interface for delivery agents.
   - Assigned drops with patron contact, address, and direct Google Maps navigation links.
   - Mandatory One-Time Passcode (OTP) verification upon personal handoff to eliminate fraudulent deliveries.

5. **Dynamic No-Code CMS & Customizer**
   - Modify business identity, store branding, editorial tagline, announcements, legal registrations (GSTIN/CIN), and policies without editing code.

6. **Statutory Indian GST Compliance**
   - Automatic determination of Intra-State (CGST + SGST) vs Inter-State (IGST) supply based on state codes.
   - Generation of computer-verified GST Tax Invoices with amounts converted to Indian words notation.

---

## Technology Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Luxury Palette: Deep Charcoal `#151515`, Noir `#090909`, Metallic Champagne `#C5A46D`, Off-White `#F7F7F5`, Inter Font)
- **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS)
- **Icons:** Lucide React
- **Payments:** Razorpay with cryptographic HMAC-SHA256 signature verification

---

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env.local` using `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
3. Run the migrations located in `supabase/migrations/` and the seed script `supabase/seed/seed.sql` in your Supabase SQL Editor.
4. Launch the local development server:
   ```bash
   npm run dev
   ```

Refer to the exhaustive 30-section **[SETUP.md](SETUP.md)** for complete end-to-end cloud deployment instructions.
