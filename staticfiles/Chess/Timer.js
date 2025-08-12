export class Timer{
    /**
     * 
     * @param {number} Timer Minutes dedicated for a match
     * @param {number} PerMove Additional time get after making a move
     * @param {HTMLSpanElement} playerTimer
     * @param {string} oppositeSide 
     * @param {Function} additonalFunc 
     */
    constructor(Timer, PerMove, playerTimer, oppositeSide, additionalFunc){
        this.Timer = Timer * 60;
        this.PerMove = PerMove;
        this.playerTimer = playerTimer;
        this.timerID = 0;
        this.EventBanner = document.getElementById("EventBanner");
        this.timeLeft = this.Timer;
        this.oppositeSide = oppositeSide;
        this.additionalFunc = additionalFunc;
        this.playerTimer.innerText = secToMMSS(this.timeLeft);
        
    }
    start(){
        this.timerID = setInterval(this.theTimerfunc.bind(this), 1000);
    }

    add(){
        this.timeLeft = this.timeLeft + this.PerMove;
    }

    stop(){
        clearInterval(this.timerID);
    }

    theTimerfunc(){
        this.timeLeft--;
        this.playerTimer.innerText = secToMMSS(this.timeLeft);
        if(this.timeLeft === 0){
            clearInterval(this.timerID);
            this.additionalFunc();
            this.EventBanner.innerHTML = "Event: Timeout<br>" + this.oppositeSide + " wins!";
            this.EventBanner.dataset.promptHidden = "false";
        }
    }
}

function secToMMSS(seconds){
    const mainMinutes = Math.floor(seconds / 60);
    const second = seconds % 60;
    return mainMinutes.toString().padStart(2, "0") + ":" + second.toString().padStart(2, "0");
}