// ============================================================
//  src/schema.js — SINGLE SOURCE OF TRUTH FOR FIRESTORE SCHEMA
//
//  When you change a field:
//    1. Update the relevant SCHEMA constant below
//    2. Update SCHEMA.md (run `npm run schema` or edit manually)
//
//  All field shapes, required flags, and default values live here.
//  Form sections, hooks, and Firestore writes import from this file.
// ============================================================

// ---------- HOTEL DOCUMENT ----------
export const HOTEL_SCHEMA = {
  // ── Basic Info ──────────────────────────────────────────────
  name: { type: 'string', required: true, label: 'Hotel Name' },
  description: { type: 'string', required: false, label: 'Description' },
  hotelType: {
    type: 'string',
    required: true,
    label: 'Hotel Type',
    lookupCollection: 'hotelTypes',
  },
  starRating: { type: 'number', required: true, label: 'Star Rating', min: 1, max: 5 },
  isActive: { type: 'boolean', required: false, default: true, label: 'Active' },
  isLuxury: { type: 'boolean', required: false, default: false, label: 'Luxury Property' },
  totalRooms: { type: 'number', required: false, label: 'Total Rooms' },

  // ── Contact ──────────────────────────────────────────────────
  contactPhone: { type: 'string', required: true, label: 'Phone Number' },
  contactEmail: { type: 'string', required: true, label: 'Email Address' },
  socialLinks: { type: 'string', required: false, label: 'Social Media Links' },
  website: { type: 'string', required: false, label: 'Website URL' },

  // ── Check-in / Check-out ─────────────────────────────────────
  checkInTime: { type: 'string', required: true, label: 'Check-In Time' },
  checkOutTime: { type: 'string', required: true, label: 'Check-Out Time' },
  earlyCheckInAllowed: { type: 'boolean', required: false, default: false, label: 'Early Check-In Allowed' },
  earlyCheckInPrice: { type: 'number', required: false, default: 0, label: 'Early Check-In Price' },
  lateCheckOutAllowed: { type: 'boolean', required: false, default: false, label: 'Late Check-Out Allowed' },
  lateCheckOutPrice: { type: 'number', required: false, default: 0, label: 'Late Check-Out Price' },

  // ── Location ──────────────────────────────────────────────────
  address: { type: 'string', required: true, label: 'Street Address' },
  city: { type: 'string', required: true, label: 'City' },
  country: { type: 'string', required: true, label: 'Country' },
  pincode: { type: 'string', required: false, label: 'Pincode / ZIP' },
  // GeoPoint stored separately as { latitude: number, longitude: number }
  latitude: { type: 'number', required: false, label: 'Latitude' },
  longitude: { type: 'number', required: false, label: 'Longitude' },

  // ── Media ─────────────────────────────────────────────────────
  // photos: array of Firebase Storage URLs
  photos: { type: 'array', required: true, minItems: 1, label: 'Photos', itemType: 'string' },

  // ── Transport ─────────────────────────────────────────────────
  // modes: array of transport objects
  modes: {
    type: 'array',
    required: false,
    label: 'Transport Modes',
    itemSchema: {
      category: { type: 'enum', options: ['BUS', 'TRAIN', 'AIRPORT', 'METRO'], label: 'Category' },
      name: { type: 'string', label: 'Name / Station' },
      distance: { type: 'string', label: 'Distance (text)' },
      distanceInKm: { type: 'number', label: 'Distance (km)' },
      detailed: { type: 'string', label: 'Description' },
      cab: { type: 'boolean', label: 'Cab Available' },
      auto: { type: 'boolean', label: 'Auto Available' },
    },
  },

  // ── Food & Dining ──────────────────────────────────────────────
  mealPlansAvailable: {
    type: 'array',
    required: false,
    label: 'Meal Plans',
    itemSchema: {
      value: { type: 'enum', options: ['Breakfast', 'FullBoard', 'HB', 'RO'], label: 'Plan' },
      price: { type: 'number', default: 0, label: 'Price per person (₹)' },
    },
  },

  // ── Parking ───────────────────────────────────────────────────
  parkingAvailable: { type: 'boolean', required: false, default: false, label: 'Parking Available' },
  parkingType: {
    type: 'string',
    required: false,
    label: 'Parking Type',
    lookupCollection: 'parkingTypes',
  },
  parkingSpots: { type: 'number', required: false, label: 'Total Parking Spots' },

  // ── Property Highlights ───────────────────────────────────────
  highlights: {
    type: 'array',
    required: false,
    label: 'Property Highlights',
    itemSchema: {
      title: { type: 'string', label: 'Highlight Title' },
      category: {
        type: 'string',
        label: 'Category',
        lookupCollection: 'highlightCategories',
      },
      amenityType: { type: 'string', label: 'Amenity Type', lookupCollection: 'amenityTypes' },
    },
  },

  // ── Policies & Compliance ─────────────────────────────────────
  pdfRequired: { type: 'boolean', required: false, default: false, label: 'ID/PDF Required at Check-in' },
  privacyPremium: { type: 'boolean', required: false, default: false, label: 'Privacy Premium Room' },
  ageRestriction: { type: 'number', required: false, label: 'Minimum Age Restriction' },
  petPolicy: { type: 'boolean', required: false, default: false, label: 'Pets Allowed' },

  // ── Ratings (read-only — updated by Cloud Functions) ──────────
  averageRating: { type: 'number', readOnly: true, label: 'Average Rating' },
  totalReviews: { type: 'number', readOnly: true, label: 'Total Reviews' },
  ratingBreakdown: {
    type: 'object',
    readOnly: true,
    label: 'Rating Breakdown',
    fields: {
      cleanliness: { type: 'number' },
      food: { type: 'number' },
      staff: { type: 'number' },
      location: { type: 'number' },
      value: { type: 'number' },
    },
  },

  // ── Meta ──────────────────────────────────────────────────────
  status: {
    type: 'enum',
    required: false,
    default: 'DRAFT',
    options: ['ACTIVE', 'INACTIVE', 'DRAFT'],
    label: 'Status',
  },
  openingDate: { type: 'timestamp', required: false, label: 'Opening Date' },
  closingDate: { type: 'timestamp', required: false, label: 'Closing Date' },
  createdAt: { type: 'timestamp', readOnly: true, label: 'Created At' },
  updatedAt: { type: 'timestamp', readOnly: true, label: 'Updated At' },
};

