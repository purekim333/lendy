package com.lendy.backend.orders.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardStatsResponse {
    private SummaryDTO summary;
    private List<TopItemDTO> items;

    @Data
    @Builder
    public static class SummaryDTO {
        private Integer totalQty;
        private Long totalRevenue;
        private String from;
        private String to;
    }

    @Data
    @Builder
    public static class TopItemDTO {
        private String name;
        private String variant;
        private Integer qty;
        private Long revenue;
        private Long unitPrice;
    }
}
