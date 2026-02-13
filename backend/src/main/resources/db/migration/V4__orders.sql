-- Orders domain tables
CREATE TABLE IF NOT EXISTS ORDERS (
    id BIGINT NOT NULL AUTO_INCREMENT,
    order_code VARCHAR(36) NOT NULL UNIQUE,
    order_access_key_hash VARCHAR(64) NOT NULL,
    buyer_name VARCHAR(100) NOT NULL,
    buyer_phone VARCHAR(20) NOT NULL,
    buyer_email VARCHAR(255),
    receiver_name VARCHAR(100) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    address1 VARCHAR(255) NOT NULL,
    address2 VARCHAR(255),
    zip_code VARCHAR(10) NOT NULL,
    delivery_message VARCHAR(500),
    subtotal_amount INT NOT NULL,
    shipping_fee INT NOT NULL,
    total_amount INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    merchant_uid VARCHAR(50) NOT NULL UNIQUE,
    carrier VARCHAR(50),
    invoice_no VARCHAR(50),
    created_at DATETIME(6),
    updated_at DATETIME(6),
    PRIMARY KEY (id),
    INDEX idx_order_code (order_code),
    INDEX idx_merchant_uid (merchant_uid),
    INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS ORDER_ITEM (
    id BIGINT NOT NULL AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_option_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    option_description VARCHAR(100),
    quantity INT NOT NULL,
    unit_price INT NOT NULL,
    total_price INT NOT NULL,
    image_url VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES ORDERS (id),
    INDEX idx_order_item_order_id (order_id)
);
