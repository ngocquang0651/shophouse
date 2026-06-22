# AGENTS.md

## Project Brief

Build a Next.js ecommerce web app named **LuxeStore**. The app is inspired by the luxury shopping experience on ZALORA's Luxury page, but the implementation must use original layout, copy, styling, and component structure.

The MVP focuses on two core experiences:

- A polished login flow.
- A complete home page for a luxury fashion ecommerce storefront.

The site should feel premium, modern, easy to scan, and practical for shopping. Prioritize a real usable storefront over a marketing landing page.

## Tech Stack

- Next.js with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui where it fits the project
- lucide-react for icons
- Mock authentication unless a backend is explicitly added
- Mock product/category/brand data in TypeScript files

## Core Pages

### Login Page

Route: `/login`

Requirements:

- Email and password fields.
- Basic validation for required fields and email format.
- Loading state on submit.
- Error state for invalid credentials.
- Successful login redirects to the home page.
- Use this mock account unless another auth system is added:
  - Email: `user@example.com`
  - Password: `password123`
- The UI should look refined, minimal, and appropriate for a luxury fashion store.

### Home Page

Route: `/`

Requirements:

- Sticky header with:
  - LuxeStore logo
  - Main navigation: Women, Men, Luxury, Sports, Beauty, Kids
  - Search input
  - Login or user menu
  - Cart icon
- Hero area for the luxury collection.
- Category section with:
  - Women's Bags
  - Women's Accessories
  - Women's Shoes
  - Women's Clothing
  - Men
  - Fine Jewellery
  - Beauty
  - Outlet
  - Pre-Loved
- Top brands section with examples such as:
  - ALDO
  - Lacoste
  - Nike
  - Calvin Klein
  - New Balance
  - Adidas
  - Kate Spade
  - Coach
  - Michael Kors
  - BOSS
  - COS
- Product grid for luxury fashion products.
- Product cards should include:
  - Product image
  - Brand
  - Product name
  - Current price
  - Original price when discounted
  - Badge such as New, Sale, or Luxury
- Intro/content sections covering:
  - Luxe Haven
  - Discover Exclusivity
  - Authentic Luxury
  - Luxury for Less
- Footer links:
  - About
  - Privacy
  - Terms
  - Contact
  - Help

## Optional Future Pages

Only add these after the MVP is complete or if explicitly requested:

- Product listing page by category.
- Product detail page.
- Mock cart page.
- Profile page for authenticated users.
- Wishlist.
- Checkout mock.
- Admin product management.

## UX And Visual Direction

- Use a premium ecommerce style: clean spacing, clear hierarchy, restrained colors, and crisp product presentation.
- Favor white, black, gray, and subtle champagne/gold accents.
- Avoid copying ZALORA's exact UI.
- Avoid one-note color palettes.
- Avoid decorative gradient blobs, oversized marketing sections, and unnecessary cards.
- The first screen should immediately communicate a shopping experience.
- Product grids should be easy to scan on desktop and mobile.
- Header must not cover page content.
- Text must not overflow on mobile.
- Buttons, inputs, menus, and cards must have clear hover, focus, disabled, and loading states.
- Use lucide-react icons for common actions such as search, cart, user, menu, heart, and logout.

## Suggested Folder Structure

```text
app/
  layout.tsx
  page.tsx
  login/
    page.tsx
components/
  AuthForm.tsx
  BrandSection.tsx
  CategoryGrid.tsx
  Footer.tsx
  Header.tsx
  Hero.tsx
  ProductCard.tsx
data/
  brands.ts
  categories.ts
  products.ts
lib/
  auth.ts
  utils.ts
types/
  product.ts
```

Follow existing project structure if it already differs from this suggestion.

## Implementation Plan

### Phase 1: Project Setup

- Initialize or verify Next.js, TypeScript, and Tailwind CSS.
- Install required dependencies.
- Configure global styles, theme tokens, and base layout.
- Confirm the app runs with `npm run dev`.

### Phase 2: Mock Data

- Create category data.
- Create brand data.
- Create product data with realistic luxury fashion examples.
- Add product types.
- Add formatting utilities such as currency formatting.

### Phase 3: Authentication

- Build a mock login helper.
- Build the login form.
- Validate user input.
- Persist login state with a simple client-side method unless a real auth system is added.
- Add logout behavior.
- Show authenticated user state in the header.

### Phase 4: Shared Layout

- Build the header.
- Build navigation.
- Build search UI.
- Build user/cart actions.
- Build footer.
- Verify responsive behavior.

### Phase 5: Home Page

- Build the hero section.
- Build category grid.
- Build top brands section.
- Build product grid.
- Build luxury intro/content sections.
- Wire all sections into the home page.

### Phase 6: Polish And Verification

- Test valid and invalid login attempts.
- Test responsive layouts for mobile, tablet, and desktop.
- Check hover/focus/loading states.
- Run lint/build commands where available.
- Update README with setup and run instructions if README exists or is requested.

## Task Checklist

