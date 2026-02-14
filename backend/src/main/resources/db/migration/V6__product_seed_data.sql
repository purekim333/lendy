-- Product seed data for development

-- Insert sample products with explicit IDs
INSERT IGNORE INTO PRODUCT (id, product_name, type, tag, color, description, buy_price, rental_price, thickness, elasticity, lining, hand_feel, see_through, is_deleted, is_pulished)
VALUES
    (1001, '우아한 블랙 원피스', '원피스', '데일리', '블랙', '세련된 블랙 컬러의 원피스로 다양한 상황에서 활용 가능합니다. 부드러운 소재와 우아한 실루엣이 특징입니다.', 89000, 15000, 3, 2, 1, 4, 1, false, true),
    (1002, '캐주얼 데님 자켓', '아우터', '캐주얼', '블루', '편안한 착용감의 데님 자켓으로 사계절 내내 활용할 수 있는 필수 아이템입니다. 클래식한 디자인으로 오래 입어도 질리지 않습니다.', 125000, 22000, 4, 1, 0, 3, 0, false, true);

-- Insert product options
INSERT IGNORE INTO PRODUCT_OPTION (id, product_id, size, count, buy_price, rental_price)
VALUES
    (2001, 1001, 'S', 5, 89000.0, 15000.0),
    (2002, 1001, 'M', 8, 89000.0, 15000.0),
    (2003, 1001, 'L', 3, 89000.0, 15000.0),
    (2004, 1002, 'M', 6, 125000.0, 22000.0),
    (2005, 1002, 'L', 4, 125000.0, 22000.0),
    (2006, 1002, 'XL', 2, 125000.0, 22000.0);

-- Insert product images (using placeholder URLs)
INSERT IGNORE INTO PRODUCT_IMAGE (id, product_id, is_main, image_URL)
VALUES
    (3001, 1001, true, 'https://via.placeholder.com/800x1000/000000/FFFFFF?text=Black+Dress+Main'),
    (3002, 1001, false, 'https://via.placeholder.com/800x1000/000000/FFFFFF?text=Black+Dress+Detail1'),
    (3003, 1001, false, 'https://via.placeholder.com/800x1000/000000/FFFFFF?text=Black+Dress+Detail2'),
    (3004, 1002, true, 'https://via.placeholder.com/800x1000/4169E1/FFFFFF?text=Denim+Jacket+Main'),
    (3005, 1002, false, 'https://via.placeholder.com/800x1000/4169E1/FFFFFF?text=Denim+Jacket+Detail1'),
    (3006, 1002, false, 'https://via.placeholder.com/800x1000/4169E1/FFFFFF?text=Denim+Jacket+Detail2');
