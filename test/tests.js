var randomTestCount = 1000;
var allFigures = ELUS.generateAllFigures();

QUnit.test('ELUS.Figure test', function(assert) {
    var figure = new ELUS.Figure('SYL');
    
    // verify attributes
    assert.ok(figure.size == 'S');
    assert.ok(figure.color == 'Y');
    assert.ok(figure.shape == 'L');

    // verify oppositeX() functions
    assert.ok(figure.oppositeSize() == 'B');
    assert.ok(figure.oppositeColor() == 'G');
    assert.ok(figure.oppositeShape() == 'C');
    
    // verify equals()
    assert.ok(figure.equals(new ELUS.Figure('SYL')));
    assert.notOk(figure.equals(new ELUS.Figure('BYC')));
});

QUnit.test('ELUS.Rule test', function(assert) {
    var rule1 = new ELUS.Rule('-?c='), rule2 = new ELUS.Rule('-?c!'), rule3 = new ELUS.Rule('sB?hC:cY');
    
    // verify attributes
    assert.ok(rule1.condition == '-');
    assert.ok(rule1.trueTemplate == 'c=');
    assert.notOk(rule1.falseTemplate);
    
    assert.ok(rule3.condition == 'sB');
    assert.ok(rule3.trueTemplate == 'hC');
    assert.ok(rule3.falseTemplate == 'cY');

    // verify toString()
    assert.ok(rule1.toString() == 'Always choose figure with same color');
    assert.ok(rule2.toString() == 'Always choose figure with different color');
    assert.ok(rule3.toString() == 'If the last figure is Big, then choose figure with Circle shape, otherwise choose figure with Yellow color');
    
});

QUnit.test('ELUS.getRandomElement() test', function(assert) {
    assert.ok(function() {
        var pool = [11, 22, 33, 44, 55];
        
        // each randomly chosen element must be from the pool
        for (var i = 0; i < randomTestCount; i++) {
            if (pool.indexOf(ELUS.getRandomElement(pool)) < 0) return false;
        }
        return true;
    }());
});

QUnit.test('ELUS.getNRandomElements() test', function(assert) {
    assert.ok(function() {
        var pool = [11, 22, 33, 44, 55];

        // each randomly chosen element must be from the pool
        for (var i = 0; i < randomTestCount; i++) {
            var elements = ELUS.getNRandomElements(pool.slice(), 3); // using slice() to clone the pool
            if (elements.every(function(element) {
                return pool.indexOf(element) >= 0;
            }) == false) return false;
        }
        return true;
    }());
});

QUnit.test('ELUS.generateAllFigures() test', function(assert) {
    // verify that the generated figures include all combinations
    assert.ok(setEquals(ELUS.generateAllFigures().map(getShorthand), ['SYL', 'SGL', 'SYC', 'SGC', 'BYL', 'BGL', 'BYC', 'BGC']));
});

QUnit.test('ELUS.getNextFigureTemplate() test', function(assert) {
    var figure = new ELUS.Figure('SGC');
    
    // verify next templates with no condition
    assert.ok(ELUS.getNextFigureTemplate(new ELUS.Rule('-?c='), figure) == 'c=');
    assert.ok(ELUS.getNextFigureTemplate(new ELUS.Rule('-?c!'), figure) == 'c!');
    
    // verify next templates follow the condition
    assert.ok(ELUS.getNextFigureTemplate(new ELUS.Rule('hL?cG:s='), figure) == 's='); // false condition
    assert.ok(ELUS.getNextFigureTemplate(new ELUS.Rule('cG?sB:hC'), figure) == 'sB'); // true condition
    assert.ok(ELUS.getNextFigureTemplate(new ELUS.Rule('sB?hC:hL'), figure) == 'hL'); // false condition
});

QUnit.test('ELUS.getMatchingFigures() test', function(assert) {
    var figure = new ELUS.Figure('SYL');
    
    // verify figures matching same color
    assert.ok(setEquals(ELUS.getMatchingFigures(allFigures, figure, 'c=').map(getShorthand), ['SYL', 'BYL', 'SYC', 'BYC']));
    
    // verify figures matching different color
    assert.ok(setEquals(ELUS.getMatchingFigures(allFigures, figure, 'c!').map(getShorthand), ['SGL', 'BGL', 'SGC', 'BGC']));
    
    // verify figures matching lozenge shape regardless of previous figure's attributes
    assert.ok(setEquals(ELUS.getMatchingFigures(allFigures, figure, 'hL').map(getShorthand), ['SYL', 'BYL', 'SGL', 'BGL']));
    assert.ok(setEquals(ELUS.getMatchingFigures(allFigures, new ELUS.Figure('BGC'), 'hL').map(getShorthand), ['SYL', 'BYL', 'SGL', 'BGL']));
});

