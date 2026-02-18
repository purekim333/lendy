package com.lendy.backend.user.controller;

import com.lendy.backend.user.dto.AddressDTO;
import com.lendy.backend.user.entity.UserAddress;
import com.lendy.backend.user.entity.UserEntity;
import com.lendy.backend.user.repository.UserAddressRepository;
import com.lendy.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final UserAddressRepository addressRepository;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<List<AddressDTO>> list() {
        Long userId = getCurrentUserId();
        List<AddressDTO> addresses = addressRepository
                .findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(AddressDTO::of)
                .toList();
        return ResponseEntity.ok(addresses);
    }

    @PostMapping
    public ResponseEntity<AddressDTO> create(@RequestBody AddressDTO dto) {
        Long userId = getCurrentUserId();

        // 기본 배송지로 설정하면 기존 기본 배송지 해제
        if (Boolean.TRUE.equals(dto.getIsDefault())) {
            clearDefaults(userId);
        }

        // 첫 번째 배송지는 자동으로 기본 배송지
        List<UserAddress> existing = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
        boolean shouldBeDefault = existing.isEmpty() || Boolean.TRUE.equals(dto.getIsDefault());

        UserAddress address = UserAddress.builder()
                .userId(userId)
                .label(dto.getLabel())
                .receiverName(dto.getReceiverName())
                .phone(dto.getPhone())
                .zipCode(dto.getZipCode())
                .address1(dto.getAddress1())
                .address2(dto.getAddress2())
                .isDefault(shouldBeDefault)
                .build();

        UserAddress saved = addressRepository.save(address);
        return ResponseEntity.status(HttpStatus.CREATED).body(AddressDTO.of(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressDTO> update(@PathVariable Long id, @RequestBody AddressDTO dto) {
        Long userId = getCurrentUserId();
        UserAddress address = addressRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));

        if (!address.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        if (Boolean.TRUE.equals(dto.getIsDefault())) {
            clearDefaults(userId);
        }

        address.update(dto.getLabel(), dto.getReceiverName(), dto.getPhone(),
                dto.getZipCode(), dto.getAddress1(), dto.getAddress2(), dto.getIsDefault());

        UserAddress saved = addressRepository.save(address);
        return ResponseEntity.ok(AddressDTO.of(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        UserAddress address = addressRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));

        if (!address.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        addressRepository.delete(address);
        return ResponseEntity.ok().build();
    }

    private void clearDefaults(Long userId) {
        addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .filter(UserAddress::getIsDefault)
                .forEach(addr -> {
                    addr.clearDefault();
                    addressRepository.save(addr);
                });
    }
}
