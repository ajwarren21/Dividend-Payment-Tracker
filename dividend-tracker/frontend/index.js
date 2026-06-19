const BACKEND_URL = "http://localhost:8080/dividends";

// Keeps track of which record is currently selected for deletion,
// since the modal confirm button needs to know which id to delete
let pendingDeleteId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadAllDividends();
});

const stocks = [
    { symbol: "AAPL", price: 213.44, change: 1.2 },
    { symbol: "MSFT", price: 487.10, change: -0.5 },
    { symbol: "NVDA", price: 158.22, change: 2.4 },
    { symbol: "TSLA", price: 302.18, change: -1.1 },
    { symbol: "SPY", price: 612.88, change: 0.4 }
];

// CREATE
document.getElementById("new-dividend-form").addEventListener("submit", (eventInfo) => {
    eventInfo.preventDefault();

    const newDividend = buildDividendDtoFromForm("new");

    fetch(BACKEND_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newDividend)
    })
    .then((httpResponse) => {
        if (httpResponse.status === 201) {
            return httpResponse.json();
        }
        // pull the validation/error message out of the response 
        // need to first check if it is just a string in the body, or an errors array
        return httpResponse.text().then((text) => {
            let body;
            try {
                body = JSON.parse(text);
            } catch {
                body = text;
            }
            throw new Error(extractErrorMessage(body));
        });
    })
    .then((dividend) => {
        addDividendToTable(dividend);
        document.getElementById("new-dividend-form").reset();
        showAlert("Dividend payment added successfully.", "success");
    })
    .catch((error) => {
        showAlert("Could not save dividend payment: " + error.message, "danger");
    });
});

