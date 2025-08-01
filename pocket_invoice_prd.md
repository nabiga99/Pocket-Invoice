# Pocket Invoice - Product Requirements Document (PRD)

## 1. Product Overview

### 1.1 Product Name
**Pocket Invoice** - Professional Document Generation Suite

### 1.2 Product Vision
A comprehensive web application that empowers businesses and event organizers to create professional invoices, receipts, and entry passes with advanced management features, bulk generation capabilities, and seamless sharing options.

### 1.3 Product Mission
To eliminate repetitive document creation tasks by providing intelligent templates, centralized data management, and automated workflows that scale from individual use to enterprise-level operations.

### 1.4 Target Audience
- Small to medium businesses needing invoice and receipt generation
- Event organizers and conference managers
- Freelancers and service providers
- Accounting professionals
- Educational institutions organizing events

### 1.5 Key Value Propositions
- **Efficiency**: Eliminate repetitive data entry with centralized business profiles and event management
- **Professional Quality**: Generate high-quality PDF documents with customizable templates
- **Scalability**: Handle single document creation to bulk generation of thousands
- **Security**: Built-in verification systems for document authenticity
- **Integration**: Seamless WhatsApp sharing and multi-format exports

## 2. Technical Stack & Architecture

### 2.1 Frontend Technology
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand for global state
- **Form Handling**: React Hook Form with Zod validation
- **PDF Generation**: @react-pdf/renderer or jsPDF
- **QR Code**: qrcode.js library
- **File Upload**: react-dropzone
- **Icons**: Lucide React

### 2.2 Backend Technology
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **File Storage**: AWS S3 or Cloudinary
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Zod schemas
- **Email Service**: Resend or SendGrid

### 2.3 Infrastructure
- **Hosting**: Vercel for frontend, Railway/Render for backend
- **Database**: Supabase or Neon PostgreSQL
- **CDN**: Vercel Edge Network
- **Environment**: Staging and Production environments

## 3. Core Features & Functional Requirements

### 3.1 User Authentication & Management

#### 3.1.1 Authentication System
```typescript
// User registration/login flow
interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  subscription_tier: 'free' | 'pro' | 'enterprise'
  created_at: Date
  updated_at: Date
}

// Authentication endpoints required
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
PUT  /api/auth/profile
```

#### 3.1.2 Subscription Management
- **Free Tier**: 10 documents/month, basic templates, watermarked PDFs
- **Pro Tier ($9.99/month)**: Unlimited documents, all templates, no watermarks
- **Enterprise Tier ($29.99/month)**: White-label, API access, priority support

### 3.2 Business Profile Management

#### 3.2.1 Business CRUD Operations
```typescript
interface BusinessProfile {
  id: string
  user_id: string
  name: string
  logo_url?: string
  address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  contact: {
    email: string
    phone: string
    website?: string
  }
  tax_settings: {
    tax_id?: string
    default_tax_rate: number
    tax_inclusive: boolean
  }
  payment_methods: {
    bank_details?: BankDetails[]
    digital_wallets?: string[]
  }
  branding: {
    primary_color: string
    secondary_color: string
    font_family: string
  }
  default_terms?: string
  is_default: boolean
  created_at: Date
  updated_at: Date
}

// Required API endpoints
GET    /api/businesses
POST   /api/businesses
GET    /api/businesses/{id}
PUT    /api/businesses/{id}
DELETE /api/businesses/{id}
POST   /api/businesses/{id}/set-default
```

#### 3.2.2 Items/Services Catalog
```typescript
interface BusinessItem {
  id: string
  business_id: string
  type: 'product' | 'service'
  name: string
  description?: string
  price: number
  sku?: string
  category: string
  tax_class: 'taxable' | 'non_taxable' | 'exempt'
  unit: string // 'piece', 'hour', 'kg', etc.
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// Required API endpoints
GET    /api/businesses/{businessId}/items
POST   /api/businesses/{businessId}/items
GET    /api/businesses/{businessId}/items/{id}
PUT    /api/businesses/{businessId}/items/{id}
DELETE /api/businesses/{businessId}/items/{id}
POST   /api/businesses/{businessId}/items/bulk-import
```

