// ==UserScript==
// @name         ROMP Column with Boost Link
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Adds ROMP and Boost columns, checks every 10 seconds, avoids duplicates, highlights Site rows with distinct colors, and highlights Brick cells containing "INFLIGHT".
// @author       trevrat
// @match        *://*/*
// @grant        https://w.amazon.com/bin/view/Abdoure/dashboard
// @updateURL    https://raw.githubusercontent.com/trevrat/ROMP-Column/main/Romp-column.user.js
// @downloadURL  https://raw.githubusercontent.com/trevrat/ROMP-Column/main/Romp-column.user.js
// ==/UserScript==

(function() {
    'use strict';

    const pastelColors = [
        '#FFCCCC', '#FFE0B2', '#FFFFCC', '#D9FFD9', '#CCFFFF',
        '#D0D0FF', '#E0CCFF', '#FFCCDB', '#FFFFE6', '#E6FFFF'
    ];
    const siteColorMap = new Map();

    function processTables() {
        let tables = document.querySelectorAll('table');
        if (tables.length === 0) return;

        tables.forEach((table, tableIndex) => {
            let positionColumnIndex = -1, rompColumnExists = false;
            let siteColumnIndex = -1, brickColumnIndex = -1, assetColumnIndex = -1, boostColumnExists = false;

            let headerCells = table.querySelectorAll('th');
            headerCells.forEach((header, index) => {
                let text = header.innerText.trim();
                if (text === "ROMP") rompColumnExists = true;
                if (text === "Boost") boostColumnExists = true;
                if (text === "Site") siteColumnIndex = index;
                if (text === "Brick") brickColumnIndex = index;
                if (text === "Asset") assetColumnIndex = index;
                if (text === "Position") positionColumnIndex = index;
            });

            if (rompColumnExists && boostColumnExists) return;

            if (positionColumnIndex !== -1) {
                if (!rompColumnExists) {
                    let rompHeader = document.createElement('th');
                    rompHeader.innerText = "ROMP";
                    table.querySelector('tr').appendChild(rompHeader);
                }
                if (!boostColumnExists) {
                    let boostHeader = document.createElement('th');
                    boostHeader.innerText = "Boost";
                    table.querySelector('tr').appendChild(boostHeader);
                }

                let rows = table.querySelectorAll('tr');
                rows.forEach((row, rowIndex) => {
                    let cells = row.querySelectorAll('td');
                    
                    if (cells.length > positionColumnIndex) {
                        let positionValue = cells[positionColumnIndex].innerText.trim();
                        let match = positionValue.match(/(\d{2})-(\d{2})-(\d{3})-(\d{2})$/);
                        let rompValue = match ? getRompValue(`${match[1]}${match[2]}${match[3]}${match[4]}`) : "";
                        
                        let rompCell = document.createElement('td');
                        rompCell.innerText = rompValue;
                        row.appendChild(rompCell);
                    } else {
                        row.appendChild(document.createElement('td'));
                    }

                    if (cells.length > assetColumnIndex) {
                        let assetValue = cells[assetColumnIndex].innerText.trim();
                        let boostCell = document.createElement('td');
                        if (assetValue) {
                            let boostLink = document.createElement('a');
                            boostLink.href = `https://app.boost.aws.a2z.com/platform/work-requests?view=RackInstall&searchInput=${assetValue}`;
                            boostLink.innerText = "Boost Link";
                            boostLink.target = "_blank";
                            boostCell.appendChild(boostLink);
                        }
                        row.appendChild(boostCell);
                    } else {
                        row.appendChild(document.createElement('td'));
                    }

                    if (siteColumnIndex !== -1 && cells.length > siteColumnIndex) {
                        let siteValue = cells[siteColumnIndex].innerText.trim();
                        if (!siteColorMap.has(siteValue)) {
                            siteColorMap.set(siteValue, pastelColors[siteColorMap.size % pastelColors.length]);
                        }
                        let rowColor = siteColorMap.get(siteValue);
                        row.style.backgroundColor = rowColor;
                        cells.forEach(cell => {
                            cell.style.backgroundColor = rowColor;
                            cell.style.color = 'black';
                        });
                    } else {
                        row.style.backgroundColor = '';
                        cells.forEach(cell => cell.style.backgroundColor = '');
                    }

                    if (brickColumnIndex !== -1 && cells.length > brickColumnIndex) {
                        let brickCell = cells[brickColumnIndex];
                        if (brickCell.innerText.includes("INFLIGHT")) {
                            brickCell.style.backgroundColor = "orange";
                            brickCell.style.color = "black";
                        }
                    }
                });
            }
        });
    }

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
        return "";
    }

    setInterval(() => {
        console.log("Checking for tables with 'Position' column every 10 seconds.");
        processTables();
    }, 10000);
})();
