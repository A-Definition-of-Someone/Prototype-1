import { ChessTypes, Side, Status } from "./Chess Constants.js";
import { ChessTile, setAttackRange, setEnPassantMe } from "./Chess Tiles V2.js";
import { getP1KingCoord, getP2KingCoord } from "./Chess Data V2.js";

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
     * @description Check if the opposing king overlaps with the attack range of this piece
     * @param {Array<Array<ChessTile>>} chessdata
     * @param {ChessPiece} king 
     */
    checkKingOverlapwithAttackRange(chessdata, king){
        if(king.ClassName !== ChessTypes.King){
            return false;
        }
        for (let index = 0; index < this.currentTilesAffected.length; index++) {
            let temp = this.currentTilesAffected[index].ChessPiece;
            if(temp.Col === king.Col && temp.Row === king.Row){
                return true;
            }
        }
        return false;
    }

    /**
     * 
     * @param {Array<Array<ChessTile>>} chessdata 
     * @param {ChessPiece} chesspiece 
     * @param {ChessTile} attackingpiece 
     */
    MoveWhileBlocked(chessdata, chesspiece, attackingpiece){

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
        let check = false;
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

    /**
     * @description Check if the opposing king overlaps with the attack range of this piece
     * @param {Array<Array<ChessTile>>} chessdata
     * @param {ChessPiece} king 
     */
    checkKingOverlapwithAttackRange(chessdata, king){
        if(king.ClassName !== ChessTypes.King){
            return false;
        }
        if((this.Row + 1) === king.Row && (this.Col - 1) === king.Col){
            return true;
        }

        if((this.Row + 1) === king.Row && (this.Col + 1) === king.Col){
            return true;
        }

        return false;
    }

    /**
     * 
     * @param {Array<Array<ChessTile>>} chessdata 
     * @param {ChessPiece} chesspiece
     * @param {ChessPiece} attackingpiece 
     */
    MoveWhileBlocked(chessdata, chesspiece, attackingpiece){
        /* Pawn P1 can move forward */
        if (
            this.Col === chesspiece.Col &&
            this.Col === attackingpiece.Col && 
            (Math.abs(this.Row - chesspiece.Row) === 1 
            || Math.abs(this.Row - chesspiece.Row) === 2)
        ){
            return true;
        }

        /* Pawn P1 can actually move diagonal (for attacking) */
        if (
            Math.abs(this.Row - chesspiece.Row) === 1 &&
            Math.abs(this.Col - chesspiece.Col === 1 &&
            (Math.abs(chesspiece.Row - attackingpiece.Row) 
            === Math.abs(chesspiece.Col - attackingpiece.Col)) 
        )
        ){
            return true;
        }
        


        return false;
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

    /**
     * @description Check if the opposing king overlaps with the attack range of this piece
     * @param {Array<Array<ChessTile>>} chessdata
     * @param {ChessPiece} king 
     */
    checkKingOverlapwithAttackRange(chessdata, king){
        if(king.ClassName !== ChessTypes.King){
            return false;
        }
        if((this.Row - 1) === king.Row && (this.Col - 1) === king.Col){
            return true;
        }

        if((this.Row - 1) === king.Row && (this.Col + 1) === king.Col){
            return true;
        }

        return false;
    }

    /**
     * 
     * @param {Array<Array<ChessTile>>} chessdata 
     * @param {ChessPiece} chesspiece
     * @param {ChessPiece} attackingpiece 
     */
    MoveWhileBlocked(chessdata, chesspiece, attackingpiece){
        /* Pawn P1 can move forward */
        if (
            this.Col === chesspiece.Col &&
            this.Col === attackingpiece.Col && 
            (Math.abs(this.Row - chesspiece.Row) === 1 
            || Math.abs(this.Row - chesspiece.Row) === 2)
        ){
            return true;
        }

        /* Pawn P1 can actually move diagonal (for attacking) */
        if (
            Math.abs(this.Row - chesspiece.Row) === 1 &&
            Math.abs(this.Col - chesspiece.Col === 1 &&
            (Math.abs(chesspiece.Row - attackingpiece.Row) 
            === Math.abs(chesspiece.Col - attackingpiece.Col)) 
        )
        ){
            return true;
        }


        return false;
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

        if (
            chesspiece.ClassName !== ChessTypes.King
            && chesspiece.Side !== this.Side
            && chesspiece.Row === this.Row
            && Math.abs((chesspiece.Col - this.Col)) === 1
        ){
            return true;
        }

        if (
            chesspiece.ClassName !== ChessTypes.King
            && chesspiece.Side !== this.Side
            && chesspiece.Col === this.Col
            && Math.abs((chesspiece.Row - this.Row)) === 1
        ){
            return true;
        }

        if (
            chesspiece.ClassName !== ChessTypes.King
            && chesspiece.Side !== this.Side
            && chesspiece.Row === this.Row
            && chesspiece.Col > this.Col
        ){
            /* Check first throughout the destination path have obstacle or not*/
            let tempCol = this.Col + 1;
            do {
                let temp = chessdata[this.Row][tempCol].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; // Not gonna crash into obstacles before destination
                }
                tempCol++;
            } while (tempCol !== chesspiece.Col);
            return true; // Can move to the destination
        }

        if (
            chesspiece.ClassName !== ChessTypes.King
            && chesspiece.Side !== this.Side
            && chesspiece.Row === this.Row
            && chesspiece.Col < this.Col
        ){
            /* Check first throughout the destination path have obstacle or not*/
            let tempCol = this.Col - 1;
            do {
                let temp = chessdata[this.Row][tempCol].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; // Not gonna crash into obstacles before destination
                }
                tempCol--;
            } while (tempCol !== chesspiece.Col);
            return true; // Can move to the destination
        }

        if (
            chesspiece.ClassName !== ChessTypes.King
            && chesspiece.Side !== this.Side
            && chesspiece.Col === this.Col
            && chesspiece.Row > this.Row
        ){
            /* Check first throughout the destination path have obstacle or not*/
            let tempRow = this.Row + 1;
            do {
                let temp = chessdata[tempRow][this.Col].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; // Not gonna crash into obstacles before destination
                }
                tempRow++;
            } while (tempRow !== chesspiece.Row);
            return true; // Can move to the destination
        }
        if (
            chesspiece.ClassName !== ChessTypes.King
            && chesspiece.Side !== this.Side
            && chesspiece.Col === this.Col
            && chesspiece.Row < this.Row
        ){
            /* Check first throughout the destination path have obstacle or not*/
            let tempRow = this.Row - 1;
            do {
                let temp = chessdata[tempRow][this.Col].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; // Not gonna crash into obstacles before destination
                }
                tempRow--;
            } while (tempRow !== chesspiece.Row);
            return true; // Can move to the destination
        }
    }

    /**
     * 
     * @param {Array<Array<ChessTile>>} chessdata If it can set enpassantme to tiile behind or infront
     * @param {ChessPiece} chesspiece to compare with coords to know if it wil move two squares forward
     */
    AttackRange(chessdata, chesspiece){
        /* Cover the whole Row */
        for (let index = 0; index < 8; index++) {
            if(index === chesspiece.Row){
                /* Skip if this piece */
                continue; 
            }
            this.currentTilesAffected.push(chessdata[chesspiece.Row][index]);
            chessdata[chesspiece.Row][index].Callable
            .push(setAttackRange(this.Side, this));
        }
        /* Cover the whole Column */
        for (let index = 0; index < 8; index++) {
            if(index === chesspiece.Col){
                /* Skip if this piece */
                continue; 
            }
            this.currentTilesAffected.push(chessdata[index][chesspiece.Col]);
            chessdata[index][chesspiece.Col].Callable
            .push(setAttackRange(this.Side, this));
        }
    }

    /**
     * @param {Array<Array<ChessTile>>} chessdata 
     */
    initAttackRange(chessdata){
        /* Cover the whole Row */
        for (let index = 0; index < 8; index++) {
            if(index === this.Col){
                /* Skip if this piece */
                continue; 
            }
            this.currentTilesAffected.push(chessdata[this.Row][index]);
            chessdata[this.Row][index].Callable
            .push(setAttackRange(this.Side, this));
        }
        /* Cover the whole Column */
        for (let index = 0; index < 8; index++) {
            if(index === this.Col){
                /* Skip if this piece */
                continue; 
            }
            this.currentTilesAffected.push(chessdata[index][this.Col]);
            chessdata[index][this.Col].Callable
            .push(setAttackRange(this.Side, this));
        }
    }

    /**
     * @description Check if the opposing king overlaps with the attack range of this piece
     * @param {Array<Array<ChessTile>>} chessdata
     * @param {ChessPiece} king 
     */
    checkKingOverlapwithAttackRange(chessdata, king){
        if(king.ClassName !== ChessTypes.King){
            return false;
        }
        /* If Rook at the right of enemy king */
        if(this.Row === king.Row && this.Col > king.Col){
            /* Check for obstacles */
            for (let index = this.Col - 1; index > king.Col; index--) {
                let temp = chessdata[this.Row][index].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; // Not gonna crash into obstacles before destination
                }
            }
            return true;
        }

        /* If Rook at the left of enemy king*/
        if(this.Row === king.Row && this.Col < king.Col){
            /* Check for obstacles */
            for (let index = this.Col + 1; index < king.Col; index++) {
                let temp = chessdata[this.Row][index].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; // Not gonna crash into obstacles before destination
                }
            }
            return true;
        }

        /* If Rook at the top of enemy king*/
        if(this.Col === king.Col && this.Row < king.Row){
            /* Check for obstacles */
            for (let index = this.Row + 1; index < king.Row; index++) {
                let temp = chessdata[index][this.Col].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; // Not gonna crash into obstacles before destination
                }
            }
            return true;
        }

        /* If Rook at the bottom of enemy king*/
        if(this.Col === king.Col && this.Row > king.Row){
            /* Check for obstacles */
            for (let index = this.Row - 1; index > king.Row; index--) {
                let temp = chessdata[index][this.Col].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; // Not gonna crash into obstacles before destination
                }
            }
            return true;
        }

        return false;
    }

    /**
     * 
     * @param {Array<Array<ChessTile>>} chessdata 
     * @param {ChessPiece} chesspiece
     * @param {ChessPiece} attackingpiece 
     */
    MoveWhileBlocked(chessdata, chesspiece, attackingpiece){
        /* Can move forward */
        if(
            this.Col === chesspiece.Col &&
            chesspiece.Col === attackingpiece.Col
        ){
            return true;
        }

        /* Can move sideways */
        if(
            this.Row === chesspiece.Row &&
            chesspiece.Row === attackingpiece.Row
        ){
            return true;
        }

        return false;
    }
}

