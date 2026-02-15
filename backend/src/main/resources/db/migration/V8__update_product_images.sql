-- Update product images with real URLs from frontend assets

-- Update product 1001 images
UPDATE PRODUCT_IMAGE
SET
    image_URL = '/assets/sample/p1.png'
WHERE
    product_id = 1001;

-- Update product 1002 images
UPDATE PRODUCT_IMAGE
SET
    image_URL = '/assets/sample/p2.png'
WHERE
    product_id = 1002;

-- Update product 1003 images
UPDATE PRODUCT_IMAGE
SET
    image_URL = '/assets/sample/p3.png'
WHERE
    product_id = 1003;

-- Update product 1004 images
UPDATE PRODUCT_IMAGE
SET
    image_URL = '/assets/sample/p4.png'
WHERE
    product_id = 1004;