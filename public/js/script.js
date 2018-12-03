'use strict';

/**
 * Utility Methods
 */
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Modules Library
 */
var Library = {};

Library.Scoreboard = function() {
    var key = 'whack-a-moleScores';
    var defaults = {
        elfleat: 48,
        jvaldes: 16,
        mvanhouten: 8,
        spierre: 21
    };

    this.init = function() {
        var currentScore = this.get();

        if(!currentScore) {
            localStorage.setItem(key, JSON.stringify(defaults));
        }

        return this;
    }

    this.get = function() {
        return JSON.parse(localStorage.getItem(key));
    }

    this.saveScore = function(name, score) {
        var currentScore = this.get();
        currentScore[name] = score;
        localStorage.setItem(key, JSON.stringify(currentScore));
        return true;
    }

    return this.init();
}

Library.Timer = function(el, onDone, totalTime) {
    var time = totalTime;

    this.queryElements = function() {
        this.el = el;
        return this;
    }

    var timerInstance = setInterval(function(){ 
        time -= 1;
        this.updateTime();

        if(time === 0) {
            this.stopTimer();
            onDone();
        }

    }.bind(this), 1000);

    this.stopTimer = function() {
        clearInterval(timerInstance);
    }

    this.updateTime = function() {
        this.el.innerText = time;
        return this;
    }

    return this.queryElements().updateTime();
}

Library.Modal = function(selectors) {
    
    // Cached DOM elements to reduce querys to min.
    this.queryElements = function() {
        var container = document.getElementById(selectors.container);

        this.els = {
            container: container,
            closeBtn: container.querySelector('.modal-close'),
            trigger: document.getElementById(selectors.trigger),
            overlay: document.querySelector('.modal-overlay')
        };
        return this;
    }

    // Bind events to DOM elements
    this.bindEvents = function() {
        this.els.closeBtn.addEventListener('click', this.close.bind(this));
        this.els.overlay.addEventListener('click', this.close.bind(this));
        this.els.trigger.addEventListener('click', this.open.bind(this));
        return this;
    }

    // Method to open modal
    this.open = function() {
        if(this.render) this.render(this.els);
        this.els.container.classList.add('is-open');
        this.els.container.setAttribute('aria-modal', true);
        return this;
    }.bind(this);

    this.close = function() {
        this.els.container.classList.remove('is-open');
        this.els.container.setAttribute('aria-modal', false);
        return this;
    }

    return this.queryElements().bindEvents();   
};

Library.GameApp = function(selectors) {
    // Object to store the instances of the nested modules
    this.modules = {};

    this.appState = {
        screen: 'intro',    // 'intro' || 'game' || 'over'
        score: 0            // Default Score (0)
    };

    // Methods not available via instance api
    var updateAppState = function(state) {
        if(this.appState.screen) {
            this.els.body.classList.remove('app-state-' + this.appState.screen);
        }
        
        this.appState.screen = state;
        this.els.body.classList.add('app-state-' + this.appState.screen);
        return this;
    }.bind(this);

    // Cached DOM elements to reduce querys to min.
    this.queryElements = function() {
        var appContainer = document.getElementById(selectors.appContainer);

        this.els = {
            body: document.body,
            appContainer: appContainer,
            leaderboardModalContainer: appContainer.querySelector('#' + selectors.leaderboard),
            playNowBtn: appContainer.querySelector('#' + selectors.playNowBtn),
            timerSeconds: appContainer.querySelector('#' + selectors.timerSeconds),
            scorePoints: appContainer.querySelector('#' + selectors.scorePoints),
            gameViewport: appContainer.querySelector('#' + selectors.gameViewport),
            craters: document.querySelectorAll('.' + selectors.craters),
            saveNameBtn:  appContainer.querySelector('#' + selectors.saveNameBtn),
            nameInput: appContainer.querySelector('#' + selectors.nameInput),
            gameOverScore: appContainer.querySelector('#' + selectors.gameOverScore)
        };

        return this;
    }

    // Bind events to DOM elements
    this.bindEvents = function() {
        this.els.playNowBtn.addEventListener('click', this.startGame.bind(this));

        this.els.gameViewport.addEventListener('click', function(e) {
            if(e.target.classList.contains('is-out')) {
                this.addPoints();
                e.target.classList.remove('is-out');
            }
        }.bind(this));
        
        this.els.saveNameBtn.addEventListener('click', function(e) {
            e.preventDefault();
            var name = this.els.nameInput.value;

            if(!name.length) {
                return alert('Please enter your name.');
            }

            updateAppState('intro');
            this.modules.scoreBoard.saveScore(name, this.appState.score);

            // Reset Score
            this.appState.score = 0;
            this.modules.leaderboardModal.open();

        }.bind(this));

        return this;
    }

    this.initApp = function() {
        updateAppState('intro');

        this.modules.scoreBoard = Library.Scoreboard();

        this.modules.leaderboardModal = new window.Library.Modal({
            container: 'leaderboard-modal',
            trigger: 'wam-leaderboard-cta',
            leaderboard: 'leaderboard-modal'
        }, this.modules.scoreBoard);

        // Set custom render method for Modal instance
        this.modules.leaderboardModal.render =  this.renderLeaderBoard.bind(this);

        return this;
    }

    this.renderLeaderBoard = function(els) {
        var currentScores = this.modules.scoreBoard.get();
        var listHtml = '';

        var itemHtml = function(name, score) {
            var outputHtml = '<li class="leaderboard-item">'
            + '<span class="leaderboard-item-user">' + name + '</span>'
            + '<span class="leaderboard-item-points">' + score + '</span>'
            + '</li>'
            return outputHtml;
        }

        Object.keys(currentScores).forEach(function(name) {
            listHtml += itemHtml(name, currentScores[name]);
        })

        els.container.querySelector('.leaderboard-table').innerHTML = listHtml;
    };

    this.addPoints = function() {
        this.appState.score += 4;
        this.els.scorePoints.innerText = this.appState.score;
        return this;
    }

    this.toggleMole = function() {
        var crater = this.els.craters[getRandom(0, this.els.craters.length)];
        crater.classList.add('is-out');

        setTimeout(function() {
            crater.classList.remove('is-out');
        }.bind(this), 1200);
    }

    this.setUpCrater = function(delay) {
        setTimeout(this.toggleMole.bind(this), delay);
    }

    this.startGame = function() {
        var totalGameTime = 30;
        var i = 0;

        updateAppState('game');
        this.modules.timer = new Library.Timer(this.els.timerSeconds, this.endGame.bind(this), totalGameTime);

        while (i < 20) {
            this.setUpCrater(getRandom(0, totalGameTime) * 1000);
            i++;
        }

        return this;
    }

    this.endGame = function() {
        this.els.gameOverScore.innerText = this.appState.score;
        updateAppState('game-over');
    }

    return this.queryElements().bindEvents().initApp();
};

window.Library = Library;

(function() {
    console.info('Welcome to Whack-a-Mole.');
    window.app = new Library.GameApp({
        appContainer: 'wam-app',
        playNowBtn: 'wam-play-cta',
        timerSeconds: 'game-countdown-secs',
        scorePoints: 'game-score-points',
        gameViewport: 'game-screen',
        craters: 'game-mole',
        saveNameBtn: 'save-name-cta',
        nameInput: 'game-over-name',
        gameOverScore: 'game-over-score'
    });
}());
