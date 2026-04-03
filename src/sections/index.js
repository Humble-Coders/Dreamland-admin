// sections/index.js — ordered list of wizard sections
// To add a section: add an entry here, create the component, update schema.js + SCHEMA.md

import {
  Building2, Phone, Clock, MapPin, Images, Bus,
  UtensilsCrossed, SquareParking, Sparkles, ShieldCheck,
  Tag, Landmark, Compass, Star,
} from 'lucide-react'

import BasicInfo from './BasicInfo'
import Contact from './Contact'
import CheckInOut from './CheckInOut'
import Location from './Location'
import Media from './Media'
import Transport from './Transport'
import FoodDining from './FoodDining'
import Parking from './Parking'
import PropertyHighlights from './PropertyHighlights'
import PoliciesCompliance from './PoliciesCompliance'
import Categories from './Categories'
import Attractions from './Attractions'
import Activity from './Activity'
import Reviews from './Reviews'

// Section IDs must match keys in SECTION_REQUIRED_FIELDS from schema.js
export const SECTIONS = [
  {
    id: 'basicInfo',
    label: 'Basic Info',
    description: 'Hotel name, type, star rating',
    icon: Building2,
    component: BasicInfo,
    required: true,
  },
  {
    id: 'contact',
    label: 'Contact',
    description: 'Phone, email, website',
    icon: Phone,
    component: Contact,
    required: true,
  },
  {
    id: 'checkInOut',
    label: 'Check-In / Check-Out',
    description: 'Times and fee policies',
    icon: Clock,
    component: CheckInOut,
    required: true,
  },
  {
    id: 'location',
    label: 'Location',
    description: 'Address, city, country, coordinates',
    icon: MapPin,
    component: Location,
    required: true,
  },
  {
    id: 'media',
    label: 'Photos',
    description: 'Upload hotel images',
    icon: Images,
    component: Media,
    required: true,
  },
  {
    id: 'transport',
    label: 'Transport',
    description: 'Nearby buses, trains, airport',
    icon: Bus,
    component: Transport,
    required: false,
  },
  {
    id: 'foodDining',
    label: 'Food & Dining',
    description: 'Meal plans and inclusivity',
    icon: UtensilsCrossed,
    component: FoodDining,
    required: false,
  },
  {
    id: 'parking',
    label: 'Parking',
    description: 'Parking availability and type',
    icon: SquareParking,
    component: Parking,
    required: false,
  },
  {
    id: 'propertyHighlights',
    label: 'Property Highlights',
    description: 'Amenities and special features',
    icon: Sparkles,
    component: PropertyHighlights,
    required: false,
  },
  {
    id: 'policiesCompliance',
    label: 'Policies & Compliance',
    description: 'Pet policy, age restriction, ID requirements',
    icon: ShieldCheck,
    component: PoliciesCompliance,
    required: false,
  },
  {
    id: 'categories',
    label: 'Categories',
    description: 'Hotel category tags',
    icon: Tag,
    component: Categories,
    required: false,
    usesHotelId: true,
  },
  {
    id: 'attractions',
    label: 'Nearby Attractions',
    description: 'Places to visit near the hotel',
    icon: Landmark,
    component: Attractions,
    required: false,
    usesHotelId: true,
  },
  {
    id: 'activity',
    label: 'Activities',
    description: 'Excursions and experiences',
    icon: Compass,
    component: Activity,
    required: false,
    usesHotelId: true,
  },
  {
    id: 'reviews',
    label: 'Guest Reviews',
    description: 'Read-only — reviews from guests',
    icon: Star,
    component: Reviews,
    required: false,
    usesHotelId: true,
    readOnly: true,
  },
]
