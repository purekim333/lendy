package com.lendy.backend.product.service;

import com.lendy.backend.product.dto.AdminProductResponseDTO;
import com.lendy.backend.product.dto.ProductCreateRequestDTO;
import com.lendy.backend.product.dto.ProductDetailResponseDTO;
import com.lendy.backend.product.dto.ProductOptionRequestDTO;
import com.lendy.backend.product.dto.ProductResponseDTO;
import com.lendy.backend.product.dto.ProductUpdateRequestDTO;
import com.lendy.backend.product.entity.Product;
import com.lendy.backend.product.entity.ProductImage;
import com.lendy.backend.product.entity.ProductOption;
import com.lendy.backend.product.repository.ProductImageRepository;
import com.lendy.backend.product.repository.ProductOptionRepository;
import com.lendy.backend.product.repository.ProductRepository;
import com.lendy.backend.common.service.S3StorageService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductAdminService {
    private final S3StorageService s3StorageService;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductOptionRepository productOptionRepository;

    public ProductAdminService(S3StorageService s3StorageService, ProductRepository productRepository,
            ProductImageRepository productImageRepository, ProductOptionRepository productOptionRepository) {
        this.s3StorageService = s3StorageService;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.productOptionRepository = productOptionRepository;

    }

    @Transactional
    public ProductResponseDTO createProduct(ProductCreateRequestDTO dto, List<MultipartFile> images)
            throws IllegalAccessException {
        // s3 업로드
        List<String> uploadURLs = new ArrayList<>();
        try {
            if (images != null && !images.isEmpty()) {
                for (MultipartFile file : images) {
                    String url = s3StorageService.uploadImage(file, "product");
                    uploadURLs.add(url);
                }
            } else {
                throw new IllegalArgumentException("적어도 한 장의 이미지가 필요합니다.");
            }

            Product product = Product.builder()
                    .productName(dto.getName())
                    .type(dto.getType())
                    .tag(dto.getTag())
                    .color(dto.getColor())
                    .description(dto.getDescription())
                    .buyPrice(dto.getBuyPrice())
                    .rentalPrice(dto.getRentalPrice())
                    .thickness(dto.getThickness())
                    .elasticity(dto.getElasticity())
                    .lining(dto.getLining())
                    .handFeel(dto.getHandFeel())
                    .seeThrough(dto.getSeeThrough())
                    // .isDeleted(false) // 생략 가능 (기본값/PrePersist로 세팅)
                    // .isPublished(true) // 생략 가능
                    .build();

            Product save = productRepository.save(product);

            // 이미지 저장
            int imageCnt = uploadURLs.size();
            for (int i = 0; i < imageCnt; i++) {
                ProductImage productImage;
                // 첫번째 사진이면
                if (i == 0) {
                    productImage = ProductImage.builder()
                            .product(save)
                            .isMain(true)
                            .imageURL(uploadURLs.get(i))
                            .build();
                } else {
                    productImage = ProductImage.builder()
                            .product(save)
                            .isMain(false)
                            .imageURL(uploadURLs.get(i))
                            .build();
                }
                productImageRepository.save(productImage);
            }

            // 상품 옵션 저장
            if (dto.getOptions() != null && !dto.getOptions().isEmpty()) {
                for (ProductOptionRequestDTO optionDto : dto.getOptions()) {
                    ProductOption productOption = ProductOption.builder()
                            .product(save)
                            .size(optionDto.getSize())
                            .count(optionDto.getCount())
                            .buyPrice(optionDto.getBuyPrice())
                            .rentalPrice((optionDto.getRentalPrice()))
                            .build();
                    productOptionRepository.save(productOption);
                }
            }
            return ProductResponseDTO.of(save, uploadURLs.get(0));

        } catch (Exception e) {
            throw new IllegalAccessException("상품 등록 중 오류가 발생했습니다.");
        }
    }

    @Transactional
    public Page<AdminProductResponseDTO> listAllProducts(Pageable pageable) {
        Page<Product> products = productRepository.findByIsDeletedFalse(pageable);

        return products.map(product -> {
            // 메인 이미지 URL 가져오기
            String mainImageUrl = productImageRepository.findByProductIdAndIsMainTrue(product.getId())
                    .map(ProductImage::getImageURL)
                    .orElse(null);

            // 옵션 개수 가져오기
            Integer optionCount = productOptionRepository.findByProductId(product.getId()).size();

            return AdminProductResponseDTO.of(product, mainImageUrl, optionCount);
        });
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id.intValue())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        product.setIsDeleted(true);
        productRepository.save(product);
    }

    @Transactional
    public void togglePublish(Long id) {
        Product product = productRepository.findById(id.intValue())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        product.setIsPublished(!product.getIsPublished());
        productRepository.save(product);
    }

    @Transactional
    public ProductDetailResponseDTO getProduct(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        List<ProductOption> options = productOptionRepository.findByProductId(id);
        List<ProductImage> images = productImageRepository.findByProductId(id);

        return ProductDetailResponseDTO.of(product, options, images);
    }

    @Transactional
    public ProductDetailResponseDTO updateProduct(Integer id, ProductUpdateRequestDTO dto, List<MultipartFile> newImages) throws IOException {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        // 기본 정보 업데이트
        product.setProductName(dto.getName());
        product.setType(dto.getType());
        product.setTag(dto.getTag());
        product.setColor(dto.getColor());
        product.setDescription(dto.getDescription());
        product.setBuyPrice(dto.getBuyPrice());
        product.setRentalPrice(dto.getRentalPrice());
        product.setThickness(dto.getThickness());
        product.setElasticity(dto.getElasticity());
        product.setLining(dto.getLining());
        product.setHandFeel(dto.getHandFeel());
        product.setSeeThrough(dto.getSeeThrough());
        if (dto.getIsPublished() != null) {
            product.setIsPublished(dto.getIsPublished());
        }
        productRepository.save(product);

        // 이미지 처리: keepImageUrls에 없는 기존 이미지 삭제
        List<ProductImage> existingImages = productImageRepository.findByProductId(id);
        List<String> keepUrls = dto.getKeepImageUrls() != null ? dto.getKeepImageUrls() : List.of();

        for (ProductImage img : existingImages) {
            if (!keepUrls.contains(img.getImageURL())) {
                productImageRepository.delete(img);
            }
        }

        // 새 이미지 업로드
        if (newImages != null && !newImages.isEmpty()) {
            for (MultipartFile file : newImages) {
                String url = s3StorageService.uploadImage(file, "product");
                ProductImage productImage = ProductImage.builder()
                        .product(product)
                        .isMain(false)
                        .imageURL(url)
                        .build();
                productImageRepository.save(productImage);
            }
        }

        // 남은 이미지 중 메인 이미지가 없으면 첫 번째를 메인으로 설정
        List<ProductImage> remainingImages = productImageRepository.findByProductId(id);
        boolean hasMain = remainingImages.stream().anyMatch(ProductImage::getIsMain);
        if (!hasMain && !remainingImages.isEmpty()) {
            ProductImage first = remainingImages.get(0);
            first.setIsMain(true);
            productImageRepository.save(first);
        }

        // 옵션 처리: 기존 삭제 후 새로 생성
        List<ProductOption> existingOptions = productOptionRepository.findByProductId(id);
        productOptionRepository.deleteAll(existingOptions);

        if (dto.getOptions() != null && !dto.getOptions().isEmpty()) {
            for (ProductOptionRequestDTO optionDto : dto.getOptions()) {
                ProductOption option = ProductOption.builder()
                        .product(product)
                        .size(optionDto.getSize())
                        .count(optionDto.getCount())
                        .buyPrice(optionDto.getBuyPrice())
                        .rentalPrice(optionDto.getRentalPrice())
                        .build();
                productOptionRepository.save(option);
            }
        }

        // 최신 데이터 반환
        List<ProductOption> updatedOptions = productOptionRepository.findByProductId(id);
        List<ProductImage> updatedImages = productImageRepository.findByProductId(id);
        return ProductDetailResponseDTO.of(product, updatedOptions, updatedImages);
    }
}
