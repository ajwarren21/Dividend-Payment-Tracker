package com.skillstorm.services;

// import org.springframework.http.ResponseEntity;
// import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.skillstorm.dto.DividendDto;
import com.skillstorm.mappers.DividendMapper;
import com.skillstorm.models.Dividend;
import com.skillstorm.repository.DividendRepository;

// import io.micrometer.core.ipc.http.HttpSender.Response;

/**
 * Business logic for dividend payments
 */
@Service
public class DividendService {

    private final DividendRepository repo;
    private final DividendMapper mapper;

    public DividendService(DividendRepository repo, DividendMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    /**
     * Finds all dividends
     * @return an iterable of all dividends
     */
    public Iterable<DividendDto> getAll() {
        return repo.findAll().stream().map(mapper::toDto).toList();
        // return ResponseEntity.ok(repo.findAll());
    }

    // getById()
    public DividendDto getById(Long id) {
        Dividend d = repo.findById(id).orElseThrow();

        return mapper.toDto(d);
    }


    public Iterable<DividendDto> getByTickerSymbol(String ticker) {
        return repo.findByTickerSymbol(ticker).stream().map(mapper::toDto).toList();
        // return ResponseEntity.ok(repo.findByTickerSymbol(ticker));
    }

    public DividendDto create(DividendDto dto) {
        Dividend d = mapper.toEntity(dto);
        return mapper.toDto(repo.save(d));
    }

    public DividendDto update(Long id, DividendDto dto) {
        Dividend d = repo.findById(id).orElseThrow();
        mapper.updateEntityFromDto(dto, d);

        Dividend saved = repo.save(d);
        return mapper.toDto(saved);
    }

    public void delete(Long id) {
        Dividend d = repo.findById(id).orElseThrow();
        repo.delete(d);
    }
}
