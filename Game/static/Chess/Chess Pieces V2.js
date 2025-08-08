import { ChessTypes, Side, Status } from "./Chess Constants.js";
import { ChessTile, setAttackRange, setEnPassantMe } from "./Chess Tiles V2.js";
import { getP1KingCoord, getP2KingCoord } from "./Chess Data V2.js";
import { setCheck } from "./Canvas Chess.js";

export class ChessPiece{
    /**
     * @param {string} side Use Side constant from Chess Constants module
     */
    constructor(side, row, col){
        this.side = side;
        this.row = row;
        this.col = col;
        /**
         * @type {Array<ChessTile>}
         * @description Tiles that are affected by this piece's attack range
         */
        this.currentTilesAffected = [];
        this.ID = randomID(8); // Generate a random ID for the piece
        console.log(this.ClassName +" row: " + this.Row + " col: " + this.Col);
    }

    /**
     * 
     * @param {ChessPiece} chesspiece
     * @param {Array<Function>} callables  
     * @param {Array<Array<ChessTile>>} chessdata 
     * @returns {boolean}
     */
    Move(chesspiece, callables, chessdata){
        return true;
    }

     /**
     * 
     * @param {Array<Array<ChessTile>>} chessdata If it can set enpassantme to tiile behind or infront
     * @param {ChessPiece} chesspiece to compare with coords to know if it wil move two squares forward
     */
    AttackRange(chessdata, chesspiece){

    }
    /**
     * 
     * @param {Array<Array<ChessTile>>} chessdata 
     */
    initAttackRange(chessdata){

    }

    RemovePreviousAttackRange(){
        this.currentTilesAffected.forEach(tile => {
            tile.Callable = tile.Callable
            /* Filter out callables from this piece */
            .filter(callable => callable(this).from !== this.ID);
        });
    }

    ActuallyMove(chessdata, targetpiece){
        let currentTile = chessdata[this.row][this.col];
        let targetTile = chessdata[targetpiece.Row][targetpiece.Col];

        currentTile.ChessPiece = new ChessPiece(Side.Neutral, this.row, this.col);
        targetTile.ChessPiece = this;
        this.row = targetpiece.Row;
        this.col = targetpiece.Col;
    }
    /**
     * 
     * @param {ChessTile} affectedtile 
     */
    CheckKingOverlapwithAttackRange(affectedtile){
        
    }

    get Side(){return this.side;}
    set Side(side){this.side = side;}

    get Row(){return this.row;}
    set Row(row){this.row = row;}
    get Col(){return this.col;}
    set Col(col){this.col = col;}

    get ClassName(){return ChessTypes.ChessPiece;}
}

