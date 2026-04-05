# Dreamland Firestore Schema Reference

> **Source of truth:** `src/schema.js`
> This file mirrors the schema in human-readable form.
> When you update `src/schema.js`, update this file too.
> Last updated: 2026-04-04

---

## Collection: `hotels`

### Basic Info
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✅ | Hotel name |
| `description` | string | — | Long description |
| `hotelType` | enum | ✅ | `resort` \| `boutique` \| `hostel` \| `villa` \| `homestay` |
| `starRating` | number | ✅ | 1–5 |
| `isActive` | boolean | — | Default: `true` |
| `isLuxury` | boolean | — | Default: `false` |
| `totalRooms` | number | — | Total room count |

### Contact
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `contactPhone` | string | ✅ | |
| `contactEmail` | string | ✅ | |
| `socialLinks` | string | — | Comma-separated or JSON |
| `website` | string | — | Full URL |

### Check-In / Check-Out
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `checkInTime` | string | ✅ | Default: `"14:00"` |
| `checkOutTime` | string | ✅ | Default: `"11:00"` |
| `earlyCheckInFee` | boolean | — | Default: `false` |
| `lateCheckOutFee` | boolean | — | Default: `false` |

### Location
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `address` | string | ✅ | Street address |
| `city` | string | ✅ | |
| `country` | string | ✅ | |
| `pincode` | string | — | ZIP / postal code |
| `latitude` | number | — | GeoPoint latitude |
| `longitude` | number | — | GeoPoint longitude |

### Media
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `photos` | string[] | ✅ | Min 1 item; Firebase Storage URLs |

### Transport (`modes` array)
Each item in `modes`:
| Field | Type | Notes |
|-------|------|-------|
| `category` | enum | `bus` \| `train` \| `airport` \| `metro` |
| `name` | string | Station / route name |
| `distance` | string | Human-readable e.g. "2.5 km" |
| `distanceInKm` | number | Numeric km |
| `detailed` | string | Description e.g. "15 mins by cab" |
| `cab` | boolean | Cab available |
| `auto` | boolean | Auto-rickshaw available |

### Food & Dining
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `mealPlansAvailable` | string[] | — | Options: `Breakfast`, `FullBoard`, `HB`, `RO` |
| `foodInclusivity` | boolean | — | Vegetarian / inclusive menu available |

### Parking
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `parkingAvailable` | boolean | — | Default: `false` |
| `parkingType` | string | — | Name from `parkingTypes` lookup — e.g. `covered`, `shared`, `guest`, `valet`, `paid`, `free` |
| `parkingCategory` | string | — | Name from `parkingCategories` lookup — e.g. `basement`, `surface`, `multi-level`, `rooftop`, `street`, `indoor` |
| `parkingSpots` | number | — | Total spots |

### Property Highlights (`highlights` array)
Each item:
| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Highlight name |
| `category` | string | Name from `highlightCategories` lookup — e.g. `hotel`, `shared`, `outdoor`, `cultural`, `water`, `wellness`, `entertainment` |
| `amenityType` | string | Name from `amenityTypes` lookup — e.g. `basic`, `shared`, `premium`, `exclusive` |

### Policies & Compliance
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `pdfRequired` | boolean | — | ID/document required at check-in |
| `privacyPremium` | boolean | — | Privacy premium rooms |
| `ageRestriction` | number | — | Min age, e.g. `18` |
| `petPolicy` | boolean | — | Pets allowed |

### Ratings *(read-only — updated by Cloud Functions)*
| Field | Type | Notes |
|-------|------|-------|
| `averageRating` | number | Overall average |
| `totalReviews` | number | Count |
| `ratingBreakdown.cleanliness` | number | 0–5 |
| `ratingBreakdown.food` | number | 0–5 |
| `ratingBreakdown.staff` | number | 0–5 |
| `ratingBreakdown.location` | number | 0–5 |
| `ratingBreakdown.value` | number | 0–5 |

### Meta
| Field | Type | Notes |
|-------|------|-------|
| `status` | enum | `active` \| `inactive` \| `draft` |
| `openingDate` | timestamp | Hotel opening date |
| `closingDate` | timestamp | Hotel closing / seasonal date |
| `createdAt` | timestamp | Auto-set on create |
| `updatedAt` | timestamp | Auto-set on update |

---

## Collection: `config`
| Field | Type | Notes |
|-------|------|-------|
| `document` | string | Policy document URL |
| `support` | string | Support page URL |
| `privacyCenter` | string | Privacy centre URL |
| `termsAndConditions` | string | T&C URL |
| `footerPage` | string | Footer content |
| `carousel` | boolean | Show hero carousel |

---

## Subcollection: `hotels/{hotelId}/reviews`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `hotelId` | string | ✅ | Parent hotel reference |
| `userId` | string | ✅ | Reviewer user ID |
| `rating` | number | ✅ | 1–5 overall |
| `cleanliness` | number | — | 0–5 |
| `food` | number | — | 0–5 |
| `staff` | number | — | 0–5 |
| `location` | number | — | 0–5 |
| `value` | number | — | 0–5 |
| `comment` | string | — | Text review |
| `createdAt` | timestamp | — | Auto-set |

---

