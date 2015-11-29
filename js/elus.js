// TODO: use Rule class
// TODO: fluid layout
// TODO: select animation
// TODO: add rule tooltips
// TODO: finalize instructions
// TODO: add statusbar messages to all buttons
// TODO: fix method names & wording (eg. choose vs select)
// TODO: add unit tests
// TODO: add documentation
// TODO: separate UI from game logic
// TODO: add random game mode

// initialize namespace
var ELUS = ELUS || {
    version: 0.82,
    statusBarMessage: '',
    rule: '',
    gameType: 'Classic',
    level: 0,
    round: 0,
    errorsLeft: 0,
    lastFigure: '',
    nextFigureTemplate: ''
};

ELUS.Size = { 'S': 'Small', 'B': 'Big' },
ELUS.Color = { 'G': 'Blue', 'Y': 'Yellow' },
ELUS.Shape = { 'C': 'Circle', 'L': 'Lozenge' }

ELUS.Figure = function(shorthand) {
    this.shorthand = shorthand; // eg. "BYC"
    this.size = shorthand.substr(0, 1); // B
    this.color = shorthand.substr(1, 1); // Y
    this.shape = shorthand.substr(2, 1); // C
    
    this.reverseSize = function() {
        return this.size == 'B' ? 'S' : 'B';
    }
    
    this.reverseColor = function() {
        return this.color == 'G' ? 'Y' : 'G';
    }
    
    this.reverseShape = function() {
        return this.shape == 'C' ? 'L' : 'C';
    }
    
    this.iconClass = function() {
        return 'fa figure-icon'
            + (this.size == 'B' ? ' big' : ' small')
            + (this.color == 'Y' ? ' yellow' : ' blue')
            + (this.shape == 'C' ? ' fa-circle-o' : ' fa-lozenge-o');
    }
    
    this.render = function(id, clazz) {
        return '<span ' + (id ? 'id="' + id + '" ' : '') + 'class="figure' + (clazz ? ' ' + clazz : '') + '" data-value="' + shorthand + '">'
            +   '<span class="figure-icon ' + this.iconClass() + '"></span>'
            +   '<span class="figure-label">' + ELUS.Size[this.size] + " " + ELUS.Color[this.color] + " " + ELUS.Shape[this.shape] + '</span>'
            + '</span>';
    }
    
    this.equals = function(other) {
        return this.shorthand === other.shorthand;
    }
}

