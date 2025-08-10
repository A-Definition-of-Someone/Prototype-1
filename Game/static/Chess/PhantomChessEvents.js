import { ChessTile } from "./Chess Tiles V2.js";
import { ChessTypes, Side } from "./Chess Constants.js";
import { ChessPiece, P1_Pawn, P2_Pawn, P1_Queen, P2_Queen, P1_King, P2_King } from "./Chess Pieces V2.js";
import { getP1KingCoord, getP2KingCoord } from "./Chess Data V2.js";
import { setCheck } from "./Canvas Chess.js";
import { PieceNotation, HorizontalNotation, addEventEntry } from "./Chess Movement Notations.js";

const EventBanner = document.getElementById("EventBanner");
const tileColours = [["#FFB366", "#994C00"], ["#994C00","#FFB366"]];
const Rook = 0;
const Knight = 1;
const Bishop = 2;
const Queen = 3;
const King = 4;
const Pawn = 5;

const mapPieceType = new Map([
    [ChessTypes.Rook, Rook],
    [ChessTypes.Knight, Knight],
    [ChessTypes.Bishop, Bishop],
    [ChessTypes.Queen, Queen],
    [ChessTypes.King, King],
    [ChessTypes.Pawn, Pawn]
]);

const attackPriority = [
    ChessTypes.Queen, ChessTypes.Rook, ChessTypes.Bishop, 
    ChessTypes.Pawn, ChessTypes.Knight, ChessTypes.King
];
/**
 * @param {Array<Array<ChessTile>>} chessdata
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} boardOffset 
 * @param {number} TileHeight 
 * @param {number} TileWidth 
 * @param {number} scaleDown 
 * @returns {boolean} 
 */
export async function Disappear(chessdata, ctx, boardOffset,
    TileHeight, TileWidth, scaleDown,
    blackSide_IMGs, whiteSide_IMGs
){
    /* Choose random pieces */
    let tempRow = Math.floor(Math.random() * 7);
    let tempCol = Math.floor(Math.random() * 7);
    let temp = chessdata[tempRow][tempCol].ChessPiece;
    while (temp.Side === Side.Neutral || temp.ClassName === ChessTypes.King) {
        tempRow = Math.floor(Math.random() * 7);
        tempCol = Math.floor(Math.random() * 7);
        temp = chessdata[tempRow][tempCol].ChessPiece;
    }
    await showEventBanner("Event: Chess Piece Disappearance<br>Victim Player: " + temp.Side);
    await markUnfortunatePiece(temp, ctx, boardOffset, TileHeight, TileWidth);
    await deleteUnfortunatePiece(chessdata, temp, ctx, boardOffset, TileHeight, TileWidth);
    await hideEventBanner();
    return true;
}
/**
 * @param {Array<Array<ChessTile>>} chessdata
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} boardOffset 
 * @param {number} TileHeight 
 * @param {number} TileWidth 
 * @param {number} scaleDown 
 * @returns {boolean} 
 */
export async function Betray(chessdata, ctx, boardOffset,
    TileHeight, TileWidth, scaleDown, 
    blackSide_IMGs, whiteSide_IMGs
){
    /* Choose random pieces */
    let tempRow = Math.floor(Math.random() * 7);
    let tempCol = Math.floor(Math.random() * 7);
    let temp = chessdata[tempRow][tempCol].ChessPiece;
    while (temp.Side === Side.Neutral || temp.ClassName === ChessTypes.King) {
        tempRow = Math.floor(Math.random() * 7);
        tempCol = Math.floor(Math.random() * 7);
        temp = chessdata[tempRow][tempCol].ChessPiece;
    }
    await showEventBanner("Event: Chess Piece Betrayal<br>Victim Player: " + temp.Side);
    await markUnfortunatePiece(temp, ctx, boardOffset, TileHeight, TileWidth);
    await turnIntoEnemy(
        chessdata, temp, ctx, boardOffset, TileHeight, 
        TileWidth, scaleDown, blackSide_IMGs, whiteSide_IMGs
    );
    await hideEventBanner();
    return true;
}
/**
 * @param {string} msg 
 */
async function showEventBanner(msg){
    await new Promise(resolve=>setTimeout(resolve, 500));
    EventBanner.innerHTML = msg;
    EventBanner.dataset.promptHidden = "false";
}
async function hideEventBanner(){
    await new Promise(resolve=>setTimeout(resolve, 1000));
    EventBanner.dataset.promptHidden = "true";
}

/**
 * @param {ChessPiece} chesspiece
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} boardOffset 
 * @param {number} TileHeight 
 * @param {number} TileWidth 
 */
