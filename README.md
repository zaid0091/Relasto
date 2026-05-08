# Relasto — Real Estate Marketplace

Full-stack real estate marketplace built with **Django REST Framework** (backend) and **React 19 + Vite 7** (frontend).

## Architecture Overview

```
┌─ backend/          Django REST API (port 8000)
│  ├─ backend/       Project settings (settings.py, urls.py)
│  ├─ apps/          7 domain apps (accounts, profiles, properties, reviews, visits, search, common)
│  └─ media/         Uploaded images (properties/, profiles/)
│
└─ frontend/         React SPA (port 5173)
   └─ src/
      ├─ pages/      16 route pages
      ├─ components/ 9 reusable components
      ├─ contexts/   AuthContext (global auth state)
      └─ services/   Axios API client module
```

## Quick Start

### Backend

```bash
cd backend    # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata datadump.json    # seed sample data
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` — the Vite dev server proxies `/media` to `localhost:8000`.

## Backend Reference

### Entry Points

| File | Purpose |
|---|---|
| `manage.py` | Django CLI entry (sets settings module, runs commands) |
| `backend/__init__.py` | Empty; Python package marker |
| `backend/settings.py` | **Full Django configuration**: 8 custom apps, DRF + JWT + CORS + drf-spectacular, PostgreSQL (env-driven, falls back to SQLite), SIMPLE_JWT (7hr access / 7-day refresh), CORS origin localhost:5173, REST_FRAMEWORK defaults, Google OAuth client ID, commented-out AWS SES + Staticfiles config |
| `backend/urls.py` | **Root URLConf**: `admin/`, `api/auth/` → accounts, `api/` → profiles/properties/reviews/search/visits; `+ static(media)` in DEBUG |
| `backend/asgi.py` | Standard ASGI app (`get_asgi_application()`) |
| `backend/wsgi.py` | Standard WSGI app (`get_wsgi_application()`) |
| `requirements.txt` | Python dependencies (Django 6+, DRF, simplejwt, corsheaders, drf-spectacular, django-filter, python-decouple, google-auth, Pillow, psycopg2-binary, django-cleanup) |
| `.env` | PostgreSQL credentials (DB_ENGINE, DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT) |
| `datadump.json` | DB fixture with sample users (admin, zaidliaqat, dukhi0999, etc.) |
| `db.sqlite3` | Fallback SQLite database |

### accounts (users & auth)

| File | Purpose |
|---|---|
| `models.py` | **`User(AbstractUser)`**: email is USERNAME_FIELD (unique, indexed), `is_active`, timestamps; `Meta.db_table='users'`; `__str__` returns email |
| `serializers.py` | **`UserRegistrationSerializer`**: validates email/username uniqueness, password match/strength, creates with `is_agent` flag. **`UserLoginSerializer`**: email + password. **`UserSerializer`**: returns user + profile data + tokens + `is_agent`. **`TokenRefreshSerializer`**: refresh_token field. **`PasswordChangeSerializer`**: old_password + new_password with `validate_old_password` |
| `views.py` | 9 views: **RegisterView** (POST), **LoginView** (POST returns user+tokens), **LogoutView** (blacklists tokens), **RefreshTokenView** (new access), **ProfileView** (GET/PATCH current user), **ChangePasswordView** (POST), **GoogleLoginView** (verifies Google ID token, returns JWT), **health_check**, **debug_blacklist** |
| `urls.py` | 9 routes: register, login, logout, google-login, refresh, profile, change-password, health, debug-blacklist |
| `services.py` | **`AuthService`**: `register_user()` (validates, creates user + sets is_agent on profile), `authenticate_user()` (email auth via `authenticate()`), `google_authenticate()` (extracts from Google ID token, creates if new) |
| `authentication.py` | **`JWTAuthentication`**: extends simplejwt — `get_validated_token()` checks `BlacklistedToken.is_blacklisted(jti)` after super; `get_user()` loads user by user_id from token, raises if inactive |
| `middleware.py` | **`JWTBlacklistMiddleware`**: extracts Bearer token from Authorization header, decodes jti, checks blacklist; returns 401 JSON if blacklisted; passes through on any exception |
| `signals.py` | `post_save on User`: creates Profile (get_or_create) on creation; saves profile on every save |
| `utils.py` | **`TokenService`**: `generate_tokens()` creates RefreshToken with custom claims (email, username, is_agent, is_admin), returns dict; `refresh_token()` decodes refresh, creates new access; `blacklist_tokens()`/`blacklist_token()` add jti to BlacklistedToken; `cleanup_expired_tokens()` deletes expired entries; `get_token_from_request()` extracts Bearer string |
| `admin.py` | **`UserAdmin(BaseUserAdmin)`**: adds created_at/updated_at fields; list_display=email, username, is_active, is_staff, created_at |

