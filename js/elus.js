// TODO: elus namespace
// TODO: separate UI from game logic
// TODO: documentation
// TODO: unit tests
// TODO: fix wording (choose vs select)

var Size = { 'S': 'Small', 'B': 'Big' }
var Color = { 'G': 'Blue', 'Y': 'Yellow' }
var Shape = { 'C': 'Circle', 'L': 'Lozenge' }

var Figure = function(shorthand) {
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
            +   '<span class="figure-label">' + Size[this.size] + " " + Color[this.color] + " " + Shape[this.shape] + '</span>'
            + '</span>';
    }
}

var Strategy = [
    /*
    1st round is simple, there is one variable that either alternates or stays the same, while the other two variables are ALWAYS irrelevant. Examples: always big; or alternating color. The pattern should be easy to see, the only difficulty may arise when in the initial sequence more than one variable follows some pattern, and then you face a choice and all you can do is guess. 
    
    2nd round is where one variable is the cause, and the other is the consequence (or cause and effect). This ALWAYS leaves one variable irrelevant. Examples are: if big choose blue, if small choose yellow; if circle, choose same size, if lozenge choose different size. With the first figure you choose you most likely have to guess. Here is a rule that make help to guess right. Let's say you have to choose from these choices: 
        1. Big blue lozenge 
        2. Big yellow lozenge 
        3. Small blue circle 
    The right choice should have a unique variable that none of the other choices have. Figure 1 has no unique variable (there is another big, or blue or lozenge figure). Figure 2 has a unique color. Figure 3 has unique shape and size. Unless you already see a pattern that rules out figure 3, your best odds are if you choose it. If it proves correct, you know that the consequence is either size or shape, and you should be able to test different patterns and arrive to the correct pattern by now. 

    3rd round works like this: if variable x is this, then y is this, if variable x is the other, than z is this. In other words, one variable is the cause, but it affects different variables (consequence) depending on it's value. An example: if size is big, then shape is circle, if size is small then color is blue. Now you will definitely HAVE to guess with the first choice of figure, do it like in the previous round. It will give you the starting point - (one of) the unique variable(s) of the correct figure among the 3 choices is the consequence, so it cannot be the cause. That's where you turn on your logic to work through the possiblities. 
    */
    [           // LEVEL 1 STRATEGIES
    '-?c=',     // always choose same color
    '-?s=',     // always choose same size
    '-?h=',     // always choose same shape
    '-?c!',     // always choose different color
    '-?s!',     // always choose different size
    '-?h!'      // always choose different shape
    ], 
    [           // LEVEL 2 STRATEGIES
    'cY?sB:sS', // if the last figure is yellow, choose a big one, if not choose a small one
    'hC?cG:cY', // if the last figure is a circle, choose a blue figure, if not choose a yellow one
    'hC?sS:sB', // if the last figure is a circle, choose a small one, if not choose a big one
    'sB?hC:hL', // if the last figure is big, choose a circle, if not choose a lozenge
    'sB?cY:cG' // if the last figure is big, choose a yellow one, if not choose a blue one
    ],
    [           // LEVEL 3 STRATEGIES
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

function strategyToString(strategy) { // TODO: eliminate duplication
    var text = '';
    var i1 = strategy.indexOf('?');
    var i2 = strategy.indexOf(':');
    var condition = strategy.substring(0, i1);
    
    var conditionToken = condition.substr(0, 1);
    var conditionValue = condition.substr(1, 1);
    var trueRule = (i2 == -1) ? strategy.substring(i1 + 1) : strategy.substring(i1 + 1, i2);
    var falseRule = (i2 == -1) ? '' : strategy.substring(i2 + 1);
    
    if (condition == '-') {
        text = 'Always choose ' + ruleToString(trueRule);
    } else {
        text = 'If the last figure is ';
        if (conditionToken == 's') { // size
            text += Size[conditionValue];
        } else if (conditionToken == 'c') { // color
            text += Color[conditionValue];
        } else if (conditionToken == 'h') { // shape
            text += Shape[conditionValue];
        }
        text += ', then choose ' + ruleToString(trueRule) + ', otherwise choose ' + ruleToString(falseRule);
    }
    return text;
}


function ruleToString(rule) { // TODO: eliminate duplication
    var attribute = rule.substr(0, 1);
    var operator = rule.substr(1, 1);

    if (attribute == 's') { // size
        return (operator == '=' ? 'same' : (operator == '!' ? 'different' : Size[operator])) + ' size';
    } else if (attribute == 'c') { // color
        return (operator == '=' ? 'same' : (operator == '!' ? 'different' : Color[operator])) + ' color';
    } else if (attribute == 'h') { // shape
        return (operator == '=' ? 'same' : (operator == '!' ? 'different' : Shape[operator])) + ' shape';
    }
}

function ruleTooltip(level) {
    switch (level) {
        case 1: return "Level 1: Always choose same/different feature";
        case 2: return "Level 2: TODO";
        case 3: return "Level 3: TODO";
    }
}


function generateStrategy(currentLevel) {
    return pickOneRandom(Strategy[currentLevel - 1]);
    //return '-?c=';     // always choose same color

}

function generateAllFigures() {
    var figures = [];
   
    for (var i = 0; i < Object.keys(Size).length; i++) {
        for (var j = 0; j < Object.keys(Color).length; j++) {
            for (var k = 0; k < Object.keys(Shape).length; k++) {
                figures.push(new Figure(Object.keys(Size)[i] + Object.keys(Color)[j] + Object.keys(Shape)[k]));
            }
        }
    }
    
    return figures;
}

function nextRule(strategy, figure) {
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

function matchingFigures(pool, figure, rule) {
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

function indexOf(pool, figure) {
    for (var i = 0; i < pool.length; i++) {
        if (pool[i].shorthand == figure.shorthand) {
            return i;
        }
    }
    return -1;
}

function nonMatchingFigures(pool, figure, rule) {
    var matching = matchingFigures(pool, figure, rule);
    return pool.filter(function(item) {
        return indexOf(matching, item) < 0;
    });
}

function pickOneRandom(pool) {
    return pool[Math.floor(Math.random() * pool.length)];
}

function pickNRandom(pool, count) {
    var picked = [];
    for (var i = 0; i < count; i++) {
        picked.push(pool.splice(indexOf(pool, pickOneRandom(pool)), 1)[0]);
    }
    return picked;
}

function nextChoicesShuffled(pool, figure, rule) {
    return [pickOneRandom(matchingFigures(pool, figure, rule))].concat(pickNRandom(nonMatchingFigures(pool, figure, rule), 2)).sort(function() {
       return .5 - Math.random(); 
    });
}

function isMatching(chosen, pool, previous, rule) {
    return indexOf(matchingFigures(pool, previous, rule), chosen) >= 0;
}

function addFigureRow(round) {
    var newRound = $('<div class="figure-row">'
      +   '<span class="figure-row-number">' + round + '</span>'
      +   '<span class="figure-row-details"></span>' // figure contents will go here
      + '</div>');
    $('.figures').append(newRound);
    $('#figures-value').text(round + '/8');
    newRound.hide().slideDown(500);
}

function addFigure(figure) {
    $('.figures').children().last().find('.figure-row-details').append(figure.render(null, 'selected'));
}

function addChoices() {
    // get 3 choice buttons based on current figure/rule
    var choices = nextChoicesShuffled(allFigures, currentFigure, currentRule);
    var placeholder = '<span id="next-placeholder" class="figure next-placeholder">'
      +   '<span id="select-next" class="figure-label next">?</span>'
      + '</span>';
    $('.figures').children().last().find('.figure-row-details').append(placeholder);
    
    // add 3 choice buttons
    for (var i = 0; i < 3; i++) {
        var figure = choices[i];
        var choice = $(figure.render('choice' + i, 'selectable'));
            
        choice.click(function() {
            choose(this, choices);
        });
        
        $('.figures').children().last().find('.figure-row-details').append(choice);
    }
}

function choose(selected, choices) {
    var figure = new Figure(selected.getAttribute('data-value'));
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
        chosen.hide().fadeIn().addClass(isMatching(figure, choices, currentFigure, currentRule) ? 'correct' : 'incorrect').removeAttr('id');

        if (!isMatching(figure, choices, currentFigure, currentRule)) {
            attemptsLeft--;
            var attemptsValue = $('#tries-left-value');
            attemptsValue.fadeOut(function() {
                attemptsValue.text(attemptsLeft).fadeIn();
            })
            $('#status-value').text('Incorrect choice - ' + attemptsLeft + ' tries left.');
        } else {
            $('#status-value').text('Correct choice!');
        }
    
        // check how many attempts/rounds we have left in the game
        if (++currentRound == 9 || attemptsLeft == 0) {
            finishGame(attemptsLeft > 0);
        } else {
            currentFigure = figure;
            currentRule = nextRule(strategy, figure);
            addFigureRow(currentRound);
            addChoices();
        }
    });
}

function addInitialFigures() {
    var initialFigures = [];
    for (var i = 0; i < 3; i++) {
        currentFigure = (i == 0) ? pickOneRandom(allFigures) : pickOneRandom(matchingFigures(allFigures, currentFigure, currentRule));
        currentRule = nextRule(strategy, currentFigure);
        initialFigures.push(currentFigure);
    }
    $.each(initialFigures, function(i, figure) {
        setTimeout(function() {
            addFigureRow(++currentRound);
            addFigure(figure);
        }, 500 * (i + 1));
    });
        
}

function newGame() {
    // show game containers
    $('.stats').slideDown(200, 'linear', {});
    $('.figures').show();
    
    // hide buttons
    $('#button-new-game').hide();
    $('#button-next-level').hide();
    $('#button-instructions').hide();
    
    // start at level 1
    currentLevel = 0;
    nextLevel(++currentLevel);
}

function initialize() {
    $('.stats').hide();
    $('.figures').hide();
    $('#status-value').text('Welcome to ELUS!');
    $('#button-new-game').show();
    $('#button-instructions').show();
    $('#button-cancel-game').hide();
}

function finishGame(won) {
    $('#button-cancel-game').hide();
    var html = '';
    if (won) {
        html = '<div style="display: inline; color: green">You won!</div>';
        $('#button-next-level').show();
    } else {
        html = '<div style="display: inline; color: red">You lost.</div>';
        $('#button-new-game').show();
    }
    html += ' The strategy was: <b>' + strategyToString(strategy) + '</b>';
    
    $('#status-value').html(html);
}

function cancelGame() {
    var btn = $('#button-cancel-game');
    var pressed = btn.attr('pressed');
    if (!pressed) {
        btn.attr('pressed', true);
        btn.text('Are you sure?');
        btn.on('mouseout', function() {
            btn.removeAttr('pressed');
            btn.text('Cancel game');
        });
    } else {
        initialize();
    }
}

function nextLevel() {
    currentRound = 0, attemptsLeft = 3;
    
    // generate strategy based on current level
    strategy = generateStrategy(currentLevel);
    
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
    $('#rule-value').tooltip({title: ruleTooltip(currentLevel), animation: true}); 
    $('#status-value').text('Starting level ' + currentLevel + '.');
    
    // add first 3 figures, then display choices based on last figure
    addInitialFigures();
    setTimeout(function() {
        addFigureRow(++currentRound);
        addChoices();
    }, 500 * 4);
}

// **** execution starts here **** 

var allFigures = generateAllFigures();
var strategy, currentLevel, currentRound, currentFigure, currentRule, attemptsLeft, roundsLeft;

// when document is loaded, start new game
$(document).ready(function() {
    // "New game" button should start new game
    $('#button-new-game').click(function() {
       newGame();
    });
    
    $('#button-next-level').hide().click(function() {
       nextLevel(++currentLevel);
    });
    
    $('#button-cancel-game').click(function() {
       cancelGame();
    });
    
    // "Instructions" button should display instructions
    $('#button-instructions').click(function() {
        $('#instructions').slideToggle(200, function() {
            $('#instructions-carousel').carousel(0); // reset
        });
    });
    
    // add instructions modal panel behaviour
    $('#instructions').on('hidden.bs.modal', function () {
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
    
    initialize();
});