export class P1_Pawn extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
        console.log(this.ClassName +" row: " + this.Row + " col: " + this.Col);
        this.hasMoved = false; // To check if it has moved two squares forward
    }
    get ClassName(){return ChessTypes.Pawn;}

    /**
     * 
     * @param {ChessPiece} chesspiece
     * @param {Array<Function>} callables 
     * @param {Array<Array<ChessTile>>} chessdata  
     * @returns {boolean}
     */
    Move(chesspiece, callables, chessdata){
        let enPassant = false;
        callables.forEach(callable => {
            if(callable(this.Side).status === Status.EnPassant){
                enPassant = true;
            }
        });

        if (
            enPassant && chesspiece.ClassName === ChessTypes.ChessPiece 
            && chesspiece.Side !== this.Side && chesspiece.Side !== Side.Neutral
            && chesspiece.Row === this.Row
            && (chesspiece.Col - this.Col === 1 || chesspiece.Col - this.Col === -1)
        ){
            this.hasMoved = true;
            return true;  
        }

        if (
            chesspiece.ClassName === ChessTypes.ChessPiece
            && chesspiece.Side !== this.Side
            && chesspiece.Row - this.Row === 1 && chesspiece.Col === this.Col
        ){
            this.hasMoved = true;
            return true;
        }

        if (
            this.hasMoved === false
            && chesspiece.ClassName === ChessTypes.ChessPiece
            && chesspiece.Side !== this.Side
            && chesspiece.Row - this.Row === 2 && chesspiece.Col === this.Col
        ){
            this.hasMoved = true;
            return true;
        }

        if (
            chesspiece.ClassName !== ChessTypes.ChessPiece
            && chesspiece.Side !== this.Side
            && chesspiece.ClassName !== ChessTypes.King
            && chesspiece.Row > this.Row && (chesspiece.Col > this.Col || chesspiece.Col < this.Col)
        ){
            this.hasMoved = true;
            return true;
        }

        return false; 
    }

     /**
     * 
     * @param {Array<Array<ChessTile>>} chessdata If it can set enpassantme to tiile behind or infront
     * @param {ChessPiece} chesspiece to compare with coords to know if it wil move two squares forward
     */
    AttackRange(chessdata, chesspiece){
        /* Check if it moves two squares */
        if (
            chesspiece.ClassName === ChessTypes.ChessPiece
            && chesspiece.Side !== this.Side
            && chesspiece.Row - this.Row === 2 && chesspiece.Col === this.Col
        ){
            /* Place the callable for en passant */
            chessdata[chesspiece.Row - 1][chesspiece.Col].Callable
            .push(setEnPassantMe(
                this.Side, chessdata[chesspiece.Row - 1][chesspiece.Col], this
            ));
        }
        
        /* After in new dest - Diagonal left and diagonal right */
        if(chesspiece.Row !== 7 && chesspiece.Col !== 0){
            this.currentTilesAffected.push(chessdata[chesspiece.Row + 1][chesspiece.Col - 1]);
            chessdata[chesspiece.Row + 1][chesspiece.Col - 1].Callable
            .push(setAttackRange(this.Side, this));
        }
        if(chesspiece.Row !== 7 && chesspiece.Col !== 7){
            this.currentTilesAffected.push(chessdata[chesspiece.Row + 1][chesspiece.Col + 1]);
            chessdata[chesspiece.Row + 1][chesspiece.Col + 1].Callable
            .push(setAttackRange(this.Side, this));
        }
        
    }

    /**
     * @param {Array<Array<ChessTile>>} chessdata 
     */
    initAttackRange(chessdata){
        /* Diagonal left and diagonal right */
        if(this.Row !== 7 && this.Col !== 0){
            this.currentTilesAffected.push(chessdata[this.Row + 1][this.Col - 1]);
            chessdata[this.Row + 1][this.Col - 1].Callable.push(setAttackRange(this.Side, this));
        }
        if(this.Row !== 7 && this.Col !== 7){
            this.currentTilesAffected.push(chessdata[this.Row + 1][this.Col + 1]);
            chessdata[this.Row + 1][this.Col + 1].Callable.push(setAttackRange(this.Side, this));
        }
    }
}

export class P2_Pawn extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
        console.log(this.ClassName +" row: " + this.Row + " col: " + this.Col);
        this.hasMoved = false; // To check if it has moved two squares forward
    }
    get ClassName(){return ChessTypes.Pawn;}

    /**
     * 
     * @param {ChessPiece} chesspiece
     * @param {Array<Function>} callables  
     * @param {Array<Array<ChessTile>>} chessdata 
     * @returns {boolean}
     */
    Move(chesspiece, callables, chessdata){
        let enPassant = false;
        callables.forEach(callable => {
            if(callable(this.Side).status === Status.EnPassant){
                enPassant = true;
            }
        });

        if (
            enPassant && chesspiece.ClassName === ChessTypes.ChessPiece 
            && chesspiece.Side !== this.Side && chesspiece.Side !== Side.Neutral
            && chesspiece.Row === this.Row
            && (chesspiece.Col - this.Col === 1 || chesspiece.Col - this.Col === -1)
        ){
            this.hasMoved = true;
            return true;  
        }

        if (
            chesspiece.ClassName === ChessTypes.ChessPiece
            && chesspiece.Side !== this.Side
            && (chesspiece.Row - this.Row) === -1 && chesspiece.Col === this.Col
        ){
            this.hasMoved = true;
            return true;
        }else{
            /*
            alert(
                "Not moving one square forward \n Row diff " + (chesspiece.Row - this.Row)
                + "\nthis.Row: " + this.Row + " chesspiece.Row: " + chesspiece.Row
            );
            */
        }

        if (
            this.hasMoved === false
            &&chesspiece.ClassName === ChessTypes.ChessPiece
            && chesspiece.Side !== this.Side
            && chesspiece.Row - this.Row === -2 && chesspiece.Col === this.Col
        ){
            this.hasMoved = true;
            return true;
        }
        else{
            //alert("Not moving two square forward");
        }

        if (
            chesspiece.ClassName !== ChessTypes.ChessPiece
            && chesspiece.Side !== this.Side
            && chesspiece.ClassName !== ChessTypes.King
            && chesspiece.Row < this.Row && (chesspiece.Col > this.Col || chesspiece.Col < this.Col)
        ){
            this.hasMoved = true;
            return true;
        }

        return false; 
    }

    /**
     * 
     * @param {Array<Array<ChessTile>>} chessdata If it can set enpassantme to tiile behind or infront
     * @param {ChessPiece} chesspiece to compare with coords to know if it wil move two squares forward
     */
    AttackRange(chessdata, chesspiece){
        /* Check if it moves two squares */
        if (
            chesspiece.ClassName === ChessTypes.ChessPiece
            && chesspiece.Side !== this.Side
            && chesspiece.Row - this.Row === 2 && chesspiece.Col === this.Col
        ){
            /* Place the callable for en passant */
            chessdata[chesspiece.Row + 1][chesspiece.Col].Callable
            .push(setEnPassantMe(
                this.Side, chessdata[chesspiece.Row + 1][chesspiece.Col], this
            ));
        }
        /* Diagonal left and diagonal right */
        if(chesspiece.Row !== 0 && chesspiece.Col !== 0){
            this.currentTilesAffected.push(chessdata[chesspiece.Row - 1][chesspiece.Col - 1]);
            chessdata[chesspiece.Row - 1][chesspiece.Col - 1].Callable
            .push(setAttackRange(this.Side, this));
        }
        if(chesspiece.Row !== 0 && chesspiece.Col !== 7){
            this.currentTilesAffected.push(chessdata[chesspiece.Row - 1][chesspiece.Col + 1]);
            chessdata[chesspiece.Row - 1][chesspiece.Col + 1].Callable
            .push(setAttackRange(this.Side, this));
        }
    }

    /**
     * @param {Array<Array<ChessTile>>} chessdata 
     */
    initAttackRange(chessdata){
        /* Diagonal left and diagonal right */
        if(this.Row !== 0 && this.Col !== 0){
            this.currentTilesAffected.push(chessdata[this.Row - 1][this.Col - 1]);
            chessdata[this.Row - 1][this.Col - 1].Callable
            .push(setAttackRange(this.Side, this));
        }
        if(this.Row !== 0 && this.Col !== 7){
            this.currentTilesAffected.push(chessdata[this.Row - 1][this.Col + 1]);
            chessdata[this.Row - 1][this.Col + 1].Callable
            .push(setAttackRange(this.Side, this));
        }
    }
}

