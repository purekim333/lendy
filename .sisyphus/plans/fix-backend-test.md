# Fix Backend Test Errors - Work Plan

## Context
- Backend bootrun 시 테스트 단계에서 에러 발생
- 원인 1: H2에서 `user` 테이블 이름이 예약어 충돌
- 원인 2: CartRepository JPQL 쿼리 경로 오타

## Required Changes

### 1. UserEntity.java
- `@Table(name = "USER")` → `@Table(name = "USERS")`

### 2. Cart.java
- 필드명 `userEntity` → `users`
- `@JoinColumn(name = "user_entity_id")` → `@JoinColumn(name = "users_id")`
- CartId 필드명 `userEntityId` → `usersId`

### 3. CartRepository.java
- JPQL 경로 수정: `com.lendy.backend.Product.entity.ProductImage` → `com.lendy.backend.product.entity.ProductImage`
- 메소드명: `deleteAllByUserEntity_Id` → `deleteAllByUsers_Id`

### 4. CartService.java
- `cartRepository.deleteAllByUserEntity_Id(user.getId())` → `cartRepository.deleteAllByUsers_Id(user.getId())`

## Verification
- `./gradlew test` 실행하여 테스트 통과 확인
