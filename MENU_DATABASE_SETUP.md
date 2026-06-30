# Menu & Categories Database Setup Guide

## Database Structure

### Collections Hierarchy

```
firestore/
├── category/
│   ├── Biryani's/
│   │   ├── name: "Biryani's" (optional, doc.id is used if missing)
│   │   ├── createdAt: "2026-04-10T..."
│   │   ├── updatedAt: "2026-04-10T..."
│   │   └── dishes/ (subcollection)
│   │       ├── {timestamp}
│   │       │   ├── name: "Chicken Biryani"
│   │       │   ├── description: "Spiced chicken rice..."
│   │       │   ├── price: 12.35
│   │       │   ├── goldPrice: 11.12
│   │       │   ├── image: "https://..."
│   │       │   ├── available: true
│   │       │   ├── offerAvailable: false
│   │       │   ├── discount: 0
│   │       │   └── addons: []
│   │       └── {timestamp}
│   │           └── ...
│   │
│   ├── "Breads and Extra"/
│   ├── "Charcoal Kebabs"/
│   ├── "Chicken curries"/
│   ├── "Desserts"/
│   ├── "Drinks"/
│   ├── "Lamb curries"/
│   └── "Starters"/
```

## Category Names (Document IDs)

These must match exactly:

```
- Biryani's
- Breads and Extra
- Charcoal Kebabs
- Chicken curries
- Desserts
- Drinks
- Lamb curries
- Starters
```

## Dish Document Fields

| Field | Type | Required | Example |
|-------|------|----------|---------|
| name | string | ✅ | "Chicken Biryani" |
| description | string | ✅ | "Chicken Biryani" |
| price | number | ✅ | 12.35 |
| goldPrice | number | ✅ | 11.12 |
| image | string | ✅ | "https://..." |
| available | boolean | ✅ | true |
| offerAvailable | boolean | ✅ | false |
| discount | number | ✅ | 0 |
| addons | array | ❌ | [] |

## Frontend Rendering Flow

1. **MenuBar.tsx** → Calls `categoriesAPI.getCategories()`
2. **categories.ts API** → Gets `/categories` from backend
3. **Backend Category Controller** → Returns array of category names
4. **OrderSection.tsx** → Gets categories and shows sidebar
5. **User selects category** → Calls `dishesAPI.getDishesByCategory(category)`
6. **Backend Dish Controller** → Fetches dishes from `category/{categoryName}/dishes`
7. **Frontend renders dishes** → Uses ArchedCard or MenuCard components

## Verification Checklist

- [ ] All 8 categories exist as documents in `category/` collection
- [ ] Each category has a `name` field (or document ID will be used as fallback)
- [ ] Each category has a `dishes` subcollection
- [ ] Each dish has all required fields (name, description, price, image, etc.)
- [ ] `available: true` for dishes that should display
- [ ] Image URLs are valid and accessible
- [ ] Categories appear in sidebar when visiting /order or /menu page
- [ ] Dishes render when clicking a category
- [ ] Prices display correctly (gold price for gold members, regular for others)

## Testing API Endpoints

### Get Categories
```bash
curl http://localhost:5000/categories
# Expected response: ["Biryani's", "Breads and Extra", ...]
```

### Get Dishes by Category
```bash
curl http://localhost:5000/dishes/category/Biryani%27s
# Expected response: [{ dishId: "...", name: "...", price: ..., }, ...]
```

## Common Issues & Solutions

### Issue: Categories not appearing in sidebar
- **Check**: Are all 8 categories in the `category/` collection?
- **Fix**: If missing, create them through the admin panel or API

### Issue: Dishes not showing for a category
- **Check**: Does the category have a `dishes` subcollection?
- **Fix**: The first dish creation will auto-create the subcollection

### Issue: Dishes showing but not rendering properly
- **Check**: Do all dishes have required fields?
- **Fix**: Missing fields will cause rendering errors

### Issue: Wrong prices displaying
- **Check**: Is the `goldPrice` set for all dishes?
- **Fix**: Update dish document with correct `goldPrice` field

## Database Seeding (Sample Data)

Use the SAMPLE_DISHES constant in `src/constants/menu.constants.ts` as a reference for correct data structure.

```typescript
import { SAMPLE_DISHES } from '@/constants/menu.constants';
// Use these values when creating dishes via admin panel
```

## Frontend Constants

All category names are defined in `src/constants/menu.constants.ts`:

```typescript
export const CATEGORY_NAMES = {
  BIRYANI: "Biryani's",
  BREADS_EXTRA: "Breads and Extra",
  CHARCOAL_KEBABS: "Charcoal Kebabs",
  // ... etc
};
```

Use these constants instead of hardcoding strings to ensure consistency.

