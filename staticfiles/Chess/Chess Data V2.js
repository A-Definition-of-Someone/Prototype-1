import { ChessTile, setNeutralTile } from "./Chess Tiles V2.js";
import { ChessPiece, P1_Pawn, P2_Pawn, P1_Bishop, P2_Bishop, P1_King, 
    P2_King, P1_Knight, P2_Knight, P1_Queen, P2_Queen, P1_Rook, P2_Rook } from "./Chess Pieces V2.js";
import { Side } from "./Chess Constants.js";

let coordP1_King = {row: 0, col: 0};
let coordP2_King = {row: 0, col: 0};

export function getP1KingCoord(){
    return coordP1_King;
}
export function getP2KingCoord(){
    return coordP2_King;
}

/**
 * @param {string} currentPlayerSide 
 * @param {string} opposingPlayerSide 
 */
export function setUpChessBoardData(currentPlayerSide, opposingPlayerSide){
    if(currentPlayerSide === Side.White){
        coordP1_King.row = 0;
        coordP1_King.col = 4;
        coordP2_King.row = 7;
        coordP2_King.col = 4;
    return new Array(
    /* Row 1 */
    new Array(
        new ChessTile(new P1_Rook(opposingPlayerSide, 0, 0), setNeutralTile()),
        new ChessTile(new P1_Knight(opposingPlayerSide , 0, 1), setNeutralTile()),
        new ChessTile(new P1_Bishop(opposingPlayerSide , 0, 2), setNeutralTile()),
        new ChessTile(new P1_Queen(opposingPlayerSide , 0, 3), setNeutralTile()),
        new ChessTile(new P1_King(opposingPlayerSide , 0, 4), setNeutralTile()),        
        new ChessTile(new P1_Bishop(opposingPlayerSide, 0, 5), setNeutralTile()),
        new ChessTile(new P1_Knight(opposingPlayerSide, 0, 6), setNeutralTile()),
        new ChessTile(new P1_Rook(opposingPlayerSide, 0, 7), setNeutralTile())
    ),
    /* Row 2 */
    Array.from({length: 8}, ($, index)=> new ChessTile(new P1_Pawn(opposingPlayerSide, 1, index), setNeutralTile())),
    /* Row 3 */
    Array.from({length: 8}, ($, index)=> new ChessTile(new ChessPiece(Side.Neutral, 2, index), setNeutralTile())),
    /* Row 4 */
    Array.from({length: 8}, ($, index)=> new ChessTile(new ChessPiece(Side.Neutral, 3, index), setNeutralTile())),
    /* Row 5 */
    Array.from({length: 8}, ($, index)=> new ChessTile(new ChessPiece(Side.Neutral, 4, index), setNeutralTile())),
    /* Row 6 */
    Array.from({length: 8}, ($, index)=> new ChessTile(new ChessPiece(Side.Neutral, 5, index), setNeutralTile())),
    /* Row 7 */
    Array.from({length: 8}, ($, index)=> new ChessTile(new P2_Pawn(currentPlayerSide, 6, index), setNeutralTile())),
    /* Row 8 */
    new Array(
        new ChessTile(new P2_Rook(currentPlayerSide, 7, 0), setNeutralTile()),
        new ChessTile(new P2_Knight(currentPlayerSide, 7, 1), setNeutralTile()),
        new ChessTile(new P2_Bishop(currentPlayerSide, 7, 2), setNeutralTile()),
        new ChessTile(new P2_Queen(currentPlayerSide, 7, 3), setNeutralTile()),
        new ChessTile(new P2_King(currentPlayerSide, 7, 4), setNeutralTile()),
        new ChessTile(new P2_Bishop(currentPlayerSide, 7, 5), setNeutralTile()),
        new ChessTile(new P2_Knight(currentPlayerSide, 7, 6), setNeutralTile()),
        new ChessTile(new P2_Rook(currentPlayerSide, 7, 7), setNeutralTile())
    )
);
    }
else{
    coordP1_King.row = 0;
    coordP1_King.col = 3;
    coordP2_King.row = 7;
    coordP2_King.col = 3;
    return new Array(
    /* Row 1 */
    new Array(
        new ChessTile(new P1_Rook(opposingPlayerSide, 0, 0), setNeutralTile()),
        new ChessTile(new P1_Knight(opposingPlayerSide, 0, 1), setNeutralTile()),
        new ChessTile(new P1_Bishop(opposingPlayerSide, 0, 2), setNeutralTile()),
        new ChessTile(new P1_King(opposingPlayerSide, 0, 3), setNeutralTile()),   
        new ChessTile(new P1_Queen(opposingPlayerSide, 0, 4), setNeutralTile()),
        new ChessTile(new P1_Bishop(opposingPlayerSide, 0, 5), setNeutralTile()),
        new ChessTile(new P1_Knight(opposingPlayerSide, 0, 6), setNeutralTile()),
        new ChessTile(new P1_Rook(opposingPlayerSide, 0, 7), setNeutralTile())
    ),
    /* Row 2 */
    Array.from({length: 8}, ($, index)=> new ChessTile(new P1_Pawn(opposingPlayerSide, 1, index), setNeutralTile())),
    /* Row 3 */
    Array.from({length: 8}, ($, index)=> new ChessTile(new ChessPiece(Side.Neutral, 2, index), setNeutralTile())),
    /* Row 4 */
    Array.from({length: 8}, ($, index)=> new ChessTile(new ChessPiece(Side.Neutral, 3, index), setNeutralTile())),
    /* Row 5 */
    Array.from({length: 8}, ($, index)=> new ChessTile(new ChessPiece(Side.Neutral, 4, index), setNeutralTile())),
    /* Row 6 */
    Array.from({length: 8}, ($, index)=> new ChessTile(new ChessPiece(Side.Neutral, 5, index), setNeutralTile())),
    /* Row 7 */
    Array.from({length: 8}, ($, index)=> new ChessTile(new P2_Pawn(currentPlayerSide, 6, index), setNeutralTile())),
    /* Row 8 */
    new Array(
        new ChessTile(new P2_Rook(currentPlayerSide, 7, 0), setNeutralTile()),
        new ChessTile(new P2_Knight(currentPlayerSide, 7, 1), setNeutralTile()),
        new ChessTile(new P2_Bishop(currentPlayerSide, 7, 2), setNeutralTile()),
        new ChessTile(new P2_King(currentPlayerSide, 7, 3), setNeutralTile()),
        new ChessTile(new P2_Queen(currentPlayerSide, 7, 4), setNeutralTile()),
        new ChessTile(new P2_Bishop(currentPlayerSide, 7, 5), setNeutralTile()),
        new ChessTile(new P2_Knight(currentPlayerSide, 7, 6), setNeutralTile()),
        new ChessTile(new P2_Rook(currentPlayerSide, 7, 7), setNeutralTile())
    )
);
}
}

