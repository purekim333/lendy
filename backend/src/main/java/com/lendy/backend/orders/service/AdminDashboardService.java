package com.lendy.backend.orders.service;

import com.lendy.backend.orders.dto.DashboardStatsResponse;
import com.lendy.backend.orders.entity.OrderStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {

    @PersistenceContext
    private EntityManager entityManager;

    public DashboardStatsResponse getStats(LocalDate from, LocalDate to, String metric, String groupBy, int limit) {
        LocalDateTime fromDateTime = from.atStartOfDay();
        LocalDateTime toDateTime = to.plusDays(1).atStartOfDay();

        // 집계 대상 상태: PAID, READY, SHIPPING, DELIVERED (취소/결제대기 제외)
        List<OrderStatus> validStatuses = List.of(
                OrderStatus.PAID,
                OrderStatus.READY,
                OrderStatus.SHIPPING,
                OrderStatus.DELIVERED
        );

        // 1. 전체 요약 통계 계산
        String summaryQuery = """
            SELECT
                COALESCE(SUM(oi.quantity), 0) as totalQty,
                COALESCE(SUM(oi.totalPrice), 0) as totalRevenue
            FROM OrderItem oi
            JOIN oi.order o
            WHERE o.createdAt >= :from
              AND o.createdAt < :to
              AND o.status IN :validStatuses
        """;

        Query sumQuery = entityManager.createQuery(summaryQuery);
        sumQuery.setParameter("from", fromDateTime);
        sumQuery.setParameter("to", toDateTime);
        sumQuery.setParameter("validStatuses", validStatuses);

        Object[] summaryResult = (Object[]) sumQuery.getSingleResult();
        Long totalQty = ((Number) summaryResult[0]).longValue();
        Long totalRevenue = ((Number) summaryResult[1]).longValue();

        // 2. Top N 아이템 조회 (product 또는 variant 기준)
        List<DashboardStatsResponse.TopItemDTO> topItems;

        if ("variant".equals(groupBy)) {
            // 옵션별 그룹화 (productName + optionDescription)
            String itemsQuery = """
                SELECT
                    oi.productName as name,
                    COALESCE(oi.optionDescription, '') as variant,
                    SUM(oi.quantity) as qty,
                    SUM(oi.totalPrice) as revenue,
                    AVG(oi.unitPrice) as unitPrice
                FROM OrderItem oi
                JOIN oi.order o
                WHERE o.createdAt >= :from
                  AND o.createdAt < :to
                  AND o.status IN :validStatuses
                GROUP BY oi.productName, oi.optionDescription
                ORDER BY %s DESC
            """.formatted("qty".equals(metric) ? "SUM(oi.quantity)" : "SUM(oi.totalPrice)");

            Query itemQuery = entityManager.createQuery(itemsQuery);
            itemQuery.setParameter("from", fromDateTime);
            itemQuery.setParameter("to", toDateTime);
            itemQuery.setParameter("validStatuses", validStatuses);
            itemQuery.setMaxResults(limit);

            @SuppressWarnings("unchecked")
            List<Object[]> results = itemQuery.getResultList();

            topItems = results.stream()
                    .map(row -> DashboardStatsResponse.TopItemDTO.builder()
                            .name((String) row[0])
                            .variant((String) row[1])
                            .qty(((Number) row[2]).intValue())
                            .revenue(((Number) row[3]).longValue())
                            .unitPrice(((Number) row[4]).longValue())
                            .build())
                    .collect(Collectors.toList());
        } else {
            // 상품별 그룹화 (productName만)
            String itemsQuery = """
                SELECT
                    oi.productName as name,
                    SUM(oi.quantity) as qty,
                    SUM(oi.totalPrice) as revenue,
                    AVG(oi.unitPrice) as unitPrice
                FROM OrderItem oi
                JOIN oi.order o
                WHERE o.createdAt >= :from
                  AND o.createdAt < :to
                  AND o.status IN :validStatuses
                GROUP BY oi.productName
                ORDER BY %s DESC
            """.formatted("qty".equals(metric) ? "SUM(oi.quantity)" : "SUM(oi.totalPrice)");

            Query itemQuery = entityManager.createQuery(itemsQuery);
            itemQuery.setParameter("from", fromDateTime);
            itemQuery.setParameter("to", toDateTime);
            itemQuery.setParameter("validStatuses", validStatuses);
            itemQuery.setMaxResults(limit);

            @SuppressWarnings("unchecked")
            List<Object[]> results = itemQuery.getResultList();

            topItems = results.stream()
                    .map(row -> DashboardStatsResponse.TopItemDTO.builder()
                            .name((String) row[0])
                            .variant(null)
                            .qty(((Number) row[1]).intValue())
                            .revenue(((Number) row[2]).longValue())
                            .unitPrice(((Number) row[3]).longValue())
                            .build())
                    .collect(Collectors.toList());
        }

        // 3. 응답 조립
        DashboardStatsResponse.SummaryDTO summary = DashboardStatsResponse.SummaryDTO.builder()
                .totalQty(totalQty.intValue())
                .totalRevenue(totalRevenue)
                .from(from.toString())
                .to(to.toString())
                .build();

        return DashboardStatsResponse.builder()
                .summary(summary)
                .items(topItems)
                .build();
    }
}
