package com.lendy.backend.user.dto;

import com.lendy.backend.user.entity.UserAddress;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressDTO {
    private Long id;
    private String label;
    private String receiverName;
    private String phone;
    private String zipCode;
    private String address1;
    private String address2;
    private Boolean isDefault;

    public static AddressDTO of(UserAddress entity) {
        return AddressDTO.builder()
                .id(entity.getId())
                .label(entity.getLabel())
                .receiverName(entity.getReceiverName())
                .phone(entity.getPhone())
                .zipCode(entity.getZipCode())
                .address1(entity.getAddress1())
                .address2(entity.getAddress2())
                .isDefault(entity.getIsDefault())
                .build();
    }
}
