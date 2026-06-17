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

// HANDLE CREATE
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
        // pull the validation/error message out of the response body
        return httpResponse.json().then((body) => {
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

// HANDLE UPDATES 
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

// HANDLE SEARCHING BY TICKER SYMBOL
document.getElementById("search-ticker-form").addEventListener("submit", (eventInfo) => {
    eventInfo.preventDefault();

    const ticker = document.getElementById("search-ticker-input").value.trim();

    if (!ticker) {
        loadAllDividends();
        return;
    }

    fetch(`${BACKEND_URL}?ticker=${encodeURIComponent(ticker)}`)
        .then((httpResponse) => httpResponse.json())
        .then((dividends) => renderDividendTable(dividends))
        .catch((error) => {
            showAlert("Could not search dividend payments: " + error.message, "danger");
        });
});

document.getElementById("clear-search-btn").addEventListener("click", () => {
    document.getElementById("search-ticker-input").value = "";
    loadAllDividends();
});

// HANDLE DELETE CONFIRMATION
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

// HANDLE TOTAL CALCULATION
document.getElementById("new-amount-per-share").addEventListener("input", () => calculateTotal("new"));
document.getElementById("new-shares-held").addEventListener("input", () => calculateTotal("new"));
document.getElementById("update-amount-per-share").addEventListener("input", () => calculateTotal("update"));
document.getElementById("update-shares-held").addEventListener("input", () => calculateTotal("update"));


// for fake tracker
const tickerTrack = document.getElementById("ticker-track");

tickerTrack.innerHTML = stocks.map(stock => {
    const arrow = stock.change >= 0 ? "▲" : "▼";
    const cssClass = stock.change >= 0 ? "up" : "down";

    // Im just returning the html from here and then add placeholder in .html file
    return `
        <span class="${cssClass}">
            ${stock.symbol} ${arrow} $${stock.price} (${stock.change}%)
        </span>
    `;
}).join("");

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
 * @param {Array} dividends - list of dividend DTOs returned from the backend
 */
const renderDividendTable = (dividends) => {
    const tableBody = document.getElementById("dividend-table-body");
    tableBody.innerHTML = "";
    dividends.forEach((dividend) => addDividendToTable(dividend));
};

/**
 * Builds a DividendDto-shaped object from one of the forms on the page.
 * @param {string} prefix - either "new" or "update", matching the form's input id prefixes
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
 * @param {Object} dividend - a dividend DTO, expected to include an "id" field
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
 * @param {Object} dividend - the updated dividend DTO
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
 * @param {number} id - id of the dividend payment to remove
 */
const removeDividendFromTable = (id) => {
    const row = document.getElementById(`TR-${id}`);
    if (row) {
        row.remove();
    }
};

/**
 * Populates and reveals the update form for the selected dividend record,
 * hiding the new-payment form while it's active.
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
 * Converts a DividendType enum value into a friendlier display label.
 * @param {string} type - raw enum value, e.g. "RETURN_OF_CAPITAL"
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
 * Formats a numeric amount as USD currency for display.
 * @param {number} amount - raw numeric amount
 */
const formatCurrency = (amount) => {
    const num = Number(amount);
    if (Number.isNaN(num)) {
        return amount;
    }
    return "$" + num.toFixed(2);
};

/**
 * Pulls a human-readable message out of a Spring error response body.
 * Falls back to a generic message if the shape is unexpected.
 * @param {Object} body - parsed JSON error response
 */
const extractErrorMessage = (body) => {
    if (!body) {
        return "Unknown error";
    }
    if (body.message) {
        return body.message;
    }
    if (body.errors && Array.isArray(body.errors)) {
        return body.errors.join(", ");
    }
    return "Unknown error";
};

/**
 * Shows a dismissible Bootstrap alert at the top of the page.
 * @param {string} message - text to display
 * @param {string} type - bootstrap alert type
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
 * @param {string} prefix - either update or new
 * @returns The new total 
 */
const calculateTotal = (prefix) => {

    console.log("GOT INTO CALCULATE WITH " + "prefix")

    const amountPerShare = parseFloat(document.getElementById(`${prefix}-amount-per-share`).value);
    const sharesHeld = parseInt(document.getElementById(`${prefix}-shares-held`).value, 10);

    if (Number.isNaN(amountPerShare) || Number.isNaN(sharesHeld)) {
        document.getElementById(`${prefix}-total-amount`).value = "";
        return;
    }

    const total = amountPerShare * sharesHeld;
    document.getElementById(`${prefix}-total-amount`).value = total.toFixed(2);
};
