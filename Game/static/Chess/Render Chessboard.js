import { Side } from "./Chess Constants.js";

let positionTextSize = 0;
let tileWidth = 0;
let tileHeight = 0;
let boardOffset = 0;

let blackSide_IMGs = [];
let whiteSide_IMGs = [];


export let Rook = 0;
export let Knight = 1;
export let Bishop = 2;
export let Queen = 3;
export let King = 4;
export let Pawn = 5;
let _currentPlayerSide;

export function renderChessBoard(currentPlayerSide){
    _currentPlayerSide = currentPlayerSide
    window.addEventListener("resize", ()=>{
        renderBaseChessBoard();
    });

    renderBaseChessBoard();

}


function renderBaseChessBoard(
    rowQTY = 8.0,
    columnQTY = 8.0,
    fontPX = 20,
    tileColours = [["#FFB366", "#994C00"], ["#994C00","#FFB366"]],
    bottomColumnLabels = ["A", "B", "C", "D", "E", "F", "G", "H"],
    leftRowLabels = ["8", "7", "6", "5", "4", "3", "2", "1"]){

        

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
        positionTextSize = 40;
        tileWidth = (chessCanvas.width - positionTextSize) / rowQTY;
        tileHeight = (chessCanvas.height - positionTextSize) / columnQTY;
        boardOffset = positionTextSize / 2;

        /**
         * Render the Chess Tiles
         */
        for (let rowTile = 0; rowTile < rowQTY; rowTile++) {
            for (let columnTile = 0; columnTile < columnQTY; columnTile++) {
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

        for (let columnTile = 0; columnTile < columnQTY; columnTile++) {
            ctx.fillText(
                bottomColumnLabels[columnTile], 
                (columnTile * tileWidth) + boardOffset + labelOffsetWidth + 3, 
                chessCanvas.height - 2);
            }

        for (let rowTile = 0; rowTile < rowQTY; rowTile++) {
            ctx.fillText(leftRowLabels[rowTile], ((positionTextSize - fontPX) / 2) - 5, 
            (rowTile * tileHeight) + boardOffset + labelOffsetHeight);
        }

        /**
         * Define Chess Pieces and their position
         */
        let blackSide = [
            "/static/Resources/Black%20Rook.png",
            "/static/Resources/Black%20Knight.png",
            "/static/Resources/Black%20Bishop.png",
            "/static/Resources/Black%20Queen.png",
            "/static/Resources/Black%20King.png",
            "/static/Resources/Black%20Pawn.png",
        ];
        let whiteSide = [
            "/static/Resources/White%20Rook.png",
            "/static/Resources/White%20Knight.png",
            "/static/Resources/White%20Bishop.png",
            "/static/Resources/White%20Queen.png",
            "/static/Resources/White%20King.png",
            "/static/Resources/White%20Pawn.png",
        ];


        obtainIMGs(blackSide).then(value=>{
            blackSide_IMGs = value;
            console.log(blackSide_IMGs);
            if(_currentPlayerSide === Side.White){
                draw_BlackRook(0,0);
                draw_BlackRook(0,7);
                draw_BlackKnight(0, 1);
                draw_BlackKnight(0, 6);
                draw_BlackBishop(0, 2);
                draw_BlackBishop(0, 5);
                draw_BlackQueen(0, 3);
                draw_BlackKing(0, 4);
                for (let column = 0; column < columnQTY; column++) {
                    draw_BlackPawn(1, column);
                }
            }else{
                draw_BlackRook(7,0);
                draw_BlackRook(7,7);
                draw_BlackKnight(7, 1);
                draw_BlackKnight(7, 6);
                draw_BlackBishop(7, 2);
                draw_BlackBishop(7, 5);
                draw_BlackQueen(7, 4);
                draw_BlackKing(7, 3);
                for (let column = 0; column < columnQTY; column++) {
                    draw_BlackPawn(6, column);
                }
            }
            
        });
        obtainIMGs(whiteSide).then(value=>{
            whiteSide_IMGs = value;
            console.log(whiteSide_IMGs);
            if(_currentPlayerSide === Side.White){
                draw_WhiteRook(7,0);
                draw_WhiteRook(7,7);
                draw_WhiteKnight(7, 1);
                draw_WhiteKnight(7, 6);
                draw_WhiteBishop(7, 2);
                draw_WhiteBishop(7, 5);
                draw_WhiteQueen(7, 3);
                draw_WhiteKing(7, 4);
                for (let column = 0; column < columnQTY; column++) {
                    draw_WhitePawn(6, column);
                }
            }else{
                draw_WhiteRook(0,0);
                draw_WhiteRook(0,7);
                draw_WhiteKnight(0, 1);
                draw_WhiteKnight(0, 6);
                draw_WhiteBishop(0, 2);
                draw_WhiteBishop(0, 5);
                draw_WhiteQueen(0, 4);
                draw_WhiteKing(0, 3);
                for (let column = 0; column < columnQTY; column++) {
                    draw_WhitePawn(1, column);
                }
            } 
        });

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
/**
 * Draw Rook for black side, centered on a chess tile
 * @param {*} RowNum 
 * @param {*} ColumnNum 
 * 
 */
function draw_BlackRook(RowNum = 0, ColumnNum = 0){
    let scaleDown = 1.4;
    let chessCanvas = document.getElementById("ChessboardLayout");
    let ctx = chessCanvas.getContext("2d");
    if(blackSide_IMGs.length > 1){
        let RookPiece = blackSide_IMGs[Rook];
        ctx.drawImage(
        RookPiece,
        /* Starting Point of Tile to be drawn on + position of the chess piece offset */ 
        (ColumnNum * tileWidth) + boardOffset + ((tileWidth - (RookPiece.width / scaleDown)) / 2), 
        (RowNum * tileHeight) + boardOffset + ((tileHeight - (RookPiece.height / scaleDown)) / 2),
        RookPiece.width / scaleDown, RookPiece.height / scaleDown);
    }
    
}
function draw_BlackKnight(RowNum = 0, ColumnNum = 0){
    let scaleDown = 1.4;
    let chessCanvas = document.getElementById("ChessboardLayout");
    let ctx = chessCanvas.getContext("2d");
    if(blackSide_IMGs.length > 1){
        let KnightPiece = blackSide_IMGs[Knight];
        ctx.drawImage(
        KnightPiece,
        /* Starting Point of Tile to be drawn on + position of the chess piece offset */ 
        (ColumnNum * tileWidth) + boardOffset + ((tileWidth - (KnightPiece.width / scaleDown)) / 2), 
        (RowNum * tileHeight) + boardOffset + ((tileHeight - (KnightPiece.height / scaleDown)) / 2),
        KnightPiece.width / scaleDown, KnightPiece.height / scaleDown);
    }
    
}

function draw_BlackBishop(RowNum = 0, ColumnNum = 0){
    let scaleDown = 1.4;
    let chessCanvas = document.getElementById("ChessboardLayout");
    let ctx = chessCanvas.getContext("2d");
    if(blackSide_IMGs.length > 1){
        let Piece = blackSide_IMGs[Bishop];
        ctx.drawImage(
        Piece,
        /* Starting Point of Tile to be drawn on + position of the chess piece offset */ 
        (ColumnNum * tileWidth) + boardOffset + ((tileWidth - (Piece.width / scaleDown)) / 2), 
        (RowNum * tileHeight) + boardOffset + ((tileHeight - (Piece.height / scaleDown)) / 2),
        Piece.width / scaleDown, Piece.height / scaleDown);
    }
}

function draw_BlackQueen(RowNum = 0, ColumnNum = 0){
    let scaleDown = 1.5;
    let chessCanvas = document.getElementById("ChessboardLayout");
    let ctx = chessCanvas.getContext("2d");
    if(blackSide_IMGs.length > 1){
        let Piece = blackSide_IMGs[Queen];
        ctx.drawImage(
        Piece,
        /* Starting Point of Tile to be drawn on + position of the chess piece offset */ 
        (ColumnNum * tileWidth) + boardOffset + ((tileWidth - (Piece.width / scaleDown)) / 2), 
        (RowNum * tileHeight) + boardOffset + ((tileHeight - (Piece.height / scaleDown)) / 2),
        Piece.width / scaleDown, Piece.height / scaleDown);
    }
}

function draw_BlackKing(RowNum = 0, ColumnNum = 0){
    let scaleDown = 1.4;
    let chessCanvas = document.getElementById("ChessboardLayout");
    let ctx = chessCanvas.getContext("2d");
    let KingOffset = 10;
    if(blackSide_IMGs.length > 1){
        let Piece = blackSide_IMGs[King];
        ctx.drawImage(
        Piece,
        /* Starting Point of Tile to be drawn on + position of the chess piece offset */ 
        (ColumnNum * tileWidth) + boardOffset + ((tileWidth - (Piece.width / scaleDown)) / 2), 
        (RowNum * tileHeight) + boardOffset + ((tileHeight - ((Piece.height + KingOffset) / scaleDown)) / 2),
        Piece.width / scaleDown, Piece.height / scaleDown);
    }
}

export function draw_BlackPawn(RowNum = 0, ColumnNum = 0){
    let scaleDown = 1.4;
    let chessCanvas = document.getElementById("ChessboardLayout");
    let ctx = chessCanvas.getContext("2d");
    if(blackSide_IMGs.length > 1){
        let Piece = blackSide_IMGs[Pawn];
        ctx.drawImage(
        Piece,
        /* Starting Point of Tile to be drawn on + position of the chess piece offset */ 
        (ColumnNum * tileWidth) + boardOffset + ((tileWidth - (Piece.width / scaleDown)) / 2), 
        (RowNum * tileHeight) + boardOffset + ((tileHeight - (Piece.height / scaleDown)) / 2),
        Piece.width / scaleDown, Piece.height / scaleDown);
    }else{
        console.log("draw_BlackPawn empty image array");
        
    }
}

/**
 * White pieces
 * @param {*} RowNum 
 * @param {*} ColumnNum 
 */

function draw_WhiteRook(RowNum = 0, ColumnNum = 0){
    let scaleDown = 1.4;
    let chessCanvas = document.getElementById("ChessboardLayout");
    let ctx = chessCanvas.getContext("2d");
    if(blackSide_IMGs.length > 1){
        let RookPiece = whiteSide_IMGs[Rook];
        ctx.drawImage(
        RookPiece,
        /* Starting Point of Tile to be drawn on + position of the chess piece offset */ 
        (ColumnNum * tileWidth) + boardOffset + ((tileWidth - (RookPiece.width / scaleDown)) / 2), 
        (RowNum * tileHeight) + boardOffset + ((tileHeight - (RookPiece.height / scaleDown)) / 2),
        RookPiece.width / scaleDown, RookPiece.height / scaleDown);
    }
    
}
function draw_WhiteKnight(RowNum = 0, ColumnNum = 0){
    let scaleDown = 1.4;
    let chessCanvas = document.getElementById("ChessboardLayout");
    let ctx = chessCanvas.getContext("2d");
    if(blackSide_IMGs.length > 1){
        let KnightPiece = whiteSide_IMGs[Knight];
        ctx.drawImage(
        KnightPiece,
        /* Starting Point of Tile to be drawn on + position of the chess piece offset */ 
        (ColumnNum * tileWidth) + boardOffset + ((tileWidth - (KnightPiece.width / scaleDown)) / 2), 
        (RowNum * tileHeight) + boardOffset + ((tileHeight - (KnightPiece.height / scaleDown)) / 2),
        KnightPiece.width / scaleDown, KnightPiece.height / scaleDown);
    }
    
}

function draw_WhiteBishop(RowNum = 0, ColumnNum = 0){
    let scaleDown = 1.4;
    let chessCanvas = document.getElementById("ChessboardLayout");
    let ctx = chessCanvas.getContext("2d");
    if(blackSide_IMGs.length > 1){
        let Piece = whiteSide_IMGs[Bishop];
        ctx.drawImage(
        Piece,
        /* Starting Point of Tile to be drawn on + position of the chess piece offset */ 
        (ColumnNum * tileWidth) + boardOffset + ((tileWidth - (Piece.width / scaleDown)) / 2), 
        (RowNum * tileHeight) + boardOffset + ((tileHeight - (Piece.height / scaleDown)) / 2),
        Piece.width / scaleDown, Piece.height / scaleDown);
    }
}

function draw_WhiteQueen(RowNum = 0, ColumnNum = 0){
    let scaleDown = 1.5;
    let chessCanvas = document.getElementById("ChessboardLayout");
    let ctx = chessCanvas.getContext("2d");
    if(blackSide_IMGs.length > 1){
        let Piece = whiteSide_IMGs[Queen];
        ctx.drawImage(
        Piece,
        /* Starting Point of Tile to be drawn on + position of the chess piece offset */ 
        (ColumnNum * tileWidth) + boardOffset + ((tileWidth - (Piece.width / scaleDown)) / 2), 
        (RowNum * tileHeight) + boardOffset + ((tileHeight - (Piece.height / scaleDown)) / 2),
        Piece.width / scaleDown, Piece.height / scaleDown);
    }
}

function draw_WhiteKing(RowNum = 0, ColumnNum = 0){
    let scaleDown = 1.4;
    let chessCanvas = document.getElementById("ChessboardLayout");
    let ctx = chessCanvas.getContext("2d");
    let KingOffset = 10;
    if(blackSide_IMGs.length > 1){
        let Piece = whiteSide_IMGs[King];
        ctx.drawImage(
        Piece,
        /* Starting Point of Tile to be drawn on + position of the chess piece offset */ 
        (ColumnNum * tileWidth) + boardOffset + ((tileWidth - (Piece.width / scaleDown)) / 2), 
        (RowNum * tileHeight) + boardOffset + ((tileHeight - ((Piece.height + KingOffset) / scaleDown)) / 2),
        Piece.width / scaleDown, Piece.height / scaleDown);
    }
}

export function draw_WhitePawn(RowNum = 0, ColumnNum = 0){
    let scaleDown = 1.4;
    let chessCanvas = document.getElementById("ChessboardLayout");
    let ctx = chessCanvas.getContext("2d");
    if(blackSide_IMGs.length > 1){
        let Piece = whiteSide_IMGs[Pawn];
        ctx.drawImage(
        Piece,
        /* Starting Point of Tile to be drawn on + position of the chess piece offset */ 
        (ColumnNum * tileWidth) + boardOffset + ((tileWidth - (Piece.width / scaleDown)) / 2), 
        (RowNum * tileHeight) + boardOffset + ((tileHeight - (Piece.height / scaleDown)) / 2),
        Piece.width / scaleDown, Piece.height / scaleDown);
    }
}

