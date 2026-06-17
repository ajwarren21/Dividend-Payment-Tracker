package com.skillstorm.exceptions;

/**
 * Custom exception for not finding a dividend in the database
 */
public class DividendNotFoundException extends RuntimeException{

    public DividendNotFoundException(Long id) {
        super("Dividend with id: " + id + " not found");
    }
}
