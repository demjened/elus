// TODO: fluid layout
// TODO: add rule tooltips
// TODO: add unit tests
// TODO: separate UI from game logic
// TODO: add random game mode

// initialize namespace
var ELUS = ELUS || {
    version: 0.90,
    statusBarMessage: '',
    rule: {},
    ruleHint: '',
    gameType: 'Classic',
    level: 0,
    round: 0,
    errorsLeft: 0,
    lastFigure: '',
    nextFigureTemplate: ''
}

// initialize type classes
ELUS.Size  = { 'S': 'Small', 'B': 'Big' }
ELUS.Color = { 'G': 'Blue', 'Y': 'Yellow' }
ELUS.Shape = { 'C': 'Circle', 'L': 'Lozenge' }

/**
 * Class to store and manipulate figures.
 *
 * @param {String} shorthand - the shorthand of the figure, eg. "BYC" (= Big Yellow Circle)
 * @returns {ELUS.Figure}
 */
ELUS.Figure = function(shorthand) {
    this.shorthand = shorthand;
    this.size = shorthand.substr(0, 1);  // B
    this.color = shorthand.substr(1, 1); // Y
    this.shape = shorthand.substr(2, 1); // C
    
    /**
     * Returns the opposite of this figure's size.
     *
     * @return {String}
     */
    this.oppositeSize = function() {
        return this.size == 'B' ? 'S' : 'B';
    }
    
    /**
     * Returns the opposite of this figure's color.
     *
     * @return {String}
     */
    this.oppositeColor = function() {
        return this.color == 'G' ? 'Y' : 'G';
    }
    
    /**
     * Returns the opposite of this figure's shape.
     *
     * @return {String}
     */
    this.oppositeShape = function() {
        return this.shape == 'C' ? 'L' : 'C';
    }

    /**
     * Evaluates if this figure is the same as the given figure.
     *
     * @param {ELUS.Figure} other - the other figure
     * @return {Boolean}
     */
    this.equals = function(other) {
        return this.shorthand === other.shorthand;
    }
    
    /**
     * Renders the figure as a HTML element.
     *
     * @param {String} id - the optional id of the element
     * @param {String} clazz - the optional class of the element
     * @return {Boolean}
     */
    this.render = function(id, clazz) {
        return '<span ' + (id ? 'id="' + id + '" ' : '') + 'class="figure' + (clazz ? ' ' + clazz : '') + '" data-value="' + this.shorthand + '">'
            + '<span class="figure-icon fa figure-icon'
            + (this.size == 'B' ? ' big' : ' small')
            + (this.color == 'Y' ? ' yellow' : ' blue')
            + (this.shape == 'C' ? ' fa-circle-o' : ' fa-lozenge-o')
            + '"></span>'
            +   '<span class="figure-label">' + ELUS.Size[this.size] + " " + ELUS.Color[this.color] + " " + ELUS.Shape[this.shape] + '</span>'
            + '</span>';
    }
    
}

/**
 * Class to store and manipulate rules.
 *
 * @param {String} shorthand - the shorthand that expresses the rule, eg. "hL?cG:s="
 * @returns {ELUS.Rule}
 */
