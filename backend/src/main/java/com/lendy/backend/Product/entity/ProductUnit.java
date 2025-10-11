//package com.lendy.backend.Product.entity;
//
//import jakarta.persistence.*;
//import lombok.AccessLevel;
//import lombok.AllArgsConstructor;
//import lombok.Getter;
//import lombok.NoArgsConstructor;
//
//@Entity
//@Table(name = "PRODUCT_UNIT")
//@Getter
//@NoArgsConstructor(access = AccessLevel.PROTECTED)
//@AllArgsConstructor
//public class ProductUnit {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Integer id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "product_option_id", foreignKey = @ForeignKey(name = "fk_product_unit_product_option_id"))
//    private ProductOption productOption;
//
//    @Column(name = "status", nullable = false)
//    private String status;
//}
