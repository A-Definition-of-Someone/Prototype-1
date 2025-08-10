import { setUpChessBoardData, getP1KingCoord, getP2KingCoord } from "./Chess Data V2.js";
import { ChessTypes, Side, Status } from "./Chess Constants.js";
import { ChessTile } from "./Chess Tiles V2.js";
import { ChessPiece, P1_Pawn, P2_Pawn, P1_Queen, P2_Queen } from "./Chess Pieces V2.js";
import { Disappear, Betray } from "./PhantomChessEvents.js";
import { Timer } from "./Timer.js";
import { addBlackEntry, addNewNotationRow, HorizontalNotation, PieceNotation } from "./Chess Movement Notations.js";

let lastclicks = [];
let targetpieces = [];
let chessdata;
let currentSide;
export let check = {status: false};
/**
 * @param {boolean} value 
 */
export function setCheck(value){
    check.status = value;
}
const Rows = 8;
const Cols = 8;
const positionTextSize = 40;
const fontPX = 20;
let TileWidth = 0
let TileHeight = 0;
const boardOffset = positionTextSize / 2;
const tileColours = [["#FFB366", "#994C00"], ["#994C00","#FFB366"]];
const bottomColumnLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];
const leftRowLabels = ["8", "7", "6", "5", "4", "3", "2", "1"];
let blackSide_IMGs = [];
let whiteSide_IMGs = [];
let Rook = 0;
let Knight = 1;
let Bishop = 2;
let Queen = 3;
let King = 4;
let Pawn = 5;

let currentPlayerTimer;
let opposingPlayerTimer

/**
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLSpanElement} Player1Timer 
 * @param {HTMLSpanElement} Player2Timer 
 * @param {string} currentPlayerSide 
 * @param {string} opposingPlayerSide 
 * @param {number} timer 
 * @param {number} PerMove 
 */
export async function React2Canvas(
    canvas, Player1Timer, Player2Timer, currentPlayerSide, opposingPlayerSide, timer, PerMove
){
    console.log("currentPlayerSide: " + currentPlayerSide + " opposingPlayerSide: " + opposingPlayerSide);
    
    blackSide_IMGs = await obtainIMGs(
        [
            "/static/Resources/Black%20Rook.png",
            "/static/Resources/Black%20Knight.png",
            "/static/Resources/Black%20Bishop.png",
            "/static/Resources/Black%20Queen.png",
            "/static/Resources/Black%20King.png",
            "/static/Resources/Black%20Pawn.png",
        ]
    );
    whiteSide_IMGs = await obtainIMGs(
        [
            "/static/Resources/White%20Rook.png",
            "/static/Resources/White%20Knight.png",
            "/static/Resources/White%20Bishop.png",
            "/static/Resources/White%20Queen.png",
            "/static/Resources/White%20King.png",
            "/static/Resources/White%20Pawn.png",
        ]
    );
    console.log("whiteSide_IMGs:", whiteSide_IMGs);
    console.log("blackSide_IMGs:", blackSide_IMGs);
    
    currentSide = Side.White;

    currentPlayerTimer = new Timer(
        timer, PerMove, Player2Timer, opposingPlayerSide, ()=>{
        currentSide = Side.Neutral;
    });
    opposingPlayerTimer = new Timer(
        timer, PerMove, Player1Timer, currentPlayerSide, ()=>{
        currentSide = Side.Neutral;
    });

    let AcceptDraw = document.getElementById("AcceptDraw");
    let ForfeitMatch = document.getElementById("ForfeitMatch");
    let ForfeitMatch_Forfeit = ForfeitMatch.querySelector("button:nth-of-type(2)");
    let AcceptDraw_Accept = AcceptDraw.querySelector("button:nth-of-type(1)");

    ForfeitMatch_Forfeit.addEventListener("click", ()=>stopAllTimers(currentPlayerTimer, opposingPlayerTimer));
    AcceptDraw_Accept.addEventListener("click", ()=>stopAllTimers(currentPlayerTimer, opposingPlayerTimer));

    let ctx = canvas.getContext("2d", { willReadFrequently: true });
    chessdata = setUpChessBoardData(currentPlayerSide, opposingPlayerSide);


    /* Init attack range for all pieces */
    chessdata.forEach((row)=>{
        row.forEach(
            (tile)=>{
                tile.ChessPiece.initAttackRange(chessdata);
            });
        });

    let coordP1_King = getP1KingCoord();
    let coordP2_King = getP2KingCoord();
    /*
    alert("cooordP1_King: " + coordP1_King.row + " " + coordP1_King.col +
    " coordP2_King: " + coordP2_King.row + " "+ coordP2_King.col);
    */

    TileWidth = (canvas.width - positionTextSize) / Cols;
    TileHeight = (canvas.height - positionTextSize )/ Rows;
    
    window.addEventListener("resize", ()=>{
        Data2Canvas(chessdata);
    });

    Data2Canvas(chessdata);

    if(currentSide === currentPlayerSide){
        currentPlayerTimer.start();
    }else{
        opposingPlayerTimer.start();
    }

    canvas.addEventListener("click", (ev)=>{
    let CanvasRect = canvas.getBoundingClientRect();
    let x = ev.clientX - CanvasRect.left;
    let y = ev.clientY - CanvasRect.top;
    
    /*Just in case canvas changes width and length*/
    TileWidth = (canvas.width - positionTextSize) / Cols;
    TileHeight = (canvas.height - positionTextSize )/ Rows;

    let temp = {row: Math.floor(y / TileHeight), col: Math.floor(x / TileWidth)};
    /*Save clicks*/
    if(lastclicks.length > 1){
        lastclicks = [];
    }

    /** @type {ChessPiece} */
    let targetPiece = chessdata[temp.row][temp.col].ChessPiece;
    let X = (temp.col * TileWidth) + boardOffset;
    let Y = (temp.row * TileHeight) + boardOffset;
    
    if(!check.status || check.status){ //Maybe f I have time, can have address check
        NormalSelection(
            lastclicks, targetPiece, temp, ctx, X, Y, currentPlayerSide, 
            opposingPlayerSide, chessdata, currentPlayerTimer, opposingPlayerTimer
        );
    }
});

        
}

