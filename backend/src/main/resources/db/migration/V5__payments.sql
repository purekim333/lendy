-- Payments domain tables
CREATE TABLE IF NOT EXISTS PAYMENT_ATTEMPT (
    id BIGINT NOT NULL AUTO_INCREMENT,
    merchant_uid VARCHAR(50) NOT NULL UNIQUE,
    imp_uid VARCHAR(50) UNIQUE,
    order_id BIGINT NOT NULL,
    amount INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    buyer_name VARCHAR(100),
    buyer_email VARCHAR(255),
    buyer_tel VARCHAR(20),
    pay_method VARCHAR(20),
    pg_provider VARCHAR(30),
    receipt_url VARCHAR(500),
    error_code VARCHAR(50),
    error_msg VARCHAR(500),
    version BIGINT DEFAULT 0,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    PRIMARY KEY (id),
    INDEX idx_payment_merchant_uid (merchant_uid),
    INDEX idx_payment_imp_uid (imp_uid)
);

CREATE TABLE IF NOT EXISTS PAYMENT_EVENT_LOG (
    id BIGINT NOT NULL AUTO_INCREMENT,
    merchant_uid VARCHAR(50) NOT NULL,
    imp_uid VARCHAR(50),
    event_type VARCHAR(30) NOT NULL,
    source VARCHAR(20) NOT NULL,
    amount INT,
    raw_payload TEXT,
    processing_result VARCHAR(50),
    error_message VARCHAR(500),
    created_at DATETIME(6),
    PRIMARY KEY (id),
    INDEX idx_event_merchant_uid (merchant_uid),
    INDEX idx_event_created_at (created_at)
);
