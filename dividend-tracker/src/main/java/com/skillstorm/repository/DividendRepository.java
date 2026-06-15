package com.skillstorm.repository;

// import org.springframework.stereotype.Repository;
import com.skillstorm.models.Dividend;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


/**
 * Repository for dividend payments
 */
public interface DividendRepository extends JpaRepository<Dividend, Long>{

    List<Dividend> findByTickerSymbol(String tickerSymbol);
}
