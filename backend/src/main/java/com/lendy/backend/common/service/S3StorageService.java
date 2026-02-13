package com.lendy.backend.common.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3StorageService {
    @Value("${cloud.aws.s3.bucketName}")
    private String bucketName;

    private final AmazonS3 amazonS3;

    public S3StorageService(AmazonS3 amazonS3) {
        this.amazonS3 = amazonS3;
    }

    // 업로드
    public String uploadImage(MultipartFile file, String folderName) throws IOException {
        // 파일 타입 검증
        if (!file.getContentType().startsWith("image/")) {
            throw new IOException("이미지 파일만 가능합니다.");
        }

        // 고유 파일 이름 생성
        String fileName = folderName + "/" + UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

        // 메타데이터 설정
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType()); // 확장자 예) image/jpeg, image/png

        // 업로드 요청 생성
        PutObjectRequest request = new PutObjectRequest(bucketName, fileName, file.getInputStream(), metadata)
                .withCannedAcl(CannedAccessControlList.PublicRead);

        // 업로드 실행
        amazonS3.putObject(request);

        return amazonS3.getUrl(bucketName, fileName).toString();
    }


}