ELUS.Rule = function(shorthand) {
    this.shorthand = shorthand;

    var i1 = this.shorthand.indexOf('?');
    var i2 = this.shorthand.indexOf(':');
    this.condition = this.shorthand.substring(0, i1);
    this.trueTemplate = (i2 == -1) ? this.shorthand.substring(i1 + 1) : this.shorthand.substring(i1 + 1, i2);
    this.falseTemplate = (i2 == -1) ? '' : this.shorthand.substring(i2 + 1);

    /**
     * Returns the full description of the rule.
     */
    this.toString = function() {
        var conditionToken = this.condition.substr(0, 1);
        var conditionValue = this.condition.substr(1, 1);
        
        if (this.condition == '-') {
            return 'Always choose figure with {0}'.format(templateToString(this.trueTemplate));
        } else {
            var conditionStr = conditionToken == 's' ? ELUS.Size[conditionValue] : conditionToken == 'c' ? ELUS.Color[conditionValue] : ELUS.Shape[conditionValue];
            return 'If the last figure is {0}, then choose figure with {1}, otherwise choose figure with {2}'.format(conditionStr, templateToString(this.trueTemplate), templateToString(this.falseTemplate));
        }
    }
    
    /**
     * Converts a partial template to a string.
     *
     * @param {String} shorthand - the shorthand that expresses the template, eg. "s="
     * @returns {String}
     */
    function templateToString(shorthand) {
        var attribute = shorthand.substr(0, 1);
        var operator = shorthand.substr(1, 1);

        if (attribute == 's') { // size
            return (operator == '=' ? 'same' : (operator == '!' ? 'different' : ELUS.Size[operator])) + ' size';
        } else if (attribute == 'c') { // color
            return (operator == '=' ? 'same' : (operator == '!' ? 'different' : ELUS.Color[operator])) + ' color';
        } else if (attribute == 'h') { // shape
            return (operator == '=' ? 'same' : (operator == '!' ? 'different' : ELUS.Shape[operator])) + ' shape';
        }
    }
}

/**
 * Classic game rules by level, expressed by their shorthands.
 */
ELUS.ClassicRules = [
    [               // LEVEL 1 RULES
        '-?c=',     // always choose same color
        '-?s=',     // always choose same size
        '-?h=',     // always choose same shape
        '-?c!',     // always choose different color
        '-?s!',     // always choose different size
        '-?h!'      // always choose different shape
    ], 
    [               // LEVEL 2 RULES
        'cY?sB:sS', // if the last figure is yellow, choose a big one, if not choose a small one
        'hC?cG:cY', // if the last figure is a circle, choose a blue figure, if not choose a yellow one
        'hC?sS:sB', // if the last figure is a circle, choose a small one, if not choose a big one
        'sB?hC:hL', // if the last figure is big, choose a circle, if not choose a lozenge
        'sB?cY:cG'  // if the last figure is big, choose a yellow one, if not choose a blue one
    ],
    [               // LEVEL 3 RULES
        'hL?cG:s=', // if the last figure is a lozenge, choose a blue one, if not choose one of the same size
        'cY?hC:hL', // if the last figure is yellow, choose a circle, if not choose a lozenge
        'cG?hC:hL', // if the last figure is blue, choose a circle, if not choose a lozenge
        'cG?sB:h!', // if the last figure is blue, choose a big figure, if not choose a different type
        'cG?sB:hC', // if the last figure is blue, choose a big figure, if not choose a circle
        'hC?cY:sS', // if the last figure is a circle, choose a yellow one, if not choose a small one
        'sB?hL:cG', // if the last figure is big, choose a lozenge, if not choose a blue one
        'sB?hC:c=', // if the last figure is big, choose a circle, if not choose one of the same color
        'sB?cY:hL', // if the last figure is big, choose a yellow one, if not choose a lozenge
        'sB?cG:cY', // if the last figure is big, choose a blue one, if not choose a yellow one
        'sB?cG:h=', // if the last figure is big, choose a blue one, if not choose one of the same type
        'sB?cG:c!'  // if the last figure is big, choose a blue one, if not choose one of another color
    ]
]

/**
 * Gets a random element from the given pool.
 *
 * @param {Array} pool - the pool to choose from
 * @return {?}
 */
