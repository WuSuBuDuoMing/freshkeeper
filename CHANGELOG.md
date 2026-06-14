# Changelog

## v2.4.0 — Security & Documentation (2026-06-14)

### Changed
- Security policy, documentation enhancements, open-source best practices

## v2.2.0 — Local Optimization & Documentation (2026-06-14)

### Changed
- Local optimization and performance improvements
- CHANGELOG sync and version alignment
- Documentation updates across project

## v2.1.0 — Quality Optimization (2026-06-11)

### Documentation
- Rewrote README.md with English docs, badges, architecture overview, and contributing guide
- Created comprehensive README.zh-CN.md with full Chinese documentation
- Added docs/data-model.md with complete data model schema, category system, and storage key mapping

### Code Quality
- Removed console.log leftovers from subscription-service.js (4 instances)
- Cleaned up junk files (test.txt, test-write.txt) from root, services/, and utils/
- Updated app.js globalData.version from 1.0.0 to 2.1.0

### Test Coverage
- Added food expiry logic tests (13 tests): date-utils boundary cases, food-utils status calculation, food-service expiry queries
- Added recipe matching tests (12 tests): recommendation algorithm validation, score system, cache behavior
- Added shopping list tests (18 tests): full CRUD coverage, groupByCategory, calculateTotalPrice, addFromUsedFood

### Performance
- Added debounce (200ms) to fridge page search input to reduce redundant filter operations
- Avoided redundant data reload on fridge page onShow when data is already loaded
- Identified 13/22 components unused by any page (reserved for future features)

## v2.0.0 — Initial Open-Source Release (2026-06-01)

### Features
- Fridge management with category filtering and search
- Food expiry alerts with tiered warnings
- Shopping list with cost estimation
- AI recipe recommendations based on fridge contents
- Weekly menu auto-generation
- Statistics and waste tracking
- Dark mode support
- Accessibility settings (font size, high contrast, color blind modes)
- i18n support (Chinese and English)
- Photo-based food recognition (mock mode)
- Data export (CSV/JSON)
- Family sharing with invite codes
- Nutrition tracking

### Technical
- WeChat Mini Program native development
- Page → Service → Storage three-layer architecture
- 10 pages, 22 components, 12 service modules, 16 utility modules
- Unified API layer with interceptors, cache, retry, and cancellation
