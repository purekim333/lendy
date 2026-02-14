package com.lendy.backend.product.service;

import com.lendy.backend.Product.dto.ProductDetailResponseDTO;
import com.lendy.backend.Product.dto.ProductResponseDTO;
import com.lendy.backend.Product.entity.Product;
import com.lendy.backend.Product.entity.ProductImage;
import com.lendy.backend.Product.entity.ProductOption;
import com.lendy.backend.Product.repository.ProductImageRepository;
import com.lendy.backend.Product.repository.ProductOptionRepository;
import com.lendy.backend.Product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductOptionRepository productOptionRepository;
    private final ProductImageRepository productImageRepository;

    public List<ProductResponseDTO> getProducts() {
        List<Product> products = productRepository.findByIsPublishedTrueAndIsDeletedFalse();

        return products.stream()
                .map(product -> {
                    String mainImageUrl = productImageRepository.findByProductIdAndIsMainTrue(product.getId())
                            .map(ProductImage::getImageURL)
                            .orElse(null);
                    return ProductResponseDTO.of(product, mainImageUrl);
                })
                .toList();
    }

    public ProductDetailResponseDTO getProductById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));

        if (product.getIsDeleted() || !product.getIsPublished()) {
            throw new IllegalArgumentException("Product is not available");
        }

        List<ProductOption> options = productOptionRepository.findByProductId(id);
        List<ProductImage> images = productImageRepository.findByProductId(id);

        return ProductDetailResponseDTO.of(product, options, images);
    }
}