export class P2_Rook extends ChessPiece{
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

        if (
            chesspiece.ClassName !== ChessTypes.King
            && chesspiece.Side !== this.Side
            && chesspiece.Row === this.Row
            && Math.abs((chesspiece.Col - this.Col)) === 1
        ){
            return true;
        }

        if (
            chesspiece.ClassName !== ChessTypes.King
            && chesspiece.Side !== this.Side
            && chesspiece.Col === this.Col
            && Math.abs((chesspiece.Row - this.Row)) === 1
        ){
            return true;
        }

        if (
            chesspiece.ClassName !== ChessTypes.King
            && chesspiece.Side !== this.Side
            && chesspiece.Row === this.Row
            && chesspiece.Col > this.Col
        ){
            /* Check first throughout the destination path have obstacle or not*/
            let tempCol = this.Col + 1;
            do {
                let temp = chessdata[this.Row][tempCol].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; // Not gonna crash into obstacles before destination
                }
                tempCol++;
            } while (tempCol !== chesspiece.Col);
            return true; // Can move to the destination
        }

        if (
            chesspiece.ClassName !== ChessTypes.King
            && chesspiece.Side !== this.Side
            && chesspiece.Row === this.Row
            && chesspiece.Col < this.Col
        ){
            /* Check first throughout the destination path have obstacle or not*/
            let tempCol = this.Col - 1;
            do {
                let temp = chessdata[this.Row][tempCol].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; // Not gonna crash into obstacles before destination
                }
                tempCol--;
            } while (tempCol !== chesspiece.Col);
            return true; // Can move to the destination
        }

        if (
            chesspiece.ClassName !== ChessTypes.King
            && chesspiece.Side !== this.Side
            && chesspiece.Col === this.Col
            && chesspiece.Row > this.Row
        ){
            /* Check first throughout the destination path have obstacle or not*/
            let tempRow = this.Row + 1;
            do {
                let temp = chessdata[tempRow][this.Col].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; // Not gonna crash into obstacles before destination
                }
                tempRow++;
            } while (tempRow !== chesspiece.Row);
            return true; // Can move to the destination
        }
        if (
            chesspiece.ClassName !== ChessTypes.King
            && chesspiece.Side !== this.Side
            && chesspiece.Col === this.Col
            && chesspiece.Row < this.Row
        ){
            /* Check first throughout the destination path have obstacle or not*/
            let tempRow = this.Row - 1;
            do {
                let temp = chessdata[tempRow][this.Col].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; // Not gonna crash into obstacles before destination
                }
                tempRow--;
            } while (tempRow !== chesspiece.Row);
            return true; // Can move to the destination
        }
    }

    /**
     * 
     * @param {Array<Array<ChessTile>>} chessdata If it can set enpassantme to tiile behind or infront
     * @param {ChessPiece} chesspiece to compare with coords to know if it wil move two squares forward
     */
    AttackRange(chessdata, chesspiece){
        /* Cover the whole Row */
        for (let index = 0; index < 8; index++) {
            if(index === chesspiece.Row){
                /* Skip if this piece */
                continue; 
            }
            this.currentTilesAffected.push(chessdata[chesspiece.Row][index]);
            chessdata[chesspiece.Row][index].Callable
            .push(setAttackRange(this.Side, this));
        }
        /* Cover the whole Column */
        for (let index = 0; index < 8; index++) {
            if(index === chesspiece.Col){
                /* Skip if this piece */
                continue; 
            }
            this.currentTilesAffected.push(chessdata[index][chesspiece.Col]);
            chessdata[index][chesspiece.Col].Callable
            .push(setAttackRange(this.Side, this));
        }
    }

    /**
     * @param {Array<Array<ChessTile>>} chessdata 
     */
    initAttackRange(chessdata){
        /* Cover the whole Row */
        for (let index = 0; index < 8; index++) {
            if(index === this.Col){
                /* Skip if this piece */
                continue; 
            }
            this.currentTilesAffected.push(chessdata[this.Row][index]);
            chessdata[this.Row][index].Callable
            .push(setAttackRange(this.Side, this));
        }
        /* Cover the whole Column */
        for (let index = 0; index < 8; index++) {
            if(index === this.Col){
                /* Skip if this piece */
                continue; 
            }
            this.currentTilesAffected.push(chessdata[index][this.Col]);
            chessdata[index][this.Col].Callable
            .push(setAttackRange(this.Side, this));
        }
    }

    /**
     * @description Check if the opposing king overlaps with the attack range of this piece
     * @param {Array<Array<ChessTile>>} chessdata
     * @param {ChessPiece} king 
     */
    checkKingOverlapwithAttackRange(chessdata, king){
        if(king.ClassName !== ChessTypes.King){
            return false;
        }
        /* If Rook at the right of enemy king */
        if(this.Row === king.Row && this.Col > king.Col){
            /* Check for obstacles */
            for (let index = this.Col - 1; index > king.Col; index--) {
                let temp = chessdata[this.Row][index].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; // Not gonna crash into obstacles before destination
                }
            }
            return true;
        }

        /* If Rook at the left of enemy king*/
        if(this.Row === king.Row && this.Col < king.Col){
            /* Check for obstacles */
            for (let index = this.Col + 1; index < king.Col; index++) {
                let temp = chessdata[this.Row][index].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; // Not gonna crash into obstacles before destination
                }
            }
            return true;
        }

        /* If Rook at the top of enemy king*/
        if(this.Col === king.Col && this.Row < king.Row){
            /* Check for obstacles */
            for (let index = this.Row + 1; index < king.Row; index++) {
                let temp = chessdata[index][this.Col].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; // Not gonna crash into obstacles before destination
                }
            }
            return true;
        }

        /* If Rook at the bottom of enemy king*/
        if(this.Col === king.Col && this.Row > king.Row){
            /* Check for obstacles */
            for (let index = this.Row - 1; index > king.Row; index--) {
                let temp = chessdata[index][this.Col].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; // Not gonna crash into obstacles before destination
                }
            }
            return true;
        }

        return false;
    }

    /**
     * 
     * @param {Array<Array<ChessTile>>} chessdata 
     * @param {ChessPiece} chesspiece
     * @param {ChessPiece} attackingpiece 
     */
    MoveWhileBlocked(chessdata, chesspiece, attackingpiece){
        /* Can move forward */
        if(
            this.Col === chesspiece.Col &&
            chesspiece.Col === attackingpiece.Col
        ){
            return true;
        }

        /* Can move sideways */
        if(
            this.Row === chesspiece.Row &&
            chesspiece.Row === attackingpiece.Row
        ){
            return true;
        }

        return false;
    }
}