async function markUnfortunatePiece(
    chesspiece, ctx, boardOffset, TileHeight, TileWidth
){
    chesspiece.RemovePreviousAttackRange();
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fillRect((chesspiece.Col * TileWidth) + boardOffset, 
    (chesspiece.Row * TileHeight) + boardOffset, TileWidth, TileHeight);
    await new Promise(resolve=>setTimeout(resolve, 1000));
}

/**
 * @param {Array<Array<ChessTile>>} chessdata 
 * @param {ChessPiece} chesspiece
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} boardOffset 
 * @param {number} TileHeight 
 * @param {number} TileWidth 
 */
async function deleteUnfortunatePiece(
    chessdata, chesspiece, ctx, boardOffset, TileHeight, TileWidth
){
    let tempRow = chesspiece.Row;
    let tempCol = chesspiece.Col;
    chessdata[tempRow][tempCol].ChessPiece = new ChessPiece(Side.Neutral, tempRow, tempCol);
    ctx.fillStyle = tileColours[tempRow % 2][tempCol % 2];
    ctx.fillRect((tempCol * TileWidth) + boardOffset, 
    (tempRow * TileHeight) + boardOffset, TileWidth, TileHeight);
}

/**
 * @param {Array<Array<ChessTile>>} chessdata 
 * @param {ChessPiece} chesspiece
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} boardOffset 
 * @param {number} TileHeight 
 * @param {number} TileWidth 
 */
async function turnIntoEnemy(
    chessdata, chesspiece, ctx, boardOffset, TileHeight, TileWidth,
    scaleDown, blackSide_IMGs, whiteSide_IMGs
){
    let temp = chesspiece;
    let tempRow = temp.Row;
    let tempCol = temp.Col;

    /* Check if its a pawn, that's the only type that has different movement based on side */
    let newSide = (chesspiece.Side === Side.White)? Side.Black : Side.White;
    if(chesspiece instanceof P1_Pawn){
        temp = chessdata[tempRow][tempCol].ChessPiece = (tempRow === 0)? 
        new P2_Queen(newSide, tempRow, tempCol) : new P2_Pawn(newSide, tempRow, tempCol);
    }else if(chesspiece instanceof P2_Pawn){
        temp = chessdata[tempRow][tempCol].ChessPiece = (tempRow === 0)? 
        new P1_Queen(newSide, tempRow, tempCol) : new P1_Pawn(newSide, tempRow, tempCol);
    }else{
        chesspiece.Side = newSide;
    }

    /* Set Attack Range for choosing who to attack later */
    temp.RemovePreviousAttackRange();
    temp.initAttackRange(chessdata);
    
    let img  = (temp.Side === Side.White)? 
    whiteSide_IMGs[mapPieceType.get(temp.ClassName)] : 
    blackSide_IMGs[mapPieceType.get(temp.ClassName)];

    ctx.fillStyle = tileColours[tempRow % 2][tempCol % 2];
    ctx.fillRect((tempCol * TileWidth) + boardOffset, 
    (tempRow * TileHeight) + boardOffset, TileWidth, TileHeight);
    
    ctx.drawImage(
        img,
        /* Starting Point of Tile to be drawn on + position of the chess piece offset */ 
        (tempCol * TileWidth) + boardOffset + ((TileWidth - (img.width / scaleDown)) / 2), 
        (tempRow * TileHeight) + boardOffset + ((TileHeight - (img.height / scaleDown)) / 2),
        img.width / scaleDown, img.height / scaleDown);

    await new Promise(resolve=>setTimeout(resolve, 1000));

    await chooseFormerAlliesToAttack(
        chessdata, temp, ctx, boardOffset, TileHeight, 
        TileWidth, scaleDown, whiteSide_IMGs, blackSide_IMGs
    );
}

/**
 * @param {Array<Array<ChessTile>>} chessdata 
 * @param {ChessPiece} chesspiece
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} boardOffset 
 * @param {number} TileHeight 
 * @param {number} TileWidth 
 * @param {num} scaleDown 
 * @param {ImageData} whiteSide_IMGs 
 * @param {ImageData} blackSide_IMGs 
 */
