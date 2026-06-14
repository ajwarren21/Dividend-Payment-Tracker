package com.skillstorm.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

import com.skillstorm.enums.DividendType;


/**
 * Represents a single dividend payment record received from a security.
 */
@Entity
@Table(name = "dividend_payments")
public class Dividend {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String securityName;

    @Column(nullable = false)
    private String tickerSymbol;

    @Column(nullable = false)
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DividendType dividendType;

    @Column(nullable = false, precision = 12, scale = 6)
    private BigDecimal amountPerShare;

    @Column(nullable = false)
    private Long sharesHeld;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount;

    public Dividend(String securityName, String tickerSymbol, LocalDate paymentDate, DividendType dividendType,
            BigDecimal amountPerShare, Long sharesHeld, BigDecimal totalAmount) {
        this.securityName = securityName;
        this.tickerSymbol = tickerSymbol;
        this.paymentDate = paymentDate;
        this.dividendType = dividendType;
        this.amountPerShare = amountPerShare;
        this.sharesHeld = sharesHeld;
        this.totalAmount = totalAmount;
    }

    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSecurityName() {
        return securityName;
    }

    public void setSecurityName(String securityName) {
        this.securityName = securityName;
    }

    public String getTickerSymbol() {
        return tickerSymbol;
    }

    public void setTickerSymbol(String tickerSymbol) {
        this.tickerSymbol = tickerSymbol;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public DividendType getDividendType() {
        return dividendType;
    }

    public void setDividendType(DividendType dividendType) {
        this.dividendType = dividendType;
    }

    public BigDecimal getAmountPerShare() {
        return amountPerShare;
    }

    public void setAmountPerShare(BigDecimal amountPerShare) {
        this.amountPerShare = amountPerShare;
    }

    public Long getSharesHeld() {
        return sharesHeld;
    }

    public void setSharesHeld(Long sharesHeld) {
        this.sharesHeld = sharesHeld;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    

}
