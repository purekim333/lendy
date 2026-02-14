package com.lendy.backend.orders.service;

import com.lendy.backend.orders.entity.Order;
import com.lendy.backend.orders.entity.OrderStatus;
import com.lendy.backend.orders.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminOrderService {

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public Page<Order> listOrders(Pageable pageable) {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public Order getOrder(String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    @Transactional
    public Order transitionToReady(String orderCode) {
        Order order = getOrder(orderCode);

        if (order.getStatus() != OrderStatus.PAID) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Can only transition to READY from PAID status. Current status: " + order.getStatus());
        }

        order.updateStatus(OrderStatus.READY);
        return orderRepository.save(order);
    }

    @Transactional
    public Order transitionToShipping(String orderCode, String carrier, String invoiceNo) {
        Order order = getOrder(orderCode);

        if (order.getStatus() != OrderStatus.READY) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Can only transition to SHIPPING from READY status. Current status: " + order.getStatus());
        }

        if (carrier == null || carrier.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Carrier is required");
        }

        if (invoiceNo == null || invoiceNo.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice number is required");
        }

        order.setTrackingInfo(carrier, invoiceNo);
        order.updateStatus(OrderStatus.SHIPPING);
        return orderRepository.save(order);
    }

    @Transactional
    public Order transitionToDelivered(String orderCode) {
        Order order = getOrder(orderCode);

        if (order.getStatus() != OrderStatus.SHIPPING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Can only transition to DELIVERED from SHIPPING status. Current status: " + order.getStatus());
        }

        order.updateStatus(OrderStatus.DELIVERED);
        return orderRepository.save(order);
    }

    @Transactional
    public Order cancelOrder(String orderCode) {
        Order order = getOrder(orderCode);

        if (order.getStatus() != OrderStatus.PAID && order.getStatus() != OrderStatus.READY) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Can only cancel orders in PAID or READY status. Current status: " + order.getStatus());
        }

        order.updateStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }
}
