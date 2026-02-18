package com.lendy.backend.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "USER_ADDRESS")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "label", nullable = false, length = 30)
    private String label;

    @Column(name = "receiver_name", nullable = false, length = 50)
    private String receiverName;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "zip_code", nullable = false, length = 10)
    private String zipCode;

    @Column(name = "address1", nullable = false, length = 200)
    private String address1;

    @Column(name = "address2", nullable = false, length = 200)
    private String address2;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    private UserAddress(Long userId, String label, String receiverName, String phone,
                        String zipCode, String address1, String address2, Boolean isDefault) {
        this.userId = userId;
        this.label = label != null ? label : "";
        this.receiverName = receiverName;
        this.phone = phone;
        this.zipCode = zipCode;
        this.address1 = address1;
        this.address2 = address2 != null ? address2 : "";
        this.isDefault = isDefault != null ? isDefault : false;
    }

    public void update(String label, String receiverName, String phone,
                       String zipCode, String address1, String address2, Boolean isDefault) {
        this.label = label != null ? label : "";
        this.receiverName = receiverName;
        this.phone = phone;
        this.zipCode = zipCode;
        this.address1 = address1;
        this.address2 = address2 != null ? address2 : "";
        this.isDefault = isDefault != null ? isDefault : this.isDefault;
    }

    public void clearDefault() {
        this.isDefault = false;
    }
}
