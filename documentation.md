# Pocket Invoice - Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Features & Pain Points Solved](#features--pain-points-solved)
3. [Technical Architecture](#technical-architecture)
4. [User Guide](#user-guide)
5. [Troubleshooting](#troubleshooting)
6. [API Reference](#api-reference)
7. [Development Guide](#development-guide)

## Overview

Pocket Invoice is a comprehensive business management platform designed specifically for Ghanaian businesses. It addresses common pain points in document generation, event management, and digital transformation challenges faced by local businesses.

### Target Market
- Small to medium businesses in Ghana
- Event organizers and venues
- Service providers needing professional documentation
- Businesses transitioning to digital processes

## Features & Pain Points Solved

### 1. Document Generation Issues ✅ SOLVED
**Pain Point**: Businesses struggle with creating professional invoices and receipts manually
**Solution**: 
- Automated invoice/receipt generation with professional templates
- Auto-generated document numbers with date-based formatting
- PDF export functionality for easy sharing and record-keeping
- Integration with Ghana-specific business requirements

### 2. Payment Method Diversity ✅ SOLVED
**Pain Point**: Ghana's diverse payment landscape (Cash, Cards, Mobile Money)
**Solution**:
- Built-in support for all major payment methods
- Mobile Money (MoMo) integration for local preferences
- Clear payment tracking and documentation

### 3. Event Management Complexity ✅ SOLVED
**Pain Point**: Manual event registration and entry verification
**Solution**:
- Digital entry pass generation with QR codes
- Secure entry verification system
- Real-time attendance tracking
- Integration with Ghana's regional addressing system

### 4. Business Legitimacy Documentation ✅ SOLVED
**Pain Point**: Need for professional business documentation
**Solution**:
- Complete business profile management
- Professional document templates
- Registration number and tax ID integration
- Social media presence linking

### 5. Mobile-First Requirements ✅ SOLVED
**Pain Point**: High mobile usage in Ghana requires mobile-optimized solutions.
**Solution**:
- A fully responsive, mobile-first design ensures a seamless experience on any device.
- Touch-friendly interface and mobile-optimized navigation.

### 6. Secure & Flexible Authentication ✅ SOLVED
**Pain Point**: Users often forget passwords, and standard sign-up can be tedious. Unverified accounts can pose a security risk.
**Solution**:
- **Multiple Sign-In Options**: Users can sign up and sign in using their email and password or with a single click via their Google account.
- **Secure Password Reset**: A straightforward, secure flow allows users to reset forgotten passwords directly from the login page.
- **Automated Email Verification**: The system automatically sends a confirmation link upon registration and intelligently resends a new link if a user with an unverified email attempts to log in, enhancing security and user experience.

## Technical Architecture

### Frontend Stack
```typescript
// Core Technologies
React 18.3.1          // Modern UI library
TypeScript            // Type safety
Tailwind CSS          // Utility-first styling
Vite                  // Build tool
React Router DOM      // Client-side routing

// UI Components
Radix UI              // Accessible components
Lucide React          // Icon library
Sonner                // Toast notifications
React Hook Form       // Form management
```

### Backend Infrastructure
```typescript
// Backend as a Service
Supabase {
  PostgreSQL          // Main database
  Row Level Security  // Data isolation
  Real-time subscriptions
  Authentication      // User management
  Edge Functions      // Serverless compute
  File Storage        // Document storage
}
```

### Document Generation
```typescript
// PDF Generation Pipeline
html2canvas           // HTML to canvas conversion
jsPDF                 // PDF creation
QRCode               // QR code generation
WhatsApp API         // Document sharing
```

## User Guide

### Getting Started

#### 1. User Account Management

##### Registration
Creating an account is the first step to using Pocket Invoice. We offer two convenient methods:
1.  **Email & Password**: Fill out the sign-up form with your full name, a valid phone number, your email address, and a secure password (minimum 6 characters).
2.  **Google Sign-Up**: For faster access, you can sign up using your existing Google account with a single click.

Upon registration, a verification link will be sent to your email. You must click this link to activate your account.

##### Sign-In
- **Credentials**: Log in using the email and password you registered with.
- **Google Sign-In**: If you signed up with Google, you can log in with one click.

##### Password Reset
If you forget your password:
1.  On the Sign-In form, click the "Forgot Password?" link.
2.  Enter the email address associated with your account.
3.  A password reset link will be sent to your email. Follow the instructions to set a new password.

##### Profile Management
After logging in, you can manage your personal information:
1.  Navigate to the **Settings** page from the main sidebar.
2.  In the **Profile** tab, you can view and update your **Full Name** and **Phone Number**.
3.  Your email address is used as your primary identifier and cannot be changed.

#### 2. Business Profile Setup
Once your account is set up and you are logged in, you can create one or more business profiles. Navigate to the **Profile** section to add and manage your business details.

#### 2. Creating Documents

##### Invoices
```typescript
// Invoice Creation Flow
1. Click "Create Invoice" → Opens invoice dialog
2. Fill client information (name, email, address)
3. Add line items (description, quantity, price)
4. Set due date and payment terms
5. Save → Auto-generates invoice number (INV-YYYY-MM-XXXX)
6. Download PDF or share via WhatsApp
```

##### Receipts
```typescript
// Receipt Creation Flow
1. Click "Create Receipt" → Opens receipt dialog
2. Enter customer details
3. Select payment method (Cash/Card/MoMo)
4. Add items and calculate totals
5. Save → Auto-generates receipt number (RCP-YYYY-MM-XXXX)
6. Download PDF or share via WhatsApp
```

#### 3. Event Management

##### Creating Events
```typescript
// Event Setup Process
1. Navigate to Events page
2. Click "Create Event" → Opens event form
3. Fill event details:
   - Event name and description
   - Date and time
   - Location (Ghana region + address)
   - Capacity and pricing
4. Save event
5. Generate entry passes for attendees
```

##### Entry Pass Management
```typescript
// Entry Pass Generation
1. Open event details
2. Click "Generate Passes"
3. Enter attendee information
4. Generate QR-coded passes
5. Distribute passes (email/WhatsApp)
6. Scan QR codes for entry verification
```

## Troubleshooting

### PDF Download Issues

#### Problem: PDF generates but doesn't download
**Symptoms**: Console shows "Download triggered" but no file downloads

**Solutions**:
1. **Browser Settings**
   ```javascript
   // Check browser download settings
   chrome://settings/downloads (Chrome)
   about:preferences#privacy (Firefox)
   ```

2. **Popup Blockers**
   - Disable popup blockers for the site
   - Allow downloads from the domain

3. **Fallback Methods**
   ```javascript
   // App automatically tries multiple download methods:
   1. Direct blob download (preferred)
   2. New window opening (fallback)
   3. Manual confirmation dialog (final fallback)
   ```

#### Problem: Empty PDF or "Canvas is empty" error
**Solutions**:
1. Ensure document has content before PDF generation
2. Check that all required fields are filled
3. Wait for DOM to fully render before generating PDF

### Mobile Navigation Issues

#### Problem: Sidebar not responsive
**Solution**: Use hamburger menu (☰) on mobile devices

#### Problem: Touch interactions not working
**Solution**: Ensure modern browser with touch event support

### Authentication Issues

#### Problem: Login/signup not working
**Solutions**:
1.  Check your network connection.
2.  Ensure you are using the correct email and password combination.
3.  Check your browser's console for any specific error messages.

#### Problem: Receiving "Email not confirmed" error upon login
**Symptom**: You attempt to sign in and receive a notification that your email has not been verified.
**Solution**:
1.  The system has automatically resent a new verification link to your registered email address.
2.  Check your inbox (and spam/junk folder) for this new email.
3.  Click the link in the new email to verify your account. You should now be able to log in successfully.

## API Reference

### Database Schema

**Note on User Data**: User-specific data like `full_name` and `phone` is stored in the `raw_user_meta_data` JSONB column of Supabase's built-in `auth.users` table, not in a custom `users` table. This is a secure approach managed directly by Supabase Authentication.

#### Businesses Table
```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  region TEXT,
  category TEXT,
  registration_number TEXT,
  tax_id TEXT,
  website TEXT,
  social_media JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Documents Table (Invoices & Receipts)
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('invoice', 'receipt')),
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Events Table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location JSONB NOT NULL,
  capacity INTEGER,
  price DECIMAL(10,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Key Functions

#### PDF Generation
```typescript
export const generatePDF = async (
  element: HTMLElement, 
  filename: string
): Promise<void> => {
  // Multi-step process:
  // 1. Position element off-screen but visible
  // 2. Capture with html2canvas
  // 3. Generate PDF with jsPDF
  // 4. Attempt download with fallbacks
}
```

#### Currency Formatting
```typescript
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2
  }).format(amount);
}
```

## Development Guide

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── auth/           # Authentication components
│   ├── business/       # Business management
│   ├── documents/      # Invoice/Receipt components
│   ├── events/         # Event management
│   └── layout/         # Layout components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── integrations/       # Third-party integrations
├── lib/                # Utility functions
└── pages/              # Page components
```

### Key Dependencies
```json
{
  "core": {
    "react": "^18.3.1",
    "typescript": "latest",
    "vite": "latest"
  },
  "ui": {
    "@radix-ui/*": "latest",
    "tailwindcss": "latest",
    "lucide-react": "latest"
  },
  "backend": {
    "@supabase/supabase-js": "^2.52.0"
  },
  "document": {
    "jspdf": "^3.0.1",
    "html2canvas": "^1.4.1",
    "qrcode": "^1.5.4"
  }
}
```

### Environment Setup
```bash
# 1. Clone repository
git clone <repository-url>
cd pocket-invoice

# 2. Install dependencies
npm install

# 3. Configure Supabase
# Update src/integrations/supabase/client.ts

# 4. Start development server
npm run dev
```

### Deployment Checklist
- [ ] Supabase project configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Authentication configured
- [ ] Environment variables set
- [ ] Build process tested
- [ ] Mobile responsiveness verified

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Support**: For technical support, please refer to the troubleshooting section or contact the development team.