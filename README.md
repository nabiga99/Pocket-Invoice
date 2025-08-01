
# Pocket Invoice

**A Comprehensive Document Generation and Event Management System for Businesses in Ghana**

Pocket Invoice is a modern, full-stack web application built specifically for Ghanaian businesses to streamline document generation, event management, and entry pass creation. The platform enables businesses to create professional invoices, receipts, manage events, and generate digital entry passes with QR codes.

## 🚨 Known Issues & Solutions

### PDF Download Issue
If PDF downloads are not working in your browser:
1. **Check browser settings** - Ensure downloads are allowed
2. **Disable popup blockers** - The app may need to open new windows for downloads
3. **Try different browsers** - Chrome, Firefox, and Safari have different download behaviors
4. **Manual download fallback** - If automatic download fails, the app will show a confirmation dialog with manual download options

For more detailed troubleshooting, see our [documentation.md](./documentation.md) file.

## 🚀 Features

### 📄 Document & Item Management
- **Invoice & Receipt Generation**: Create professional, itemized invoices and receipts.
- **PDF Export**: Download all documents as clean, professional PDF files.
- **Product & Service Management**: Maintain a catalog of items for quick addition to documents.

### 🎪 Event & Pass Management
- **Event Creation**: Organize events with detailed location and scheduling information.
- **QR-Coded Entry Passes**: Generate and manage secure, digital entry passes for events.
- **Pass Analytics**: Track pass scanning and attendance data.

### 🏢 Business Profile Management
- **Multi-Business Support**: Manage multiple business profiles from a single account.
- **Detailed Profiles**: Store essential business information, including name, contact details, and location.
- **Ghana-Specific**: Tailored for Ghanaian businesses with support for all 16 regions.

### 👤 User & Account Management
- **Flexible Authentication**: Sign up and sign in with email/password or Google.
- **Secure Password Reset**: A simple, secure flow for resetting forgotten passwords.
- **Email Verification**: Automated email confirmation ensures the validity of user accounts and resends links when needed.
- **User Profile Settings**: Users can easily view and update their full name and phone number in a dedicated settings page.

### 💰 Financial & Dashboard Features
- **Ghana Cedi (GHS) Support**: All financial transactions are handled in the local currency.
- **Dashboard Overview**: A central dashboard to view key business metrics and navigate the app.

### 📱 Modern Mobile Experience
- **Responsive Design**: A mobile-first approach ensures a seamless experience on any device.
- **Modern UI/UX**: Built with a clean, modern design system for intuitive navigation and use.

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks and functional components
- **TypeScript** - Type-safe development for better code quality
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing for single-page application

### UI Components & Design
- **Radix UI** - Accessible, unstyled UI components
- **Lucide React** - Beautiful SVG icons
- **Tailwind CSS Animate** - CSS animations and transitions
- **Custom Design System** - Semantic tokens and consistent theming

### Backend & Database
- **Supabase** - Backend-as-a-Service platform providing:
  - PostgreSQL database with Row Level Security (RLS)
  - Real-time subscriptions
  - User authentication and authorization
  - Edge Functions for serverless computing
  - File storage capabilities

### Document Generation & Sharing
- **jsPDF** - PDF generation library for client-side document creation
- **html2canvas** - HTML to canvas conversion for PDF generation
- **QRCode** - QR code generation for entry passes
- **WhatsApp Business API Integration** - Document sharing via WhatsApp

### Development Tools
- **ESLint** - Code linting for consistent code style
- **PostCSS** - CSS processing and optimization
- **TypeScript Compiler** - Type checking and compilation

## 🏗️ Architecture

### Database Schema
The application uses a well-structured PostgreSQL database with the following main entities:

- **businesses** - Business profile information with Ghana-specific fields
- **events** - Event management with location and timing details
- **documents** - Unified storage for invoices and receipts
- **entry_passes** - Digital passes with QR codes and verification
- **business_items** - Product/service catalog for businesses
- **templates** - Customizable document templates
- **document_shares** - Document sharing and access control
- **pass_scans** - Entry pass verification tracking

### Security Features
- **Row Level Security (RLS)** - Database-level security ensuring users can only access their own data
- **User Authentication** - Secure user registration and login system
- **Data Isolation** - Complete separation of business data between users
- **Secure API Endpoints** - Protected routes with proper authorization

### Real-time Features
- **Live Updates** - Real-time synchronization of data changes
- **Instant Notifications** - Toast notifications for user actions
- **Responsive Design** - Mobile-first approach for all screen sizes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/bun
- Supabase account
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/pocket-invoice.git
   cd pocket-invoice
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations
   - Configure authentication settings

4. **Configure environment**
   - Update Supabase configuration in the project
   - Set up authentication providers if needed

5. **Start development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

### Deployment
The application can be deployed to various platforms:
- **Vercel** - Recommended for easy deployment
- **Netlify** - Alternative hosting platform
- **Traditional hosting** - Any platform supporting static sites

## 📱 Usage

### Account & Business Setup
1. **Register/Login**: Create an account using your email and password or with a single click via Google. You'll be asked for your full name and phone number during sign-up.
2. **Create a Business Profile**: Once logged in, create your first business profile with key details like its name, contact info, and location in Ghana.

### Document Generation
1. **Create Invoices** - Add client details, itemize services/products, set due dates
2. **Generate Receipts** - Record transactions with payment methods and customer information
3. **Export & Share** - Download PDFs or share via WhatsApp

### Event Management
1. **Create Events** - Set up events with venue, timing, and location details
2. **Generate Entry Passes** - Create digital passes for attendees
3. **QR Code Distribution** - Share QR codes for easy entry verification
4. **Track Attendance** - Monitor pass usage and scanning activity

## 🔧 Troubleshooting

### PDF Generation Issues
If you encounter "canvas is empty" errors when generating PDFs:
- Ensure the document has content before attempting PDF generation
- Check that all required fields are filled
- Verify that the document template is properly rendered

### Mobile Navigation
- Use the hamburger menu (☰) to toggle the sidebar on mobile devices
- Ensure your browser supports modern CSS features for optimal experience

### Dialog Accessibility
All dialogs include proper ARIA labels and descriptions for screen reader compatibility.

## 🌍 Ghana-Specific Features

### Regional Support
Complete coverage of all 16 Ghana regions:
- Greater Accra, Ashanti, Eastern, Western, Central
- Volta, Northern, Upper East, Upper West, Brong-Ahafo
- Western North, Ahafo, Bono East, Oti, North East, Savannah

### Payment Methods
- **Cash Transactions** - Traditional payment method
- **Credit Card** - Card-based payments
- **Mobile Money (MoMo)** - Popular mobile payment system in Ghana

### Business Categories
Support for various business types common in Ghana:
- Technology, Healthcare, Education, Finance
- Retail, Manufacturing, Agriculture, Construction
- Transportation, Hospitality, Entertainment
- Professional Services, Non-Profit, Government

---

**Built with ❤️ for Ghanaian businesses by the Pocket Invoice Team**