/**
 * * Function
 * */

function selectAlly(X, Y, CTX, TileWidth, TileHeight, lastclicks){
    lastclicks.push({image: CTX.getImageData(X, Y, TileWidth, TileHeight), _x: X, _y: Y });
    console.log("Popped selection: " + lastclicks.length);
    if(currentSide === Side.White){
        CTX.fillStyle = "RGBA(255, 255, 0, 0.5)";
    }
    else{
        CTX.fillStyle = "RGBA(0, 0, 255, 0.5)";
    }
    
    CTX.fillRect( X, Y, TileWidth, TileHeight);
}

function obtainIMGs(urls = []){
    return Promise.all(
        urls.map(
            link=> new Promise(
                (resolve,reject)=>{
                    let img = new Image();
                    function resolution(){
                        img.removeEventListener("load", resolution);
                        resolve(img);
                    }
                    function rejection(){
                        img.removeEventListener("error", rejection);
                        reject();
                    }
                    img.addEventListener("load", resolution);
                    img.addEventListener("error", rejection);
                    img.src = link;
                }
            )
        )
    );
}

function draw(
    ctx, img, RowNum = 0, ColumnNum = 0, boardOffset,
    TileHeight, TileWidth, scaleDown
){
    ctx.drawImage(
        img,
        /* Starting Point of Tile to be drawn on + position of the chess piece offset */ 
        (ColumnNum * TileWidth) + boardOffset + ((TileWidth - (img.width / scaleDown)) / 2), 
        (RowNum * TileHeight) + boardOffset + ((TileHeight - (img.height / scaleDown)) / 2),
        img.width / scaleDown, img.height / scaleDown);
}

function drawColouredTiles(rowTile, columnTile, ctx, TileWidth, TileHeight){
    console.log("rowTile:", rowTile, "columnTile:", columnTile);
    
    ctx.fillStyle = tileColours[rowTile % 2][columnTile % 2];
    ctx.fillRect((columnTile * TileWidth) + boardOffset, 
    (rowTile * TileHeight) + boardOffset, TileWidth, TileHeight);
}

