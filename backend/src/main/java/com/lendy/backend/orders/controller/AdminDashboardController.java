package com.lendy.backend.orders.controller;

import com.lendy.backend.orders.dto.DashboardStatsResponse;
import com.lendy.backend.orders.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(defaultValue = "qty") String metric,
            @RequestParam(defaultValue = "product") String groupBy,
            @RequestParam(defaultValue = "10") int limit) {
        LocalDate fromDate = LocalDate.parse(from);
        LocalDate toDate = LocalDate.parse(to);
        return ResponseEntity.ok(dashboardService.getStats(fromDate, toDate, metric, groupBy, limit));
    }
}
