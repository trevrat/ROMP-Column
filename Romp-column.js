// ==UserScript==
// @name         ROMP Column
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Adds a ROMP column at the end of tables with a "Position" column, checking every 10 seconds and avoiding duplicate ROMP columns.
// @match        *://*/*
// @grant        none
// @updateURL    
// @downloadURL  
// ==/UserScript==

(function() {
    'use strict';

    // Function to process tables and add the ROMP column if "Position" is found
    function processTables() {
        let tables = document.querySelectorAll('table');
        if (tables.length === 0) {
            console.log("No tables found on the page.");
            return;
        }

        tables.forEach((table, tableIndex) => {
            let positionColumnIndex = -1;
            let headers = table.querySelectorAll('th.sortable');
            let rompColumnExists = false;

            // Check if the "ROMP" column already exists
            let headerCells = table.querySelectorAll('th');
            headerCells.forEach((header) => {
                if (header.innerText.trim() === "ROMP") {
                    rompColumnExists = true;
                    console.log(`Table ${tableIndex}: 'ROMP' column already exists.`);
                }
            });

            if (rompColumnExists) {
                // Skip processing if ROMP column already exists
                console.log(`Table ${tableIndex}: Skipping ROMP column addition.`);
                return;
            }

            headers.forEach((header, index) => {
                if (header.innerText.trim() === "Position") {
                    positionColumnIndex = index;
                    console.log(`Table ${tableIndex}: Found 'Position' column at index ${index}.`);
                }
            });

            if (positionColumnIndex !== -1) {
                // Add the ROMP header at the end of the header row
                let rompHeader = document.createElement('th');
                rompHeader.innerText = "ROMP";
                table.querySelector('tr').appendChild(rompHeader);
                console.log(`Table ${tableIndex}: 'ROMP' column header added at the end of the table.`);

                let rows = table.querySelectorAll('tr');
                rows.forEach((row, rowIndex) => {
                    let cells = row.querySelectorAll('td');

                    if (cells.length > positionColumnIndex) {
                        let positionCell = cells[positionColumnIndex];
                        let positionValue = positionCell.innerText.trim();
                        // Match and extract the last 9 digits
                        let match = positionValue.match(/(\d{2})-(\d{2})-(\d{3})-(\d{2})$/);  // Adjusted to only match the last 9 digits
                        if (match) {
                            let ddeefffgg = `${match[1]}${match[2]}${match[3]}${match[4]}`;  // Construct ddeefffgg string
                            let rompValue = getRompValue(ddeefffgg);
                            let rompCell = document.createElement('td');
                            rompCell.innerText = rompValue;
                            row.appendChild(rompCell);
                            console.log(`Table ${tableIndex}, Row ${rowIndex}: Added ROMP value '${rompValue}' for Position '${positionValue}'.`);
                        }
                    } else if (rowIndex > 0) {
                        // Add empty cells for rows without position data (in case of header or blank rows)
                        let rompCell = document.createElement('td');
                        row.appendChild(rompCell);
                    }
                });
            }
        });
    }

    // Function to determine ROMP value based on ddeefffgg as a string
    function getRompValue(ddeefffgg) {
        if (ddeefffgg >= "010100110" && ddeefffgg <= "010101099") return "ROMP 1";
        if (ddeefffgg >= "010101110" && ddeefffgg <= "010101899") return "ROMP 2";
        if (ddeefffgg >= "010101910" && ddeefffgg <= "010102699") return "ROMP 3";
        if (ddeefffgg >= "010102710" && ddeefffgg <= "010103499") return "ROMP 4";
        if (ddeefffgg >= "010103510" && ddeefffgg <= "010104299") return "ROMP 5";
        if (ddeefffgg >= "010104310" && ddeefffgg <= "010105099") return "ROMP 6";
        if (ddeefffgg >= "010200110" && ddeefffgg <= "010201099") return "ROMP 7";
        if (ddeefffgg >= "010201110" && ddeefffgg <= "010201899") return "ROMP 8";
        if (ddeefffgg >= "010201910" && ddeefffgg <= "010202699") return "ROMP 9";
        if (ddeefffgg >= "010202710" && ddeefffgg <= "010203499") return "ROMP 10";
        if (ddeefffgg >= "010203510" && ddeefffgg <= "010204299") return "ROMP 11";
        if (ddeefffgg >= "010204310" && ddeefffgg <= "010205099") return "ROMP 12";
        return "";  // No match
    }

    // Check for tables every 10 seconds
    setInterval(() => {
        console.log("Checking for tables with 'Position' column every 10 seconds.");
        processTables();
    }, 10000);  // 10000 milliseconds = 10 seconds
})();