### profiles

| File | Purpose |
|---|---|
| `models.py` | **`Profile(BaseModel)`**: OneToOneField→User (PK=user), bio, profile_image, phone (RegexValidator), address/city/state/zip_code, is_agent (indexed, default=False), experience, property_types, area, license_no, average_rating (FloatField default=0), review_count; `full_name` property returns user name or username; `Meta.db_table='profiles'` |
| `serializers.py` | **`ProfileSerializer`**: nested `user` object (id/email/username/first_name/last_name), full_name read-only, review_count read-only, profile_image via SerializerMethodField (absolute URL). **`ProfileUpdateSerializer`**: validates phone regex, lat/lng range, license_no, property_types, area. **`AgentSearchSerializer`**: extends with rating info |
| `views.py` | **`ProfileViewSet(ModelViewSet)`**: AllowAny; `list()` returns only agents; `retrieve()` by PK; `me()` GET current user's profile; `update_me()` PATCH via service; `toggle_agent()` POST flips is_agent; `search_agents()` GET with Q search (name/city/state/area) + ordering by average_rating; `get_serializer_class()` switches on action |
| `urls.py` | DefaultRouter + 4 extra endpoints: me, update_me, toggle_agent, search_agents |
| `services.py` | **`ProfileService`**: `get_user_profile()`, `get_profile_by_id()`, `update_profile()` (validates and saves all profile fields), `toggle_agent_status()` (flips is_agent, sets all properties to pending if becoming non-agent), `search_agents()` (Q filtering + ordering by rating/reviews) |
| `admin.py` | **`ProfileAdmin`**: list_display=user, is_agent, phone, created_at |

### properties

| File | Purpose |
|---|---|
| `models.py` | **`property_image_upload_path()`**: generates `property_{prop_id}_{img_id}.{ext}` path. **`PropertyManager`**: `for_agent()` filter. **`Property(BaseModel)`**: agent (FK→Profile), slug (unique), title, description, price (Decimal max_digits=12), property_type/residential/commercial/industrial/agricultural), status (sale/rent/sold/rented/pending), address/city/state/zip_code, lat/lng, bedrooms/bathrooms (Decimal), square_feet/lot_size/year_built (PositiveInteger), attributes+features (JSONField); `save()` auto-generates slug. **`PropertyImage(BaseModel)`**: property_ref FK, image, alt_text, is_primary, display_order. **`PropertyFeature(BaseModel)`**: property FK, feature_key, feature_value (unique_together) |
| `serializers.py` | **`PropertySerializer`**: nested images, features, agent info, status_display, property_type_display, primary_image. **`PropertyCreateSerializer`**: validates price>0, type/status in choices. **`PropertyUpdateSerializer`**: all fields optional. **`PropertyListSerializer`**: primary_image only (lighter payload) |
| `views.py` | **`PropertyViewSet(ModelViewSet)`**: IsAuthenticatedOrReadOnly; filter_backends=[DjangoFilter, SearchFilter, OrderingFilter]; `search_fields`=title/description/address/city/state; `filterset_fields`=property_type/status/city/state; `get_serializer_class()` switches on action; `get_queryset()` select_related+prefetch_related; `list()` supports price_min/price_max/bedrooms Q filtering; `retrieve()` by slug or PK; `create/update/destroy` with ownership checks; `my_properties()` agent's listings; `upload_images()` POST multipart; `delete_image()` DELETE; `universal_search()` searches both properties+agents |
| `urls.py` | DefaultRouter + `/my_properties/` endpoint |
| `services.py` | **`PropertyService`**: `create_property()` (atomic, validates agent+price), `update_property()` (checks ownership), `delete_property()` (checks ownership), `get_property_by_slug()` (eager load), `get_agent_properties()` (paginated), `upload_images()` (first=primary), `delete_image()` (file+DB), `get_filtered_properties()` (Q across price/bedrooms/search) |
| `admin.py` | **`PropertyAdmin`**: list_display=title, agent, price, status, type, city, created_at |

