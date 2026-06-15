package com.skillstorm.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import com.skillstorm.models.Dividend;
import com.skillstorm.services.DividendService;

@RestController
@RequestMapping("/dividends")
public class DividendController {

    private final DividendService service;

    public DividendController(DividendService service) {
        this.service = service;
    }

    // need to change everything here
    public Iterable<Dividend> getAll() {
        return service.getAll();
    }

    @GetMapping
    public Iterable<Dividend> getByTickerSymbol(@RequestParam String ticker) {
        return service.getByTickerSymbol(ticker);
    }

}
