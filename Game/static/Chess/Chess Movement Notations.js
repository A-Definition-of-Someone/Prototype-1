import { ChessTypes } from "./Chess Constants.js";

export const HorizontalNotation = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h"
];

export const PieceNotation = new Map([
    [ChessTypes.Rook, "R"],
    [ChessTypes.Knight, "N"],
    [ChessTypes.Bishop, "B"],
    [ChessTypes.Queen, "Q"],
    [ChessTypes.King, "K"],
    [ChessTypes.Pawn, "P"]
]);

const ChessMovements = document.getElementById("ChessMovements");
let currentRowNum = 0;

/**
 * Used by White as they make the first, hence opening new rows
 * @param {string} chessNotation 
 */
export function addNewNotationRow(chessNotation){
    
    currentRowNum++;

    const ChessMovements_Sides = document.createElement("div");
    ChessMovements_Sides.classList.add("ChessMovements_Sides");

    const spanNumber = document.createElement("span");
    spanNumber.innerText = currentRowNum.toString();

    const spanWhite = document.createElement("span");
    spanWhite.innerText = chessNotation;

    const spanBlack = document.createElement("span");
    const spanEvent = document.createElement("span");

    ChessMovements_Sides.appendChild(spanNumber);
    ChessMovements_Sides.appendChild(spanWhite);
    ChessMovements_Sides.appendChild(spanBlack);
    ChessMovements_Sides.appendChild(spanEvent);

    ChessMovements.appendChild(ChessMovements_Sides);
}

/**
 * Used by White as they make the first, hence opening new rows
 * @param {string} chessNotation 
 */
export function addBlackEntry(chessNotation){
    let spanBlack = document.querySelector(
        "#ChessMovements .ChessMovements_Sides:last-of-type span:nth-child(3)"
    );
    spanBlack.innerText = chessNotation;
}

/**
 * Used by White as they make the first, hence opening new rows
 * @param {string} chessNotation 
 */
export function addEventEntry(chessNotation){
    let spanEvent = document.querySelector(
        "#ChessMovements .ChessMovements_Sides:last-of-type span:nth-child(4)"
    ); 
    spanEvent.innerText = chessNotation;
}