### reviews

| File | Purpose |
|---|---|
| `models.py` | **`Review(BaseModel)`**: reviewer (FK→User), agent_profile (FK→Profile, limit_choices_to={'is_agent':True}), rating (1-5 via Min/MaxValueValidator), comment; `Meta.unique_together=(reviewer, agent_profile)` — one review per user per agent; `save()` prevents self-review; signals recalculate average_rating+review_count on Profile |
| `serializers.py` | **`ReviewSerializer`**: nested reviewer (id/username/first_name/last_name/profile_image), nested agent (id/username/avg_rating/review_count), rating_display. **`ReviewCreateSerializer`**: validates rating 1-5, checks unique agent_profile. **`ReviewUpdateSerializer`**: optional fields |
| `views.py` | **`ReviewViewSet(ModelViewSet)`**: IsAuthenticatedOrReadOnly (list AllowAny); `list()` requires agent_id query param; `create()` sets reviewer=request.user; `update/partial_update/destroy` check IsReviewAuthor; `my_reviews()` current user's reviews; `agent_summary()` aggregate stats (count, avg, distribution, recent); `can_review()` checks eligibility |
| `urls.py` | DefaultRouter + 3 extra endpoints: my_reviews, agent_summary, can_review |
| `services.py` | **`ReviewService`**: `create_or_update_review()` (prevents self, validates, update_or_create, recalculates average), `get_reviews_for_agent()` (paginated), `get_review_summary()` (aggregate stats with percentage distribution), `can_review_agent()` (checks self/duplicate/agent-active), `update_agent_average_rating()` (calculates and saves to Profile) |
| `admin.py` | **`ReviewAdmin`**: list_display=id, agent_profile, reviewer, rating, created_at |

### visits

| File | Purpose |
|---|---|
| `models.py` | **`VisitRequest(BaseModel)`**: STATUS_CHOICES (pending/reviewed/completed/cancelled), user FK, property FK, agent FK (limit_choices_to={'is_agent':True}), preferred_date (DateField), contact_phone/message, status (default='pending'), is_reviewed; `clean()` validates property.agent==agent and date is future |
| `serializers.py` | **`VisitRequestSerializer`**: nested user, property, agent. **`VisitRequestCreateSerializer`**: validates date (not past), email format, phone format. **`VisitRequestUpdateSerializer`**: status + is_reviewed. **UserVisitRequestListSerializer** / **AgentVisitRequestListSerializer**: simplified variants |
| `views.py` | **`VisitRequestViewSet(ModelViewSet)`**: AllowAny; `list()` filters by role (user→own, agent→received, admin→all); `create()` requires auth; `update/partial_update/destroy` with ownership checks; `my_requests()`/`agent_requests()`/`property_requests()`/`summary()` dashboard endpoints |
| `urls.py` | DefaultRouter + 4 extra endpoints: my_requests, agent_requests, property_requests, summary |
| `services.py` | **`VisitRequestService`**: `create_visit_request()` (validates property/agent/date, creates with contact details), `update_request_status()` (agent-only, validates transition), `get_requests_for_user/agent/property()` (paginated, filtered), `get_summary_stats()` (status counts for dashboard) |
| `admin.py` | **`VisitRequestAdmin`**: list_display=id, property, user, agent, preferred_date, status |

### search

| File | Purpose |
|---|---|
| `views.py` | **`SearchViewSet(viewsets.ViewSet)`**: AllowAny; `list()` reads `q` query param, searches Properties (`__icontains` on title/description/address/city/state, limit 10) and Agent Profiles (first_name/last_name/city/state/area, is_agent=True, limit 10), returns combined `{properties, agents, total_results, query}` |
| `urls.py` | DefaultRouter at empty prefix (URL: `/api/search/`) |

