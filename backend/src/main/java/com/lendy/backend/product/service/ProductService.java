package com.lendy.backend.product.service;

import com.lendy.backend.product.dto.ProductDetailResponseDTO;
import com.lendy.backend.product.dto.ProductResponseDTO;
import com.lendy.backend.product.entity.Product;
import com.lendy.backend.product.entity.ProductImage;
import com.lendy.backend.product.entity.ProductOption;
import com.lendy.backend.product.repository.ProductImageRepository;
import com.lendy.backend.product.repository.ProductOptionRepository;
import com.lendy.backend.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductOptionRepository productOptionRepository;
    private final ProductImageRepository productImageRepository;

    public List<ProductResponseDTO> getProducts() {
        List<Product> products = productRepository.findByIsPublishedTrueAndIsDeletedFalse();

        if (products.isEmpty()) {
            return List.of();
        }

        Map<Integer, String> mainImageMap = productImageRepository.findByProductInAndIsMainTrue(products).stream()
                .collect(Collectors.toMap(
                        img -> img.getProduct().getId(),
                        ProductImage::getImageURL,
                        (existing, replacement) -> existing));

        return products.stream()
                .map(product -> ProductResponseDTO.of(product, mainImageMap.get(product.getId())))
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