// ---------- CONFIG DOCUMENT ----------
export const CONFIG_SCHEMA = {
  document: { type: 'string', label: 'Document URL' },
  support: { type: 'string', label: 'Support URL' },
  privacyCenter: { type: 'string', label: 'Privacy Center URL' },
  termsAndConditions: { type: 'string', label: 'Terms & Conditions URL' },
  footerPage: { type: 'string', label: 'Footer Page Content' },
  carousel: { type: 'boolean', label: 'Show Carousel' },
};

// ---------- REVIEW DOCUMENT (subcollection of hotels) ----------
export const REVIEW_SCHEMA = {
  hotelId: { type: 'string', required: true, label: 'Hotel ID' },
  userId: { type: 'string', required: true, label: 'User ID' },
  rating: { type: 'number', required: true, min: 1, max: 5, label: 'Overall Rating' },
  cleanliness: { type: 'number', min: 0, max: 5, label: 'Cleanliness' },
  food: { type: 'number', min: 0, max: 5, label: 'Food' },
  staff: { type: 'number', min: 0, max: 5, label: 'Staff' },
  location: { type: 'number', min: 0, max: 5, label: 'Location' },
  value: { type: 'number', min: 0, max: 5, label: 'Value' },
  comment: { type: 'string', label: 'Comment' },
  createdAt: { type: 'timestamp', readOnly: true, label: 'Created At' },
};

// ---------- REQUIRED FIELDS PER SECTION (for wizard validation) ----------
export const SECTION_REQUIRED_FIELDS = {
  basicInfo: ['name', 'hotelType', 'starRating'],
  contact: ['contactPhone', 'contactEmail'],
  checkInOut: ['checkInTime', 'checkOutTime'],
  location: ['address', 'city', 'country'],
  media: ['photos'],
  transport: [],
  foodDining: [],
  parking: [],
  propertyHighlights: [],
  policiesCompliance: [],
  // sub-collection sections use hotelId-based Firestore writes, not hotel doc fields
  attractions: [],
  categories: [],
  activity: [],
  reviews: [],
};

// ---------- FIRESTORE COLLECTION NAMES ----------
export const COLLECTIONS = {
  hotels: 'hotels',
  config: 'config',
  reviews: 'reviews',
  attractions: 'attractions',
  categories: 'categories',
  travelList: 'travelList',
  rooms: 'rooms',
  roomInstances: 'roomInstances',
  // Lookup / reference collections
  hotelTypes: 'hotelTypes',
  parkingTypes: 'parkingTypes',
  parkingCategories: 'parkingCategories',
  attractionCategories: 'attractionCategories',
  highlightCategories: 'highlightCategories',
  amenityTypes: 'amenityTypes',
  bedTypes: 'bedTypes',
  viewTypes: 'viewTypes',
  bathroomTypes: 'bathroomTypes',
};

// ---------- ATTRACTION DOCUMENT ----------
export const ATTRACTION_SCHEMA = {
  hotelId: { type: 'string', required: true, label: 'Hotel ID' },
  name: { type: 'string', required: true, label: 'Attraction Name' },
  category: {
    type: 'string',
    required: true,
    label: 'Category',
    lookupCollection: 'attractionCategories',
  },
  pictureable: { type: 'boolean', required: false, default: false, label: 'Photo Spot' },
  description: { type: 'string', required: false, label: 'Description / Travel Info' },
  media: { type: 'string', required: false, label: 'Photo URL' },
};

// ---------- CATEGORY DOCUMENT ----------
export const CATEGORY_SCHEMA = {
  hotelId: { type: 'string', required: true, label: 'Hotel ID' },
  name: { type: 'string', required: true, label: 'Category Name' },
  icon: { type: 'string', required: false, label: 'Icon (emoji)' },
  description: { type: 'string', required: false, label: 'Description' },
};

