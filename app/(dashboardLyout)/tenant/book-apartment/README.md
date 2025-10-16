# Tenant Book Apartment System

A comprehensive, production-ready apartment booking system for tenants to browse, search, and apply for rental properties.

## 🚀 Features

### 🔍 Advanced Search & Filtering

- **Text Search**: Search by title, description, address
- **Price Range**: Filter by minimum and maximum rent
- **Property Details**: Filter by bedrooms, bathrooms
- **Location**: Filter by city and state
- **Amenities**: Multi-select amenity filtering
- **Sorting**: Multiple sorting options (price, date, bedrooms, etc.)

### 🏠 Property Management

- **Property Cards**: Beautiful, responsive property cards with image galleries
- **Detailed Views**: Comprehensive property detail modals
- **Image Gallery**: Multiple images with navigation and thumbnails
- **Availability Status**: Real-time availability tracking
- **Favorites**: Save properties to favorites list

### 📝 Application System

- **Application Form**: Complete rental application with validation
- **Employment Details**: Conditional fields based on employment status
- **Income Validation**: Income-to-rent ratio calculation
- **File Uploads**: Support for documents (future enhancement)
- **Status Tracking**: Track application status

### 🎨 UI/UX Features

- **Responsive Design**: Mobile-first, fully responsive
- **Loading States**: Skeleton loaders and loading indicators
- **Error Handling**: Comprehensive error handling with user feedback
- **Notifications**: Toast notifications for user actions
- **Grid/List Views**: Toggle between grid and list layouts
- **Dark Mode Ready**: Built with shadcn/ui components

## 🏗️ Architecture

### Components Structure

```
book-apartment/
├── components/
│   ├── BookApartment.tsx           # Main page component
│   ├── PropertyCard.tsx            # Property card component
│   ├── PropertySearchFilters.tsx   # Search and filter component
│   ├── PropertyDetailsDialog.tsx   # Property details modal
│   ├── BookApartmentDialog.tsx     # Application form modal
│   └── ErrorBoundary.tsx          # Error boundary component
├── page.tsx                       # Route page
└── loading.tsx                    # Loading page
```

### API Integration

- **Redux Toolkit Query**: For API state management
- **Application API**: Complete CRUD operations for applications
- **Apartment API**: Property data fetching
- **Type Safety**: Full TypeScript support

### Validation

- **Zod Schemas**: Client-side validation
- **Form Validation**: React Hook Form integration
- **Error Display**: User-friendly error messages
- **Real-time Validation**: Instant feedback

## 🔧 Technical Implementation

### State Management

```typescript
// Local state for UI
const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
const [favorites, setFavorites] = useState<Set<string>>(new Set());
const [searchFilters, setSearchFilters] = useState<PropertySearchData>({});

// RTK Query for server state
const {
  data: apartmentsResponse,
  isLoading,
  error,
} = useGetAllApartmentsQuery();
const { data: applicationsResponse } = useGetMyApplicationsQuery();
```

### Search & Filtering Logic

```typescript
// Comprehensive filtering with multiple criteria
const filteredApartments = apartments.filter((apartment) => {
  // Text search across multiple fields
  // Price range filtering
  // Property details filtering
  // Location filtering
  // Amenities filtering
  // Sorting by various criteria
});
```

### Form Validation

```typescript
const applicationSchema = z.object({
  moveInDate: z.string().refine((date) => new Date(date) >= new Date()),
  leaseTerm: z.enum([
    "6 months",
    "1 year",
    "18 months",
    "2 years",
    "month-to-month",
  ]),
  monthlyIncome: z.number().min(1).max(1000000),
  employmentStatus: z.enum([
    "employed",
    "self-employed",
    "unemployed",
    "student",
    "retired",
  ]),
  // Conditional validation for employment fields
});
```

## 🎯 User Flow

1. **Browse Properties**: Users see all available properties in a responsive grid/list
2. **Search & Filter**: Advanced filtering options to narrow down results
3. **View Details**: Click on property cards to see detailed information
4. **Add to Favorites**: Save interesting properties for later
5. **Apply for Property**: Fill out comprehensive application form
6. **Track Applications**: View application status and history

## 🔒 Security & Validation

### Frontend Validation

- **Zod Schemas**: Type-safe validation
- **Form Validation**: Real-time validation feedback
- **Input Sanitization**: Clean user inputs
- **Error Boundaries**: Graceful error handling

### API Security

- **Authentication**: JWT token-based authentication
- **Authorization**: Role-based access control
- **Input Validation**: Server-side validation
- **Rate Limiting**: API rate limiting (backend)

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px - Single column, stacked layout
- **Tablet**: 768px - 1024px - Two column grid
- **Desktop**: > 1024px - Three column grid

### Mobile Features

- **Touch-Friendly**: Large tap targets
- **Swipe Navigation**: Image gallery swiping
- **Collapsible Filters**: Space-efficient filtering
- **Optimized Images**: Responsive image loading

## 🚀 Performance Optimizations

### Image Optimization

- **Next.js Image**: Automatic optimization and lazy loading
- **Responsive Images**: Multiple sizes for different devices
- **Lazy Loading**: Images load as needed

### State Management

- **RTK Query Caching**: Automatic caching and background updates
- **Optimistic Updates**: Immediate UI feedback
- **Error Recovery**: Automatic retry mechanisms

### Bundle Optimization

- **Code Splitting**: Lazy loading of components
- **Tree Shaking**: Remove unused code
- **Minification**: Optimized production builds

## 🧪 Testing Strategy

### Component Testing

- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **Accessibility Tests**: WCAG compliance testing

### E2E Testing

- **User Journeys**: Complete user flow testing
- **Cross-Browser**: Multi-browser compatibility
- **Mobile Testing**: Mobile device testing

## 🔮 Future Enhancements

### Planned Features

- **File Uploads**: Document upload for applications
- **Real-time Updates**: WebSocket integration
- **Advanced Filters**: Map-based location filtering
- **Saved Searches**: Save and reuse search criteria
- **Notifications**: Push notifications for application updates
- **Virtual Tours**: 360° property tours
- **Chat System**: Direct communication with landlords

### Technical Improvements

- **PWA Support**: Progressive Web App features
- **Offline Support**: Offline functionality
- **Performance Monitoring**: Real-time performance tracking
- **Analytics**: User behavior analytics

## 📋 Usage

### For Tenants

1. Navigate to the Book Apartment page
2. Use search and filters to find properties
3. Click "View Details" to see full property information
4. Click "Book Now" to start application process
5. Fill out application form with required details
6. Submit application and track status

### For Developers

1. Import components as needed
2. Use the provided hooks for API integration
3. Customize styling with Tailwind CSS
4. Extend validation schemas as needed
5. Add new features following the established patterns

## 🛠️ Development

### Prerequisites

- Node.js 18+
- React 18+
- TypeScript 5+
- Tailwind CSS 3+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Property Rental
```

## 📄 License

This project is part of the Property Rental System and follows the same licensing terms.

---

**Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and shadcn/ui**
