package com.skillstorm.services;

import org.springframework.stereotype.Service;

import com.skillstorm.dto.DividendDto;
import com.skillstorm.enums.DividendType;
import com.skillstorm.exceptions.DividendNotFoundException;
import com.skillstorm.mappers.DividendMapper;
import com.skillstorm.models.Dividend;
import com.skillstorm.repository.DividendRepository;

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
    }

    /**
     * Finds dividend by given id
     * @param id id of dividend
     * @return the DTO
     */
    public DividendDto getById(Long id) {
        Dividend d = repo.findById(id).orElseThrow(() -> new DividendNotFoundException(id));

        return mapper.toDto(d);
    }


    /**
     * Finds dividends by given ticker
     * @param ticker ticker
     * @return list of all dividends with the given ticker
     */
    public Iterable<DividendDto> getByTickerSymbol(String ticker) {
        return repo.findByTickerSymbol(ticker).stream().map(mapper::toDto).toList();
    }

    /**
     * Finds dividend by given security name
     * @param security security name
     * @retunr list of all dividends with the given name
     */
    public Iterable<DividendDto> getBySecurity(String security) {
        return repo.findBySecurityName(security).stream().map(mapper::toDto).toList();
    }

    /**
     * Finds dividend by given enum type
     * @param type the string to convert into the dividendType
     * @return list of all dividends of the given type
     */
    public Iterable<DividendDto> getByType(String type) {
        DividendType t = DividendType.valueOf(type);
        return repo.findByDividendType(t).stream().map(mapper::toDto).toList();
    }

    /**
     * Creates a new dividend
     * @param dto dividendDto 
     * @return the dto of the created entity
     */
    public DividendDto create(DividendDto dto) {
        Dividend d = mapper.toEntity(dto);
        return mapper.toDto(repo.save(d));
    }

    /**
     * Updates given dividend with new values
     * @param id id of dividend to update
     * @param dto the given dto with new info 
     * @return the dto of the updated entity
     */
    public DividendDto update(Long id, DividendDto dto) {
        Dividend d = repo.findById(id).orElseThrow(() -> new DividendNotFoundException(id));
        mapper.updateEntityFromDto(dto, d);

        Dividend saved = repo.save(d);
        return mapper.toDto(saved);
    }

    /**
     * Deletes given dividend
     * @param id id of dividend to delete
     */
    public void delete(Long id) {
        Dividend d = repo.findById(id).orElseThrow(() -> new DividendNotFoundException(id));
        repo.delete(d);
    }
}
