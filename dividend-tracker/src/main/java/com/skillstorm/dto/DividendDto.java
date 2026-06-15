package com.skillstorm.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.skillstorm.enums.DividendType;
// import com.skillstorm.models.Dividend;


public record DividendDto(String securityName,
    String tickerSymbol,
    LocalDate paymentDate,
    DividendType dividendType,
    BigDecimal amountPerShare,
    Long sharesHeld,
    BigDecimal totalAmount 
) {}
