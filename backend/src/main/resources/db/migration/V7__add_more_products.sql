-- Add missing products from Frontend Mock Data (1003, 1004)

INSERT IGNORE INTO
    PRODUCT (
        id,
        product_name,
        type,
        tag,
        color,
        description,
        buy_price,
        rental_price,
        thickness,
        elasticity,
        lining,
        hand_feel,
        see_through,
        created_at,
        update_at,
        is_deleted,
        is_pulished
    )
VALUES (
        1003,
        '데일리 코튼 팬츠 아이보리',
        'Bottoms',
        'Work',
        'Ivory',
        '편안한 착용감의 코튼 팬츠.',
        29000,
        9000,
        2,
        1,
        3,
        2,
        1,
        NOW(6),
        NOW(6),
        false,
        true
    ),
    (
        1004,
        '라이트 윈드 재킷 민트',
        'Outers',
        'Travel',
        'Mint',
        '가볍게 걸치기 좋은 윈드 재킷.',
        49000,
        15000,
        3,
        3,
        2,
        2,
        1,
        NOW(6),
        NOW(6),
        false,
        true
    );

-- Add options for these products (so they are purchaseable)
INSERT IGNORE INTO
    PRODUCT_OPTION (
        id,
        product_id,
        size,
        count,
        buy_price,
        rental_price
    )
VALUES (
        2007,
        1003,
        'M',
        10,
        29000,
        9000
    ),
    (
        2008,
        1003,
        'L',
        10,
        29000,
        9000
    ),
    (
        2009,
        1004,
        'FREE',
        10,
        49000,
        15000
    );

-- Add images
INSERT IGNORE INTO
    PRODUCT_IMAGE (
        id,
        product_id,
        is_main,
        image_URL,
        created_at,
        updated_at
    )
VALUES (
        3007,
        1003,
        true,
        'https://via.placeholder.com/800x1000/FFFFF0/000000?text=Ivory+Pants+Main',
        NOW(6),
        NOW(6)
    ),
    (
        3008,
        1004,
        true,
        'https://via.placeholder.com/800x1000/98FF98/000000?text=Mint+Jacket+Main',
        NOW(6),
        NOW(6)
    );