QUnit.test('ELUS.getNonMatchingFigures() test', function(assert) {
    var figure = new ELUS.Figure('SYL');
    
    // verify figures not matching same color
    assert.ok(setEquals(ELUS.getNonMatchingFigures(allFigures, figure, 'c=').map(getShorthand), ['SGL', 'BGL', 'SGC', 'BGC']));
    
    // verify figures not matching different color
    assert.ok(setEquals(ELUS.getNonMatchingFigures(allFigures, figure, 'c!').map(getShorthand), ['SYL', 'BYL', 'SYC', 'BYC']));
    
    // verify figures matching lozenge shape regardless of previous figure's attributes
    assert.ok(setEquals(ELUS.getNonMatchingFigures(allFigures, figure, 'hL').map(getShorthand), ['SYC', 'BYC', 'SGC', 'BGC']));
    assert.ok(setEquals(ELUS.getNonMatchingFigures(allFigures, new ELUS.Figure('BGC'), 'hL').map(getShorthand), ['SYC', 'BYC', 'SGC', 'BGC']));
});

QUnit.test('ELUS.indexOf() test', function(assert) {
    // verify indexOf method with various conditions for figures
    var figures = [new ELUS.Figure('SYL'), new ELUS.Figure('BYL'), new ELUS.Figure('BYC')];
    assert.ok(ELUS.indexOf(figures, new ELUS.Figure('BYL')) == 1);
    assert.ok(ELUS.indexOf(figures, new ELUS.Figure('BYC')) == 2);
    assert.ok(ELUS.indexOf(figures, new ELUS.Figure('SYC')) == -1);
    
    // verify indexOf method with various conditions for literals
    assert.ok(ELUS.indexOf([9, 8, 7], 7) == 2);
    assert.ok(ELUS.indexOf([9, 8, 7], 6) == -1);
    assert.ok(ELUS.indexOf(['A', 'B', 'C'], 'A') == 0);
    assert.ok(ELUS.indexOf(['A', 'B', 'C'], 'Z') == -1);
});

QUnit.test('ELUS.isCorrectFigure() test', function(assert) {
    var previousFigure = new ELUS.Figure('BGC');
    
    // verify correct figures matching same color
    assert.ok(ELUS.isCorrectFigure(allFigures, new ELUS.Figure('SGC'), previousFigure, 'c='));
    assert.ok(ELUS.isCorrectFigure(allFigures, new ELUS.Figure('SGL'), previousFigure, 'c='));
    assert.ok(ELUS.isCorrectFigure(allFigures, new ELUS.Figure('BGL'), previousFigure, 'c='));
    
    // verify correct figures matching different color
    assert.ok(ELUS.isCorrectFigure(allFigures, new ELUS.Figure('SYC'), previousFigure, 'c!'));
    assert.ok(ELUS.isCorrectFigure(allFigures, new ELUS.Figure('BYC'), previousFigure, 'c!'));
    assert.ok(ELUS.isCorrectFigure(allFigures, new ELUS.Figure('BYL'), previousFigure, 'c!'));
    assert.notOk(ELUS.isCorrectFigure(allFigures, new ELUS.Figure('BGC'), previousFigure, 'c!'));
    
    // verify correct figures matching big size regardless of previous figure's attributes
    assert.ok(ELUS.isCorrectFigure(allFigures, new ELUS.Figure('BGC'), previousFigure, 'sB'));
    assert.ok(ELUS.isCorrectFigure(allFigures, new ELUS.Figure('BGL'), previousFigure, 'sB'));
    assert.ok(ELUS.isCorrectFigure(allFigures, new ELUS.Figure('BYC'), previousFigure, 'sB'));
    assert.ok(ELUS.isCorrectFigure(allFigures, new ELUS.Figure('BYL'), previousFigure, 'sB'));
    assert.notOk(ELUS.isCorrectFigure(allFigures, new ELUS.Figure('SYC'), previousFigure, 'sB'));
});

QUnit.test('ELUS.getNextChoicesShuffled() test', function(assert) {
    var previousFigure = new ELUS.Figure('BGC');
    
    // run assertion for different rule templates
    ['c=', 'c!', 'cY', 'sB', 'hC'].forEach(function(template) {
        assert.ok(function() {
            for (var i = 0; i < randomTestCount; i++) {
                var numberOfCorrectFigures = 0, nextChoices = ELUS.getNextChoicesShuffled(allFigures, previousFigure, template);
                
                // we always need to get 3 choices
                if (nextChoices.length != 3) {
                    return false;
                }
                
                // exactly 1 of 3 choices must be correct
                nextChoices.forEach(function(figure) {
                    if (ELUS.isCorrectFigure(allFigures, figure, previousFigure, 'c=')) {
                        console.log("correct: " + figure + " " + previousFigure);
                        numberOfCorrectFigures++;
                    }
                });
                if (numberOfCorrectFigures != 1) {
                    return false;
                }
            }
            return true;
        });
    });
});

// helper methods

/** Gets the shorthand of the given figure. */
function getShorthand(figure) {
    return figure.shorthand;
}

/** Evaluates if the two given sets are equal. */
function setEquals(a1, a2) {
    return a1.length == a2.length && a1.every(element => a2.indexOf(element) >= 0);
}