ELUS.Rule = [
    [           // LEVEL 1 RULES
    '-?c=',     // always choose same color
    '-?s=',     // always choose same size
    '-?h=',     // always choose same shape
    '-?c!',     // always choose different color
    '-?s!',     // always choose different size
    '-?h!'      // always choose different shape
    ], 
    [           // LEVEL 2 RULES
    'cY?sB:sS', // if the last figure is yellow, choose a big one, if not choose a small one
    'hC?cG:cY', // if the last figure is a circle, choose a blue figure, if not choose a yellow one
    'hC?sS:sB', // if the last figure is a circle, choose a small one, if not choose a big one
    'sB?hC:hL', // if the last figure is big, choose a circle, if not choose a lozenge
    'sB?cY:cG' // if the last figure is big, choose a yellow one, if not choose a blue one
    ],
    [           // LEVEL 3 RULES
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

ELUS.ruleToString = function(rule) { // TODO: eliminate duplication
    var text = '';
    var i1 = rule.indexOf('?');
    var i2 = rule.indexOf(':');
    var condition = rule.substring(0, i1);
    
    var conditionToken = condition.substr(0, 1);
    var conditionValue = condition.substr(1, 1);
    var trueTemplate = (i2 == -1) ? rule.substring(i1 + 1) : rule.substring(i1 + 1, i2);
    var falseTemplate = (i2 == -1) ? '' : rule.substring(i2 + 1);
    
    if (condition == '-') {
        return 'Always choose figure with {0}'.format(ELUS.rulePartToString(trueTemplate));
    } else {
        var conditionStr = conditionToken == 's' ? ELUS.Size[conditionValue] : conditionToken == 'c' ? ELUS.Color[conditionValue] : ELUS.Shape[conditionValue];
        return 'If the last figure is {0}, then choose figure with {1}, otherwise choose figure with {2}'.format(conditionStr, ELUS.rulePartToString(trueTemplate), ELUS.rulePartToString(falseTemplate));
    }
    return text;
}

ELUS.rulePartToString = function(rulePart) {
    var attribute = rulePart.substr(0, 1);
    var operator = rulePart.substr(1, 1);

    if (attribute == 's') { // size
        return (operator == '=' ? 'same' : (operator == '!' ? 'different' : ELUS.Size[operator])) + ' size';
    } else if (attribute == 'c') { // color
        return (operator == '=' ? 'same' : (operator == '!' ? 'different' : ELUS.Color[operator])) + ' color';
    } else if (attribute == 'h') { // shape
        return (operator == '=' ? 'same' : (operator == '!' ? 'different' : ELUS.Shape[operator])) + ' shape';
    }
}

ELUS.ruleTooltip = function(level) {
    switch (level) {
        case 1: return "Level 1: Always choose same/different feature";
        case 2: return "Level 2: TODO";
        case 3: return "Level 3: TODO";
    }
}

ELUS.generateRule = function(level) {
    return ELUS.getRandomElement(ELUS.Rule[level - 1]);
}

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

ELUS.getNextFigureTemplate = function(rule, figure) {
    var i1 = rule.indexOf('?');
    var i2 = rule.indexOf(':');
    var condition = rule.substring(0, i1);
    var trueTemplate = (i2 == -1) ? rule.substring(i1 + 1) : rule.substring(i1 + 1, i2);
    var falseTemplate = (i2 == -1) ? '' : rule.substring(i2 + 1);
    
    var sizeCondition, colorCondition, shapeCondition;
    var conditionToken = condition.substr(0, 1);
    var conditionValue = condition.substr(1, 1);
    if (conditionToken == 's') { // size
        sizeCondition = conditionValue;
    } else if (conditionToken == 'c') { // color
        colorCondition = conditionValue;
    } else if (conditionToken == 'h') { // shape
        shapeCondition = conditionValue;
    }
    
    return condition == '-' || sizeCondition == figure.size || colorCondition == figure.color || shapeCondition == figure.shape ? trueTemplate : falseTemplate;
}

ELUS.getMatchingFigures = function(pool, figure, template) {
    var matching = [];
    var sizeFilter, colorFilter, shapeFilter;

    var attribute = template.substr(0, 1);
    var operator = template.substr(1, 1);
    
    if (attribute == 's') { // size
        sizeFilter = (operator == '=' ? figure.size : (operator == '!' ? figure.reverseSize() : operator));
    } else if (attribute == 'c') { // color
        colorFilter = (operator == '=' ? figure.color : (operator == '!' ? figure.reverseColor() : operator));
    } else if (attribute == 'h') { // shape
        shapeFilter = (operator == '=' ? figure.shape : (operator == '!' ? figure.reverseShape() : operator));
    }
    
    for (var i = 0; i < pool.length; i++) {
        var candidate = pool[i];
        if ((!sizeFilter || sizeFilter == candidate.size) && (!colorFilter || colorFilter == candidate.color) && (!shapeFilter || shapeFilter == candidate.shape)) {
            matching.push(candidate);
        }
    }
    
    return matching;
}

ELUS.getNonMatchingFigures = function(pool, figure, template) {
    var matching = ELUS.getMatchingFigures(pool, figure, template);
    return pool.filter(function(item) {
        return ELUS.indexOfFigure(matching, item) < 0;
    });
}

ELUS.indexOfFigure = function(pool, figure) {
    for (var i = 0; i < pool.length; i++) {
        if (pool[i].equals(figure)) {
            return i;
        }
    }
    return -1;
}

ELUS.getRandomElement = function(pool) {
    return pool[Math.floor(Math.random() * pool.length)];
}

ELUS.getNRandomElements = function(pool, count) {
    var picked = [];
    for (var i = 0; i < count; i++) {
        picked.push(pool.splice(ELUS.indexOfFigure(pool, ELUS.getRandomElement(pool)), 1)[0]);
    }
    return picked;
}

ELUS.getNextChoicesShuffled = function(pool, figure, template) {
    return [ELUS.getRandomElement(ELUS.getMatchingFigures(pool, figure, template))].concat(ELUS.getNRandomElements(ELUS.getNonMatchingFigures(pool, figure, template), 2)).sort(function() {
       return .5 - Math.random(); 
    });
}

ELUS.isMatching = function(chosen, pool, previous, template) {
    return ELUS.indexOfFigure(ELUS.getMatchingFigures(pool, previous, template), chosen) >= 0;
}

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
 * Adds a figure to the last row.
 */
ELUS.addFigure = function(figure) {
    $('.figure-row').last().children('.figure-row-number').after(figure.render(null, 'not-selected'));
}

/**
 * Adds placeholder and 3 choices to the last row.
 */
ELUS.addChoices = function() {
    // add "?" placeholder to last row
    var placeholder = '<span id="next-placeholder" class="figure next-placeholder">'
      +   '<span id="select-next" class="figure-label next">?</span>'
      + '</span>';
    $('.figure-row').last().children('.figure-row-number').after(placeholder);
    
    // get 3 choice buttons based on current figure/rule and add them as choice buttons
    var choices = ELUS.getNextChoicesShuffled(ELUS.allFigures, ELUS.lastFigure, ELUS.nextFigureTemplate);
    for (var i = 0; i < 3; i++) {
        var figure = choices[i];
        var choice = $(figure.render('choice' + i, 'selectable'));
            
        choice.click(function() {
            ELUS.selectFigure(this, choices);
        });
        
        $('.figure-row').last().children().last().after(choice);
    }
}

/**
 * Selects a figure to become the next one. Checks if the choice is correct, then replaces the placeholder with it.
 */
ELUS.selectFigure = function(selected, choices) {
    var figure = new ELUS.Figure(selected.getAttribute('data-value'));
    
    var selectedId = selected.getAttribute('id');
    $('[id^=choice]').each(function(i) {
        if ($(this).attr('id') != selectedId) {
            $(this).addClass('not-selected');
        }
        $(this).off('click').removeClass('selectable').removeAttr('id');
    });
    
    
    var selectNext = $('#next-placeholder');
    selectNext.fadeOut();
    $(selected).fadeOut(function() {
        // 3->2 buttons animation
        var placeholder = $('<span class="figure blank"></span>');
        $(selected).replaceWith(placeholder);
        placeholder.animate({width: 0}, 200, function() {
            placeholder.remove();
        });
        
        // replace figure
        var selectedFigure = $(figure.render());
        selectNext.replaceWith(selectedFigure);
        selectedFigure.hide().fadeIn().addClass(ELUS.isMatching(figure, choices, ELUS.lastFigure, ELUS.nextFigureTemplate) ? 'correct' : 'incorrect').removeAttr('id');

        if (!ELUS.isMatching(figure, choices, ELUS.lastFigure, ELUS.nextFigureTemplate)) {
            ELUS.errorsLeft--;
            var attemptsValue = $('#tries-left-value');
            attemptsValue.fadeOut(function() {
                attemptsValue.text(ELUS.errorsLeft).fadeIn();
            })
            ELUS.changeStatusbarText('Incorrect choice - ' + ELUS.errorsLeft + ' tries left.', true);
        } else {
            ELUS.changeStatusbarText('Correct choice!', true);
        }
    
        // check how many attempts/rounds we have left in the game
        if (++ELUS.round == 9 || ELUS.errorsLeft == 0) { // won or lost the round
            ELUS.finishLevel(ELUS.errorsLeft > 0);
        } else { // next round
            ELUS.lastFigure = figure;
            ELUS.nextFigureTemplate = ELUS.getNextFigureTemplate(ELUS.rule, figure);
            ELUS.addFigureRow(ELUS.round);
            ELUS.addChoices();
        }
    });
}

/**
 * Adds the initial 3 figures to the game.
 */
ELUS.addInitialFigures = function() {
    var initialFigures = [];
    for (var i = 0; i < 3; i++) {
        ELUS.lastFigure = (i == 0) ? ELUS.getRandomElement(ELUS.allFigures) : ELUS.getRandomElement(ELUS.getMatchingFigures(ELUS.allFigures, ELUS.lastFigure, ELUS.nextFigureTemplate));
        ELUS.nextFigureTemplate = ELUS.getNextFigureTemplate(ELUS.rule, ELUS.lastFigure);
        initialFigures.push(ELUS.lastFigure);
    }
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

ELUS.finishLevel = function(won) {
    var html = '';
    if (won) {
        html = '<span class="game-won">You won!</span>';
        html += ' The rule was: <b>' + ELUS.ruleToString(ELUS.rule) + '</b>';
        
        if (ELUS.isGameWon()) {
            html += '<br><span class="game-completed">Congratulations, you have won the game!</span>';
            $('#button-finish-game').show();
        } else {
            $('#button-next-level').show();
        }
    } else {
        html = '<span class="game-lost">You lost.</span>';
        html += ' The rule was: <b>' + ELUS.ruleToString(ELUS.rule) + '</b>';
        
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
 * Cancels the current game after confirmation.
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

ELUS.nextLevel = function() {
    ELUS.level++;
    ELUS.round = 0, ELUS.errorsLeft = 3;
    
    // generate strategy based on current level
    ELUS.rule = ELUS.generateRule(ELUS.level);
    
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

ELUS.changeGameType = function(type) {
    ELUS.gameType = type;
    $('#button-new-game').text('New game: ' + type);
}

ELUS.changeStatusbarText = function(html, sticky, withoutFade) {
    if (sticky) {
        ELUS.statusBarMessage = html;
    }
    
    var delay = withoutFade ? 0 : 100;
    $('.statusbar-message').fadeOut(delay, function() {
        $(this).html(html).hide().fadeIn(delay);
    });
}

ELUS.resetStatusbarText = function() {
    ELUS.changeStatusbarText(ELUS.statusBarMessage);
}

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
                text = '<b>Random game</b> - Play a round with a randomized rule.'; break;
        }
        ELUS.changeStatusbarText(text);
    }, ELUS.resetStatusbarText);
    
    // set next level button to go to next level
    $('#button-next-level').hide().click(function() {
       ELUS.nextLevel();
    });
    
    // set "Cancel game" and "Finish game" buttons to cancel game
    $('#button-cancel-game, #button-finish-game').click(function(e) {
       ELUS.cancelGame(e.target);
    });
    
    // set "Instructions" button to display instructions
    $('#button-instructions').click(function() {
        $('#instructions').slideToggle(200, function() {
            $('#instructions-carousel').carousel(0); // reset carousel
        });
    });
    
    // set instructions modal panel behaviour
    $('#instructions').on('hidden.bs.modal', function() {
        $('#instructions-carousel').carousel(0); // reset carousel
    })
    
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

String.prototype.format = function() {
    var formatted = this;
    for( var arg in arguments ) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
};
