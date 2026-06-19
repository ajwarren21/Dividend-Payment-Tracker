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

/**
 * Valid endpoints controller class
 */
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

    /**
     * Get all dividends
     * @return Response entity with a list of all dividends
     */
    @GetMapping
    public ResponseEntity<Iterable<DividendDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    /**
     * Get dividend by id
     * @param id given dividend id
     * @return Response entity with the dividend 
     */
    @GetMapping("/{id}")
    public ResponseEntity<DividendDto> getById(@PathVariable long id) {
        return ResponseEntity.ok(service.getById(id));
    }
    

    /**
     * Get dividends by ticker
     * @param ticker given dividend ticker
     * @return Response entity with the dividends 
     */
    @GetMapping(params = "ticker")
    public ResponseEntity<Iterable<DividendDto>> getByTickerSymbol(@RequestParam String ticker) {
        return ResponseEntity.ok(service.getByTickerSymbol(ticker));
    }

    /**
     * Get dividend by DividendType
     * @param type given dividendType string
     * @return Response entity with the dividends 
     */
    @GetMapping(params = "type")
    public ResponseEntity<Iterable<DividendDto>> getByType(@RequestParam String type) {
        return ResponseEntity.ok(service.getByType(type));
    }

    /**
     * Get dividend by security name
     * @param security given dividend name
     * @return Response entity with the dividends 
     */
    @GetMapping(params = "security")
    public ResponseEntity<Iterable<DividendDto>> getBySecurity(@RequestParam String security) {
        return ResponseEntity.ok(service.getBySecurity(security));
    }

    /**
     * Create new dividend
     * @param dto given dividend dto
     * @return Response entity with the dividend 
     */
    @PostMapping
    public ResponseEntity<DividendDto> create(@Valid @RequestBody DividendDto dto) {
        DividendDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update dividend
     * @param id given dividend id
     * @param dto dividend dto with new fields
     * @return Response entity with the dividend 
     */
    @PutMapping("/{id}")
    public ResponseEntity<DividendDto> update(@PathVariable long id, @Valid @RequestBody DividendDto dto) {
        DividendDto updated = service.update(id, dto);
        // Could maybe return this another way, test first
        return ResponseEntity.status(HttpStatus.OK).body(updated);
    }

    /**
     * Delete dividend
     * @param id given dividend id 
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable long id) {
        service.delete(id);
        return ResponseEntity.ok("Deleted dividend payment");
    }


}
