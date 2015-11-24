// TODO: fluid layout
// TODO: finalize instructions
// TODO: use SASS
// TODO: fix method names & wording (eg. choose vs select)
// TODO: add unit tests
// TODO: add documentation
// TODO: separate UI from game logic
// TODO: add random game mode

// initialize namespace
var ELUS = ELUS || {
    version: 0.81,
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

ELUS.ruleToString = function(strategy) { // TODO: eliminate duplication
    var text = '';
    var i1 = strategy.indexOf('?');
    var i2 = strategy.indexOf(':');
    var condition = strategy.substring(0, i1);
    
    var conditionToken = condition.substr(0, 1);
    var conditionValue = condition.substr(1, 1);
    var trueRule = (i2 == -1) ? strategy.substring(i1 + 1) : strategy.substring(i1 + 1, i2);
    var falseRule = (i2 == -1) ? '' : strategy.substring(i2 + 1);
    
    if (condition == '-') {
        text = 'Always choose ' + ELUS.rulePartToString(trueRule);
    } else {
        text = 'If the last figure is ';
        if (conditionToken == 's') { // size
            text += ELUS.Size[conditionValue];
        } else if (conditionToken == 'c') { // color
            text += ELUS.Color[conditionValue];
        } else if (conditionToken == 'h') { // shape
            text += ELUS.Shape[conditionValue];
        }
        text += ', then choose ' + ELUS.rulePartToString(trueRule) + ', otherwise choose ' + ELUS.rulePartToString(falseRule);
    }
    return text;
}


ELUS.rulePartToString = function(rule) { // TODO: eliminate duplication
    var attribute = rule.substr(0, 1);
    var operator = rule.substr(1, 1);

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


ELUS.generateRule = function(currentLevel) {
    return ELUS.pickOneRandom(ELUS.Rule[currentLevel - 1]);
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

ELUS.nextRule = function(strategy, figure) {
    var i1 = strategy.indexOf('?');
    var i2 = strategy.indexOf(':');
    var condition = strategy.substring(0, i1);
    var trueRule = (i2 == -1) ? strategy.substring(i1 + 1) : strategy.substring(i1 + 1, i2);
    var falseRule = (i2 == -1) ? '' : strategy.substring(i2 + 1);
    
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
    
    return condition == '-' || sizeCondition == figure.size || colorCondition == figure.color || shapeCondition == figure.shape ? trueRule : falseRule;
}

ELUS.matchingFigures = function(pool, figure, rule) {
    var matching = [];
    var sizeFilter, colorFilter, shapeFilter;

    var attribute = rule.substr(0, 1);
    var operator = rule.substr(1, 1);
    
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

ELUS.indexOf = function(pool, figure) {
    for (var i = 0; i < pool.length; i++) {
        if (pool[i].shorthand == figure.shorthand) {
            return i;
        }
    }
    return -1;
}

ELUS.nonMatchingFigures = function(pool, figure, rule) {
    var matching = ELUS.matchingFigures(pool, figure, rule);
    return pool.filter(function(item) {
        return ELUS.indexOf(matching, item) < 0;
    });
}

ELUS.pickOneRandom = function(pool) {
    return pool[Math.floor(Math.random() * pool.length)];
}

ELUS.pickNRandom = function(pool, count) {
    var picked = [];
    for (var i = 0; i < count; i++) {
        picked.push(pool.splice(ELUS.indexOf(pool, ELUS.pickOneRandom(pool)), 1)[0]);
    }
    return picked;
}

ELUS.nextChoicesShuffled = function(pool, figure, rule) {
    return [ELUS.pickOneRandom(ELUS.matchingFigures(pool, figure, rule))].concat(ELUS.pickNRandom(ELUS.nonMatchingFigures(pool, figure, rule), 2)).sort(function() {
       return .5 - Math.random(); 
    });
}

ELUS.isMatching = function(chosen, pool, previous, rule) {
    return ELUS.indexOf(ELUS.matchingFigures(pool, previous, rule), chosen) >= 0;
}

ELUS.addFigureRow = function(round) {
    var newRound = $('<div class="figure-row">'
      +   '<span class="figure-row-number">' + round + '</span>'
      + '</div>');
    $('.figures').append(newRound);
    
    if (round == 1) {
        var span = $('<span class="stats">'
            + '<span class="stats-label">Level</span>'
            + '<span class="stats-value" id="level-value">' + currentLevel + '</span>'
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

ELUS.addFigure = function(figure) {
    $('.figure-row').last().children('.figure-row-number').after(figure.render(null, 'not-selected'));
}

ELUS.addChoices = function() {
    // get 3 choice buttons based on current figure/rule
    var choices = ELUS.nextChoicesShuffled(allFigures, currentFigure, currentRule);
    var placeholder = '<span id="next-placeholder" class="figure next-placeholder">'
      +   '<span id="select-next" class="figure-label next">?</span>'
      + '</span>';
    $('.figure-row').last().children('.figure-row-number').after(placeholder);
    
    // add 3 choice buttons
    for (var i = 0; i < 3; i++) {
        var figure = choices[i];
        var choice = $(figure.render('choice' + i, 'selectable'));
            
        choice.click(function() {
            ELUS.choose(this, choices);
        });
        
        $('.figure-row').last().children().last().after(choice);
    }
}

ELUS.choose = function(selected, choices) {
    var figure = new ELUS.Figure(selected.getAttribute('data-value'));
    var selectNext = $('#next-placeholder');
    
    var selectedId = selected.getAttribute('id');
    //$('[id^=choice]').off('click').removeClass('selectable').removeAttr('id');
    $('[id^=choice]').each(function(i) {
        if ($(this).attr('id') != selectedId) {
            $(this).addClass('not-selected');
        }
        $(this).off('click').removeClass('selectable').removeAttr('id');
    });
    
    
    selectNext.fadeOut();
    $(selected).fadeOut(function() {
        // 3->2 buttons animation
        var placeholder = $('<span class="figure blank"></span>');
        $(selected).replaceWith(placeholder);
        placeholder.animate({width: 0}, 200, function() {
            placeholder.remove();
        });
        
        // replace figure
        var chosen = $(figure.render());
        selectNext.replaceWith(chosen);
        chosen.hide().fadeIn().addClass(ELUS.isMatching(figure, choices, currentFigure, currentRule) ? 'correct' : 'incorrect').removeAttr('id');

        if (!ELUS.isMatching(figure, choices, currentFigure, currentRule)) {
            attemptsLeft--;
            var attemptsValue = $('#tries-left-value');
            attemptsValue.fadeOut(function() {
                attemptsValue.text(attemptsLeft).fadeIn();
            })
            ELUS.changeStatusbarText('Incorrect choice - ' + attemptsLeft + ' tries left.');
        } else {
            ELUS.changeStatusbarText('Correct choice!');
        }
    
        // check how many attempts/rounds we have left in the game
        if (++currentRound == 9 || attemptsLeft == 0) {
            ELUS.finishLevel(attemptsLeft > 0);
        } else {
            currentFigure = figure;
            currentRule = ELUS.nextRule(strategy, figure);
            ELUS.addFigureRow(currentRound);
            ELUS.addChoices();
        }
    });
}

ELUS.addInitialFigures = function() {
    var initialFigures = [];
    for (var i = 0; i < 3; i++) {
        currentFigure = (i == 0) ? ELUS.pickOneRandom(allFigures) : ELUS.pickOneRandom(ELUS.matchingFigures(allFigures, currentFigure, currentRule));
        currentRule = ELUS.nextRule(strategy, currentFigure);
        initialFigures.push(currentFigure);
    }
    $.each(initialFigures, function(i, figure) {
        setTimeout(function() {
            ELUS.addFigureRow(++currentRound);
            ELUS.addFigure(figure);
        }, 500 * i);
    });
        
}

ELUS.newGame = function() {
    if (currentGameType == 'Random') {
        ELUS.changeStatusbarText('Sorry, Random game type is not available yet.');
        return;
    }
    
    // show game containers
    $('.stats').slideDown(200, 'linear', {});
    $('.figures').show();
    
    // hide buttons
    $('#button-new-game-grp').hide();
    $('#button-next-level').hide();
    
    // start at level 1
    currentLevel = 0;
    ELUS.nextLevel(++currentLevel);
}

ELUS.initialize = function() {
    $('.stats').hide();
    $('.figures').hide();
    ELUS.changeStatusbarText('Welcome to ELUS!', true);
    $('#button-new-game-grp').show();
    $('#button-instructions').show();
    $('#button-cancel-game').hide();
    $('#button-finish-game').hide();
    $('#button-next-level').hide();
}

ELUS.finishLevel = function(won) {
    var html = '';
    if (won) {
        html = '<span style="display: inline; color: green">You won!</span>';
        html += ' The rule was: <b>' + ELUS.ruleToString(strategy) + '</b>';
        
        if (ELUS.isGameWon()) {
            html += '<span style="display: inline; color: green">Congratulations, you have won the game!</span>';
            $('#button-finish-game').show();
        } else {
            $('#button-next-level').show();
        }
    } else {
        html = '<span style="display: inline; color: red">You lost.</span>';
        html += ' The rule was: <b>' + ELUS.strategyToString(strategy) + '</b>';
        
        $('#button-cancel-game').hide();
        $('#button-new-game-grp').show();
        $('#button-finish-game').show();        
    }
    ELUS.changeStatusbarText(html);
}

/**
 * Evaluates if the current game has been won.
 */
ELUS.isGameWon = function() {
    return currentRound == 9 && (currentGameType == "Classic" && currentLevel == 3) || currentGameType == "Random";
}

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
        ELUS.initialize();
    }
}

ELUS.nextLevel = function() {
    currentRound = 0, attemptsLeft = 3;
    
    // generate strategy based on current level
    strategy = ELUS.generateRule(currentLevel);
    
    // clear all containers
    $('.figures').empty();
    $('.result').empty();
    $('#instructions').hide();
    $('#instructions-carousel').carousel(0); // reset
    $('#button-next-level').hide();
    $('#button-cancel-game').show();
    
    // set initial values
    $('#tries-left-value').text(attemptsLeft);
    $('#level-value').text(currentLevel);
    $('#rule-value').tooltip({title: ELUS.ruleTooltip(currentLevel), animation: true}); 
    ELUS.changeStatusbarText('Starting level ' + currentLevel + '.', true);
    
    // add first 3 figures, then display choices based on last figure
    ELUS.addInitialFigures();
    setTimeout(function() {
        ELUS.addFigureRow(++currentRound);
        ELUS.addChoices();
    }, 500 * 3);
}

ELUS.changeGameType = function(type) {
    currentGameType = type;
    $('#button-new-game').text('New game: ' + type);
}

ELUS.changeStatusbarText = function(html, withoutFade) {
    var delay = withoutFade ? 0 : 100;
    $('.statusbar-message').fadeOut(delay, function() {
        $(this).html(html).hide().fadeIn(delay);
    });
}

// **** execution starts here **** 

var allFigures = ELUS.generateAllFigures();
var strategy, currentGameType, currentLevel, currentRound, currentFigure, currentRule, attemptsLeft, roundsLeft;

// when document is loaded, start new game
$(document).ready(function() {
    ELUS.changeGameType('Classic');
    
    // "New game" button should start new game
    $('#button-new-game').click(function() {
       ELUS.newGame();
    });
    
    // dropdown under "New game"
    $('#button-new-game-grp .dropdown-menu li').click(function(e) {
        ELUS.changeGameType($(e.target).text());
    }).hover(function(e) {
        var text = '';
        switch ($(e.target).text()) {
            case 'Classic':
                text = 'Classic game: Play 3 consecutive rounds of rules with increasing difficulty.'; break;
            case "Random":
                text = 'Random game: Play a round with a randomized rule.'; break;
        }
        ELUS.changeStatusbarText(text);
    });
    
    $('#button-next-level').hide().click(function() {
       ELUS.nextLevel(++currentLevel);
    });
    
    $('#button-cancel-game').click(function(e) {
       ELUS.cancelGame(e.target);
    });
    
    $('#button-finish-game').click(function(e) {
       ELUS.cancelGame(e.target);
    });
    
    // "Instructions" button should display instructions
    $('#button-instructions').click(function() {
        $('#instructions').slideToggle(200, function() {
            $('#instructions-carousel').carousel(0); // reset
        });
    });
    
    // add instructions modal panel behaviour
    $('#instructions').on('hidden.bs.modal', function() {
        $('#instructions-carousel').carousel(0); // reset
    })
    
    // add instructions carousel behaviour
    $('#instructions-carousel').on('slid.bs.carousel', function() {
        var curSlide = $('#instructions-carousel .item.active');
        if (curSlide.is( ':first-child' )) {
            $('#instructions-carousel .left').hide();
        } else {
            $('#instructions-carousel .left').show();
        }
        
        if (curSlide.is( ':last-child' )) {
            var rightButton = $('<span class="fa fa-close" data-dismiss="modal"></span>');
            $('#instructions-carousel .right').html(rightButton).removeAttr('data-slide').click(function() {
                $('#instructions-carousel').carousel(0); // reset
            });
            
            return;
        } else {
            var rightButton = $('<span class="fa fa-arrow-right"></span>');
            $('#instructions-carousel .right').html(rightButton).attr('data-slide', 'next').off('click');
        }
    });
    
    $('.version').text('v' + ELUS.version.toFixed(3));
    
    ELUS.initialize();
});
