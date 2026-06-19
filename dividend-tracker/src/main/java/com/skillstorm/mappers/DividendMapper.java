package com.skillstorm.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.skillstorm.dto.DividendDto;
import com.skillstorm.models.Dividend;

/**
 * Mapper class to map between entity and dto types
 */
@Mapper(componentModel = "spring")
public interface DividendMapper {

    /**
     * Map from dto to entity
     * @param dto dto to map
     * @return Dividend entity 
    */
    @Mapping(target = "id", ignore = true)
    Dividend toEntity(DividendDto dto);

    /**
     * Map from entity to Dto
     * @param entity entity to map
     * @return DividendDto
     */
    DividendDto toDto(Dividend entity);

    /**
     * Updates the entity found in the database from the given dto
     * @param dto dto with fields to update to
     * @param entity entity to be updated
     */
    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(DividendDto dto, @MappingTarget Dividend entity);
}
