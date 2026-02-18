package com.lendy.backend.product.controller;

import com.lendy.backend.product.dto.ProductDetailResponseDTO;
import com.lendy.backend.product.dto.ProductResponseDTO;
import com.lendy.backend.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/search")
    public ResponseEntity<List<ProductResponseDTO>> searchProducts(@RequestParam String q) {
        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        List<ProductResponseDTO> results = productService.searchProducts(q.trim());
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductDetailResponseDTO> getProductById(@PathVariable Integer productId) {
        ProductDetailResponseDTO product = productService.getProductById(productId);
        return ResponseEntity.ok(product);
    }
}