function Data2Canvas(chessdata){
    lastclicks = [];
    targetpieces = [];

    let chessCanvas = document.getElementById("ChessboardLayout");
    let dpr = window.devicePixelRatio;
    let ctx = chessCanvas.getContext("2d", { willReadFrequently: true });

    /**
    * Set Canvas Height, Width, and Font
    */
    let rect = chessCanvas.getBoundingClientRect();
    chessCanvas.height = rect.height * dpr;
    chessCanvas.width = rect.width * dpr;
    ctx.font = "Bold " + fontPX + "px Helvetica";

    /**
    * Define Chess Tiles and their position
    */
    let tileWidth = (chessCanvas.width - positionTextSize) / Rows;
    let tileHeight = (chessCanvas.height - positionTextSize) / Cols;

    /**
     ** Render the Chess Tiles
     */
    for (let rowTile = 0; rowTile < Rows; rowTile++) {
        for (let columnTile = 0; columnTile < Cols; columnTile++) {
            ctx.fillStyle = tileColours[rowTile % 2][columnTile % 2];
            ctx.fillRect((columnTile * tileWidth) + boardOffset, 
            (rowTile * tileHeight) + boardOffset, tileWidth, tileHeight);
        }
    }

    /**
    * Define Labels on Chessboard and their position
    */
    ctx.fillStyle = "#1BA1E2";
    let labelOffsetWidth = (tileWidth - fontPX) / 2;
    let labelOffsetHeight = (tileHeight / 2) + 5;

    for (let columnTile = 0; columnTile < Cols; columnTile++) {
        ctx.fillText(
            bottomColumnLabels[columnTile], 
            (columnTile * tileWidth) + boardOffset + labelOffsetWidth + 3, 
            chessCanvas.height - 2);
    }

    for (let rowTile = 0; rowTile < Rows; rowTile++) {
        ctx.fillText(leftRowLabels[rowTile], ((positionTextSize - fontPX) / 2) - 5, 
        (rowTile * tileHeight) + boardOffset + labelOffsetHeight);
    }

    /**
     * * Render the Chess Pieces
     */
    for (let rowTile = 0; rowTile < Rows; rowTile++) {
        for (let columnTile = 0; columnTile < Cols; columnTile++) {
            let chesspiece = chessdata[rowTile][columnTile].ChessPiece;
            let downscaling = 1.4;
            let chesstype = 0;
            let piece;
            switch (chesspiece.ClassName) {
                case ChessTypes.Pawn:
                    chesstype = Pawn;
                    break;
                case ChessTypes.Rook:
                    chesstype = Rook;
                    break;
                case ChessTypes.Knight:
                    chesstype = Knight;
                    break;
                case ChessTypes.Bishop:
                    chesstype = Bishop;
                    downscaling = 1.5;
                    break;
                case ChessTypes.Queen:
                    chesstype = Queen;
                    downscaling = 1.5;
                    break;
                case ChessTypes.King:
                    chesstype = King;
                    break;
                default:
                    break;
                }
            if(chesspiece.Side === Side.White){
               
                piece = whiteSide_IMGs[chesstype];
                
            }else if(chesspiece.Side === Side.Black){
                
                piece = blackSide_IMGs[chesstype];
            }
            if(chesspiece.Side !== Side.Neutral){
                ctx.drawImage(
                    piece,
                    /* Starting Point of Tile to be drawn on + position of the chess piece offset */ 
                    (columnTile * tileWidth) + boardOffset + ((tileWidth - (piece.width / downscaling)) / 2), 
                    (rowTile * tileHeight) + boardOffset + ((tileHeight - (piece.height / downscaling)) / 2),
                    piece.width / downscaling, piece.height / downscaling
                );
            }
           
            
        }
    }
            
}

/**
 *
 * @param {Array<Array<ChessTile>>} chessdata 
 * @param {string} currentside 
 * @param {ChessPiece} chesspiece 
 * @param {ChessPiece} targetpiece
 * @returns {boolean} true if the chess piece can move to the target tile, false otherwise
 */