#### 3.2.3 UI Components Required
- **BusinessProfileForm**: Form for creating/editing business profiles
- **BusinessSelector**: Dropdown to select active business
- **ItemCatalog**: Grid/list view of items with search and filter
- **ItemForm**: Modal form for adding/editing items
- **BulkImportModal**: CSV/Excel upload with field mapping

### 3.3 Event Management System

#### 3.3.1 Event Data Structure
```typescript
interface Event {
  id: string
  user_id: string
  name: string
  description?: string
  type: 'conference' | 'workshop' | 'concert' | 'meeting' | 'other'
  start_datetime: Date
  end_datetime: Date
  venue: {
    name: string
    address: string
    capacity?: number
  }
  settings: {
    pass_types: PassType[]
    security_level: 'low' | 'medium' | 'high'
    scan_limit: number // -1 for unlimited
    geo_restriction?: {
      latitude: number
      longitude: number
      radius_meters: number
    }
  }
  branding: {
    logo_url?: string
    primary_color: string
    secondary_color: string
    sponsors?: Sponsor[]
  }
  is_active: boolean
  created_at: Date
  updated_at: Date
}

interface PassType {
  id: string
  name: string // 'VIP', 'General', 'Staff'
  access_level: number
  color: string
  description?: string
}

// Required API endpoints
GET    /api/events
POST   /api/events
GET    /api/events/{id}
PUT    /api/events/{id}
DELETE /api/events/{id}
GET    /api/events/{id}/analytics
```

#### 3.3.2 UI Components Required
- **EventDashboard**: List view of events with actions
- **EventForm**: Comprehensive form for event creation/editing
- **EventTemplates**: Pre-built event type templates
- **EventAnalytics**: Charts showing pass generation and scan data

### 3.4 Invoice Generation System

#### 3.4.1 Invoice Data Structure
```typescript
interface Invoice {
  id: string
  user_id: string
  business_id: string
  invoice_number: string // Auto-generated or custom
  client: {
    name: string
    email?: string
    address?: Address
    phone?: string
  }
  line_items: InvoiceLineItem[]
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  currency: string
  issue_date: Date
  due_date: Date
  payment_terms?: string
  notes?: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  template_id: string
  pdf_url?: string
  created_at: Date
  updated_at: Date
}

interface InvoiceLineItem {
  id: string
  item_id?: string // Reference to BusinessItem
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  line_total: number
}

// Required API endpoints
POST   /api/invoices/generate
GET    /api/invoices
GET    /api/invoices/{id}
PUT    /api/invoices/{id}
DELETE /api/invoices/{id}
POST   /api/invoices/{id}/send
GET    /api/invoices/{id}/pdf
```

#### 3.4.2 Invoice Builder UI
```typescript
// Main invoice builder component structure
<InvoiceBuilder>
  <BusinessSelector />
  <ClientForm />
  <LineItemsTable>
    <ItemSelector /> // Dropdown from business catalog
    <AddItemButton /> // Add items not in catalog
    <QuantityInput />
    <PriceInput />
    <TaxSelector />
  </LineItemsTable>
  <CalculationsSummary />
  <TemplateSelector />
  <PreviewPane />
  <ActionButtons>
    <SaveDraftButton />
    <GeneratePDFButton />
    <ShareWhatsAppButton />
  </ActionButtons>
</InvoiceBuilder>
```

### 3.5 Receipt Generation System

#### 3.5.1 Receipt Data Structure
```typescript
interface Receipt {
  id: string
  user_id: string
  business_id: string
  receipt_number: string
  transaction_type: 'sale' | 'service' | 'refund' | 'exchange'
  customer?: {
    name?: string
    email?: string
    phone?: string
    loyalty_id?: string
  }
  line_items: ReceiptLineItem[]
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_method: 'cash' | 'card' | 'digital' | 'bank_transfer'
  currency: string
  transaction_datetime: Date
  notes?: string
  template_id: string
  pdf_url?: string
  verification_hash: string
  created_at: Date
  updated_at: Date
}

// Required API endpoints
POST   /api/receipts/generate
GET    /api/receipts
GET    /api/receipts/{id}
GET    /api/receipts/{id}/verify
```

