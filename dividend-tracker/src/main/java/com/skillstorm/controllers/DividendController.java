package com.skillstorm.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.models.Dividend;
import com.skillstorm.services.DividendService;

@RestController
@RequestMapping("/dividends")
public class DividendController {

    private final DividendService service;

    public DividendController(DividendService service) {
        this.service = service;
    }

    public Iterable<Dividend> getAll() {
        return this.service.getAll();
    }

}
