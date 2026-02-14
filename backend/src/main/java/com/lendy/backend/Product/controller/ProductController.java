package com.lendy.backend.Product.controller;

import com.lendy.backend.Product.dto.ProductDetailResponseDTO;
import com.lendy.backend.Product.dto.ProductResponseDTO;
import com.lendy.backend.Product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getProducts() {
        List<ProductResponseDTO> products = productService.getProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductDetailResponseDTO> getProductById(@PathVariable Integer productId) {
        ProductDetailResponseDTO product = productService.getProductById(productId);
        return ResponseEntity.ok(product);
    }
}