function isMoveAble(chessdata, currentside, chesspiece, targetpiece){
    
    let P1_KingCoord = getP1KingCoord();
    let P2_KingCoord = getP2KingCoord();
    let P1_King = chessdata[P1_KingCoord.row][P1_KingCoord.col].ChessPiece;
    let P2_King = chessdata[P2_KingCoord.row][P2_KingCoord.col].ChessPiece;
    let king = (P1_King.Side === currentside) ? P1_King : P2_King;
    let kingOppo = (P1_King.Side === currentside) ? P2_King : P1_King;

    /* Check position of our chess piece */
    let currentRow = chesspiece.Row;
    let currentCol = chesspiece.Col;

    let inDanger = false;
    let enPassant = false;
    let currentCallable = chessdata[currentRow][currentCol].Callable;
    currentCallable.forEach((callable)=>{
        let status = callable(king).status;
        if(status === Status.Block){
            inDanger = true;
            
        }
        //alert(status);
    });
    /* If this piece does not have block status, it means the kng is liekly not under attack
    or this piece is too far to cover the king anyway*/
    if(inDanger && chesspiece.ClassName !== ChessTypes.King){
        /* 
        If checking direction towards the king from the piece yields no one to protect
        the king, it will stay falase and secondary checking opposite of that direction will
        be done
        */
        let firstCheck = false;
        /* Check diagonals first */
        if(Math.abs(king.Row - currentRow) === Math.abs(king.Col - currentCol)){
            /* If king to the top right of piece */
            if(king.Row < currentRow && king.Col > currentCol){
                /* Check top right of the piece */
                let tempRow = currentRow - 1;
                let tempCol = currentCol + 1;
                while (tempRow !== king.Row && tempCol != king.Col) {
                    let temp = chessdata[tempRow][tempCol].ChessPiece;
                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        firstCheck = true;
                        break;
                    }
                        tempRow--;
                        tempCol++;
                    }
                if(!firstCheck){
                /* Check bottom left of the piece */
                let tempRow = currentRow + 1;
                let tempCol = currentCol - 1;
                while (tempRow <= 7 && tempCol >= 0) {
                    let temp = chessdata[tempRow][tempCol].ChessPiece;
                    if(temp.Side === currentSide){
                        break;
                    }
                    if(
                        temp.ClassName === ChessTypes.Queen 
                        || temp.ClassName === ChessTypes.Bishop
                    ){
                        /* Check if this piece can move towards attacker */
                        if(chesspiece.MoveWhileBlocked(chessdata, targetpiece, temp)){
                            break;
                        }
                        return false; //Obstacles found!
                    }

                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        break;
                    }
                        tempRow++;
                        tempCol--;
                    }}
                }
                /* If king to the top left of piece */
                else if(king.Row < currentRow && king.Col < currentCol){
                /* Check top left of the piece */
                let tempRow = currentRow - 1;
                let tempCol = currentCol - 1;
                while (tempRow !== king.Row && tempCol != king.Col) {
                    let temp = chessdata[tempRow][tempCol].ChessPiece;
                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        firstCheck = true;
                        break;
                    }
                        tempRow--;
                        tempCol--;
                    }
                if(!firstCheck){
                /* Check bottom right of the piece */
                let tempRow = currentRow + 1;
                let tempCol = currentCol + 1;
                while (tempRow <= 7 && tempCol <= 7) {
                    let temp = chessdata[tempRow][tempCol].ChessPiece;
                    if(temp.Side === currentSide){
                        break;
                    }
                    if(
                        temp.ClassName === ChessTypes.Queen 
                        || temp.ClassName === ChessTypes.Bishop
                    ){
                        /* Check if this piece can move towards attacker */
                        if(chesspiece.MoveWhileBlocked(chessdata, targetpiece, temp)){
                            break;
                        }
                        return false; //Obstacles found!
                    }

                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        break;
                    }

                        tempRow++;
                        tempCol++;
                    }}
                }

                /* If king to the bottom right of piece */
                else if(king.Row > currentRow && king.Col > currentCol){
                /* Check top bottom right of the piece */
                let tempRow = currentRow + 1;
                let tempCol = currentCol + 1;
                while (tempRow !== king.Row && tempCol != king.Col) {
                    let temp = chessdata[tempRow][tempCol].ChessPiece;
                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        firstCheck = true;
                        break;
                    }
                        tempRow++;
                        tempCol++;
                    }
                if(!firstCheck){
                /* Check top left of the piece */
                let tempRow = currentRow - 1;
                let tempCol = currentCol - 1;
                while (tempRow >= 0 && tempCol >= 0) {
                    let temp = chessdata[tempRow][tempCol].ChessPiece;
                    if(temp.Side === currentSide){
                        break;
                    }
                    if(
                        temp.ClassName === ChessTypes.Queen 
                        || temp.ClassName === ChessTypes.Bishop
                    ){
                        /* Check if this piece can move towards attacker */
                        if(chesspiece.MoveWhileBlocked(chessdata, targetpiece, temp)){
                            break;
                        }
                        return false; //Obstacles found!
                    }

                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        break;
                    }

                        tempRow--;
                        tempCol--;
                    }}
                }

                /* If king to the bottom left of piece */
                else if(king.Row > currentRow && king.Col < currentCol){
                /* Check bottom left of the piece */
                let tempRow = currentRow + 1;
                let tempCol = currentCol - 1;
                while (tempRow !== king.Row && tempCol != king.Col) {
                    let temp = chessdata[tempRow][tempCol].ChessPiece;
                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        firstCheck = true;
                        break;
                    }
                        tempRow++;
                        tempCol--;
                    }
                if(!firstCheck){
                /* Check top right of the piece */
                let tempRow = currentRow - 1;
                let tempCol = currentCol + 1;
                while (tempRow >= 0 && tempCol <= 7) {
                    let temp = chessdata[tempRow][tempCol].ChessPiece;
                    if(temp.Side === currentSide){
                        break;
                    }
                    if(
                        temp.ClassName === ChessTypes.Queen 
                        || temp.ClassName === ChessTypes.Bishop
                    ){
                        /* Check if this piece can move towards attacker */
                        if(chesspiece.MoveWhileBlocked(chessdata, targetpiece, temp)){
                            break;
                        }
                        return false; //Obstacles found!
                    }

                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        break;
                    }

                        tempRow--;
                        tempCol++;
                    }}
                }
            }

            /* If king same row as piece but on the right of the piece */
            else if(king.Row === currentRow && king.Col > currentCol){
                /* Check right of the piece */
                let tempCol = currentCol + 1;
                while (tempCol <= 7) {
                    let temp = chessdata[currentRow][tempCol].ChessPiece;
                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        firstCheck = true;
                        break;
                    }
                    tempCol++;  
                }
                if(!firstCheck){
                /* Check left of the piece */
                let tempCol = currentCol - 1;
                while (tempCol >= 0) {
                    let temp = chessdata[currentRow][tempCol].ChessPiece;
                    if(temp.Side === currentSide){
                        break;
                    }
                    if(
                        temp.ClassName === ChessTypes.Queen 
                        || temp.ClassName === ChessTypes.Rook
                    ){
                        /* Check if this piece can move towards attacker */
                        if(chesspiece.MoveWhileBlocked(chessdata, targetpiece, temp)){
                            break;
                        }
                        return false; //Obstacles found!
                    }

                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        break;
                    }

                        tempCol--;  
                }}
            }

            /* If king same row as piece but on the left of the piece */
            else if(king.Row === currentRow && king.Col < currentCol){
                /* Check left of the piece */
                let tempCol = currentCol - 1;
                while (tempCol >= 0) {
                    let temp = chessdata[currentRow][tempCol].ChessPiece;
                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        firstCheck = true;
                        break;
                    }
                    tempCol--;  
                }
                if(!firstCheck){
                /* Check right of the piece */
                let tempCol = currentCol + 1;
                while (tempCol <= 7) {
                    let temp = chessdata[currentRow][tempCol].ChessPiece;
                    if(temp.Side === currentSide){
                        break;
                    }
                    if(
                        temp.ClassName === ChessTypes.Queen 
                        || temp.ClassName === ChessTypes.Rook
                    ){
                        /* Check if this piece can move towards attacker */
                        if(chesspiece.MoveWhileBlocked(chessdata, targetpiece, temp)){
                            break;
                        }
                        return false; //Obstacles found!
                    }

                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        break;
                    }

                        tempCol++;  
                }}
            }

            /* If king same col as piece but on the top of the piece */
            else if(king.Col === currentCol && king.Row < currentRow){
                /* Check top of the piece */
                let tempRow = currentRow - 1;
                while (tempRow >= 0) {
                    let temp = chessdata[tempRow][currentCol].ChessPiece;
                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        firstCheck = true;
                        break;
                    }

                        tempRow--;  
                }
                if(!firstCheck){
                /* Check bottom of the piece */
                let tempRow = currentRow + 1;
                while (tempRow <= 7) {
                    let temp = chessdata[tempRow][currentCol].ChessPiece;
                    if(temp.Side === currentSide){
                        break;
                    }
                    if(
                        temp.ClassName === ChessTypes.Queen 
                        || temp.ClassName === ChessTypes.Rook
                    ){
                        /* Check if this piece can move towards attacker */
                        if(chesspiece.MoveWhileBlocked(chessdata, targetpiece, temp)){
                            break;
                        }
                        return false; //Obstacles found!
                    }

                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        break;
                    }

                        tempRow++;  
                }}
            }

            /* If king same col as piece but on the bottom of the piece */
            else if(king.Col === currentCol && king.Row > currentRow){
                /* Check bottom of the piece */
                let tempRow = currentRow + 1;
                while (tempRow >= 0) {
                    let temp = chessdata[tempRow][currentCol].ChessPiece;
                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        firstCheck = true;
                        break;
                    }

                        tempRow++;  
                }
                if(!firstCheck){
                /* Check top of the piece */
                let tempRow = currentRow - 1;
                while (tempRow >= 0) {
                    let temp = chessdata[tempRow][currentCol].ChessPiece;
                    if(temp.Side === currentSide){
                        break;
                    }
                    if(
                        temp.ClassName === ChessTypes.Queen 
                        || temp.ClassName === ChessTypes.Rook
                    ){
                        /* Check if this piece can move towards attacker */
                        if(chesspiece.MoveWhileBlocked(chessdata, targetpiece, temp)){
                            break;
                        }
                        return false; //Obstacles found!
                    }

                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        break;
                    }

                        tempRow--;  
                }}
            }
        
    }

    /* If No danger to the king when this piece moves,
    * Send coordinates to the chess piece to see if the distance is valid
    */
   if(chesspiece.Move(targetpiece, currentCallable, chessdata)){
    if(enPassant){
        /* Redraw everything as it will be easier for me to implement */
        Data2Canvas(chessdata);
    }
    /* Deploy callables (especially Attack Range) */
    chesspiece.RemovePreviousAttackRange();
    chesspiece.AttackRange(chessdata, targetpiece);
    chesspiece.ActuallyMove(chessdata, targetpiece);

    let temp = chesspiece;
    /* Check if a king have moved */
    if(chesspiece.ClassName === ChessTypes.King){
        if(P1_King.Side === chesspiece.Side){
            P1_KingCoord.row = chesspiece.Row;
            P1_KingCoord.col = chesspiece.Col;
            /*
            alert(
                "King Coords: " + "\n Row:" +  P1_KingCoord.row
                + "\n Col: " + P1_KingCoord.col
            );
            */
        }else{
            P2_KingCoord.row = chesspiece.Row;
            P2_KingCoord.col = chesspiece.Col;
            /*
            alert(
                "King Coords: " + "\n Row:" +  P2_KingCoord.row
                + "\n Col: " + P2_KingCoord.col
            );
            */
        }
    }else if(chesspiece instanceof P1_Pawn && chesspiece.Row === 7){
        chesspiece.RemovePreviousAttackRange();
        temp = chessdata[chesspiece.Row][chesspiece.Col].ChessPiece = 
        new P1_Queen(chesspiece.Side, chesspiece.Row, chesspiece.Col);
        temp.initAttackRange(chessdata);
    }else if(chesspiece instanceof P2_Pawn && chesspiece.Row === 0){
        chesspiece.RemovePreviousAttackRange();
        temp = chessdata[chesspiece.Row][chesspiece.Col].ChessPiece = 
        new P2_Queen(chesspiece.Side, chesspiece.Row, chesspiece.Col);
        temp.initAttackRange(chessdata);
    }

    

    /**
     * Check if the opposing king are checked
     */
    check.status = temp.checkKingOverlapwithAttackRange(chessdata, kingOppo);
    if(check.status){
        console.log("Check! Opposing King is under attack!");
        /* Check if opponent king have a way to escape */
        let escape = false;
        for (let index = 0; index < kingOppo.CurrentTilesAffected.length; index++) {
            kingOppo.CurrentTilesAffected[index].Callable.forEach(callable=>{
                if(callable.status !== Status.Block){
                    escape = true;
                }
                else{
                    escape = false;
                }
            });
            if(escape){
                break;
            }
        }
        if(!escape){
            stopAllTimers(currentPlayerTimer, opposingPlayerTimer);
            let EventBanner = document.getElementById("EventBanner");
            EventBanner.innerHTML = "Event: Checkmate<br>" + kingOppo.Side + " wins!";
            EventBanner.dataset.promptHidden = true;
            currentSide = Side.Neutral;
        }
    }
    return true;
   }

    
    return false;
    
}
/**
 * 
 * @param {Array} lastclicks 
 * @param {ChessPiece} targetPiece 
 * @param {Object} temp 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} X 
 * @param {number} Y 
 * @param {string} currentPlayerSide 
 * @param {string} opposingPlayerSide
 * @param {Array<Array<ChessTile>>} chessdata  
 * @param {Timer} currentPlayerTimer 
 * @param {Timer} opposingPlayerTimer 
 */
