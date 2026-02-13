package com.lendy.backend.Order.repository;

import com.lendy.backend.Order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


public interface OrderRepository extends JpaRepository<Order, Integer> {

    Optional<Order> findByOrderNo(String orderNo);
    @Query("select o from Order o left join fetch o.userEntity where o.userEntity.id = :userId order by o.orderDate desc")
    List<Order> findAllByUserEntityIdOrderByOrderDateDesc(@Param("userId") Long userId);


}