#### 3.5.2 Receipt Builder UI
```typescript
<ReceiptBuilder>
  <BusinessSelector />
  <TransactionTypeSelector />
  <CustomerForm /> // Optional
  <ItemsGrid>
    <ItemSearch />
    <QuickAddButtons /> // Common items
    <QuantityControls />
    <DiscountControls />
  </ItemsGrid>
  <PaymentSection>
    <PaymentMethodSelector />
    <AmountPaidInput />
    <ChangeCalculation />
  </PaymentSection>
  <TemplateSelector />
  <ActionButtons>
    <GenerateReceiptButton />
    <PrintButton />
    <ShareWhatsAppButton />
  </ActionButtons>
</ReceiptBuilder>
```

### 3.6 Entry Pass Generation System

#### 3.6.1 Entry Pass Data Structure
```typescript
interface EntryPass {
  id: string
  event_id: string
  unique_pass_id: string // Human-readable unique ID
  attendee: {
    name: string
    email?: string
    phone?: string
    company?: string
    title?: string
    photo_url?: string
  }
  pass_type: string // References Event.settings.pass_types
  special_access?: string[]
  qr_data: {
    verification_url: string
    security_hash: string
    encrypted_data: string
  }
  validity: {
    valid_from: Date
    valid_until: Date
    is_active: boolean
  }
  scan_history: PassScan[]
  max_scans: number // -1 for unlimited
  current_scan_count: number
  template_id: string
  pdf_url?: string
  created_at: Date
  updated_at: Date
}

interface PassScan {
  id: string
  pass_id: string
  scanned_at: Date
  scanner_info?: string
  location?: string
  ip_address: string
}

// Required API endpoints
POST   /api/entry-passes/generate
POST   /api/entry-passes/bulk-generate
GET    /api/entry-passes
GET    /api/entry-passes/{id}
GET    /api/verify/pass/{uniquePassId}
POST   /api/entry-passes/{id}/scan
GET    /api/events/{eventId}/passes
```

#### 3.6.2 Single Pass Generator UI
```typescript
<SinglePassGenerator>
  <EventSelector />
  <AttendeeForm>
    <NameInput />
    <EmailInput />
    <PhoneInput />
    <CompanyInput />
    <TitleInput />
    <PhotoUpload />
  </AttendeeForm>
  <PassTypeSelector />
  <SpecialAccessCheckboxes />
  <ValiditySettings />
  <TemplateSelector />
  <PreviewPane />
  <ActionButtons>
    <GeneratePassButton />
    <DownloadPDFButton />
    <ShareWhatsAppButton />
  </ActionButtons>
</SinglePassGenerator>
```

#### 3.6.3 Bulk Pass Generator UI
```typescript
<BulkPassGenerator>
  <EventSelector />
  <UploadSection>
    <CSVUploadDropzone />
    <ExcelUploadDropzone />
    <SampleTemplateDownload />
  </UploadSection>
  <FieldMappingTable>
    <ColumnMappingDropdowns />
    <PassTypeMapping />
    <ValidationRules />
  </FieldMappingTable>
  <PreviewTable>
    <DataValidationResults />
    <ErrorHighlighting />
  </PreviewTable>
  <GenerationSettings>
    <TemplateSelector />
    <BulkNamingRules />
  </GenerationSettings>
  <ProgressSection>
    <GenerationProgressBar />
    <StatusMessages />
  </ProgressSection>
  <ResultsSection>
    <SuccessfulGeneration />
    <FailedRecords />
    <BulkDownloadZip />
  </ResultsSection>
</BulkPassGenerator>
```

### 3.7 Template System

#### 3.7.1 Template Data Structure
```typescript
interface Template {
  id: string
  name: string
  type: 'invoice' | 'receipt' | 'entry_pass'
  category: string
  preview_image_url: string
  is_premium: boolean
  design_config: {
    layout: 'standard' | 'modern' | 'minimalist' | 'creative'
    colors: {
      primary: string
      secondary: string
      accent: string
      text: string
    }
    fonts: {
      heading: string
      body: string
      size_scale: number
    }
    spacing: {
      margins: number
      padding: number
      line_height: number
    }
    elements: TemplateElement[]
  }
  is_active: boolean
  created_at: Date
  updated_at: Date
}

interface TemplateElement {
  id: string
  type: 'text' | 'image' | 'qr_code' | 'table' | 'line' | 'shape'
  position: { x: number; y: number }
  size: { width: number; height: number }
  style: Record<string, any>
  content?: string
  data_binding?: string // Field to bind data to
}

// Required API endpoints
GET    /api/templates
GET    /api/templates/{type}
POST   /api/templates
PUT    /api/templates/{id}
DELETE /api/templates/{id}
```