// UPDATE 
document.getElementById("update-dividend-form").addEventListener("submit", (eventInfo) => {
    eventInfo.preventDefault();

    const id = document.getElementById("update-dividend-id").value;
    const updatedDividend = buildDividendDtoFromForm("update");

    fetch(`${BACKEND_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedDividend)
    })
    .then((httpResponse) => {
        if (httpResponse.status === 200) {
            return httpResponse.json();
        }
        return httpResponse.json().then((body) => {
            throw new Error(extractErrorMessage(body));
        });
    })
    .then((dividend) => {
        replaceDividendInTable(dividend);
        hideUpdateForm();
        showAlert("Dividend payment updated successfully.", "success");
    })
    .catch((error) => {
        showAlert("Could not update dividend payment: " + error.message, "danger");
    });
});

document.getElementById("cancel-update-btn").addEventListener("click", () => {
    hideUpdateForm();
});



///////////////////////////////////////////////////////////////////////////////
//                                  FILTERING METHODS
///////////////////////////////////////////////////////////////////////////////

const searchCategory = document.getElementById("search-category");
const searchInput = document.getElementById("search-input");
const typeDropdown = document.getElementById("type-dropdown");

searchCategory.addEventListener("change", () => {
    const category = searchCategory.value;
    
    // swap between the input bar and the dropdown for the type option
    if (category === "type") {
        searchInput.classList.add("d-none");
        typeDropdown.classList.remove("d-none");
    } else {
        typeDropdown.classList.add("d-none");
        searchInput.classList.remove("d-none");
        
        if (category === "ticker") {
            searchInput.placeholder = "Enter ticker symbol";
        } else {
            searchInput.placeholder = "Enter security name";
        }
    }
});

document.getElementById("search-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const category = searchCategory.value;
    let searchValue = "";

    if (category === "type") {
        searchValue = typeDropdown.value;
    } else {
        searchValue = searchInput.value.trim();
    }

    if (!searchValue) {
        loadAllDividends();
        return;
    }

    fetch(`${BACKEND_URL}?${category}=${encodeURIComponent(searchValue)}`)
        .then(response => response.json())
        .then(dividends => renderDividendTable(dividends))
        .catch(error => {
            showAlert("Could not search dividend payments: " + error.message, "danger");
        });
});



/////////////////////////////////////////////////////////////////////////////////////
//                                  END FILTERING
////////////////////////////////////////////////////////////////////////////////////


document.getElementById("clear-search-btn").addEventListener("click", () => {
    // This should now also reset the dropdown menu
    document.getElementById("type-dropdown").value = "";

    document.getElementById("search-form").value = "";
    document.getElementById("search-input").value = "";
    loadAllDividends();
});



// DELETE CONFIRMATION
document.getElementById("confirm-delete-btn").addEventListener("click", () => {
    if (pendingDeleteId === null) {
        return;
    }

    fetch(`${BACKEND_URL}/${pendingDeleteId}`, {
        method: "DELETE"
    })
    .then((httpResponse) => {
        if (httpResponse.ok) {
            removeDividendFromTable(pendingDeleteId);
            showAlert("Dividend payment deleted.", "success");
        } else {
            throw new Error("Server returned status " + httpResponse.status);
        }
    })
    .catch((error) => {
        showAlert("Could not delete dividend payment: " + error.message, "danger");
    })
    .finally(() => {
        pendingDeleteId = null;
        const modalEl = document.getElementById("delete-confirm-modal");
        bootstrap.Modal.getInstance(modalEl).hide();
    });
});


// TOTAL CALCULATION
document.getElementById("new-amount-per-share").addEventListener("input", () => calculateTotal("new"));
document.getElementById("new-shares-held").addEventListener("input", () => calculateTotal("new"));
document.getElementById("update-amount-per-share").addEventListener("input", () => calculateTotal("update"));
document.getElementById("update-shares-held").addEventListener("input", () => calculateTotal("update"));


const tickerTrack = document.getElementById("ticker-track");

tickerTrack.innerHTML = stocks.map(stock => {
    // arrow grabbed from unicode: U+25BC (for down)
    const arrow = stock.change >= 0 ? "▲" : "▼";
    const cssClass = stock.change >= 0 ? "up" : "down";

    // Im just returning the html from here and then add placeholder in .html file
    return `
        <span class="${cssClass}">
            ${stock.symbol} ${arrow} $${stock.price} (${stock.change}%)
        </span>
    `;
}).join("");


// sidebar
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggle-sidebar-btn");

toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("d-none");
});


//////////////////////////////////////////////////////////////////////////////////////////
//                              HELPER FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////////////


/**
 * Loads every dividend payment from the backend and renders the table.
 */
const loadAllDividends = () => {
    fetch(BACKEND_URL)
        .then((httpResponse) => httpResponse.json())
        .then((dividends) => renderDividendTable(dividends))
        .catch((error) => {
            showAlert("Could not load dividend payments: " + error.message, "danger");
        });
};

/**
 * Clears and rebuilds the table body from a list of dividend records.
 * @param {Array} dividends list of dividend DTOs returned from the backend
 */
const renderDividendTable = (dividends) => {
    const tableBody = document.getElementById("dividend-table-body");
    tableBody.innerHTML = "";
    dividends.forEach((dividend) => addDividendToTable(dividend));
};

/**
 * Builds a DividendDto-shaped object from one of the forms on the page.
 * @param {string} prefix either new or update
 */
const buildDividendDtoFromForm = (prefix) => {
    return {
        securityName: document.getElementById(`${prefix}-security-name`).value,
        tickerSymbol: document.getElementById(`${prefix}-ticker-symbol`).value,
        paymentDate: document.getElementById(`${prefix}-payment-date`).value,
        dividendType: document.getElementById(`${prefix}-dividend-type`).value,
        amountPerShare: parseFloat(document.getElementById(`${prefix}-amount-per-share`).value),
        sharesHeld: parseInt(document.getElementById(`${prefix}-shares-held`).value, 10),
        totalAmount: parseFloat(document.getElementById(`${prefix}-total-amount`).value)
    };
};

/**
 * Adds a single dividend payment row to the table.
 * @param {Object} dividend dividendDto
 */
const addDividendToTable = (dividend) => {
    // Most of logic from https://github.com/AReeves8/20260427-EY-Java/blob/main/JavaScript/dom/frontend/index.js
    // Check here for any errors 

    const tr = document.createElement("tr");
    tr.setAttribute("id", `TR-${dividend.id}`);

    const securityTD = document.createElement("td");
    const tickerTD = document.createElement("td");
    const dateTD = document.createElement("td");
    const typeTD = document.createElement("td");
    const amountPerShareTD = document.createElement("td");
    const sharesHeldTD = document.createElement("td");
    const totalAmountTD = document.createElement("td");
    const editBtnTD = document.createElement("td");
    const delBtnTD = document.createElement("td");

    securityTD.innerText = dividend.securityName;
    tickerTD.innerText = dividend.tickerSymbol;
    dateTD.innerText = dividend.paymentDate;
    typeTD.innerText = formatDividendType(dividend.dividendType);
    amountPerShareTD.innerText = formatCurrency(dividend.amountPerShare);
    sharesHeldTD.innerText = dividend.sharesHeld;
    totalAmountTD.innerText = formatCurrency(dividend.totalAmount);

    editBtnTD.innerHTML = `<button class="btn btn-primary p-1" id="EDIT-${dividend.id}">Edit</button>`;
    delBtnTD.innerHTML = `<button class="btn btn-danger p-1" id="DEL-${dividend.id}">Delete</button>`;

    tr.appendChild(securityTD);
    tr.appendChild(tickerTD);
    tr.appendChild(dateTD);
    tr.appendChild(typeTD);
    tr.appendChild(amountPerShareTD);
    tr.appendChild(sharesHeldTD);
    tr.appendChild(totalAmountTD);
    tr.appendChild(editBtnTD);
    tr.appendChild(delBtnTD);

    const tableBody = document.getElementById("dividend-table-body");
    tableBody.appendChild(tr);

    // wire up the edit/delete buttons now that they exist in the DOM
    document.getElementById(`EDIT-${dividend.id}`).addEventListener("click", () => {
        showUpdateForm(dividend);
    });

    document.getElementById(`DEL-${dividend.id}`).addEventListener("click", () => {
        pendingDeleteId = dividend.id;
        const modalEl = document.getElementById("delete-confirm-modal");
        new bootstrap.Modal(modalEl).show();
    });
};

/**
 * Replaces an existing row in the table with updated dividend data.
 * @param {Object} dividend the updated dividend DTO
 */
const replaceDividendInTable = (dividend) => {
    const existingRow = document.getElementById(`TR-${dividend.id}`);
    if (existingRow) {
        existingRow.remove();
    }
    addDividendToTable(dividend);
};

/**
 * Removes a row from the table by dividend id.
 * @param {number} id id of the dividend payment to remove
 */
const removeDividendFromTable = (id) => {
    const row = document.getElementById(`TR-${id}`);
    if (row) {
        row.remove();
    }
};

/**
 * Populates and reveals the update form for the selected dividend record,
 * hiding the new payment form while it's active.
 * @param {Object} dividend - the dividend DTO to edit
 */
const showUpdateForm = (dividend) => {
    document.getElementById("update-dividend-id").value = dividend.id;
    document.getElementById("update-security-name").value = dividend.securityName;
    document.getElementById("update-ticker-symbol").value = dividend.tickerSymbol;
    document.getElementById("update-payment-date").value = dividend.paymentDate;
    document.getElementById("update-dividend-type").value = dividend.dividendType;
    document.getElementById("update-amount-per-share").value = dividend.amountPerShare;
    document.getElementById("update-shares-held").value = dividend.sharesHeld;
    document.getElementById("update-total-amount").value = dividend.totalAmount;

    document.getElementById("new-dividend-form").style.display = "none";
    document.getElementById("update-dividend-form").style.display = "block";
};

/**
 * Hides the update form and brings back the new-payment form.
 */
const hideUpdateForm = () => {
    document.getElementById("update-dividend-form").style.display = "none";
    document.getElementById("update-dividend-form").reset();
    document.getElementById("new-dividend-form").style.display = "block";
};

/**
 * Converts a DividendType enum value into a display label.
 * @param {string} type raw enum value
 */
const formatDividendType = (type) => {
    if (!type) {
        return "";
    }
    return type
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

/**
 * Formats a numeric amount as USD for display.
 * @param {number} amount raw numeric amount
 */
const formatCurrency = (amount) => {
    const num = Number(amount);
    if (Number.isNaN(num)) {
        return amount;
    }
    return "$" + num.toFixed(2);
};

/**
 * Pulls message out of a Spring error response body.
 * Falls back to a generic message
 * @param {Object} body parsed JSON error response
 */
const extractErrorMessage = (body) => {
    if (!body) {
        return "Unknown error";
    }

    // plain string body (e.g. DividendNotFoundException returns ResponseEntity<String>)
    if (typeof body === "string") {
        return body;
    }

    // Spring @Valid failure — field errors are in body.errors as objects with a defaultMessage
    if (body.errors && Array.isArray(body.errors)) {
        return body.errors.map(e => e.defaultMessage).join(", ");
    }

    // fallback to top-level message field
    if (body.message) {
        return body.message;
    }

    return "Unknown error";
};

/**
 * Shows an auto dismissible Bootstrap alert at the top of the page.
 * @param {string} message text to display
 * @param {string} type bootstrap alert type
 */
const showAlert = (message, type) => {
    const placeholder = document.getElementById("alert-placeholder");
    placeholder.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show mt-2" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
};
/**
 * Calculate the total based on the number and amount per share
 * @param {string} prefix either update or new
 * @returns The new total 
 */
const calculateTotal = (prefix) => {

    // console.log("GOT INTO CALCULATE WITH " + "prefix")

    const amountPerShare = parseFloat(document.getElementById(`${prefix}-amount-per-share`).value);
    const sharesHeld = parseInt(document.getElementById(`${prefix}-shares-held`).value, 10);

    if (Number.isNaN(amountPerShare) || Number.isNaN(sharesHeld)) {
        document.getElementById(`${prefix}-total-amount`).value = "";
        return;
    }

    const total = amountPerShare * sharesHeld;
    document.getElementById(`${prefix}-total-amount`).value = total.toFixed(2);
};