- Setup Next.js app and dependencies.
- Configure Tailwind and global styles.
- Create data models and mock data.
- Implement login page.
- Implement mock auth state.
- Implement header and footer.
- Implement hero.
- Implement category grid.
- Implement brand section.
- Implement product cards and product grid.
- Implement home page content sections.
- Verify responsiveness.
- Run lint/build checks.

## Definition Of Done

The MVP is complete when:

- `/` renders a polished luxury ecommerce home page.
- `/login` renders a functional login page.
- Mock login works with `user@example.com` and `password123`.
- Logout works.
- Header reflects login state.
- Home page includes navigation, hero, categories, brands, products, content sections, and footer.
- The UI is responsive and does not have obvious text overflow or broken layout.
- The project runs locally with the documented dev command.

## Engineering Guidelines

- Keep components small and focused.
- Prefer typed mock data over hardcoded repeated JSX.
- Use existing project conventions if the codebase already has them.
- Avoid broad refactors unrelated to the current task.
- Do not introduce a backend unless explicitly requested.
- Do not add optional pages until the MVP is stable.
- Use accessible labels for forms and icon buttons.
- Keep code readable and avoid unnecessary abstractions.

## Backend Roadmap

Build a basic NestJS backend with MongoDB when the project is ready to move beyond frontend mock data and localStorage.

Backend goals:

- Authenticate users and admins.
- Store users and products in MongoDB.
- Protect admin-only product mutations with JWT and role guards.
- Expose product CRUD APIs for the Next.js frontend.
- Replace frontend mock auth and local product storage with API calls.

### Backend Tech Stack

- NestJS
- TypeScript
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing
- class-validator
- class-transformer
- @nestjs/config

### Backend Folder Structure

Create the backend in a separate root folder:

```text
backend/
  src/
    main.ts
    app.module.ts
    auth/
      auth.module.ts
      auth.controller.ts
      auth.service.ts
      dto/
        login.dto.ts
      decorators/
        roles.decorator.ts
      guards/
        jwt-auth.guard.ts
        roles.guard.ts
      strategies/
        jwt.strategy.ts
    users/
      users.module.ts
      users.service.ts
      schemas/
        user.schema.ts
    products/
      products.module.ts
      products.controller.ts
      products.service.ts
      dto/
        create-product.dto.ts
        update-product.dto.ts
      schemas/
        product.schema.ts
    common/
      enums/
        user-role.enum.ts
        product-badge.enum.ts
        product-status.enum.ts
```

### Backend Environment

Use a backend `.env` file:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/luxestore
JWT_SECRET=luxestore_dev_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### MongoDB Models

Users collection:

```ts
{
  email: string;
  password: string;
  name: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}
```

Products collection:

```ts
{
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge: "New" | "Sale" | "Luxury";
  description?: string;
  stock: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}
```

### Backend API

Auth:

```http
POST /auth/login
```

Products:

```http
GET /products
GET /products/:id
POST /products
PATCH /products/:id
DELETE /products/:id
```

Only `GET /products` and `GET /products/:id` are public. Create, update, and delete must require an authenticated admin.

Support filters for product listing:

```http
GET /products?search=coach&category=Women's%20Bags&badge=Sale&status=active
```

### Milestone 1: Initialize Backend

- Create `backend/`.
- Initialize a NestJS project.
- Install dependencies:
  - `@nestjs/config`
  - `@nestjs/mongoose`
  - `mongoose`
  - `@nestjs/jwt`
  - `@nestjs/passport`
  - `passport`
  - `passport-jwt`
  - `bcrypt`
  - `class-validator`
  - `class-transformer`
- Configure `ConfigModule`.
- Configure `MongooseModule`.
- Enable CORS for the frontend URL.
- Enable global validation pipe in `main.ts`.
- Confirm backend runs at `http://localhost:4000`.

### Milestone 2: Users Module

- Create `UserRole` enum.
- Create `User` schema.
- Create `UsersModule`.
- Create `UsersService`.
- Add methods:
  - `findByEmail(email)`
  - `findById(id)`
  - `createUser(data)`
- Seed default accounts:
  - `admin@example.com` / `admin123` / role `admin`
  - `user@example.com` / `password123` / role `user`
- Hash passwords with bcrypt.
- Ensure the seed can run more than once without duplicates.

### Milestone 3: Auth Module

- Create `AuthModule`.
- Create `AuthController`.
- Create `AuthService`.
- Create `LoginDto`.
- Validate email and password.
- Create `POST /auth/login`.
- Compare password with bcrypt.
- Return JWT plus user object.
- Create JWT strategy.
- Create `JwtAuthGuard`.
- JWT payload should include:
  - `sub`
  - `email`
  - `role`

Expected login response:

```json
{
  "accessToken": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "admin@example.com",
    "name": "Store Admin",
    "role": "admin"
  }
}
```

### Milestone 4: Admin Authorization

- Create `@Roles()` decorator.
- Create `RolesGuard`.
- Check `request.user.role`.
- Apply `JwtAuthGuard` and `RolesGuard` to admin-only product routes.
- Verify normal users receive `403 Forbidden` for admin mutations.

