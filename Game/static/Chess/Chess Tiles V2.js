import { ChessPiece } from "./Chess Pieces V2.js";
import { Status, Side } from "./Chess Constants.js";

export class ChessTile{
    /**
     * 
     * @param {ChessPiece} chesspiece 
     * @param {Function} callable  
     */
    constructor(chesspiece, callable){
        this.chesspiece = chesspiece;
        this.callable = new Array(callable);
    }

    get ChessPiece(){return this.chesspiece;}
    get Callable(){return this.callable;}
    
    set ChessPiece(chesspiece){this.chesspiece = chesspiece;}
    set Callable(callable){this.callable = callable;}
}

/**
 * 
 * @param {string} side Use Side constant from Chess Constants module 
 * @param {ChessPiece} chesspiece 
 * @returns {Function}
 */
export function setAttackRange(side, chesspiece){
    let _side = side;
    let _chesspiece = chesspiece;
    /**
     * @param {ChessPiece} chesspiece
     */
    return (chesspiece)=>{
        if (chesspiece.Side !== _side && chesspiece.ClassName === "King"){
            return {status: "Block", candidate: chesspiece};
        }
        return {status: "JustLanding", from: _chesspiece.ID};
    };
}

/**
 * 
 * @returns {Function}
 */
export function setNeutralTile(){
    /**
     * @param {ChessPiece} chesspiece
     */
    return ()=>{
        return {status: "JustLanding", from: "Neutral"};
    };
}

/**
 * 
 * @param {string} side Use Side constant from Chess Constants module 
 * @param {ChessTile} targetTile containing the pawn that forwarded two tiles
 * @param {ChessPiece} chesspiece
 * @returns {Function}
 */
export function setEnPassantMe(side, targetTile, chesspiece){
    let _side = side;
    let _targetTile = targetTile;
    let _chesspiece = chesspiece;
    /**
     * @param {ChessPiece} chesspiece
     */
    return (chesspiece)=>{
        if (chesspiece.Side !== _side && chesspiece.ClassName === "Pawn"){
            /* Remove the pawn */
            let temp = _targetTile.ChessPiece;
            _targetTile.chesspiece = new ChessPiece(Side.Neutral, temp.Row, temp.Col);
            return {status: "EnPassant", candidate: chesspiece};
        }
        return {status: "JustLanding", from: _chesspiece.ID};
    };
}