import { setUpChessBoardData, getP1KingCoord, getP2KingCoord } from "./Chess Data V2.js";
import { ChessTypes, Side, Status } from "./Chess Constants.js";
import { ChessTile } from "./Chess Tiles V2.js";
import { ChessPiece } from "./Chess Pieces V2.js";


let lastclicks = [];
let targetpieces = [];
let chessdata;
let currentSide;
const Rows = 8;
const Cols = 8;
const positionTextSize = 40;
const fontPX = 20;
let TileWidth = 0
let TileHeight = 0;
const boardOffset = positionTextSize / 2;
const tileColours = [["#FFB366", "#994C00"], ["#994C00","#FFB366"]];
let blackSide_IMGs = [];
let whiteSide_IMGs = [];
let Rook = 0;
let Knight = 1;
let Bishop = 2;
let Queen = 3;
let King = 4;
let Pawn = 5;

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} currentPlayerSide 
 * @param {string} opposingPlayerSide 
 */
export async function React2Canvas(canvas, currentPlayerSide, opposingPlayerSide){
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
    
    currentSide = currentPlayerSide;

    let ctx = canvas.getContext("2d", { willReadFrequently: true });
    chessdata = setUpChessBoardData(currentPlayerSide, opposingPlayerSide);
    let coordP1_King = getP1KingCoord();
    let coordP2_King = getP2KingCoord();
    alert("cooordP1_King: " + coordP1_King.row + " " + coordP1_King.col +
    " coordP2_King: " + coordP2_King.row + " "+ coordP2_King.col);

    TileWidth = (canvas.width - positionTextSize) / Cols;
    TileHeight = (canvas.height - positionTextSize )/ Rows;
    
    window.addEventListener("resize", ()=>{
        Data2Canvas(chessdata);
    });

    Data2Canvas(chessdata);

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

    let targetPiece = chessdata[temp.row][temp.col].ChessPiece;
    let X = (temp.col * TileWidth) + boardOffset;
    let Y = (temp.row * TileHeight) + boardOffset;
    
    if(lastclicks.length === 0 && targetPiece.Side === currentSide){
        selectAlly(X, Y, ctx, TileWidth, TileHeight, lastclicks);
    }
    else if (lastclicks.length === 1 && targetPiece.Side === currentSide && targetPiece.ClassName === ChessTypes.King){
        selectAlly(X, Y, ctx, TileWidth, TileHeight, lastclicks);
        for (let index = 0; index < 2; index++) {
            console.log("TEST")
            const details = lastclicks.pop();
            ctx.putImageData(details.image, details._x, details._y);
        }
        
    }
    else if (lastclicks.length === 1 && targetPiece.Side === currentSide){
        let details = lastclicks.pop();
        ctx.putImageData(details.image, details._x, details._y);
        selectAlly(X, Y, ctx, TileWidth, TileHeight, lastclicks);
    }

    if(targetpieces.length >= 2){
        targetpieces = [];
    }
    if(targetpieces.length === 1){
        /* Check if the selected is duplicated or not */
        if(targetpieces[0].target !== targetPiece){
            targetpieces.push({target: targetPiece, _x: temp.row, _y: temp.col});
        }
    }else{
        /* Ignore chesspiece */
        if(targetPiece.ClassName !== ChessTypes.ChessPiece)
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

        /* Check if pawn move to empty tile */
        if (
            piece1Name !== ChessTypes.ChessPiece && piece1Side === currentSide
            && piece2Name !== ChessTypes.King && piece2Side !== currentSide
        ){
            if(true){ /* Pretend its true */
                /* Move */
                targetpieces = [];
                let details = lastclicks.pop();
                lastclicks = [];
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

                /* Switch turns */
                currentSide = (currentSide === currentPlayerSide) ? opposingPlayerSide : currentPlayerSide;
                console.log("Turn switched. Current side:", currentSide);
                
            }
        }
        /* Check if Rook move to an empty tile */
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
    alert("row: " + temp.row + " col: " + temp.col + " is " + targetPiece.ClassName);
});

        
}

/**
 * * Function
 * */

function selectAlly(X, Y, CTX, TileWidth, TileHeight, lastclicks){
    lastclicks.push({image: CTX.getImageData(X, Y, TileWidth, TileHeight), _x: X, _y: Y });
    console.log("Popped selection: " + lastclicks.length);
    CTX.fillStyle = "RGBA(0, 0, 255, 0.5)";
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
 * @param {number} targetRow 
 * @param {number} targetCol 
 */
function isMoveAble(chessdata, currentside, chesspiece, targetRow, targetCol){
    /* Note: P1 King Coord extract and insert coord must + 1 */
    let P1_KingCoord = getP1KingCoord();
    let P2_KingCoord = getP2KingCoord();
    let P1_King = chessdata[P1_KingCoord.row][P1_KingCoord.col].ChessPiece;
    let P2_King = chessdata[P2_KingCoord.row][P2_KingCoord.col].ChessPiece;
    let king = (P1_King.Side === currentside) ? P1_King : P2_King;

    /* Check position of our chess piece */
    let currentRow = chesspiece.Row;
    let currentCol = chesspiece.Col;

    let currentCallable = chessdata[currentRow][currentCol].Callable;
    /* If this piece does not have block status, it means the kng is liekly not under attack
    or this piece is too far to cover the king anyway*/
    if(currentCallable === Status.Block){
        /* Check if the piece is in the same row but diferent columns - left and right */
        if(currentRow === king.Row && currentCol <= king.Col && currentCol != 0){
            for (let index = currentCol - 1; index >= 0; index--) {
                
            }
        }
        /* Check if the piece is in the same column but diferent rows - top and bottom */
        /* Check if the piece is diagonal but right side - top and bottom */
        /* Check if the piece is diagonal but left side - top and bottom */
    }

    
    
}

function randomEvent(){
    const event = ["disappear", "betrayal"];
}