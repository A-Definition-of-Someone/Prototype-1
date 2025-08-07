import { ChessTypes, Status } from "./Chess Constants.js";
export class ChessPiece{
    /**
     * @param {string} side Use Side constant from Chess Constants module
     */
    constructor(side, row, col){
        this.side = side;
        this.row = row;
        this.col = col;
    }

    /**
     * 
     * @param {ChessPiece} chesspiece
     * @param {Array<Function>} callables  
     */
    Move(chesspiece, callables){

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
    }
    get ClassName(){return ChessTypes.Pawn;}

    /**
     * 
     * @param {ChessPiece} chesspiece
     * @param {Array<Function>} callables  
     * @returns {boolean}
     */
    Move(chesspiece, callables){
        let enPassant = false;
        callables.forEach(callable => {
            if(callable(currentside) === Status.EnPassant){
                enPassant = true;
            }
        });

        if (
            enPassant && chesspiece.ClassName === ChessTypes.ChessPiece 
            && chesspiece.Side !== this.Side && chesspiece.Side !== Side.Neutral
            && chesspiece.Row === this.Row
            && (chesspiece.Col - this.Col === 1 || chesspiece.Col - this.Col === -1)
        ){
            return true;  
        }

        if (
            chesspiece.ClassName === ChessTypes.ChessPiece
            && chesspiece.Side !== this.Side
            && ((chesspiece.Row - this.Row === 2 && chesspiece.Col === this.Col)
            || (chesspiece.Row - this.Row === 1 && chesspiece.Col === this.Col))
        ){
            return true;
        }

        if (
            chesspiece.ClassName !== ChessTypes.ChessPiece
            && chesspiece.Side !== this.Side
            && chesspiece.ClassName !== ChessTypes.King
            && chesspiece.Row - this.Row === 1 && chesspiece.Col === this.Col
        ){
            return true;
        }

        return false; 
    }
}

export class P2_Pawn extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
    }
    get ClassName(){return ChessTypes.Pawn;}

    /**
     * 
     * @param {ChessPiece} chesspiece
     * @param {Array<Function>} callables  
     * @returns {boolean}
     */
    Move(chesspiece, callables){
        let enPassant = false;
        callables.forEach(callable => {
            if(callable(currentside) === Status.EnPassant){
                enPassant = true;
            }
        });

        if (
            enPassant && chesspiece.ClassName === ChessTypes.ChessPiece 
            && chesspiece.Side !== this.Side && chesspiece.Side !== Side.Neutral
            && chesspiece.Row === this.Row
            && (chesspiece.Col - this.Col === 1 || chesspiece.Col - this.Col === -1)
        ){
            return true;  
        }

        if (
            chesspiece.ClassName === ChessTypes.ChessPiece
            && chesspiece.Side !== this.Side
            && ((chesspiece.Row - this.Row === -2 && chesspiece.Col === this.Col)
            || (chesspiece.Row - this.Row === -1 && chesspiece.Col === this.Col))
        ){
            return true;
        }

        if (
            chesspiece.ClassName !== ChessTypes.ChessPiece
            && chesspiece.Side !== this.Side
            && chesspiece.ClassName !== ChessTypes.King
            && chesspiece.Row - this.Row === -1 && chesspiece.Col === this.Col
        ){
            return true;
        }

        return false; 
    }
}

export class P1_Rook extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
    }
    get ClassName(){return ChessTypes.Rook;}
}

export class P2_Rook extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
    }
    get ClassName(){return ChessTypes.Rook;}
}

export class P1_Bishop extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
    }
    get ClassName(){return ChessTypes.Bishop;}
}

export class P2_Bishop extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
    }
    get ClassName(){return ChessTypes.Bishop;}
}

export class P1_Queen extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
    }
    get ClassName(){return ChessTypes.Queen;}
}

export class P2_Queen extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
    }
    get ClassName(){return ChessTypes.Queen;}
}

export class P1_King extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
    }
    get ClassName(){return ChessTypes.King;}
}

export class P2_King extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
    }
    get ClassName(){return ChessTypes.King;}
}

export class P1_Knight extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
    }
    get ClassName(){return ChessTypes.Knight;}
}

export class P2_Knight extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
    }
    get ClassName(){return ChessTypes.Knight;}
}