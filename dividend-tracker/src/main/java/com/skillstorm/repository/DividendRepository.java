package com.skillstorm.repository;

// import org.springframework.stereotype.Repository;
import com.skillstorm.models.Dividend;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for dividend payments
 */
public interface DividendRepository extends JpaRepository<Dividend, Long>{

}