## Collection: `rooms` *(Room Categories)*
Top-level collection; documents reference a hotel via `hotelId`. Each doc represents a room type/category.
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `hotelId` | string | ✅ | Parent hotel ID |
| `name` | string | ✅ | Room category name e.g. "Deluxe Suite" |
| `description` | string | — | Optional description |
| `capacity` | number | ✅ | Default guest capacity |
| `maxOccupancy` | number | — | Max allowed guests |
| `price` | number | ✅ | Base price per night (₹) |
| `tax` | number | — | Tax percentage |
| `available` | boolean | — | Default: `true` |
| `bedType` | enum | — | `single` \| `twin` \| `double` \| `queen` \| `king` \| `bunk` |
| `noOfBeds` | number | — | Number of beds |
| `view` | string | — | e.g. "Sea View", "Garden View" |
| `roomSizeSqft` | number | — | Room size in sqft |
| `floor` | string | — | Default floor e.g. "3rd floor" |
| `bathroomType` | string | — | e.g. "Attached", "Shared" |
| `smokingAllowed` | boolean | — | Default: `false` |
| `accessibilityFeatures` | string[] | — | e.g. `["Wheelchair Accessible"]` |
| `connectedRooms` | boolean | — | Default: `false` |
| `extraGuestCharge` | number | — | Charge per extra guest (₹) |
| `weekendPricing` | object | — | `{ fri: number, sat: number }` prices in ₹ |
| `minStayNights` | number | — | Minimum booking nights |
| `seasonalPricing` | array | — | `[{ label, from (MM-DD), to (MM-DD), price }]` |
| `freeCancellation` | boolean | — | Default: `false` |
| `cancellationPolicy` | object | — | `{ freeBefore (hours), refundPercent, policyNote }` |
| `amenities` | string[] | — | List of amenity strings |
| `media` | string[] | — | Firebase Storage photo URLs |
| `complimentaryBenefits` | string[] | — | Included extras e.g. "Breakfast Included" |
| `purchasableBenefits` | string[] | — | Add-ons e.g. "Spa Package" |
| `createdAt` | timestamp | — | Auto-set on create |
| `updatedAt` | timestamp | — | Auto-set on update |

---

## Collection: `roomInstances`
Individual physical rooms. Each doc is one room number, referencing its category.
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `hotelId` | string | ✅ | Parent hotel ID |
| `categoryId` | string | ✅ | Reference to `rooms` doc |
| `roomNumber` | string | ✅ | Physical room identifier e.g. "101" |
| `overrides` | object | — | Per-room field overrides (see below) |
| `createdAt` | timestamp | — | Auto-set on create |

### `overrides` object (all fields optional)
| Field | Type | Notes |
|-------|------|-------|
| `amenities` | string[] | Replaces category amenities for this room |
| `smokingAllowed` | boolean | Overrides category default |
| `available` | boolean | Mark individual room unavailable |
| `floor` | string | Overrides category floor |
| `notes` | string | Internal notes for this room |

---

## Collection: `attractions`
Top-level collection; documents reference a hotel via `hotelId`.
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `hotelId` | string | ✅ | Parent hotel ID |
| `name` | string | ✅ | Attraction name |
| `categoryId` | string | ✅ | Reference to `attractionCategories` doc |
| `category` | string | ✅ | Denormalised name from `attractionCategories` |
| `description` | string | — | Travel info / description |
| `pictureable` | boolean | — | Good photo spot |
| `media` | string | — | Photo URL |
| `createdAt` | timestamp | — | Auto-set on create |

---

## Collection: `categories`
Hotel tag/category labels (e.g. Family-Friendly, Romantic). Top-level collection referencing a hotel.
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `hotelId` | string | ✅ | Parent hotel ID |
| `name` | string | ✅ | Category label |
| `icon` | string | — | Emoji icon |
| `description` | string | — | Optional description |
| `createdAt` | timestamp | — | Auto-set on create |

---

## Collection: `travelList` *(Activities)*
Activities / experiences offered by or near the hotel.
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `hotelId` | string | ✅ | Parent hotel ID |
| `title` | string | ✅ | Activity name |
| `category` | string | — | e.g. `adventure`, `leisure`, `cultural`, `wellness`, `water sports`, `trekking`, `sightseeing`, `food tour` |
| `description` | string | — | Brief description |
| `duration` | string | — | Human-readable e.g. "2 hours" |
| `price` | number | — | Price in ₹; `null` if free |
| `included` | boolean | — | Included in hotel package |
| `media` | string | — | Photo URL |
| `createdAt` | timestamp | — | Auto-set on create |

---

## Lookup Collections
Seeded automatically on first use. Each document has a `name` field and `createdAt` timestamp.

| Collection | Default Seed Values |
|------------|---------------------|
| `parkingTypes` | `covered`, `shared`, `guest`, `valet`, `paid`, `free` |
| `parkingCategories` | `basement`, `surface`, `multi-level`, `rooftop`, `street`, `indoor` |
| `highlightCategories` | `hotel`, `shared`, `outdoor`, `cultural`, `water`, `wellness`, `entertainment` |
| `amenityTypes` | `basic`, `shared`, `premium`, `exclusive` |
| `attractionCategories` | `religious`, `nature`, `shopping`, `food`, `heritage`, `adventure` |

---

## Required Fields Per Wizard Section
| Section | Required Fields |
|---------|----------------|
| Basic Info | `name`, `hotelType`, `starRating` |
| Contact | `contactPhone`, `contactEmail` |
| Check-In/Out | `checkInTime`, `checkOutTime` |
| Location | `address`, `city`, `country` |
| Media | `photos` (min 1) |
| Transport | *(optional)* |
| Food & Dining | *(optional)* |
| Parking | *(optional)* |
| Property Highlights | *(optional)* |
| Policies & Compliance | *(optional)* |
