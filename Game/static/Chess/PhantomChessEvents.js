import { ChessTile } from "./Chess Tiles V2.js";
import { ChessTypes } from "./Chess Constants.js";
import { ChessPiece } from "./Chess Pieces V2.js";

const EventBanner = document.getElementById("EventBanner");

/**
 * @param {Array<Array<ChessTile>>} chessdata
 * @returns {boolean} 
 */
export async function Disappear(chessdata){
    /* Choose random pieces */
    let temp = chessdata[Math.floor(Math.random() * 7)][Math.floor(Math.random() * 7)].ChessPiece;
    EventBanner.innerHTML = "Event: Chess Piece Disappearance<br>Victim Player: " + temp.Side;
    EventBanner.dataset.promptHidden = "false";
    showEventBanner("Event: Chess Piece Disappearance<br>Victim Player: " + temp.Side);
}
/**
 * @param {Array<Array<ChessTile>>} chessdata 
 * @returns {boolean} 
 */
export async function Betray(chessdata){
    /* Choose random pieces */
    let temp = chessdata[Math.floor(Math.random() * 7)][Math.floor(Math.random() * 7)].ChessPiece;
    showEventBanner("Event: Chess Piece Betrayal<br>Victim Player: " + temp.Side);
    return true;
}
/**
 * @param {string} msg 
 */
function showEventBanner(msg){
    return new Promise(
        resolve=> setTimeout(()=>{
            EventBanner.innerHTML = msg;
            EventBanner.dataset.promptHidden = "false";
            hideEventBanner();
        }, 500)
        ).then();
    
}
function hideEventBanner(){
    return new Promise(
        resolve=>setTimeout(()=>{
            EventBanner.dataset.promptHidden = "true";
            resolve();
        }, 3000));
}