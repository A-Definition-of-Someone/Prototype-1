import { ChessTypes } from "./Chess Constants.js";
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
     * @param {number} row2 Row of the destination
     * @param {number} col2 Col of the destination
     */
    Move(row2, col2){

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
}

export class P2_Pawn extends ChessPiece{
    constructor(side, row, col){
        super(side, row, col);
    }
    get ClassName(){return ChessTypes.Pawn;}
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