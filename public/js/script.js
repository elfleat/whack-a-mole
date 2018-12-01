'use strict';

var Library = {};

Library.Modal = function(selectors) {
    
    // Cached DOM elements to reduce querys to min.
    this.queryElements = function() {
        var container = document.getElementById(selectors.container);

        this.els = {
            container: container,
            closeBtn: container.querySelector('#leaderboard-close'),
            trigger: document.getElementById(selectors.trigger),
            overlay: document.querySelector('#leaderboard-modal-overlay')
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
    this.appState = {
        screen: 'intro',    // 'intro' || 'game' || 'over'
        score: 0,           // Default Score (0)
        timer: 30           // Defined in seconds
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
            playNowBtn: appContainer.querySelector('#' + selectors.playNowBtn)
        };

        return this;
    }

    // Bind events to DOM elements
    this.bindEvents = function() {
        this.els.playNowBtn.addEventListener('click', this.startGame.bind(this));
        return this;
    }

    this.initApp = function() {
        updateAppState('intro');
        return this;
    }

    this.startGame = function() {
        updateAppState('game');
        return this;
    }

    return this.queryElements().bindEvents().initApp();
};

window.Library = Library;

(function() {
    console.log('We\'re ready.');
    var leaderboardModalEl = document.getElementById('leaderboard-modal');

    window.app = new Library.GameApp({
        appContainer: 'wam-app',
        playNowBtn: 'wam-play-cta'
    });

    if(leaderboardModalEl) {
        window.leaderboardModal = new window.Library.Modal({
            container: 'leaderboard-modal',
            trigger: 'wam-leaderboard-cta'
        });
    }
}());
