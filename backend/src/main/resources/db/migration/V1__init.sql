CREATE TABLE PRODUCT (
    id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(30) NOT NULL,
    type VARCHAR(15) NOT NULL,
    tag VARCHAR(10) NOT NULL,
    color VARCHAR(10) NOT NULL,
    description VARCHAR(200) NOT NULL,
    thickness TINYINT NOT NULL,
    elasticity TINYINT NOT NULL,
    lining TINYINT NOT NULL,
    hand_feel TINYINT NOT NULL,
    see_through TINYINT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    update_at DATETIME(6) NOT NULL,
    is_deleted BOOLEAN NOT NULL,
    is_pulished BOOLEAN NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE `USER_ENTITY` (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_lock BOOLEAN NOT NULL,
    is_social BOOLEAN NOT NULL,
    social_provider_type VARCHAR(255),
    role_type VARCHAR(255) NOT NULL,
    nickname VARCHAR(255),
    email VARCHAR(255),
    created_date DATETIME(6),
    updated_date DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_user_username UNIQUE (username)
);

CREATE TABLE PRODUCT_OPTION (
    id INT NOT NULL AUTO_INCREMENT,
    product_id INT,
    size VARCHAR(10) NOT NULL,
    count INT NOT NULL,
    buy_price FLOAT NOT NULL,
    rental_price FLOAT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_product_option_product FOREIGN KEY (product_id) REFERENCES PRODUCT (id)
);

CREATE TABLE PRODUCT_IMAGE (
    id INT NOT NULL AUTO_INCREMENT,
    product_id INT,
    is_main BOOLEAN NOT NULL,
    image_URL VARCHAR(50) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_product_image_product FOREIGN KEY (product_id) REFERENCES PRODUCT (id)
);

CREATE TABLE CART (
    user_entity_id BIGINT NOT NULL,
    product_option_id INT NOT NULL,
    quantity INT NOT NULL,
    is_deleted BOOLEAN NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (user_entity_id, product_option_id),
    CONSTRAINT uk_cart_user_option UNIQUE (user_entity_id, product_option_id),
    CONSTRAINT fk_cart_user_entity FOREIGN KEY (user_entity_id) REFERENCES USER_ENTITY (id),
    CONSTRAINT fk_cart_product_option FOREIGN KEY (product_option_id) REFERENCES PRODUCT_OPTION (id)
);

CREATE TABLE jwt_refresh_entity (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    refresh VARCHAR(512) NOT NULL,
    created_date DATETIME(6),
    PRIMARY KEY (id)
);
