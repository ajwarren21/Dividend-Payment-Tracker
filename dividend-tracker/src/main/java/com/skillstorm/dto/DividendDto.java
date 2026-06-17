package com.skillstorm.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.skillstorm.enums.DividendType;
// import com.skillstorm.models.Dividend;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;


public record DividendDto(
    
    long id,

    @NotBlank(message = "Security name is required") String securityName,
    
    @NotBlank(message = "Ticker symbol is required") String tickerSymbol,
    
    @NotNull(message = "Date is required") @PastOrPresent(message = "Date cannot be in the future") LocalDate paymentDate,
    
    @NotNull(message = "Type is required") DividendType dividendType,
    
    @NotNull @DecimalMin(value = "0.000001",
                message = "Amount per share must be greater than zero") BigDecimal amountPerShare,
    
    @NotNull @Min(value = 1,
                message = "Shares held must be at least 1") Long sharesHeld,
    
    @NotNull @DecimalMin(value = "0.01",
                message = "Total amount must be greater than zero")BigDecimal totalAmount 

) {}