async function chooseFormerAlliesToAttack(
    chessdata, chesspiece, ctx, boardOffset, TileHeight, TileWidth, 
    scaleDown, whiteSide_IMGs, blackSide_IMGs
){
    /* Check for anything in its attack range  */
    let success = false;
    for (let index = 0; index < attackPriority.length; index++) {
        for (let index2 = 0; index2 < chesspiece.CurrentTilesAffected.length; index2++) {
            let tempTarget = attackPriority[index];
            let tempTilePiece = chesspiece.CurrentTilesAffected[index2].ChessPiece;
            if(
                tempTilePiece.ClassName !== ChessTypes.ChessPiece 
                && tempTilePiece.ClassName === tempTarget
                && tempTilePiece.Side !== chesspiece.Side
            ){
                
                /* Check if can attack, no obstacles */
                let targetTile = chessdata[tempTilePiece.Row][tempTilePiece.Col];
                if(chesspiece.Move(tempTilePiece, targetTile.Callable, chessdata)){
                    success = true;
                    let tempRow = chesspiece.Row;
                    let tempCol = chesspiece.Col;
                    chesspiece.RemovePreviousAttackRange();
                    chesspiece.ActuallyMove(chessdata, tempTilePiece);

                    let tempNewRow = chesspiece.Row;
                    let tempNewCol = chesspiece.Col;
                    let newSide = chesspiece.Side;
                    let temp = chesspiece;
                    /* Check if attacking coordinate is promotion tile */
                    if(chesspiece instanceof P1_Pawn && tempNewRow === 7){
                        temp = chessdata[tempNewRow][tempNewCol].ChessPiece = new P1_Queen(newSide, tempNewRow, tempNewCol);
                    }else if(chesspiece instanceof P2_Pawn && tempNewRow === 0){
                        temp = chessdata[tempNewRow][tempNewCol].ChessPiece = new P2_Queen(newSide, tempNewRow, tempNewCol);
                    }

                    temp.initAttackRange(chessdata);

                    /* Draw new piece over new coordinates */
                    draw(
                        temp, ctx, boardOffset, TileHeight, 
                        TileWidth, scaleDown, whiteSide_IMGs, blackSide_IMGs
                    );  
                    /* Paint Over Old cooordinates */
                    drawColouredTiles(chessdata[tempRow][tempCol].ChessPiece, boardOffset, ctx, TileWidth, TileHeight);

                    /* Add to event notation */
                    let notation = PieceNotation.get(chesspiece.ClassName) + HorizontalNotation[tempNewRow] + tempNewCol.toString();
                    addEventEntry(notation);

                    /* Let's find out if any tiles under attack range have king or not */
                    let P1_KingCoord = getP1KingCoord();
                    let P2_KingCoord = getP2KingCoord();
                    let P1_King = chessdata[P1_KingCoord.row][P1_KingCoord.col].ChessPiece;
                    let P2_King = chessdata[P2_KingCoord.row][P2_KingCoord.col].ChessPiece;
                    let kingOppo = (P1_King.Side === temp.Side) ? P2_King : P1_King;
                    let check = temp.checkKingOverlapwithAttackRange(chessdata, kingOppo);
                    setCheck(check);
                   
                    //alert("Check: " + check + "\n" + );
                    
                    break;
                }
            }
        }
        if(success){
            break;
        }
    }

}

/**
 * @param {ChessPiece} chesspiece
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} boardOffset 
 * @param {number} TileHeight 
 * @param {number} TileWidth 
 */
function drawColouredTiles(chesspiece, boardOffset, ctx, TileWidth, TileHeight){

    let rowTile = chesspiece.Row;
    let columnTile = chesspiece.Col;
    console.log("rowTile:", rowTile, "columnTile:", columnTile);
    
    ctx.fillStyle = tileColours[rowTile % 2][columnTile % 2];
    ctx.fillRect((columnTile * TileWidth) + boardOffset, 
    (rowTile * TileHeight) + boardOffset, TileWidth, TileHeight);
}

/**
 * @param {ChessPiece} chesspiece
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} boardOffset 
 * @param {number} TileHeight 
 * @param {number} TileWidth 
 * @param {number} scaleDown 
 * @param {ImageData} whiteSide_IMGs 
 * @param {ImageData} blackSide_IMGs 
 */
function draw(chesspiece, ctx, boardOffset, TileHeight, TileWidth, scaleDown, whiteSide_IMGs, blackSide_IMGs){
    let temp = chesspiece;
    let tempRow = temp.Row;
    let tempCol = temp.Col;
    let img  = (temp.Side === Side.White)? 
    whiteSide_IMGs[mapPieceType.get(temp.ClassName)] : 
    blackSide_IMGs[mapPieceType.get(temp.ClassName)];
                    
    ctx.fillStyle = tileColours[tempRow % 2][tempCol % 2];
    ctx.fillRect((tempCol * TileWidth) + boardOffset, 
    (tempRow * TileHeight) + boardOffset, TileWidth, TileHeight);
    ctx.drawImage(
        img,
        /* Starting Point of Tile to be drawn on + position of the chess piece offset */ 
        (tempCol * TileWidth) + boardOffset + ((TileWidth - (img.width / scaleDown)) / 2), 
        (tempRow * TileHeight) + boardOffset + ((TileHeight - (img.height / scaleDown)) / 2),
        img.width / scaleDown, img.height / scaleDown);
}