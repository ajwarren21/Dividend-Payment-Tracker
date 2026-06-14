package com.skillstorm.services;

// import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.skillstorm.models.Dividend;
import com.skillstorm.repository.DividendRepository;

/**
 * Business logic for dividend payments
 */
@Service
public class DividendService {

    private final DividendRepository repo;

    public DividendService(DividendRepository repo) {
        this.repo = repo;
    }

    /**
     * Finds all dividends
     * @return an iterable of all dividends
     */
    public Iterable<Dividend> getAll() {
        return this.repo.findAll();
    }
}
