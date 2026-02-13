# BACKEND KNOWLEDGE BASE

## OVERVIEW
Spring Boot 3.5 (Java 17) API service with domain packages for cart, product, user, and JWT auth.

## STRUCTURE
```text
backend/
├── src/main/java/com/lendy/backend/
│   ├── Cart/
│   ├── Product/
│   ├── User/
│   ├── Jwt/
│   └── common/
├── src/main/resources/
├── src/test/java/
├── build.gradle
└── Dockerfile
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Application bootstrap | `src/main/java/com/lendy/backend/BackendApplication.java` | enables scheduling |
| Cart REST endpoints | `src/main/java/com/lendy/backend/Cart/controller/CartController.java` | `/api/v1/cart/*` |
| User CRUD/profile endpoints | `src/main/java/com/lendy/backend/User/controller/UserController.java` | `/user` routes |
| Token refresh/login flow | `src/main/java/com/lendy/backend/Jwt/service/JwtService.java` | token parse/rotate logic hotspot |
| Security boundary | `src/main/java/com/lendy/backend/User/config/SecurityConfig.java` | auth policy wiring |
| Global exception mapping | `src/main/java/com/lendy/backend/common/config/CustomControllerAdvice.java` | shared error handling |
| Runtime properties | `src/main/resources/application.properties` | DB/OAuth/AWS config keys |
| Backend tests | `src/test/java/com/lendy/backend/BackendApplicationTests.java` | minimal context-load test |

## CONVENTIONS
- Package names use domain-first grouping, then layer (`controller`, `service`, `repository`, `entity`, `dto`).
- Controllers return `ResponseEntity` for most API responses.
- Cart endpoints are versioned (`/api/v1/cart`); user endpoints are currently unversioned (`/user`).
- OAuth providers configured in properties for naver/kakao/google.

## ANTI-PATTERNS (THIS DIRECTORY)
- Do not assume every controller has full implementation (`ProductController` is currently stubbed).
- Do not rely on backend Docker image to run tests; Docker build uses `-x test`.
- Do not commit secrets from `.env`/properties substitutions.

## UNIQUE STYLES
- JWT flow is split across `Jwt/filter`, `Jwt/handler`, `Jwt/service`, and `Jwt/repository`.
- Cart service contains most cart business logic in a single class (`CartService.java`).
- Mixed package casing exists (`Cart/Entity` vs `Product/entity`), so use exact existing paths.

## COMMANDS
```bash
cd backend && ./gradlew test -x integrationTest
cd backend && ./gradlew bootJar
docker build -t lendy-backend:latest -f backend/Dockerfile .
```

## NOTES
- `src/main/resources/.env` is imported via `spring.config.import` in `application.properties`.
- Test coverage is currently thin; protect critical auth/cart paths with focused tests before large refactors.