function NormalSelection(
    lastclicks, targetPiece, temp, ctx, X, Y, currentPlayerSide, opposingPlayerSide, chessdata,
    currentPlayerTimer, opposingPlayerTimer
){
    if(lastclicks.length === 0 && targetPiece.Side === currentSide){
        selectAlly(X, Y, ctx, TileWidth, TileHeight, lastclicks);
    }
    else if (
        lastclicks.length === 1 && targetPiece.Side === currentSide 
        && targetPiece.ClassName === ChessTypes.King
    ){
        selectAlly(X, Y, ctx, TileWidth, TileHeight, lastclicks);
        for (let index = 0; index < 2; index++) {
            const details = lastclicks.pop();
            ctx.putImageData(details.image, details._x, details._y);
        }
        
    }
    else if (lastclicks.length === 1 && targetPiece.Side === currentSide){
        let details = lastclicks.pop();
        ctx.putImageData(details.image, details._x, details._y);
        selectAlly(X, Y, ctx, TileWidth, TileHeight, lastclicks);
    }

    /* So first click cannot select chess tiles */
    if(
        targetpieces.length === 0 && targetPiece.ClassName !== ChessTypes.ChessPiece 
        && targetPiece.Side == currentSide
    ){
        targetpieces.push({target: targetPiece, _x: temp.row, _y: temp.col});
    }
    /* So the second click will either take in tile or opponent chess piece */
    else if(
        targetpieces.length === 1 && targetPiece.Side !== currentSide
    ){
        targetpieces.push({target: targetPiece, _x: temp.row, _y: temp.col});
    }
    /* Assuming the second click is to reselect allying chess piece */
    else if(
        targetpieces.length === 1 && targetPiece.Side === currentSide
    ){
        targetpieces.length = 0;
        targetpieces.push({target: targetPiece, _x: temp.row, _y: temp.col});
    }

    /**
     *  After Selecting a piece and what if second piece is selected
     */
    if(targetpieces.length === 2){
        let piece1Info = targetpieces[0];
        let piece2Info = targetpieces[1];

        let piece1Name = piece1Info.target.ClassName;
        let piece1Side = piece1Info.target.Side;

        let piece2Name = piece2Info.target.ClassName;
        let piece2Side = piece2Info.target.Side;

        let piece1Row = piece1Info._x;
        let piece1Col = piece1Info._y;

        let piece2Row = piece2Info._x;
        let piece2Col = piece2Info._y;

        let piece1piece = piece1Info.target;
        let piece2piece = piece2Info.target;

        targetpieces.length = 0;

        /* Check if pawn move to empty tile */
        if (
            piece1Name !== ChessTypes.ChessPiece && piece1Side === currentSide
            && piece2Name !== ChessTypes.King && piece2Side !== currentSide
        ){
            if(isMoveAble(
                chessdata, currentSide, piece1piece, 
                piece2piece
            )){ 
                /* Move */
                targetpieces.length = 0;
                let details = lastclicks.pop();
                lastclicks.length = 0;
                if(details)
                ctx.putImageData(details.image, details._x, details._y);
                let downscaling = 1.4;
                let chesstype = 0;
                let piece;
                switch (piece1Name) {
                    case ChessTypes.Pawn:
                        chesstype = Pawn;
                        break;
                    case ChessTypes.Rook:
                        chesstype = Rook;
                        break;
                    case ChessTypes.Knight:
                        chesstype = Knight;
                        break;
                    case ChessTypes.Bishop:
                        chesstype = Bishop;
                        downscaling = 1.5;
                        break;
                    case ChessTypes.Queen:
                        chesstype = Queen;
                        downscaling = 1.5;
                        break;
                    case ChessTypes.King:
                        chesstype = King;
                        break;
                    default:
                        break;
                }

                if(piece1piece instanceof P1_Pawn && piece2piece.Row === 7){
                    chesstype = Queen;
                }else if(piece1piece instanceof P2_Pawn && piece2piece.Row === 0){
                    chesstype = Queen;
                }

                switch (currentSide) {
                    case Side.White:
                        piece = whiteSide_IMGs[chesstype];
                        break;
                    case Side.Black:
                        piece = blackSide_IMGs[chesstype];
                        break;
                    default:
                        console.log("Invalid side:", currentSide);
                        break;
                }
                
                drawColouredTiles(temp.row, temp.col, ctx, TileWidth, TileHeight);
                
                draw(
                    ctx, piece, temp.row, temp.col, 
                    boardOffset, TileHeight, TileWidth, downscaling
                );
                
                drawColouredTiles(piece1Row, piece1Col, ctx, TileWidth, TileHeight);

                /**
                 * Stop time for the player that moved
                 */
                if(currentSide === currentPlayerSide){
                    currentPlayerTimer.stop();
                    currentPlayerTimer.add();
                }else{
                    opposingPlayerTimer.stop();
                    opposingPlayerTimer.add();
                }

                let notation = PieceNotation.get(piece1Name) + HorizontalNotation[temp.col] + ( 8 - temp.row);
                if(currentSide === Side.White){
                    addNewNotationRow(notation);
                }else if(currentSide == Side.Black){
                    addBlackEntry(notation);
                }

                
                let tempSide = currentSide;
                currentSide = Side.Neutral;
                
                /* Random Event */
                randomEvent(
                    chessdata, tempSide, currentPlayerSide, opposingPlayerSide,
                    ctx, boardOffset, TileHeight, TileWidth, downscaling,
                    blackSide_IMGs, whiteSide_IMGs
                ).then((NextSide)=>{
                    // Switch turns
                    currentSide = NextSide;
                    console.log("Turn switched. Current side:", currentSide);
                    /**
                     * Start time for the next player
                     * */
                    if(currentSide === currentPlayerSide){
                        currentPlayerTimer.start();
                    }else{
                        opposingPlayerTimer.start();
                    }
                });
                
                //currentSide = (currentSide === currentPlayerSide) ? opposingPlayerSide : currentPlayerSide;

            }
            /* If it fails */
            else{
                let details = lastclicks.pop();
                if(details)
                ctx.putImageData(details.image, details._x, details._y);
            }
        }
        /* 
        If second piece is ally, reset the targetpieces array and have
        the second piece as first piece
         */
        else if(
            piece1Side === currentSide && piece2Side === currentSide
        ){
            let temp = targetpieces.pop();
            targetpieces.length = 0;
            targetpieces.push(temp);
        }
        /* Check if castling */
        else if(
            piece1Name === ChessTypes.Rook && piece1Side === currentSide
            && piece2Name === ChessTypes.King && piece2Side === currentSide
        ){
            if(true){ /* Pretend its true */
                
            }
        }

        
        
    }
    console.log("lastclicks:", lastclicks);
    console.log(targetPiece.ClassName, "at row: " + targetPiece.Row + " col: " + targetPiece.Col);
    /*
    alert(
        "check: " + check.status +
        "\nrow: " + temp.row + " col: " + temp.col + " is " + targetPiece.ClassName
    );
    */
}