### Milestone 5: Products Module

- Create product enums:
  - `ProductBadge`
  - `ProductStatus`
- Create `Product` schema.
- Create `ProductsModule`.
- Create `ProductsController`.
- Create `ProductsService`.
- Create `CreateProductDto`.
- Create `UpdateProductDto`.
- Validate fields:
  - `name` is required.
  - `brand` is required.
  - `category` is required.
  - `price` must be greater than 0.
  - `originalPrice` is optional and must be greater than 0 when present.
  - `image` is required.
  - `badge` must be a valid enum value.
  - `stock` must be 0 or greater.
  - `status` must be a valid enum value.
- Implement service methods:
  - `findAll(filters)`
  - `findOne(id)`
  - `create(dto)`
  - `update(id, dto)`
  - `remove(id)`

### Milestone 6: Seed Products

- Create a seed script for users and products.
- Copy initial product values from the frontend `data/products.ts`.
- Add default values for backend-only fields:
  - `description`
  - `stock`
  - `status`
- Add a backend npm script:

```json
{
  "seed": "ts-node src/seed.ts"
}
```

- Ensure repeated seed runs do not duplicate products.

### Milestone 7: Backend API Testing

Test the backend before wiring the frontend.

Login admin:

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

Get products:

```bash
curl http://localhost:4000/products
```

Create product as admin:

```bash
curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Test Product","brand":"Coach","category":"Women","price":100,"image":"https://example.com/image.jpg","badge":"New","stock":5,"status":"active"}'
```

Also verify:

- Wrong login returns `401 Unauthorized`.
- User token cannot create, update, or delete products.
- Admin token can create, update, and delete products.

### Milestone 8: Frontend API Client

Add frontend environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Create:

```text
lib/api.ts
lib/token.ts
```

`lib/token.ts` should expose:

- `getAccessToken()`
- `setAccessToken(token)`
- `clearAccessToken()`

`lib/api.ts` should expose helpers for:

- `GET`
- `POST`
- `PATCH`
- `DELETE`

Attach `Authorization: Bearer TOKEN` automatically when a token exists.

### Milestone 9: Connect Frontend Auth

Replace mock login in `lib/auth.ts` with backend login:

- `login(email, password)` calls `POST /auth/login`.
- Store `accessToken`.
- Store user data.
- Keep `logout()` clearing token and user.
- Keep `getCurrentUser()` for header/admin guard state.
- Redirect admin users to `/admin/products`.

Handle API auth errors:

- `401` should clear auth and send users back to `/login`.
- `403` should show unauthorized UI.

### Milestone 10: Connect Admin Products

Replace localStorage product CRUD in `lib/product-store.ts` with backend API calls:

- `getProducts()` calls `GET /products`.
- `createProduct()` calls `POST /products`.
- `updateProduct()` calls `PATCH /products/:id`.
- `deleteProduct()` calls `DELETE /products/:id`.

Update the admin page to support:

- Loading state.
- Error state.
- Refetch product list after create, update, and delete.
- Unauthorized handling for `401` and `403`.

### Milestone 11: Connect Home Page Products

Replace static frontend product import on the home page with backend data.

Preferred approach:

- Fetch products from `GET /products`.
- Render product grid from API results.
- Keep a graceful fallback if backend is unavailable.

Acceptable approaches:

- Server-side fetch in `app/page.tsx`.
- Client-side product grid component with loading and error states.

### Milestone 12: Full Stack Run

Run MongoDB:

```bash
mongod
```

Or Docker:

```bash
docker run -d --name luxestore-mongo -p 27017:27017 mongo:7
```

Run backend:

```bash
cd backend
npm run start:dev
```

Run frontend:

```bash
npm run dev
```

Expected local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- MongoDB: `mongodb://localhost:27017/luxestore`

## Backend And Integration Checklist

- MongoDB connects successfully.
- Backend starts without errors.
- Users seed successfully.
- Products seed successfully.
- Admin login works.
- User login works.
- JWT guard works.
- Role guard works.
- `GET /products` works publicly.
- `POST /products` is admin-only.
- `PATCH /products/:id` is admin-only.
- `DELETE /products/:id` is admin-only.
- Frontend login calls backend.
- Frontend stores JWT token.
- Frontend admin product table loads products from MongoDB.
- Frontend create product saves to MongoDB.
- Frontend edit product saves to MongoDB.
- Frontend delete product removes product from MongoDB.
- Home page product grid loads products from MongoDB.
- Browser refresh keeps data because MongoDB is the source of truth.

## Backend Definition Of Done

The backend and frontend integration are complete when:

- NestJS runs at `http://localhost:4000`.
- MongoDB stores users and products.
- `admin@example.com` / `admin123` can login and manage products.
- `user@example.com` / `password123` can login but cannot mutate products.
- Product create, edit, delete, list, and detail APIs work.
- Admin page uses real backend APIs instead of local product storage.
- Home page reads products from MongoDB through the backend.
- Lint/build checks pass for both frontend and backend.