### 3.8 PDF Generation & Export System

#### 3.8.1 PDF Generation Requirements
```typescript
// PDF generation service interface
interface PDFGenerationService {
  generateInvoicePDF(invoice: Invoice, template: Template): Promise<PDFResult>
  generateReceiptPDF(receipt: Receipt, template: Template): Promise<PDFResult>
  generateEntryPassPDF(pass: EntryPass, template: Template): Promise<PDFResult>
  generateBulkPasses(passes: EntryPass[], template: Template): Promise<ZipResult>
}

interface PDFResult {
  success: boolean
  pdf_url: string
  file_size: number
  generation_time: number
  error?: string
}

// Export format options
interface ExportOptions {
  format: 'pdf' | 'png' | 'jpeg'
  quality: 'standard' | 'high' | 'print'
  watermark: boolean
  compression: boolean
}
```

#### 3.8.2 Required PDF Features
- High-quality rendering (300 DPI for print)
- Responsive layouts that adapt to content
- Professional typography and spacing
- Logo and image embedding
- QR code generation and positioning
- Multi-page support for long invoices
- Print-ready formats with proper margins
- Compression for email-friendly sizes

### 3.9 Sharing & Distribution System

#### 3.9.1 WhatsApp Integration
```typescript
interface WhatsAppShareService {
  shareInvoice(invoice: Invoice, recipientPhone: string): Promise<ShareResult>
  shareReceipt(receipt: Receipt, recipientPhone: string): Promise<ShareResult>
  shareEntryPass(pass: EntryPass, recipientPhone: string): Promise<ShareResult>
}

// WhatsApp message templates
const messageTemplates = {
  invoice: (businessName: string, invoiceNumber: string, downloadUrl: string) => 
    `Hi! Your invoice #${invoiceNumber} from ${businessName} is ready. Download: ${downloadUrl}`,
  
  receipt: (businessName: string, downloadUrl: string) => 
    `Thank you for your purchase at ${businessName}! Your receipt: ${downloadUrl}`,
  
  entryPass: (eventName: string, attendeeName: string, downloadUrl: string) => 
    `Hi ${attendeeName}! Your entry pass for ${eventName} is ready. Download: ${downloadUrl} Please save this for event entry.`
}
```

#### 3.9.2 Multi-Channel Sharing
```typescript
<SharingModal>
  <ShareOptions>
    <WhatsAppShare />
    <EmailShare />
    <DirectDownload />
    <CopyLinkButton />
  </ShareOptions>
  <FormatSelector>
    <PDFOption selected />
    <PNGOption />
    <JPEGOption />
  </FormatSelector>
  <QualitySelector>
    <StandardQuality />
    <HighQuality />
    <PrintQuality />
  </QualitySelector>
</SharingModal>
```

### 3.10 Verification & Authentication System

#### 3.10.1 Pass Verification Portal
```typescript
// Public verification page structure
<PassVerificationPage>
  <QRScanner />
  <ManualEntryForm>
    <PassIDInput />
    <VerifyButton />
  </ManualEntryForm>
  <VerificationResult>
    <PassDetails />
    <SecurityStatus />
    <ScanHistory />
    <EventInformation />
  </VerificationResult>
</PassVerificationPage>

// Verification API response
interface VerificationResponse {
  valid: boolean
  pass_details: {
    attendee_name: string
    event_name: string
    pass_type: string
    special_access?: string[]
  }
  scan_info: {
    current_scans: number
    max_scans: number
    last_scanned?: Date
  }
  security: {
    hash_valid: boolean
    not_expired: boolean
    within_geo_fence?: boolean
  }
  error?: string
}
```

#### 3.10.2 Security Features
- Cryptographic hash validation
- Time-based pass expiration
- Scan limit enforcement
- Geo-fencing validation (optional)
- IP-based fraud detection
- Duplicate scan prevention

## 4. User Interface Requirements

### 4.1 Design System
```typescript
// Color palette
const colors = {
  primary: '#2563eb', // Blue-600
  secondary: '#64748b', // Slate-500  
  success: '#10b981', // Emerald-500
  warning: '#f59e0b', // Amber-500
  error: '#ef4444', // Red-500
  background: '#ffffff',
  surface: '#f8fafc', // Slate-50
  text: {
    primary: '#0f172a', // Slate-900
    secondary: '#64748b', // Slate-500
    muted: '#94a3b8' // Slate-400
  }
}

