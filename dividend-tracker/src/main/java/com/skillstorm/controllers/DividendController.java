package com.skillstorm.controllers;

import com.skillstorm.repository.DividendRepository;
// import java.util.List;

import org.springframework.http.HttpStatus;
// import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.skillstorm.dto.DividendDto;
// import com.skillstorm.models.Dividend;
import com.skillstorm.services.DividendService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/dividends")
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class DividendController {

    // private final DividendRepository dividendRepository;
    private final DividendService service;

    public DividendController(DividendService service, DividendRepository dividendRepository) {
        this.service = service;
        // this.dividendRepository = dividendRepository;
    }

    @GetMapping
    public ResponseEntity<Iterable<DividendDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DividendDto> getById(@PathVariable long id) {
        return ResponseEntity.ok(service.getById(id));
    }
    

    @GetMapping(params = "ticker")
    public ResponseEntity<Iterable<DividendDto>> getByTickerSymbol(@RequestParam String ticker) {
        return ResponseEntity.ok(service.getByTickerSymbol(ticker));
    }

    @PostMapping
    public ResponseEntity<DividendDto> create(@Valid @RequestBody DividendDto dto) {
        DividendDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DividendDto> update(@PathVariable long id, @Valid @RequestBody DividendDto dto) {
        DividendDto updated = service.update(id, dto);
        // Could maybe return this another way, test first
        return ResponseEntity.status(HttpStatus.OK).body(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable long id) {
        service.delete(id);
        return ResponseEntity.ok("Deleted dividend payment");
    }


}
