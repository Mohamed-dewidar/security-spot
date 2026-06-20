# Bundle Builder — Components

Component reference for the frontend. See [../docs/FRONTEND_PLAN.md](../docs/FRONTEND_PLAN.md) for implementation phases and [../AGENTS.md](../AGENTS.md) for architecture rules.

## Conventions

- **Container** — reads context / selectors, dispatches actions
- **Presentation** — props in, callbacks out; no direct `api.*` or reducer access
- **Responsive** — each UI component is done for desktop, tablet, and mobile before moving on
- Components **never** import `bundle.json` — only `api.*`

## Breakpoint mapping

| Tailwind       | Figma node | View    |
| -------------- | ---------- | ------- |
| `lg+`          | `1:342`    | Desktop |
| `md`           | `1:27`     | Tablet  |
| default / `sm` | `1:658`    | Mobile  |

## Component index

| Component                             | Type         | Description                                       |
| ------------------------------------- | ------------ | ------------------------------------------------- |
| [`App`](#app)                         | Container    | App root; bootstraps catalog and configuration    |
| [`BundleProvider`](#bundleprovider)   | Container    | Global state via context and debounced API sync   |
| [`BundleLayout`](#bundlelayout)       | Presentation | Responsive page shell for builder + review        |
| [`BuilderPanel`](#builderpanel)       | Container    | Left column; orchestrates 4-step accordion        |
| [`AccordionStep`](#accordionstep)     | Presentation | One builder step with collapsible header and body |
| [`StepHeader`](#stepheader)           | Presentation | Clickable accordion header for a single step      |
| [`ProductList`](#productlist)         | Presentation | Renders all products in one step                  |
| [`ProductCard`](#productcard)         | Presentation | Single product with variants and qty              |
| [`VariantChips`](#variantchips)       | Presentation | Variant picker on a product card                  |
| [`NextStepButton`](#nextstepbutton)   | Presentation | Advances to the next builder step                 |
| [`ReviewPanel`](#reviewpanel)         | Container    | Right column; live bundle summary                 |
| [`ReviewGroup`](#reviewgroup)         | Presentation | One review section (Cameras, Sensors, etc.)       |
| [`ReviewLine`](#reviewline)           | Presentation | One line per variant with qty > 0                 |
| [`ReviewTotals`](#reviewtotals)       | Presentation | Order summary below line items                    |
| [`ReviewActions`](#reviewactions)     | Presentation | Primary actions at bottom of review               |
| [`QuantityStepper`](#quantitystepper) | Presentation | Shared +/- control (card + review)                |
| [`PriceBlock`](#priceblock)           | Presentation | Formatted price display                           |

## Component tree

```
App (container)
└── BundleProvider (container)
    └── BundleLayout (presentation)
        ├── BuilderPanel (container)
        │   ├── AccordionStep × 4 (presentation)
        │   │   ├── StepHeader
        │   │   └── ProductList
        │   │       └── ProductCard × n
        │   │           ├── VariantChips (optional)
        │   │           ├── PriceBlock
        │   │           └── QuantityStepper (optional)
        │   └── NextStepButton
        └── ReviewPanel (container)
            ├── ReviewGroup × 4
            │   └── ReviewLine × n
            │       ├── PriceBlock
            │       └── QuantityStepper
            ├── ReviewTotals
            └── ReviewActions
```

## Folder structure

```
client/src/components/
├── layout/
│   └── BundleLayout.tsx
├── builder/
│   ├── BuilderPanel.tsx
│   ├── AccordionStep.tsx
│   ├── StepHeader.tsx
│   ├── ProductList.tsx
│   ├── ProductCard.tsx
│   ├── VariantChips.tsx
│   └── NextStepButton.tsx
├── review/
│   ├── ReviewPanel.tsx
│   ├── ReviewGroup.tsx
│   ├── ReviewLine.tsx
│   ├── ReviewTotals.tsx
│   └── ReviewActions.tsx
└── shared/
    ├── QuantityStepper.tsx
    └── PriceBlock.tsx
```

---

## Layout

### App

**Type:** Container  
**File:** `src/App.tsx`

Bootstraps the app: loads catalog, restores or creates configuration, handles loading/error states.

**Contains:** Loading/error UI, `BundleProvider`, `BundleLayout`

**Behavior:**

1. `api.getConfig()` → catalog
2. Check localStorage for saved snapshot
3. Restore or `api.createConfiguration()` with `initialSelections`
4. Render provider + layout

---

### BundleProvider

**Type:** Container  
**File:** `src/state/bundleContext.tsx`

Provides global bundle state and debounced sync to the API.

**Contains:** React Context, reducer instance, sync hook, `useBundleState` / `useBundleDispatch` hooks

**State (mutable):** `selections`, `activeVariants`, `openStepId`, `configurationId`

**Not stored:** totals, review lines, step counts (selectors derive these)

---

### BundleLayout

**Type:** Presentation  
**File:** `src/components/layout/BundleLayout.tsx`

Responsive page shell that positions builder and review columns.

**Contains:** Page wrapper, main slot (builder), aside/bottom slot (review)

**Props:** `builder: ReactNode`, `review: ReactNode`

**Responsive:**

- Desktop (`lg+`): two columns side by side
- Tablet (`md`): two columns, adjusted widths/gaps
- Mobile: stack builder above review, or drawer/bottom per Figma `1:658`

---

## Builder (left column)

### BuilderPanel

**Type:** Container  
**File:** `src/components/builder/BuilderPanel.tsx`

Orchestrates the 4-step accordion builder.

**Contains:** `AccordionStep` × 4, `NextStepButton`

**Reads:** catalog steps, `openStepId`, per-step selected counts (selectors)

**Dispatches:** `SET_OPEN_STEP`, `SET_QUANTITY`, `SET_ACTIVE_VARIANT`

---

### AccordionStep

**Type:** Presentation  
**File:** `src/components/builder/AccordionStep.tsx`

One builder step — composes header and collapsible product list.

**Contains:** `StepHeader`, `ProductList` (when open)

**Props:** `step`, `isOpen`, `selectedCount`, `products`, `onToggle`, qty/variant callbacks

---

### StepHeader

**Type:** Presentation  
**File:** `src/components/builder/StepHeader.tsx`

Clickable accordion header. **Child of `AccordionStep`**, not a direct child of `BuilderPanel`.

**Contains:** Step title, “N selected” text, expand/collapse chevron, accessible toggle button

**Props:** `title`, `selectedCount`, `isOpen`, `onToggle`

---

### ProductList

**Type:** Presentation  
**File:** `src/components/builder/ProductList.tsx`

Maps step products to cards.

**Contains:** Vertical list of `ProductCard` with spacing

**Props:** `products`, per-product active variant, quantity, callbacks

---

### ProductCard

**Type:** Presentation  
**File:** `src/components/builder/ProductCard.tsx`

Single catalog product in the builder. Primary vertical slice for responsive work.

**Contains:** Image, optional badge, title, `VariantChips`, `PriceBlock`, `QuantityStepper`

**Props:**

```tsx
{
  product: Product
  activeVariantId: string | null
  quantity: number          // active variant only
  onVariantChange: (variantId: string) => void
  onQuantityChange: (qty: number) => void
}
```

**Responsive:** Desktop may use horizontal layout; mobile stacks image above content.

---

### VariantChips

**Type:** Presentation  
**File:** `src/components/builder/VariantChips.tsx`

Variant picker on a product card.

**Contains:** Row of chip buttons; optional color swatch

**Props:** `variants`, `activeVariantId`, `onSelect`

**Note:** Full selected-chip styling may be deferred per brief — behavior first.

---

### NextStepButton

**Type:** Presentation  
**File:** `src/components/builder/NextStepButton.tsx`

Advances user to the next builder step.

**Contains:** “Next: …” label, optional arrow icon

**Props:** `label`, `onClick`, `disabled?`

---

## Review (right column)

### ReviewPanel

**Type:** Container  
**File:** `src/components/review/ReviewPanel.tsx`

Live summary — “Your security system”.

**Contains:** Panel title, `ReviewGroup` × 4, `ReviewTotals`, `ReviewActions`

**Reads:** `selectReviewLines()`, `selectTotals()`

**Dispatches:** `SET_QUANTITY`; Save for later → `storage` + optional `api.saveConfiguration`

---

### ReviewGroup

**Type:** Presentation  
**File:** `src/components/review/ReviewGroup.tsx`

One grouped section in the review panel.

**Contains:** Section heading (Cameras, Sensors, Accessories, Plan), list of `ReviewLine`

**Props:** `title`, `lines`, `onQuantityChange`

---

### ReviewLine

**Type:** Presentation  
**File:** `src/components/review/ReviewLine.tsx`

One selected item — **one variant with qty > 0**.

**Contains:** Product name, variant label, `PriceBlock`, `QuantityStepper`, optional thumbnail

**Props:** `lineKey`, `label`, `variantLabel?`, `quantity`, prices, `onQuantityChange`

**Critical:** Lists every variant with qty > 0, independent of active chip on the card.

---

### ReviewTotals

**Type:** Presentation  
**File:** `src/components/review/ReviewTotals.tsx`

Order summary numbers below line items.

**Contains:** Shipping, guarantee, financing, total, compare-at, savings

**Props:** Precomputed `totals` object from selector — no pricing math in component

---

### ReviewActions

**Type:** Presentation  
**File:** `src/components/review/ReviewActions.tsx`

Primary actions at the bottom of the review panel.

**Contains:** Checkout button (placeholder), Save my system for later

**Props:** `onCheckout`, `onSaveForLater`, optional `isSaving` / `saved` feedback

---

## Shared

### QuantityStepper

**Type:** Presentation  
**File:** `src/components/shared/QuantityStepper.tsx`

Shared +/- control on product cards and review lines. **Must stay in sync** via the same reducer key.

**Contains:** Minus button, quantity display, plus button, min/max bounds, aria labels

**Props:** `value`, `min?`, `max?`, `onChange`, `disabled?`

**Responsive:** Larger tap targets on mobile (`min-h-11` or similar)

---

### PriceBlock

**Type:** Presentation  
**File:** `src/components/shared/PriceBlock.tsx`

Consistent price formatting wherever prices appear.

**Contains:** Current price, optional struck-through compare-at, optional suffix (`/mo`)

**Props:** `price`, `compareAtPrice?`, `format?: 'unit' | 'line' | 'monthly'`

---

## Responsive checklist (per UI component)

Before marking a component done:

- [ ] Desktop Figma `1:342`
- [ ] Tablet Figma `1:27`
- [ ] Mobile Figma `1:658`
- [ ] No horizontal overflow at 320px
- [ ] Touch-friendly stepper/chips on mobile

## Logic modules (not components)

| Module    | File                         | Role                                   |
| --------- | ---------------------------- | -------------------------------------- |
| Reducer   | `src/state/bundleReducer.ts` | Selections, active variants, open step |
| Selectors | `src/state/selectors.ts`     | Review lines, totals, step counts      |
| Keys      | `src/state/keys.ts`          | `selectionKey(productId, variantId?)`  |
| Pricing   | `src/lib/pricing.ts`         | Client preview totals                  |
| Storage   | `src/lib/storage.ts`         | localStorage save/restore              |
| API       | `src/api/client.ts`          | Single data door                       |
| Sync      | `src/sync/optimisticSync.ts` | Debounced PATCH (~400ms)               |
