package com.lendy.backend.product.controller;

import com.lendy.backend.product.dto.ProductCreateRequestDTO;
import com.lendy.backend.product.dto.ProductResponseDTO;
import com.lendy.backend.product.service.ProductAdminService;
import com.lendy.backend.product.service.ProductService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/products")
public class ProductAdminController {
    private final ProductAdminService productAdminService;


    public ProductAdminController (ProductAdminService productAdminService) {
        this.productAdminService = productAdminService;
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProduct(@RequestPart("data")ProductCreateRequestDTO requestDTO,
                                           @RequestPart(value = "images", required = false)List<MultipartFile> images) {
        try{
            log.info("REQ DTO => name={}, buyPrice={}, rentalPrice={}",
                    requestDTO.getName(), requestDTO.getBuyPrice(), requestDTO.getRentalPrice());

            ProductResponseDTO responseDTO = productAdminService.createProduct(requestDTO, images);
            return  ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }

    }

    @GetMapping(value = "/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.status(HttpStatus.CREATED).body("테스트입니다.");
    }

}