### common (shared infrastructure)

| File | Purpose |
|---|---|
| `models.py` | **`BaseModel`** (abstract): created_at, updated_at, `Meta.ordering=['-created_at']`. **`BlacklistedToken`**: jti (unique), token_type, blacklisted_at, expires_at; classmethods: `is_blacklisted(jti)`, `blacklist_token(jti, type, expires)`, `cleanup_expired()` |
| `exceptions.py` | **`ValidationErrorResponse`** (400), **`OwnershipError`** (403), **`BusinessLogicError`** (409); **`custom_exception_handler()`**: logs exception with user context, formats unknown errors as `{status, error, code}` |
| `pagination.py` | **`StandardPagination`**: page_size=20, max=100; response shape: `{status, data, pagination:{total, count, page, page_size, total_pages, has_next, has_previous}}`. **`LargePagination`**: page_size=100, max=500 |
| `permissions.py` | **`IsOwner`** (abstract), **`IsProfileOwner`** (obj.user==request.user), **`IsPropertyOwner`** (obj.agent.user==request.user/staff), **`IsReviewAuthor`** (obj.reviewer==request.user/staff), **`IsAgentForRequest`** (obj.agent.user==request.user/staff), **`IsAgentUser`** (request.user.profile.is_agent), **`IsAdminUser`** (staff) |

### api (stub — NOT registered in INSTALLED_APPS, NOT included in root urls.py)

| File | Purpose |
|---|---|
| `views.py` | `hello()` view returning `{"message": "Hello from Django"}` |
| `urls.py` | `/hello/` route (wired but not included by root) |

### media/

| Path | Contents |
|---|---|
| `media/properties/` | 22 uploaded property images (filenames like `property_8_None_*.jpg`, `property_4_None.webp`) |
| `media/profiles/` | 7 uploaded profile images (`bulb.webp`, `sad.jpg`, `table.webp`, `default*.jpg` variants) |

---

## Frontend Reference

### Entry & Root Files

| File | Purpose |
|---|---|
| `src/main.jsx` | Renders `<App>` inside `<GoogleOAuthProvider>` (client ID from env) + StrictMode |
| `src/App.jsx` | BrowserRouter + AuthProvider; sets `<title>` per route (Relasto \| Home/Properties/etc.); 16 routes with Navbar/Footer; ProtectedRoute guards AddProperty, Dashboard, Profile |
| `src/index.css` | `@import "tailwindcss"` + smooth scroll |
| `vite.config.js` | React + Tailwind v4 plugins; dev proxy `/media` → `localhost:8000` |
| `package.json` | React 19, Vite 7, Tailwind v4, react-router-dom 7, axios, lucide-react, @react-oauth/google, @emailjs/browser |
| `index.html` | Inter font from Google Fonts, `<div id="root">`, loads `/src/main.jsx` |
| `.env` | VITE_API_URL, VITE_GOOGLE_CLIENT_ID, VITE_EMAILJS_* (service ID, public key, template ID) |

### State & API Layer

| File | Purpose |
|---|---|
| `src/contexts/AuthContext.jsx` | `useReducer` with 11 action types; state: user, isAuthenticated, isLoading, error; provides `login()`, `register()`, `googleLogin()`, `logout()`, `updateProfile()`; on mount attempts LOAD_USER from stored tokens; exports `useAuth()` hook |
| `src/services/api.js` | Axios instance (baseURL=VITE_API_URL); request interceptor injects Bearer token; response interceptor retries on 401 (refreshes token once); exports `BASE_URL` + 6 API modules: `authAPI` (login/register/logout/googleLogin/refresh/password/health), `profilesAPI` (CRUD + me/toggleAgent/search), `propertiesAPI` (CRUD + my/uploadImages/deleteImage/search), `reviewsAPI` (CRUD + myReviews/agentSummary/canReview), `visitsAPI` (CRUD + my/agent/propertyRequests/summary), `searchAPI` |