/**
 * @param {Array<Array<ChessTile>>} chessdata 
 * @param {string} currentSide 
 * @param {string} currentPlayerSide
 * @param {string} opposingPlayerSide
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} boardOffset 
 * @param {number} TileHeight 
 * @param {number} TileWidth 
 * @param {number} scaleDown  
 * @param {ImageData} blackSide_IMGs 
 * @param {ImageData} whiteSide_IMGs 
 */
async function randomEvent(chessdata, currentSide, currentPlayerSide, opposingPlayerSide,
    ctx, boardOffset, TileHeight, TileWidth,  scaleDown, blackSide_IMGs, whiteSide_IMGs
){
    /**
     * @type {Array<Function>}
     */
    const event = [Disappear, Betray, async ()=>{}];
    let random = Math.floor(Math.random() * 2);

    if(random === 2){
        return (currentSide === currentPlayerSide) ? opposingPlayerSide : currentPlayerSide;
    }
    /* Pause both timers, if any */

    /* Random Event */
    await event[random](
        chessdata, ctx, boardOffset, TileHeight, TileWidth, scaleDown,
        blackSide_IMGs, whiteSide_IMGs
    );

    return (currentSide === currentPlayerSide) ? opposingPlayerSide : currentPlayerSide;
}

/**
 * 
 * @param {Timer} playerTimer1 
 * @param {Timer} playerTimer2 
 */
function stopAllTimers(playerTimer1, playerTimer2){
    playerTimer1.stop();
    playerTimer2.stop();
}