export class P1_Rook extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
        console.log(this.ClassName +" row: " + this.Row + " col: " + this.Col);
        
    }
    get ClassName(){return ChessTypes.Rook;}

    /**
     * 
     * @param {ChessPiece} chesspiece
     * @param {Array<Function>} callables  
     * @param {Array<Array<ChessTile>>} chessdata 
     * @returns {boolean}
     */
    Move(chesspiece, callables, chessdata){
        if (chesspiece.ClassName === ChessTypes.ChessPiece
            && (chesspiece.Row === this.Row || chesspiece.Col === this.Col)
        ){
            /* Check fiirst throughout the  */
        }
    }
}

export class P2_Rook extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
        console.log(this.ClassName +" row: " + this.Row + " col: " + this.Col);
        
    }
    get ClassName(){return ChessTypes.Rook;}
}

export class P1_Bishop extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
        console.log(this.ClassName +" row: " + this.Row + " col: " + this.Col);
        
    }
    get ClassName(){return ChessTypes.Bishop;}
}

export class P2_Bishop extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
        console.log(this.ClassName +" row: " + this.Row + " col: " + this.Col);
        
    }
    get ClassName(){return ChessTypes.Bishop;}
}

export class P1_Queen extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
        console.log(this.ClassName +" row: " + this.Row + " col: " + this.Col);
        
    }
    get ClassName(){return ChessTypes.Queen;}
}

export class P2_Queen extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
        console.log(this.ClassName +" row: " + this.Row + " col: " + this.Col);
        
    }
    get ClassName(){return ChessTypes.Queen;}
}

export class P1_King extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
        console.log(this.ClassName +" row: " + this.Row + " col: " + this.Col);
        
    }
    get ClassName(){return ChessTypes.King;}
}

export class P2_King extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
        console.log(this.ClassName +" row: " + this.Row + " col: " + this.Col);
        
    }
    get ClassName(){return ChessTypes.King;}
}

export class P1_Knight extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
        console.log(this.ClassName +" row: " + this.Row + " col: " + this.Col);
        
    }
    get ClassName(){return ChessTypes.Knight;}
}

export class P2_Knight extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
        console.log(this.ClassName +" row: " + this.Row + " col: " + this.Col);
        
    }
    get ClassName(){return ChessTypes.Knight;}
}

/**
 * 
 * @param {number} length 
 */
function randomID(length = 8){
    return Math.random().toString(36).substring(2, 2 + length);
}