### Reusable Components

| File | Purpose |
|---|---|
| `Navbar.jsx` | Responsive nav with logo, search bar, dropdown menus (Home/Listing/Agents/Blog/Pages/About/Contact), auth-aware user menu (profile image, Dashboard link, Logout), mobile hamburger drawer |
| `Footer.jsx` | 5-column grid: logo+social, Listing links, Support, Others, Newsletter; copyright + payment icons |
| `ProtectedRoute.jsx` | Spinner while loading; if unauthenticated → clear tokens + Navigate to /login; else render children |
| `LoginForm.jsx` | Email + password inputs, validation, show/hide toggle, Google OAuth button, error display, register link |
| `RegisterForm.jsx` | Email + username + password + confirm + is_agent + terms checkboxes; password complexity; Google OAuth; error display |
| `PropertyCard.jsx` | Card with image, formatted price, status badge (color-coded), title, address, bedrooms/bathrooms, square_feet, agent name; links to `/property/{slug}` |
| `PropertyGrid.jsx` | Responsive grid (1-4 cols) with loading skeleton (8 pulse cards), error retry, empty state, pagination with ellipsis |
| `SearchFilter.jsx` | Expandable panel: text search, type/status/city/state dropdowns, price range, ordering; onChange callback; reset button |
| `VisitRequestModal.jsx` | Modal: date picker, phone, email (pre-filled), message; submit with loading/success/auto-close states; backdrop click dismisses |

### Pages (16)

| Page | Route | Purpose |
|---|---|---|
| `HomePage.jsx` | `/` | Hero with search tabs, Features grid, Stats counter, Featured Properties (tabbed by type), Gallery, Testimonials, Blog section, Newsletter CTA |
| `LoginPage.jsx` | `/login` | Wraps LoginForm; redirects auth'd users to `/` |
| `RegisterPage.jsx` | `/register` | Wraps RegisterForm; redirects auth'd users to `/dashboard` |
| `PropertiesPage.jsx` | `/properties` | Full listing: sidebar filters, active filter tags, grid + pagination (9/page) |
| `PropertyDetailPage.jsx` | `/property/:slug` | Image gallery modal, price info, monthly estimate, location scores, highlights table, features, agent sidebar card, visit request form, latest listings |
| `AgentsPage.jsx` | `/agents` | Agent directory: search + sort, cards with rating stars/pagination |
| `AgentProfilePage.jsx` | `/agents/:id` | Cover image, profile card, stats, tabs: Properties (grid), Reviews (list + form modal), About, Contact; 6 properties/page |
| `SearchResultsPage.jsx` | `/search` | Query display, properties grid + agents grid, total results count, empty state |
| `AboutPage.jsx` | `/about` | Hero, stats counter, mission, "How It Works" 3-step, core values, CTA |
| `ContactPage.jsx` | `/contact` | EmailJS contact form, success/error feedback, office address, social links |
| `BlogPage.jsx` | `/blog` | Blog listing: search, category tabs, sort, cards (image/badge/date/excerpt), pagination |
| `BlogDetailPage.jsx` | `/blog/:slug` | Full article: hero, author info, content sections, share buttons, save button, sidebar |
| `DashboardPage.jsx` | `/dashboard` | Tabs: Overview (stats), My Properties (table + actions), My Reviews (CRUD), Received Reviews, Visit Requests (status management) |
| `AddPropertyPage.jsx` | `/add-property` and `/edit-property/:slug` | Create/Edit: title/desc/price/type/status/address/beds/baths/sqft/lot/year, dynamic features, image upload with preview/reorder, existing image management |
| `ProfilePage.jsx` | `/profile` | Two-column: avatar upload, name/email/bio/phone/city/state/address; agent-only: experience/license/property_types/area; saves to AuthContext |
| `NotFoundPage.jsx` | `*` | 404: giant "404", "Oops! Page Not Found", two CTA buttons, quick links grid |

## Routes Summary

