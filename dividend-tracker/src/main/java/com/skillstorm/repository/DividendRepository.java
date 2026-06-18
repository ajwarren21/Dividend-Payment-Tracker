package com.skillstorm.repository;

// import org.springframework.stereotype.Repository;
import com.skillstorm.models.Dividend;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.skillstorm.enums.DividendType;



/**
 * Repository for dividend payments
 */
public interface DividendRepository extends JpaRepository<Dividend, Long>{

    List<Dividend> findByTickerSymbol(String tickerSymbol);

    List<Dividend> findBySecurityName(String securityName);

    List<Dividend> findByDividendType(DividendType dividendType);
}
