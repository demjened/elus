var Size = { 'S': 'Small', 'B': 'Big' }
var Color = { 'G': 'Green', 'Y': 'Yellow' }
var Shape = { 'C': 'Circle', 'L': 'Square' }

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
    
    this.icon = function() {
        return '<span class="fa figureicon'
            + (this.size == 'B' ? ' big' : ' small')
            + (this.color == 'Y' ? ' yellow' : ' green')
            + (this.shape == 'C' ? ' fa-circle' : ' fa-square')
            + '"></span>';
    }
    
    this.render = function(clazz) {
        return '<div class="figure' + (clazz ? ' ' + clazz : '') + '">'
            + this.icon() + ' '
            + Size[this.size] + " " + Color[this.color] + " " + Shape[this.shape]
            + '</div>';
    }
}

var Strategy = [
    '-?c=',     // always choose same color
    '-?s=',     // always choose same size
    '-?h=',     // always choose same shape
    '-?c!',     // always choose different color
    '-?s!',     // always choose different size
    '-?h!',     // always choose different shape
    'hL?cG:s=', // if the last figure is a lozenge, choose a blue one, if not choose one of the same size
    'cY?sB:sS', // if the last figure is yellow, choose a big one, if not choose a small one
    'cY?hC:hL', // if the last figure is yellow, choose a circle, if not choose a lozenge
    'cG?hC:hL', // if the last figure is blue, choose a circle, if not choose a lozenge
    'cG?sB:h!', // if the last figure is blue, choose a big figure, if not choose a different type
    'cG?sB:hC', // if the last figure is blue, choose a big figure, if not choose a circle
    'hC?cG:cY', // if the last figure is a circle, choose a blue figure, if not choose a yellow one
    'hC?sS:sB', // if the last figure is a circle, choose a small one, if not choose a big one
    'hC?cY:sS', // if the last figure is a circle, choose a yellow one, if not choose a small one
    'sB?hL:cG', // if the last figure is big, choose a lozenge, if not choose a blue one
    'sB?hC:c=', // if the last figure is big, choose a circle, if not choose one of the same color
    'sB?hC:hL', // if the last figure is big, choose a circle, if not choose a lozenge
    'sB?cY:cG', // if the last figure is big, choose a yellow one, if not choose a blue one
    'sB?cY:hL', // if the last figure is big, choose a yellow one, if not choose a lozenge
    'sB?cG:cY', // if the last figure is big, choose a blue one, if not choose a yellow one
    'sB?cG:h=', // if the last figure is big, choose a blue one, if not choose one of the same type
    'sB?cG:c!'  // if the last figure is big, choose a blue one, if not choose one of another color    
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
        text += 'Always ';
    } else {
        text = 'If the last figure is ';
        if (conditionToken == 's') { // size
            text += Size[conditionValue];
        } else if (conditionToken == 'c') { // color
            text += Color[conditionValue];
        } else if (conditionToken == 'h') { // shape
            text += Shape[conditionValue];
        }
        text += ', then ';
    }
    
    text += 'choose ' + ruleToString(trueRule);
    
    if (condition != '-') {
        text += ', otherwise choose ' + ruleToString(falseRule);
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


function generateStrategy() {
    //return pickOneRandom(Strategy);
    return 'sB?cG:c!';
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

function newRound(round) {
    // add new round list item
    var newRound = $('<li class="list-group-item round"><div class="round-label">Round ' + round + '</div>&nbsp;&nbsp;&nbsp;</li>');
    $('.rounds').append(newRound);
    newRound.hide().slideDown(200, function() {
        // after round 3, display choice buttons
        if (round > 3) { // TODO: use boolean input param

            // get 3 choice buttons based on current figure/rule
            var choices = nextChoicesShuffled(allFigures, currentFigure, currentRule);
            $('.rounds').children().last().append('<div id="select-next" class="figure select-next">Select next figure</div>');
            
            // add 3 choice buttons
            for (var i = 0; i < 3; i++) {
                var choice = choices[i];
                var html = '<button id="choice' + i + '" class="btn btn-default choice hoverable" value="' + choice.shorthand + '">' 
                    + choice.render()
                    + '</button>';
                $('.rounds').children().last().append(html);
            }
            
            $('[id^=choice]').click(function(html) {
                choose(this, choices);
            });
        }
    });
}

function choose(button, choices) {
    var figure = new Figure(button.value);
    var selectNext = $('#select-next');
    var btn = $(button);
    
        
    $('[id^=choice]').attr('disabled', true).removeClass('hoverable').removeAttr('id');
    selectNext.fadeOut();

    btn.fadeOut(function() {
        //
        var placeholder = $('<div class="figure"></div>');
        btn.replaceWith(placeholder);
        placeholder.hide(200);
        
        //
        var chosen = $(figure.render('chosen'));
        selectNext.replaceWith(chosen);
        chosen.hide().fadeIn().addClass(isMatching(figure, choices, currentFigure, currentRule) ? 'correct' : 'incorrect').removeAttr('id');

        if (!isMatching(figure, choices, currentFigure, currentRule)) {
            var attemptsValue = $('.attempts.value');
            attemptsValue.fadeOut(function() {
                attemptsValue.html(--attemptsLeft).fadeIn();
            })
        }
    
        // check how many attempts/rounds we have left in the game
        if (currentRound == 9 || attemptsLeft == 0) {
            finishGame();
        } else {
            currentFigure = figure;
            currentRule = nextRule(strategy, figure);
            newRound(currentRound++);
        }
    });
}

function newGame() {
    strategy = generateStrategy();
    currentRound = 1, attemptsLeft = 3;
    $('.rounds').empty();
    $('.result').empty();
    $('#instructions').hide();
    $('#instructions-carousel').carousel(0); // reset
    
    // set attempts left
    $('.attempts.value').text(attemptsLeft);
    
    // display first 3 figures
    for (var i = 0; i < 3; i++) {
        currentFigure = (i == 0) ? pickOneRandom(allFigures) : pickOneRandom(matchingFigures(allFigures, currentFigure, currentRule));
        newRound(currentRound++);
        
        $('.rounds').children().last().append(currentFigure.render('chosen'));
        currentRule = nextRule(strategy, currentFigure);
    }
    
    // then display choices based on last figure
    newRound(currentRound++);
}

function finishGame() {
    var html = '';
    if (attemptsLeft == 0) {
        html = '<div style="display: inline; color: red">You lost.</div>';
    } else {
        html = '<div style="display: inline; color: green">You won!</div>';
    }
    html += ' The strategy was: <b>' + strategyToString(strategy) + '</b>';
    
    $('.result').html(html);
}

// **** execution starts here **** 

var allFigures = generateAllFigures();
var strategy, currentRound, currentFigure, currentRule, attemptsLeft, roundsLeft;

// when document is loaded, start new game
$(document).ready(function() {
    newGame();
    
    // "New game" button should also start new game
    $('#button-new-game').click(function() {
       newGame();
    });
    
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
    
});