```
# Backend API (under /api/)
auth/register/              POST   Register
auth/login/                 POST   Login
auth/logout/                POST   Logout
auth/google-login/          POST   Google OAuth
auth/refresh/               POST   Refresh token
auth/profile/               GET    Get my profile
                               PATCH  Update my profile
auth/change-password/       POST   Change password
auth/health/                GET    Health check
auth/debug-blacklist/       GET    Debug blacklisted tokens

profiles/                   GET    List agents
profiles/{id}/              GET    Agent detail
profiles/me/                GET    My profile
profiles/update-me/         PATCH  Update profile
profiles/toggle-agent/      POST   Toggle agent status
profiles/search-agents/     GET    Search agents

properties/                 GET    List / POST Create
properties/{slug}/          GET    Detail / PUT/PATCH/DELETE
properties/my-properties/   GET    My properties
properties/{slug}/upload-images/    POST
properties/{slug}/delete-image/{img_id}/  DELETE
properties/universal-search/        GET

reviews/                    GET    List (requires agent_id)
reviews/{id}/               GET/PUT/PATCH/DELETE
reviews/my-reviews/         GET
reviews/agent-summary/      GET
reviews/can-review/         GET

visit-requests/             GET    List / POST Create
visit-requests/{id}/        GET/PUT/PATCH/DELETE
visit-requests/my-requests/         GET
visit-requests/agent-requests/      GET
visit-requests/property-requests/   GET
visit-requests/summary/             GET

search/                     GET    ?q=query

# Frontend SPA
/                           Home
/login                      Login
/register                   Register
/properties                 Properties listing
/property/:slug             Property detail
/agents                     Agents directory
/agents/:id                 Agent profile
/search                     Search results
/about                      About
/contact                    Contact
/blog                       Blog listing
/blog/:slug                 Blog detail
/dashboard                  Dashboard
/add-property               Add property
/edit-property/:slug        Edit property
/profile                    User profile
*                           404 Not Found
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **Custom User model** with email as USERNAME_FIELD | Email-based auth instead of username |
| **Profile separated from User** (OneToOneField, PK=user) | Isolates auth data from profile/business data |
| **`apps/` package structure** — each domain is a Django app | Modular domain separation; each app owns its models/serializers/views/services |
| **`services.py` pattern** — views call services, never implement domain rules | Business logic is testable and reusable outside HTTP |
| **Token blacklisting** — BlacklistedToken model + middleware + custom JWT auth | Defense-in-depth; revoked tokens rejected at both middleware and DRF auth levels |
| **Slug auto-generation** on Property.save() | SEO-friendly URLs without manual input |
| **One review per user per agent** — DB unique_together | No duplicate reviews; enforced at DB level |
| **SearchViewSet** (unmanaged ViewSet, no model) | Combined property+agent search without a DB view |
| **Vite proxy `/media` → localhost:8000** | Frontend can display uploaded images without CORS issues during dev |
| **EmailJS /static blog pages** | Contact form and blog bypass backend entirely (no mail server, no CMS) |
| **JWT in localStorage** | Simple token storage; access token refreshed automatically on 401 |

## Auth Flow

1. User logs in → backend returns `{user, tokens: {access, refresh, expires_in}}`
2. Frontend stores tokens in localStorage
3. Axios interceptor adds `Authorization: Bearer <access>` to every request
4. On 401 response, interceptor POSTs to `/auth/refresh/` with stored refresh_token
5. New access token stored; original request retried once
6. Logout POSTs to `/auth/logout/` + blacklists both tokens + clears localStorage

## Google OAuth Flow

1. Frontend renders Google Sign-In button via `@react-oauth/google`
2. Google returns credential (ID token) to frontend callback
3. Frontend POSTs `{credential}` to `/api/auth/google-login/`
4. Backend verifies ID token via `google.oauth2.id_token.verify_oauth2_token`
5. If valid, extracts email/name/sub; creates User if new; returns JWT tokens

## Style & Code Conventions

- **Backend**: Class-based views, service layer per app, Django REST Framework serializers
- **Frontend**: Functional components with hooks, Tailwind CSS v4 utility classes, Lucide icons
- **No comments in code** — code should be self-documenting
- **Naming**: PascalCase for components, camelCase for JS variables, snake_case for Python