ELUS.getRandomElement = function(pool) {
    return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Gets N random elements from the given pool.
 *
 * @param {Array} pool - the pool to choose from
 * @param {Number} count - the number of elements to choose
 * @return {Array}
 */
ELUS.getNRandomElements = function(pool, count) {
    var picked = [];
    for (var i = 0; i < count; i++) {
        picked.push(pool.splice(ELUS.indexOfFigure(pool, ELUS.getRandomElement(pool)), 1)[0]);
    }
    return picked;
}

/**
 * Generates a rule based on the current game type and level.
 *
 * @param {String} gameType - the current game type
 * @param {Number} level - the current game level
 * @returns {ELUS.Rule}
 */
ELUS.generateRule = function(gameType, level) {
    // TODO: implement gameType = 'Random'
    return new ELUS.Rule(ELUS.getRandomElement(ELUS.ClassicRules[level - 1]));
}

/**
 * Generates all (8) possible figure combinations to fill the initial figure pool.
 *
 * @returns {Array}
 */
ELUS.generateAllFigures = function() {
    var figures = [];
    for (var i = 0; i < Object.keys(ELUS.Size).length; i++) {
        for (var j = 0; j < Object.keys(ELUS.Color).length; j++) {
            for (var k = 0; k < Object.keys(ELUS.Shape).length; k++) {
                figures.push(new ELUS.Figure(Object.keys(ELUS.Size)[i] + Object.keys(ELUS.Color)[j] + Object.keys(ELUS.Shape)[k]));
            }
        }
    }

    return figures;
}

/**
 * Applies the given rule on the given figure to get the next figure template string, eg. "cY".
 *
 * @param {ELUS.Rule} rule - the rule to apply
 * @param {ELUS.Figure} figure - the figure to apply to rule on 
 * @return {String}
 */
ELUS.getNextFigureTemplate = function(rule, figure) {
    var sizeCondition, colorCondition, shapeCondition;
    var conditionToken = rule.condition.substr(0, 1);
    var conditionValue = rule.condition.substr(1, 1);
    if (conditionToken == 's') { // size
        sizeCondition = conditionValue;
    } else if (conditionToken == 'c') { // color
        colorCondition = conditionValue;
    } else if (conditionToken == 'h') { // shape
        shapeCondition = conditionValue;
    }
    
    // the next template is the rule's "true" template if a) the rule has no condition, or b) the condition matches the figure's relevant attribute; otherwise it's the "false" template
    return rule.condition == '-' || sizeCondition == figure.size || colorCondition == figure.color || shapeCondition == figure.shape ? rule.trueTemplate : rule.falseTemplate;
}

/**
 * Gets those figures from the given pool that match the given template.
 *
 * @param {Array} pool - the pool of figures to choose from
 * @param {ELUS.Figure} figure - the figure to apply the template on
 * @param {String} template - the template to apply
 * @return {Array}
 */
ELUS.getMatchingFigures = function(pool, figure, template) {
    var matching = [];
    var sizeFilter, colorFilter, shapeFilter;

    var attribute = template.substr(0, 1);
    var operator = template.substr(1, 1);
    
    if (attribute == 's') { // size
        sizeFilter = (operator == '=' ? figure.size : (operator == '!' ? figure.oppositeSize() : operator));
    } else if (attribute == 'c') { // color
        colorFilter = (operator == '=' ? figure.color : (operator == '!' ? figure.oppositeColor() : operator));
    } else if (attribute == 'h') { // shape
        shapeFilter = (operator == '=' ? figure.shape : (operator == '!' ? figure.oppositeShape() : operator));
    }
    
    for (var i = 0; i < pool.length; i++) {
        var candidate = pool[i];
        if ((!sizeFilter || sizeFilter == candidate.size) && (!colorFilter || colorFilter == candidate.color) && (!shapeFilter || shapeFilter == candidate.shape)) {
            matching.push(candidate);
        }
    }
    
    return matching;
}

/**
 * Gets those figures from the given pool that do not match the given template.
 *
 * @param {Array} pool - the pool of figures to choose from
 * @param {ELUS.Figure} figure - the figure to apply the template on
 * @param {String} template - the template to apply
 * @return {Array}
 */
ELUS.getNonMatchingFigures = function(pool, figure, template) {
    var matching = ELUS.getMatchingFigures(pool, figure, template);
    return pool.filter(function(item) {
        return ELUS.indexOfFigure(matching, item) < 0;
    });
}

/**
 * Gets the next figure choices (1 correct, 2 incorrect) from the pool based on the given figure and template string and shuffles them.
 *
 * @param {Array} pool - the pool to choose from
 * @param {ELUS.Figure} figure - the figure to apply the template on
 * @param {String} template - the template to apply
 * @return {Array}
 */
ELUS.getNextChoicesShuffled = function(pool, figure, template) {
    return [ELUS.getRandomElement(ELUS.getMatchingFigures(pool, figure, template))].concat(ELUS.getNRandomElements(ELUS.getNonMatchingFigures(pool, figure, template), 2)).sort(function() {
       return .5 - Math.random(); 
    });
}

/**
 * Gets the index of a given figure in the given pool.
 *
 * @param {Array} pool - the pool of figures to search in
 * @param {ELUS.Figure} figure - the figure to look for
 * @return {Number}
 */
ELUS.indexOfFigure = function(pool, figure) {
    for (var i = 0; i < pool.length; i++) {
        if (pool[i].equals(figure)) {
            return i;
        }
    }
    return -1;
}

/**
 * Evaluates if the given figure is the correct successor of the previous figure based on the given template.
 *
 * @param {Array} pool - the pool to choose from
 * @param {ELUS.Figure} figure - the figure to check
 * @param {ELUS.Figure} previousFigure - the previous figure to apply the template on
 * @param {String} template - the template to apply
 * @return {Boolean}
 */
ELUS.isCorrectFigure = function(pool, figure, previousFigure, template) {
    return ELUS.indexOfFigure(ELUS.getMatchingFigures(pool, previousFigure, template), figure) >= 0;
}

/**
 * Formats a string with the given arguments as placeholders.
 *
 * @returns {String}
 */
String.prototype.format = function() {
    var formatted = this;
    for (var arg in arguments) {
        formatted = formatted.replace('{' + arg + '}', arguments[arg]);
    }
    return formatted;
};

// UI methods

/**
 * Adds a new figure row to the figures grid.
 *
 * @param {Number} round - the current game round
 */
ELUS.addFigureRow = function(round) {
    var newRound = $('<div class="figure-row">'
      +   '<span class="figure-row-number">' + round + '</span>'
      + '</div>');
    $('.figures').append(newRound);
    
    if (round == 1) {
        var span = $('<span class="stats">'
            + '<span class="stats-label">Level</span>'
            + '<span class="stats-value" id="level-value" data-toggle="tooltip">' + ELUS.level + '</span>'
            + '</span>');
        newRound.append(span);
    } else if (round == 2) {
        var span = $('<span class="stats">'
            + '<span class="stats-label">Round</span>'
            + '<span class="stats-value" id="figures-value">1/8</span>'
            + '</span>');
        newRound.append(span);
    } else if (round == 3) {
        var span = $('<span class="stats">'
            + '<span class="stats-label">Errors</span>'
            + '<span class="stats-value" id="tries-left-value">3</span>'
            + '</span>');
        newRound.append(span);
    }
    
    $('#figures-value').text(round + '/8');
    newRound.hide().slideDown(500);
}

/**
 * Adds a new figure to the last row.
 *
 * @param {ELUS.Figure} figure - the figure to add
 */
ELUS.addFigure = function(figure) {
    $('.figure-row').last().children('.figure-row-number').after(figure.render(null, 'not-selected'));
}

/**
 * Adds a placeholder and 3 choices to the last row.
 */
ELUS.addChoices = function() {
    // add "?" placeholder to last row
    var placeholder = $('<span id="next-placeholder" class="figure next-placeholder" data-original-title="' + ELUS.ruleHint + '">'
      +   '<span class="figure-label next">?</span>'
      + '</span>').tooltip({ placement: "bottom" });
    $('.figure-row').last().children('.figure-row-number').after(placeholder);
    //placeholder;
    
    // get 3 choice buttons based on current figure/rule and add them as choice buttons
    var choices = ELUS.getNextChoicesShuffled(ELUS.allFigures, ELUS.lastFigure, ELUS.nextFigureTemplate);
    for (var i = 0; i < 3; i++) {
        var figure = choices[i];
        var choice = $(figure.render('choice' + i, 'selectable'));
            
        choice.click(function() {
            ELUS.selectFigure(this, choices);
        });
        // TODO: add hover text
        
        $('.figure-row').last().children().last().after(choice);
    }
}

/**
 * Selects a figure: evaluates whether the choice is correct, then replaces the "?" placeholder with it.
 */
ELUS.selectFigure = function(selected, choices) {
    var selectedFigure = new ELUS.Figure(selected.getAttribute('data-value'));
    var selectedId = selected.getAttribute('id');
    var isCorrect = ELUS.isCorrectFigure(choices, selectedFigure, ELUS.lastFigure, ELUS.nextFigureTemplate);
    
    // add appropriate class to each figure choice button and remove selectability
    $('[id^=choice]').each(function(i) {
        $(this).removeClass('selectable')
            .addClass($(this).attr('id') == selectedId ? (isCorrect ? 'correct' : 'incorrect') : 'not-selected')
            .off('click');
    });
    
    // replace "?" placeholder with selected figure via sliding animation
    var selectNext = $('#next-placeholder');
    selectNext.animate({ opacity: 0 }, 200, function() { // fade out but keep width
        var selectedIndex = parseInt(selectedId.substr(-1));
        var selectNextWidth = selectNext.outerWidth() + 4, figureWidth = $('#choice0').outerWidth() + 4;
        var offsets = []; // offsets to slide each figure by
        offsets.push((selectedIndex == 0 ? 0 : figureWidth) - selectNextWidth);
        offsets.push((selectedIndex == 0 ? 0 : selectedIndex == 1 ? -1 * figureWidth : figureWidth) - selectNextWidth);
        offsets.push((selectedIndex != 2 ? 0 : -2 * figureWidth) - selectNextWidth);
        
        // slide all figures at the same time
        $('[id^=choice]').each(function(i) {
            $(this).removeAttr('id').animate({ left: offsets[i] }, 500);
        });
        
        selectNext.removeAttr('id');
        
        // TODO: fix DOM after sliding
    });

    // apply changes based on selection (display statusbar text, move to next round or finish game)
    setTimeout(function() {
        if (!isCorrect) {
            ELUS.errorsLeft--;
            $('#tries-left-value').fadeOut(200, function() {
                $(this).text(ELUS.errorsLeft).fadeIn();
            });
            ELUS.changeStatusbarText('<span class="red">Incorrect choice!</span> ' + ELUS.errorsLeft + ' tries left.', true);
        } else {
            ELUS.changeStatusbarText('<span class="green">Correct choice!</span>', true);
        }

        // check how many attempts/rounds we have left in the game
        if (++ELUS.round == 9 || ELUS.errorsLeft == 0) { // won or lost the round
            ELUS.finishLevel(ELUS.errorsLeft > 0);
        } else { // next round
            ELUS.lastFigure = selectedFigure;
            ELUS.nextFigureTemplate = ELUS.getNextFigureTemplate(ELUS.rule, ELUS.lastFigure);
            ELUS.addFigureRow(ELUS.round);
            ELUS.addChoices();
        }
    }, 700);
}

/**
 * Adds the initial 3 figures to the figures grid.
 */
ELUS.addInitialFigures = function() {
    // construct array of 3 figures
    var initialFigures = [];
    for (var i = 0; i < 3; i++) {
        ELUS.lastFigure = (i == 0) ? ELUS.getRandomElement(ELUS.allFigures) : ELUS.getRandomElement(ELUS.getMatchingFigures(ELUS.allFigures, ELUS.lastFigure, ELUS.nextFigureTemplate));
        ELUS.nextFigureTemplate = ELUS.getNextFigureTemplate(ELUS.rule, ELUS.lastFigure);
        initialFigures.push(ELUS.lastFigure);
    }
    
    // each figure row should appear after the previous one
    $.each(initialFigures, function(i, figure) {
        setTimeout(function() {
            ELUS.addFigureRow(++ELUS.round);
            ELUS.addFigure(figure);
        }, 500 * i);
    });
}

/**
 * Starts a new game.
 */
ELUS.newGame = function() {
    if (ELUS.gameType == 'Random') {
        ELUS.changeStatusbarText('Sorry, Random game type is not available yet.');
        return;
    }
    
    // show game container, hide buttons
    $('.figures').show();
    $('#button-new-game-grp').hide();
    $('#button-next-level').hide();
    
    // start at level 1
    ELUS.level = 0;
    ELUS.nextLevel();
}

/**
 * Initializes the game.
 */
ELUS.initializeGame = function() {
    $('.figures').hide();
    $('#button-new-game-grp').show();
    $('#button-instructions').show();
    $('#button-cancel-game').hide();
    $('#button-finish-game').hide();
    $('#button-next-level').hide();
    ELUS.changeStatusbarText('Welcome to ELUS!', true, true);
}

/**
 * Finishes the current level: advances to the next level or returns to the main menu.
 * 
 * @param {Boolean} won - if the game was won
 */
ELUS.finishLevel = function(won) {
    var html = won ? '<span class="green">You won!</span>' : '<span class="red">You lost.</span>';
    html += ' The rule was: <b>' + ELUS.rule.toString() + '</b>.';
        
    if (won && ELUS.isGameWon()) {
        html += '<br><span class="teal">Congratulations, you have won the game!</span>';
        $('#button-finish-game').show();
    } else if (won) {
        $('#button-next-level').show();
    } else {
        $('#button-cancel-game').hide();
        $('#button-new-game-grp').show();
        $('#button-finish-game').show();        
    }
    ELUS.changeStatusbarText(html, true);
}

/**
 * Evaluates if the current game has been won.
 */
ELUS.isGameWon = function() {
    return ELUS.round == 9 && (ELUS.gameType == "Classic" && ELUS.level == 3) || ELUS.gameType == "Random";
}

/**
 * Cancels the current game; if in mid-game, asks for confirmation first.
 *
 * @param {Button} btn - the button that was pressed
 */
ELUS.cancelGame = function(btn) {
    var btn = $(btn);
    var pressed = btn.attr('pressed');
    if (!pressed) {
        btn.attr('pressed', true);
        btn.text('Are you sure?');
        btn.on('mouseout', function() {
            btn.removeAttr('pressed');
            btn.text('Cancel game');
        });
    } else {
        ELUS.initializeGame();
    }
}

/**
 * Advances to the next level.
 */
ELUS.nextLevel = function() {
    // advance level, reset counters
    ELUS.level++, ELUS.round = 0, ELUS.errorsLeft = 3;
    
    // generate rule and related hint
    ELUS.rule = ELUS.generateRule(ELUS.gameType, ELUS.level);
    switch (ELUS.level) {
        case 1:
            ELUS.ruleHint = 'Level 1: Always choose figure with same <attribute> OR different <attribute> as the last figure'; break;
        case 2:
            ELUS.ruleHint = 'Level 2: If the last figure has <attribute A>, then choose figure with <this of attribute B>, otherwise choose figure with <that of attribute B>'; break;
        case 3:
            ELUS.ruleHint = 'Level 3: If the last figure has <attribute A> then choose figure with <this of attribute B>, otherwise choose figure with <that of attribute C> OR with same <attribute> OR different <attribute> as the last figure'; break;
    }
    
    // clear all containers
    $('.figures').empty();
    $('.result').empty();
    $('#instructions').hide();
    $('#instructions-carousel').carousel(0); // reset
    $('#button-next-level').hide();
    $('#button-cancel-game').show();
    
    // set initial values
    $('#tries-left-value').text(ELUS.errorsLeft);
    $('#level-value').text(ELUS.level);
    $('#level-value').attr('title', 'foo');
    ELUS.changeStatusbarText('Starting level ' + ELUS.level + '.', true, true);
    
    // add first 3 figures, then display choices based on last figure
    ELUS.addInitialFigures();
    setTimeout(function() {
        ELUS.addFigureRow(++ELUS.round);
        ELUS.addChoices();
    }, 500 * 3);
}

/**
 * Changes the game type.
 */
ELUS.changeGameType = function(gameType) {
    ELUS.gameType = gameType;
    $('#button-new-game').text('New game: ' + gameType);
}

/**
 * Replaces the statusbar's text with the given content.
 *
 * @param {String} html - the content
 * @param {Boolean} sticky - if true, this will remain the next default message to reset to
 * @param {String} withoutFade - if true, the text will be replaced without any fade-out animation
 */
ELUS.changeStatusbarText = function(html, sticky, withoutFade) {
    if (sticky) {
        ELUS.statusBarMessage = html;
    }
    
    var delay = withoutFade ? 0 : 100;
    $('.statusbar-message').fadeOut(delay, function() {
        $(this).html(html).hide().fadeIn(delay);
    });
}

/**
 * Resets the statusbar's text to the previous content.
 */
ELUS.resetStatusbarText = function() {
    ELUS.changeStatusbarText(ELUS.statusBarMessage);
}

/**
 * Initializes the screen after loading the document.
 */
ELUS.initialize = function() {
    ELUS.changeGameType('Classic');
    
    // set "New game" button to start a new game
    $('#button-new-game').click(function() {
       ELUS.newGame();
    }).hover(function() { 
        ELUS.changeStatusbarText('Start new game.'); 
    }, ELUS.resetStatusbarText);
    
    $('#button-new-game-grp .dropdown-toggle').hover(function() { 
        ELUS.changeStatusbarText('Change game type.'); 
    }, ELUS.resetStatusbarText);
    
    // set dropdown under "New game" to change the game type
    $('#button-new-game-grp .dropdown-menu li').click(function(e) {
        ELUS.changeGameType($(e.target).text());
    }).hover(function(e) {
        var text = '';
        switch ($(e.target).text()) {
            case 'Classic':
                text = '<b>Classic game</b> - Play 3 consecutive rounds of rules with increasing difficulty.'; break;
            case "Random":
                text = '<b>Random game</b> - Play a round with a randomized rule. (NOT AVAILABLE YET)'; break;
        }
        ELUS.changeStatusbarText(text);
    }, ELUS.resetStatusbarText);
    
    // set next level button to go to next level
    $('#button-next-level').hide().click(function() {
       ELUS.nextLevel();
    }).hover(function() {
        ELUS.changeStatusbarText('Go to the next level.'); 
    }, ELUS.resetStatusbarText);
    
    // set "Cancel game" and "Finish game" buttons to cancel game
    $('#button-cancel-game, #button-finish-game').click(function(e) {
       ELUS.cancelGame(e.target);
    }).hover(function() {
        ELUS.changeStatusbarText('End current game and return to the main menu.'); 
    }, ELUS.resetStatusbarText);
    
    // set "Instructions" button to display instructions
    $('#button-instructions').click(function() {
        $('#instructions').slideToggle(200, function() {
            $('#instructions-carousel').carousel(0); // reset carousel
        });
    }).hover(function() { 
        ELUS.changeStatusbarText('View instructions for playing ELUS.'); 
    }, ELUS.resetStatusbarText);
    
    // set up "About" button
    $('#button-about').hover(function() { 
        ELUS.changeStatusbarText('Find out about the author of ELUS.'); 
    }, ELUS.resetStatusbarText);

    // set up "GitHub" button
    $('#button-github').hover(function() { 
        ELUS.changeStatusbarText('Check out the source code on GitHub (opens in a new tab).'); 
    }, ELUS.resetStatusbarText);
    
    // set instructions modal panel behaviour
    $('#instructions').on('hidden.bs.modal', function() {
        $('#instructions-carousel').carousel(0); // reset carousel
    });
    
    // set instructions carousel behaviour
    $('#instructions-carousel').on('slid.bs.carousel', function() {
        var curSlide = $('#instructions-carousel .item.active');
        if (curSlide.is(':first-child')) {
            $('#instructions-carousel .left').hide();
        } else {
            $('#instructions-carousel .left').show();
        }
        
        if (curSlide.is(':last-child')) {
            var rightButton = $('<span class="fa fa-close" data-dismiss="modal"></span>');
            $('#instructions-carousel .right').html(rightButton).removeAttr('data-slide').click(function() {
                $('#instructions-carousel').carousel(0); // reset carousel
            });
        } else {
            var rightButton = $('<span class="fa fa-arrow-right"></span>');
            $('#instructions-carousel .right').html(rightButton).attr('data-slide', 'next').off('click');
        }
    });
    
    // set version label
    $('.version').text('v' + ELUS.version.toFixed(3));
    
    // initialize game
    ELUS.initializeGame();
}