export class P1_Bishop extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
        console.log(this.ClassName +" row: " + this.Row + " col: " + this.Col);
        
    }
    get ClassName(){return ChessTypes.Bishop;}

    /**
     * 
     * @param {ChessPiece} chesspiece
     * @param {Array<Function>} callables  
     * @param {Array<Array<ChessTile>>} chessdata 
     * @returns {boolean}
     */
    Move(chesspiece, callables, chessdata){
        if (chesspiece.ClassName !== ChessTypes.King
            && chesspiece.Side !== this.Side
            && (Math.abs(chesspiece.Row - this.Row) === Math.abs(chesspiece.Col - this.Col))
        ){
            /* Check for obstacle towards destination diagonal top right */
            if(chesspiece.Row > this.Row && chesspiece.Col > this.Col){
                let tempRow = this.Row + 1;
                let tempCol = this.Col + 1;
                while (tempRow !== chesspiece.Row && tempCol !== chesspiece.Col) {
                    let temp = chessdata[tempRow][tempCol].ChessPiece;
                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        return false; // Not gonna crash into obstacles before destination
                    }
                    tempRow++;
                    tempCol++;
                }
            }
            /* Check for obstacle towards destination diagonal bottom right */
            if(chesspiece.Row < this.Row && chesspiece.Col > this.Col){
                let tempRow = this.Row - 1;
                let tempCol = this.Col + 1;
                while (tempRow !== chesspiece.Row && tempCol !== chesspiece.Col) {
                    let temp = chessdata[tempRow][tempCol].ChessPiece;
                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        return false; // Not gonna crash into obstacles before destination
                    }
                    tempRow--;
                    tempCol++;
                }
            }
            /* Check for obstacle towards destination diagonal top left */
            if(chesspiece.Row > this.Row && chesspiece.Col < this.Col){
                let tempRow = this.Row + 1;
                let tempCol = this.Col - 1;
                while (tempRow !== chesspiece.Row && tempCol !== chesspiece.Col) {
                    let temp = chessdata[tempRow][tempCol].ChessPiece;
                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        return false; // Not gonna crash into obstacles before destination
                    }
                    tempRow++;
                    tempCol--;
                }
            }
            /* Check for obstacle towards destination diagonal bottom left */
            if(chesspiece.Row < this.Row && chesspiece.Col < this.Col){
                let tempRow = this.Row - 1;
                let tempCol = this.Col - 1;
                while (tempRow !== chesspiece.Row && tempCol !== chesspiece.Col) {
                    let temp = chessdata[tempRow][tempCol].ChessPiece;
                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        return false; // Not gonna crash into obstacles before destination
                    }
                    tempRow--;
                    tempCol--;
                }
            }

            return true; //Assuming no obstacles in the way
        }

        return false; // Cannot move to the destination
    }

    /**
     * 
     * @param {Array<Array<ChessTile>>} chessdata If it can set enpassantme to tiile behind or infront
     * @param {ChessPiece} chesspiece to compare with coords to know if it wil move two squares forward
     */
    AttackRange(chessdata, chesspiece){
        /* Cover the whole diagonal right */
        let tempRow = chesspiece.Row - 1;
        let tempCol = chesspiece.Col + 1;
        while (tempRow >= 0 && tempCol < 8) {
            this.currentTilesAffected.push(chessdata[tempRow][tempCol]);
            chessdata[tempRow][tempCol].Callable
            .push(setAttackRange(this.Side, this));
            tempRow--;
            tempCol++;
        }

        tempRow = chesspiece.Row + 1;
        tempCol = chesspiece.Col - 1;
        while (tempRow < 8 && tempCol >= 0) {
            this.currentTilesAffected.push(chessdata[tempRow][tempCol]);
            chessdata[tempRow][tempCol].Callable
            .push(setAttackRange(this.Side, this));
            tempRow++;
            tempCol--;
        }

        /* Cover the whole diagonal left */
        tempRow = chesspiece.Row - 1;
        tempCol = chesspiece.Col - 1;
        while (tempRow >= 0 && tempCol >= 0) {
            this.currentTilesAffected.push(chessdata[tempRow][tempCol]);
            chessdata[tempRow][tempCol].Callable
            .push(setAttackRange(this.Side, this));
            tempRow--;
            tempCol--;
        }

        tempRow = chesspiece.Row + 1;
        tempCol = chesspiece.Col + 1;
        while (tempRow < 8 && tempCol < 8) {
            this.currentTilesAffected.push(chessdata[tempRow][tempCol]);
            chessdata[tempRow][tempCol].Callable
            .push(setAttackRange(this.Side, this));
            tempRow++;
            tempCol++;
        }
    }

    /**
     * @param {Array<Array<ChessTile>>} chessdata 
     */
    initAttackRange(chessdata){
        /* Cover the whole diagonal right */
        let tempRow = this.Row - 1;
        let tempCol = this.Col + 1;
        while (tempRow >= 0 && tempCol < 8) {
            this.currentTilesAffected.push(chessdata[tempRow][tempCol]);
            chessdata[tempRow][tempCol].Callable
            .push(setAttackRange(this.Side, this));
            tempRow--;
            tempCol++;
        }

        tempRow = this.Row + 1;
        tempCol = this.Col - 1;
        while (tempRow < 8 && tempCol >= 0) {
            this.currentTilesAffected.push(chessdata[tempRow][tempCol]);
            chessdata[tempRow][tempCol].Callable
            .push(setAttackRange(this.Side, this));
            tempRow++;
            tempCol--;
        }

        /* Cover the whole diagonal left */
        tempRow = this.Row - 1;
        tempCol = this.Col - 1;
        while (tempRow >= 0 && tempCol >= 0) {
            this.currentTilesAffected.push(chessdata[tempRow][tempCol]);
            chessdata[tempRow][tempCol].Callable
            .push(setAttackRange(this.Side, this));
            tempRow--;
            tempCol--;
        }

        tempRow = this.Row + 1;
        tempCol = this.Col + 1;
        while (tempRow < 8 && tempCol < 8) {
            this.currentTilesAffected.push(chessdata[tempRow][tempCol]);
            chessdata[tempRow][tempCol].Callable
            .push(setAttackRange(this.Side, this));
            tempRow++;
            tempCol++;
        }
    }

    /**
     * @description Check if the opposing king overlaps with the attack range of this piece
     * @param {Array<Array<ChessTile>>} chessdata
     * @param {ChessPiece} king 
     */
    checkKingOverlapwithAttackRange(chessdata, king){
        if(king.ClassName !== ChessTypes.King){
            return false;
        }
        
        /* Check if opponent king is on the same path as bishop first */
        if(Math.abs(king.Row - this.Row) !== Math.abs(king.Col - this.Col)){
            return false;
        }

        /* Now, check for obstacles */
        /* If king to the top right of bishop */
        if(king.Row < this.Row && king.Col > this.Col){
            let tempRow = this.Row - 1;
            let tempCol = this.Col + 1;
            while (tempRow !== king.Row && tempCol !== king.Col) {
                let temp = chessdata[tempRow][tempCol].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; //Obstacles found!
                }
                tempRow--;
                tempCol++;
            }
        }
        /* If king to the top left of bishop */
        if(king.Row < this.Row && king.Col < this.Col){
            let tempRow = this.Row - 1;
            let tempCol = this.Col - 1;
            while (tempRow !== king.Row && tempCol !== king.Col) {
                let temp = chessdata[tempRow][tempCol].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; //Obstacles found!
                }
                tempRow--;
                tempCol--;
            }
        }
        /* If king to the bottom right of bishop */
        if(king.Row > this.Row && king.Col > this.Col){
            let tempRow = this.Row + 1;
            let tempCol = this.Col + 1;
            while (tempRow !== king.Row && tempCol !== king.Col) {
                let temp = chessdata[tempRow][tempCol].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; //Obstacles found!
                }
                tempRow++;
                tempCol++;
            }
        }
        /* If king to the bottom left of bishop */
        if(king.Row > this.Row && king.Col < this.Col){
            let tempRow = this.Row + 1;
            let tempCol = this.Col - 1;
            while (tempRow !== king.Row && tempCol !== king.Col) {
                let temp = chessdata[tempRow][tempCol].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; //Obstacles found!
                }
                tempRow++;
                tempCol--;
            }
        }

        return true; //If not find any obstacles
    }

    /**
     * 
     * @param {Array<Array<ChessTile>>} chessdata 
     * @param {ChessPiece} chesspiece
     * @param {ChessPiece} attackingpiece 
     */
    MoveWhileBlocked(chessdata, chesspiece, attackingpiece){
        /* Check if it can go towards attackingpiece */
        if(
            Math.abs(chesspiece.Row - this.Row) === Math.abs(chesspiece.Col - this.Col)
        ){
            return true
        }

        return false;
    }
}