// Typography scale
const typography = {
  h1: 'text-3xl font-bold',
  h2: 'text-2xl font-semibold', 
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-medium',
  body: 'text-base',
  small: 'text-sm',
  xs: 'text-xs'
}
```

### 4.2 Layout Structure
```typescript
<AppLayout>
  <Header>
    <Logo />
    <Navigation />
    <UserMenu />
  </Header>
  <Sidebar>
    <MainNavigation />
    <QuickActions />
    <RecentDocuments />
  </Sidebar>
  <MainContent>
    <PageHeader />
    <ContentArea />
  </MainContent>
  <Footer />
</AppLayout>
```

### 4.3 Dashboard Requirements
```typescript
<Dashboard>
  <StatsCards>
    <StatCard title="Documents Generated" value={totalDocs} trend={+12} />
    <StatCard title="This Month" value={monthlyDocs} trend={+8} />
    <StatCard title="Active Events" value={activeEvents} />
    <StatCard title="Pass Scans Today" value={todayScans} />
  </StatsCards>
  
  <QuickActions>
    <ActionCard 
      title="Create Invoice" 
      description="Generate professional invoices"
      icon={<InvoiceIcon />}
      action="/invoices/create"
    />
    <ActionCard 
      title="Generate Receipt" 
      description="Create transaction receipts"
      icon={<ReceiptIcon />}
      action="/receipts/create"
    />
    <ActionCard 
      title="Entry Pass" 
      description="Create event entry passes"
      icon={<PassIcon />}
      action="/passes/create"
    />
    <ActionCard 
      title="Bulk Passes" 
      description="Generate multiple passes from CSV"
      icon={<BulkIcon />}
      action="/passes/bulk"
    />
  </QuickActions>
  
  <RecentActivity>
    <ActivityTable />
  </RecentActivity>
  
  <Charts>
    <DocumentGenerationChart />
    <PopularTemplatesChart />
  </Charts>
</Dashboard>
```

### 4.4 Responsive Design Requirements
- Mobile-first design approach
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Touch-friendly interface elements (minimum 44px touch targets)
- Optimized forms for mobile input
- Collapsible navigation for smaller screens

### 4.5 Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus indicators on all interactive elements
- Alt text for all images
- Semantic HTML structure

## 5. Database Schema

### 5.1 Core Tables
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  subscription_tier VARCHAR(20) DEFAULT 'free',
  subscription_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Business profiles
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  address JSONB,
  contact JSONB,
  tax_settings JSONB,
  payment_methods JSONB,
  branding JSONB,
  default_terms TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Business items/services catalog
CREATE TABLE business_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('product', 'service')),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sku VARCHAR(100),
  category VARCHAR(100),
  tax_class VARCHAR(20) DEFAULT 'taxable',
  unit VARCHAR(50) DEFAULT 'piece',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  start_datetime TIMESTAMP NOT NULL,
  end_datetime TIMESTAMP NOT NULL,
  venue JSONB,
  settings JSONB,
  branding JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Templates
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('invoice', 'receipt', 'entry_pass')),
  category VARCHAR(100),
  preview_image_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  design_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Documents (unified table for invoices, receipts)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('invoice', 'receipt')),
  document_number VARCHAR(100),
  document_data JSONB NOT NULL,
  template_id UUID REFERENCES templates(id),
  pdf_url TEXT,
  status VARCHAR(20) DEFAULT 'generated',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Entry passes
CREATE TABLE entry_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  unique_pass_id VARCHAR(50) UNIQUE NOT NULL,
  attendee_data JSONB NOT NULL,
  pass_type VARCHAR(100),
  special_access TEXT[],
  qr_data JSONB NOT NULL,
  validity JSONB NOT NULL,
  max_scans INTEGER DEFAULT -1,
  current_scan_count INTEGER DEFAULT 0,
  template_id UUID REFERENCES templates(id),
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pass scans (tracking)
CREATE TABLE pass_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id UUID REFERENCES entry_passes(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP DEFAULT NOW(),
  scanner_info VARCHAR(255),
  location VARCHAR(255),
  ip_address INET,
  user_agent TEXT
);

-- Document shares (analytics)
CREATE TABLE document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  pass_id UUID REFERENCES entry_passes(id) ON DELETE CASCADE,
  share_method VARCHAR(50) NOT NULL,
  recipient_info VARCHAR(255),
  shared_at TIMESTAMP DEFAULT NOW()
);
```