// ---------- ROOM CATEGORY DOCUMENT (subcollection-like, top-level with hotelId) ----------
export const ROOM_SCHEMA = {
  hotelId: { type: 'string', required: true, label: 'Hotel ID' },
  name: { type: 'string', required: true, label: 'Room Category Name' },
  description: { type: 'string', required: false, label: 'Description' },
  capacity: { type: 'number', required: true, label: 'Capacity (guests)' },
  maxOccupancy: { type: 'number', required: false, label: 'Max Occupancy' },
  price: { type: 'number', required: true, label: 'Price per Night (₹)' },
  tax: { type: 'number', required: false, label: 'Tax (%)' },
  available: { type: 'boolean', required: false, default: true, label: 'Available for Booking' },
  bedType: { type: 'string', required: false, label: 'Bed Type', lookupCollection: 'bedTypes' },
  noOfBeds: { type: 'number', required: false, label: 'Number of Beds' },
  view: { type: 'string', required: false, label: 'Room View' },
  roomSizeSqft: { type: 'number', required: false, label: 'Room Size (sqft)' },
  floor: { type: 'string', required: false, label: 'Floor' },
  bathroomType: { type: 'string', required: false, label: 'Bathroom Type' },
  smokingAllowed: { type: 'boolean', required: false, default: false, label: 'Smoking Allowed' },
  accessibilityFeatures: { type: 'array', required: false, label: 'Accessibility Features', itemType: 'string' },
  connectedRooms: { type: 'boolean', required: false, default: false, label: 'Connected Rooms Available' },
  extraGuestCharge: { type: 'number', required: false, label: 'Extra Guest Charge (₹)' },
  weekendPricing: {
    type: 'object', required: false, label: 'Weekend Pricing',
    fields: {
      fri: { type: 'number', label: 'Friday Price (₹)' },
      sat: { type: 'number', label: 'Saturday Price (₹)' },
    },
  },
  minStayNights: { type: 'number', required: false, label: 'Min Stay (nights)' },
  seasonalPricing: {
    type: 'array', required: false, label: 'Seasonal Pricing',
    itemSchema: {
      label: { type: 'string', label: 'Season Label' },
      from: { type: 'string', label: 'From (MM-DD)' },
      to: { type: 'string', label: 'To (MM-DD)' },
      price: { type: 'number', label: 'Price (₹)' },
    },
  },
  freeCancellation: { type: 'boolean', required: false, default: false, label: 'Free Cancellation' },
  cancellationPolicy: {
    type: 'object', required: false, label: 'Cancellation Policy',
    fields: {
      freeBefore: { type: 'number', label: 'Free Before (hours)' },
      refundPercent: { type: 'number', label: 'Refund Percent' },
      policyNote: { type: 'string', label: 'Policy Note' },
    },
  },
  amenities: { type: 'array', required: false, label: 'Amenities', itemType: 'string' },
  media: { type: 'array', required: false, label: 'Photos', itemType: 'string' },
  complimentaryBenefits: { type: 'array', required: false, label: 'Complimentary Benefits', itemType: 'string' },
  purchasableBenefits: { type: 'array', required: false, label: 'Purchasable Benefits', itemType: 'string' },
  createdAt: { type: 'timestamp', readOnly: true, label: 'Created At' },
  updatedAt: { type: 'timestamp', readOnly: true, label: 'Updated At' },
};

// ---------- ROOM INSTANCE DOCUMENT ----------
export const ROOM_INSTANCE_SCHEMA = {
  hotelId: { type: 'string', required: true, label: 'Hotel ID' },
  categoryId: { type: 'string', required: true, label: 'Room Category ID' },
  roomNumber: { type: 'string', required: true, label: 'Room Number' },
  status: {
    type: 'enum',
    required: true,
    default: 'AVAILABLE',
    options: ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'],
    label: 'Room Status',
  },
  currentStayId: { type: 'string', required: false, default: null, label: 'Current Stay ID' },
  overrides: {
    type: 'object', required: false, label: 'Per-Room Overrides',
    fields: {
      amenities: { type: 'array', label: 'Amenities override', itemType: 'string' },
      smokingAllowed: { type: 'boolean', label: 'Smoking override' },
      available: { type: 'boolean', label: 'Availability override' },
      floor: { type: 'string', label: 'Floor override' },
      notes: { type: 'string', label: 'Internal notes' },
    },
  },
  createdAt: { type: 'timestamp', readOnly: true, label: 'Created At' },
};

// ---------- TRAVEL LIST / ACTIVITY DOCUMENT ----------
export const TRAVEL_LIST_SCHEMA = {
  hotelId: { type: 'string', required: true, label: 'Hotel ID' },
  title: { type: 'string', required: true, label: 'Activity Title' },
  description: { type: 'string', required: false, label: 'Description' },
  category: { type: 'string', required: false, label: 'Category' },
  duration: { type: 'string', required: false, label: 'Duration' },
  price: { type: 'number', required: false, label: 'Price (₹)' },
  included: { type: 'boolean', required: false, default: false, label: 'Included in Package' },
  media: { type: 'string', required: false, label: 'Photo URL' },
};
