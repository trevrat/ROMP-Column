// ==UserScript==
// @name         ROMP Column
// @namespace    http://tampermonkey.net/
// @version      2.8
// @description  Adds a ROMP column at the end of tables with a "Position" column, checks every 10 seconds, avoids duplicate ROMP columns, highlights rows based on "Site" matching with distinct lighter colors, and highlights "Brick" cells containing "INFLIGHT".
// @author       trevrat
// @match        *://*/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/trevrat/ROMP-Column/main/Romp-column.user.js
// @downloadURL  https://raw.githubusercontent.com/trevrat/ROMP-Column/main/Romp-column.user.js
// ==/UserScript==

(function() {
    'use strict';

    const pastelColors = [
        '#FFCCCC', // Very Light Red
        '#FFE0B2', // Very Light Orange
        '#FFFFCC', // Very Light Yellow
        '#D9FFD9', // Very Light Lime
        '#CCFFFF', // Very Light Cyan
        '#D0D0FF', // Very Light Blue
        '#E0CCFF', // Very Light Lavender
        '#FFCCDB', // Very Light Pink
        '#FFFFE6', // Lightest Yellow
        '#E6FFFF'  // Lightest Cyan
    ];
    const siteColorMap = new Map();
// Add Boost Column
if (!boostExists) {
    let boostCell = document.createElement('td');
    if (cells.length > assetIndex) {
        let assetValue = cells[assetIndex].innerText.trim();
        if (assetValue) {
            let boostLink = document.createElement('a');
            boostLink.href = `https://app.boost.aws.a2z.com/platform/work-requests?view=RackInstall&searchInput=${assetValue}`;
            boostLink.innerText = "Boost Link";
            boostLink.target = "_blank";
            boostCell.appendChild(boostLink);
        }
    }
    row.appendChild(boostCell);
}
    // Function to process tables and add the ROMP column if "Position" is found
    function processTables() {
        let tables = document.querySelectorAll('table');
        if (tables.length === 0) {
            console.log("No tables found on the page.");
            return;
        }

        tables.forEach((table, tableIndex) => {
            let positionColumnIndex = -1;
            let rompColumnExists = false;
            let siteColumnIndex = -1;
            let brickColumnIndex = -1;

            // Check if the "ROMP" column already exists and find the relevant columns
            let headerCells = table.querySelectorAll('th');
            headerCells.forEach((header, index) => {
                if (header.innerText.trim() === "ROMP") {
                    rompColumnExists = true;
                    console.log(`Table ${tableIndex}: 'ROMP' column already exists.`);
                }
                if (header.innerText.trim() === "Site") {
                    siteColumnIndex = index; // Store index of "Site" column
                }
                if (header.innerText.trim() === "Brick") {
                    brickColumnIndex = index; // Store index of "Brick" column
                }
            });

            if (rompColumnExists) {
                // Skip processing if ROMP column already exists
                console.log(`Table ${tableIndex}: Skipping ROMP column addition.`);
                return;
            }

            // Identify the "Position" column
            headerCells.forEach((header, index) => {
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
                        let match = positionValue.match(/(\d{2})-(\d{2})-(\d{3})-(\d{2})$/);
                        if (match) {
                            let ddeefffgg = `${match[1]}${match[2]}${match[3]}${match[4]}`; // Construct ddeefffgg string
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
                    // Add Boost Column
				if (cells.length > assetColumnIndex) {
					let assetCell = cells[assetColumnIndex];
					let assetValue = assetCell.innerText.trim();
   					let boostCell = document.createElement('td');

 					if (assetValue) {
						let boostLink = document.createElement('a');
        				boostLink.href = `https://app.boost.aws.a2z.com/platform/work-requests?view=RackInstall&searchInput=${assetValue}`;
        				boostLink.innerText = "Boost Link";
        				boostLink.target = "_blank";
        				boostCell.appendChild(boostLink);
    				}

    				row.appendChild(boostCell);
				} else if (rowIndex > 0) {
					let boostCell = document.createElement('td');
    				row.appendChild(boostCell);
				}

                    // Check for the "Site" column to highlight rows
                    if (siteColumnIndex !== -1 && cells.length > siteColumnIndex) {
                        let siteCell = cells[siteColumnIndex];
                        let siteValue = siteCell.innerText.trim();

                        // If the site is already assigned a color, use that color; otherwise assign a new one
                        if (!siteColorMap.has(siteValue)) {
                            let color = pastelColors[siteColorMap.size % pastelColors.length];
                            siteColorMap.set(siteValue, color);
                        }

                        // Set the row color based on the site value, overriding any existing background color
                        let rowColor = siteColorMap.get(siteValue);
                        row.style.backgroundColor = rowColor; // Set the entire row's background color
                        cells.forEach(cell => {
                            cell.style.backgroundColor = rowColor; // Ensure each cell has the same background color
                            cell.style.color = 'black'; // Ensure text color is black for visibility
                        });
                    } else {
                        // If no "Site" value, ensure the row background color is reset to default
                        row.style.backgroundColor = '';
                        cells.forEach(cell => {
                            cell.style.backgroundColor = ''; // Reset cell background color to default
                        });
                    }

                    // Highlight "Brick" cells containing "INFLIGHT"
                    if (brickColumnIndex !== -1 && cells.length > brickColumnIndex) {
                        let brickCell = cells[brickColumnIndex];
                        if (brickCell.innerText.includes("INFLIGHT")) {
                            brickCell.style.backgroundColor = "orange"; // Set background color to orange
                            brickCell.style.color = "black"; // Change text color to black
                            console.log(`Table ${tableIndex}, Row ${rowIndex}: Highlighted 'Brick' cell containing 'INFLIGHT'.`);
                        }
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
