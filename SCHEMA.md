# Dreamland Firestore Schema Reference

> **Source of truth:** `src/schema.js`
> This file mirrors the schema in human-readable form.
> When you update `src/schema.js`, update this file too.
> Last updated: 2026-03-31

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
| `parkingType` | enum | — | `covered` \| `shared` \| `guest` \| `valet` |
| `parkingSpots` | number | — | Total spots |

### Property Highlights (`highlights` array)
Each item:
| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Highlight name |
| `category` | enum | `hotel` \| `shared` \| `outdoor` \| `cultural` \| `water` |
| `amenityType` | enum | `basic` \| `shared` |

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
