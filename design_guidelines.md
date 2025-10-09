# Design Guidelines: Masjid At-Taqwa Cash Flow Tracking System

## Design Approach: Reference-Based with Islamic Finance Context

**Selected Approach:** Custom design inspired by modern Islamic institutional websites with transparency-focused financial dashboards, drawing from references like Islamic Relief, mosque websites, and financial transparency platforms.

**Core Principles:**
- Trust and transparency through clear financial visualization
- Islamic aesthetic with modern, clean interface
- Community-focused design language
- Mobile-first accessibility for broad community reach

---

## Color Palette

### Light Mode
- **Primary Colors:** 160 85% 35% (Emerald), 160 75% 40% (Emerald lighter variant)
- **Secondary/Accent:** 174 75% 38% (Teal), 168 70% 30% (Teal darker)
- **Background:** 0 0% 100% (White), 160 25% 98% (Soft emerald tint)
- **Text:** 160 90% 15% (Deep emerald-black), 160 15% 35% (Medium gray)
- **Success:** 142 76% 36% (Green for pemasukan/income)
- **Warning:** 45 93% 47% (Amber for pending approvals)
- **Error:** 0 84% 60% (Red for pengeluaran/expense)

### Dark Mode
Not required for initial implementation - focus on light mode for clarity in financial data.

---

## Typography

**Font Families (via Google Fonts CDN):**
- Primary: 'Plus Jakarta Sans' - Modern, professional, excellent readability for financial data
- Secondary: 'Inter' - UI elements, tables, forms
- Display/Headers: 'Plus Jakarta Sans' at heavier weights (700-800)

**Scale:**
- Hero: text-5xl to text-7xl (48-72px), font-bold
- Section Headers: text-3xl to text-4xl (30-36px), font-bold
- Card Titles: text-xl to text-2xl (20-24px), font-semibold
- Body: text-base (16px), font-normal
- Small/Meta: text-sm (14px), font-medium

---

## Layout System

**Spacing Primitives:** Use Tailwind units 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24 (desktop), py-12 (mobile)
- Card gaps: gap-6 to gap-8
- Container max-width: max-w-7xl with px-6 lg:px-8

**Grid Patterns:**
- Financial Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- News/Berita: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Cash Flow Table: Full-width responsive table with horizontal scroll on mobile

---

## Component Library

### Navigation
- **Fixed transparent-to-solid navbar** transitioning on scroll
- Logo: "At-Taqwa" text-based (emerald-600, text-3xl, font-bold)
- Links: Horizontal desktop, hamburger mobile
- Height: h-20, shadow on scroll

### Hero Banner
- **Height:** h-[500px] md:h-[600px]
- **Background:** Gradient from-emerald-800 via-emerald-700 to-teal-700
- **Pattern overlay:** Islamic geometric pattern at 10% opacity
- **Content:** Left-aligned text with CTA button
- **No hero image** - gradient with pattern serves the purpose

### Cards
- **News Cards:** White bg, rounded-xl, shadow-md, hover:shadow-lg transition
- **Financial Summary Cards:** Colored backgrounds matching transaction type (green for income, red for expense)
- **Info Cards:** Border-2 border-emerald-200, bg-emerald-50

### Data Display
- **Cash Flow Table:** Striped rows (even:bg-gray-50), sticky header, responsive with horizontal scroll
- **Summary Stats:** Large numbers (text-4xl font-bold) with labels below
- **Date formatting:** Indonesian locale (DD MMMM YYYY)

### Forms
- **Feedback Form:** Two-column on desktop (contact info | message), single on mobile
- **Input styling:** border-2 border-gray-300 focus:border-emerald-500, rounded-lg, p-3
- **Buttons:** Primary (bg-emerald-600 hover:bg-emerald-700), Secondary (border-2 border-emerald-600 text-emerald-600)

### Footer
- **Multi-section:** About masjid, Quick links, Contact info, Social media
- **Background:** bg-gray-900 text-white
- **Sections:** grid-cols-1 md:grid-cols-2 lg:grid-cols-4

---

## Page-Specific Layouts

### Home Page (Sequential Sections)
1. Hero Banner (600px height)
2. About Content (py-16, max-w-4xl centered text)
3. Cash Flow Summary (3-card grid: Total Pemasukan, Total Pengeluaran, Saldo)
4. Latest News/Berita (3-column grid, "Lihat Semua" link)
5. Donation Info (2-column: Bank details + QR code)
6. Footer

### Berita (News) Page
- Grid layout with filtering by category
- Pagination (6 items per page)
- Featured news at top

### Informasi Donasi
- Bank account details prominently displayed
- Recent cash flow table
- Download monthly report button

### Saran (Feedback) Page
- Contact form with type selection (Kritik/Saran/Pertanyaan/Lainnya)
- Mosque contact information sidebar

---

## Images

**Hero Section:** NO large hero image - use gradient with Islamic geometric pattern overlay

**News/Berita Cards:** Featured images from Google Drive links, aspect-ratio 16:9, object-cover

**Donation Section:** QR code for digital payment (if applicable), mosque building thumbnail

**About Section:** Single mosque photo, rounded-2xl, shadow-lg, max-w-2xl

---

## Animations

**Minimal, purposeful animations only:**
- Navbar shadow on scroll (transition-all duration-300)
- Card hover elevation (hover:shadow-lg transition-shadow)
- Button hover states (default Tailwind transitions)
- NO scroll-triggered animations
- NO page transitions

---

## Accessibility & Responsiveness

- Mobile breakpoints: Base (< 768px), md (768px), lg (1024px)
- Touch targets: minimum h-12 w-12 for mobile buttons
- Color contrast: WCAG AA compliant (4.5:1 for text)
- Semantic HTML: proper heading hierarchy (h1 → h2 → h3)
- Form labels: Always visible, not placeholder-only
- Table responsiveness: Horizontal scroll wrapper on mobile with shadow indicators

---

## Critical Implementation Notes

- All monetary values formatted with Indonesian Rupiah (Rp. ###.###.###)
- Dates in Indonesian format
- Transaction type color coding: Green (pemasukan), Red (pengeluaran)
- Public pages show approved transactions only
- Dynamic data: News, Cash flow, Donation info
- Static sections: About, Footer content