### 5.2 Indexes for Performance
```sql
-- User-related indexes
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_business_items_business_id ON business_items(business_id);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_entry_passes_event_id ON entry_passes(event_id);

-- Search and filtering indexes
CREATE INDEX idx_business_items_name ON business_items USING gin(to_tsvector('english', name));
CREATE INDEX idx_documents_type_created_at ON documents(type, created_at DESC);
CREATE INDEX idx_entry_passes_unique_pass_id ON entry_passes(unique_pass_id);
CREATE INDEX idx_pass_scans_pass_id_scanned_at ON pass_scans(pass_id, scanned_at);

-- JSON indexes for better query performance
CREATE INDEX idx_documents_status ON documents USING gin((document_data->>'status'));
CREATE INDEX idx_entry_passes_validity ON entry_passes USING gin(validity);
```

## 6. API Specification

### 6.1 Authentication Endpoints
```typescript
// Authentication routes
POST   /api/auth/register
  Body: { email: string, name: string, password: string }
  Response: { user: User, token: string }

POST   /api/auth/login
  Body: { email: string, password: string }
  Response: { user: User, token: string }

POST   /api/auth/logout
  Headers: { Authorization: "Bearer <token>" }
  Response: { success: boolean }

GET    /api/auth/me
  Headers: { Authorization: "Bearer <token>" }
  Response: { user: User }

PUT    /api/auth/profile
  Headers: { Authorization: "Bearer <token>" }
  Body: { name?: string, avatar_url?: string }
  Response: { user: User }
```

### 6.2 Business Management Endpoints
```typescript
// Business CRUD
GET    /api/businesses
  Headers: { Authorization: "Bearer <token>" }
  Response: { businesses: BusinessProfile[] }

POST   /api/businesses
  Headers: { Authorization: "Bearer <token>" }
  Body: CreateBusinessRequest
  Response: { business: BusinessProfile }

GET    /api/businesses/{id}
  Headers: { Authorization: "Bearer <token>" }
  Response: { business: BusinessProfile }

PUT    /api/businesses/{id}
  Headers: { Authorization: "Bearer <token>" }
  Body: UpdateBusinessRequest
  Response: { business: BusinessProfile }

DELETE /api/businesses/{id}
  Headers: { Authorization: "Bearer <token>" }
  Response: { success: boolean }

// Business items management
GET    /api/businesses/{id}/items
  Headers: { Authorization: "Bearer <token>" }
  Query: { search?: string, category?: string, page?: number }
  Response: { items: BusinessItem[], total: number, page: number }

POST   /api/businesses/{id}/items
  Headers: { Authorization: "Bearer <token>" }
  Body: CreateBusinessItemRequest
  Response: { item: BusinessItem }

POST   /api/businesses/{id}/items/bulk-import
  Headers: { Authorization: "Bearer <token>" }
  Body: FormData with CSV/Excel file
  Response: { imported: number, errors: ImportError[] }
```

### 6.3 Event Management Endpoints
```typescript
// Event CRUD
GET    /api/events
  Headers: { Authorization: "Bearer <token>" }
  Query: { status?: 'active' | 'past', page?: number }
  Response: { events: Event[], total: number, page: number }

POST   /api/events
  Headers: { Authorization: "Bearer <token>" }
  Body: CreateEventRequest
  Response: { event: Event }

GET    /api/events/{id}
  Headers: { Authorization: "Bearer <token>" }
  Response: { event: Event }

PUT    /api/events/{id}
  Headers: { Authorization: "Bearer <token>" }
  Body: UpdateEventRequest
  Response: { event: Event }

DELETE /api/events/{id}
  Headers: { Authorization: "Bearer <token>" }
  Response: { success: boolean }

GET    /api/events/{id}/analytics
  Headers: { Authorization: "Bearer <token>" }
  Response: { 
    total_passes: number,
    scanned_passes: number,
    scan_rate: number,
    hourly_scans: HourlyScanData[],
    pass_type_breakdown: PassTypeStats[]
  }
  