export class P2_Bishop extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
        console.log(this.ClassName +" row: " + this.Row + " col: " + this.Col);
        
    }
    get ClassName(){return ChessTypes.Bishop;}

    /**
     * 
     * @param {ChessPiece} chesspiece
     * @param {Array<Function>} callables  
     * @param {Array<Array<ChessTile>>} chessdata 
     * @returns {boolean}
     */
    Move(chesspiece, callables, chessdata){
        if (chesspiece.ClassName !== ChessTypes.King
            && chesspiece.Side !== this.Side
            && (Math.abs(chesspiece.Row - this.Row) === Math.abs(chesspiece.Col - this.Col))
        ){
            /* Check for obstacle towards destination diagonal top right */
            if(chesspiece.Row > this.Row && chesspiece.Col > this.Col){
                let tempRow = this.Row + 1;
                let tempCol = this.Col + 1;
                while (tempRow !== chesspiece.Row && tempCol !== chesspiece.Col) {
                    let temp = chessdata[tempRow][tempCol].ChessPiece;
                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        return false; // Not gonna crash into obstacles before destination
                    }
                    tempRow++;
                    tempCol++;
                }
            }
            /* Check for obstacle towards destination diagonal bottom right */
            if(chesspiece.Row < this.Row && chesspiece.Col > this.Col){
                let tempRow = this.Row - 1;
                let tempCol = this.Col + 1;
                while (tempRow !== chesspiece.Row && tempCol !== chesspiece.Col) {
                    let temp = chessdata[tempRow][tempCol].ChessPiece;
                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        return false; // Not gonna crash into obstacles before destination
                    }
                    tempRow--;
                    tempCol++;
                }
            }
            /* Check for obstacle towards destination diagonal top left */
            if(chesspiece.Row > this.Row && chesspiece.Col < this.Col){
                let tempRow = this.Row + 1;
                let tempCol = this.Col - 1;
                while (tempRow !== chesspiece.Row && tempCol !== chesspiece.Col) {
                    let temp = chessdata[tempRow][tempCol].ChessPiece;
                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        return false; // Not gonna crash into obstacles before destination
                    }
                    tempRow++;
                    tempCol--;
                }
            }
            /* Check for obstacle towards destination diagonal bottom left */
            if(chesspiece.Row < this.Row && chesspiece.Col < this.Col){
                let tempRow = this.Row - 1;
                let tempCol = this.Col - 1;
                while (tempRow !== chesspiece.Row && tempCol !== chesspiece.Col) {
                    let temp = chessdata[tempRow][tempCol].ChessPiece;
                    if(temp.ClassName !== ChessTypes.ChessPiece){
                        return false; // Not gonna crash into obstacles before destination
                    }
                    tempRow--;
                    tempCol--;
                }
            }

            return true; //Assuming no obstacles in the way
        }

        return false; // Cannot move to the destination
    }

    /**
     * 
     * @param {Array<Array<ChessTile>>} chessdata If it can set enpassantme to tiile behind or infront
     * @param {ChessPiece} chesspiece to compare with coords to know if it wil move two squares forward
     */
    AttackRange(chessdata, chesspiece){
        /* Cover the whole diagonal right */
        let tempRow = chesspiece.Row - 1;
        let tempCol = chesspiece.Col + 1;
        while (tempRow >= 0 && tempCol < 8) {
            this.currentTilesAffected.push(chessdata[tempRow][tempCol]);
            chessdata[tempRow][tempCol].Callable
            .push(setAttackRange(this.Side, this));
            tempRow--;
            tempCol++;
        }

        tempRow = chesspiece.Row + 1;
        tempCol = chesspiece.Col - 1;
        while (tempRow < 8 && tempCol >= 0) {
            this.currentTilesAffected.push(chessdata[tempRow][tempCol]);
            chessdata[tempRow][tempCol].Callable
            .push(setAttackRange(this.Side, this));
            tempRow++;
            tempCol--;
        }

        /* Cover the whole diagonal left */
        tempRow = chesspiece.Row - 1;
        tempCol = chesspiece.Col - 1;
        while (tempRow >= 0 && tempCol >= 0) {
            this.currentTilesAffected.push(chessdata[tempRow][tempCol]);
            chessdata[tempRow][tempCol].Callable
            .push(setAttackRange(this.Side, this));
            tempRow--;
            tempCol--;
        }

        tempRow = chesspiece.Row + 1;
        tempCol = chesspiece.Col + 1;
        while (tempRow < 8 && tempCol < 8) {
            this.currentTilesAffected.push(chessdata[tempRow][tempCol]);
            chessdata[tempRow][tempCol].Callable
            .push(setAttackRange(this.Side, this));
            tempRow++;
            tempCol++;
        }
    }

    /**
     * @param {Array<Array<ChessTile>>} chessdata 
     */
    initAttackRange(chessdata){
        /* Cover the whole diagonal right */
        let tempRow = this.Row - 1;
        let tempCol = this.Col + 1;
        while (tempRow >= 0 && tempCol < 8) {
            this.currentTilesAffected.push(chessdata[tempRow][tempCol]);
            chessdata[tempRow][tempCol].Callable
            .push(setAttackRange(this.Side, this));
            tempRow--;
            tempCol++;
        }

        tempRow = this.Row + 1;
        tempCol = this.Col - 1;
        while (tempRow < 8 && tempCol >= 0) {
            this.currentTilesAffected.push(chessdata[tempRow][tempCol]);
            chessdata[tempRow][tempCol].Callable
            .push(setAttackRange(this.Side, this));
            tempRow++;
            tempCol--;
        }

        /* Cover the whole diagonal left */
        tempRow = this.Row - 1;
        tempCol = this.Col - 1;
        while (tempRow >= 0 && tempCol >= 0) {
            this.currentTilesAffected.push(chessdata[tempRow][tempCol]);
            chessdata[tempRow][tempCol].Callable
            .push(setAttackRange(this.Side, this));
            tempRow--;
            tempCol--;
        }

        tempRow = this.Row + 1;
        tempCol = this.Col + 1;
        while (tempRow < 8 && tempCol < 8) {
            this.currentTilesAffected.push(chessdata[tempRow][tempCol]);
            chessdata[tempRow][tempCol].Callable
            .push(setAttackRange(this.Side, this));
            tempRow++;
            tempCol++;
        }
    }

    /**
     * @description Check if the opposing king overlaps with the attack range of this piece
     * @param {Array<Array<ChessTile>>} chessdata
     * @param {ChessPiece} king 
     */
    checkKingOverlapwithAttackRange(chessdata, king){
        if(king.ClassName !== ChessTypes.King){
            return false;
        }
        
        /* Check if opponent king is on the same path as bishop first */
        if(Math.abs(king.Row - this.Row) !== Math.abs(king.Col - this.Col)){
            return false;
        }

        /* Now, check for obstacles */
        /* If king to the top right of bishop */
        if(king.Row < this.Row && king.Col > this.Col){
            let tempRow = this.Row - 1;
            let tempCol = this.Col + 1;
            while (tempRow !== king.Row && tempCol !== king.Col) {
                let temp = chessdata[tempRow][tempCol].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; //Obstacles found!
                }
                tempRow--;
                tempCol++;
            }
        }
        /* If king to the top left of bishop */
        if(king.Row < this.Row && king.Col < this.Col){
            let tempRow = this.Row - 1;
            let tempCol = this.Col - 1;
            while (tempRow !== king.Row && tempCol !== king.Col) {
                let temp = chessdata[tempRow][tempCol].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; //Obstacles found!
                }
                tempRow--;
                tempCol--;
            }
        }
        /* If king to the bottom right of bishop */
        if(king.Row > this.Row && king.Col > this.Col){
            let tempRow = this.Row + 1;
            let tempCol = this.Col + 1;
            while (tempRow !== king.Row && tempCol !== king.Col) {
                let temp = chessdata[tempRow][tempCol].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; //Obstacles found!
                }
                tempRow++;
                tempCol++;
            }
        }
        /* If king to the bottom left of bishop */
        if(king.Row > this.Row && king.Col < this.Col){
            let tempRow = this.Row + 1;
            let tempCol = this.Col - 1;
            while (tempRow !== king.Row && tempCol !== king.Col) {
                let temp = chessdata[tempRow][tempCol].ChessPiece;
                if(temp.ClassName !== ChessTypes.ChessPiece){
                    return false; //Obstacles found!
                }
                tempRow++;
                tempCol--;
            }
        }

        return true; //If not find any obstacles
    }

    /**
     * 
     * @param {Array<Array<ChessTile>>} chessdata 
     * @param {ChessPiece} chesspiece
     * @param {ChessPiece} attackingpiece 
     */
    MoveWhileBlocked(chessdata, chesspiece, attackingpiece){
        /* Check if it can go towards attackingpiece */
        if(
            Math.abs(chesspiece.Row - this.Row) === Math.abs(chesspiece.Col - this.Col)
        ){
            return true
        }

        return false;
    }
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