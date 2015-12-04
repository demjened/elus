var randomTestCount = 100;

QUnit.test('ELUS.Figure test', function(assert) {
    var figure = new ELUS.Figure('SYL');
    assert.ok(figure.size == 'S');
    assert.ok(figure.color == 'Y');
    assert.ok(figure.shape == 'L');
    assert.ok(figure.oppositeSize() == 'B');
    assert.ok(figure.oppositeColor() == 'G');
    assert.ok(figure.oppositeShape() == 'C');
    
    assert.ok(figure.equals(new ELUS.Figure('SYL')));
    assert.notOk(figure.equals(new ELUS.Figure('BYC')));
});

QUnit.test('ELUS.Rule test', function(assert) {
    var rule1 = new ELUS.Rule('-?c=');
    assert.ok(rule1.condition == '-');
    assert.ok(rule1.trueTemplate == 'c=');
    assert.notOk(rule1.falseTemplate);
    assert.ok(rule1.toString() == 'Always choose figure with same color');

    var rule2 = new ELUS.Rule('-?c!');
    assert.ok(rule2.toString() == 'Always choose figure with different color');
    
    var rule3 = new ELUS.Rule('sB?hC:cY');
    assert.ok(rule3.condition == 'sB');
    assert.ok(rule3.trueTemplate == 'hC');
    assert.ok(rule3.falseTemplate == 'cY');
    assert.ok(rule3.toString() == 'If the last figure is Big, then choose figure with Circle shape, otherwise choose figure with Yellow color');
});

QUnit.test('ELUS.getRandomElement() test', function(assert) {
    assert.ok(function() {
        var pool = [1, 2, 3, 4, 5];
        for (var i = 0; i < randomTestCount; i++) {
            if (pool.indexOf(ELUS.getRandomElement(pool) < 0)) return false;
        }
        return true;
    });
});

QUnit.test('ELUS.getNRandomElements() test', function(assert) {
    assert.ok(function() {
        var pool = [1, 2, 3, 4, 5];
        for (var i = 0; i < randomTestCount; i++) {
            var elements = ELUS.getNRandomElements(pool, 3);
            if (elements.every(function(element, index, array) {
                return pool.indexOf(element) >= 0;
            }) == false) return false;
        }
        return true;
    });
});

QUnit.test('ELUS.generateAllFigures() test', function(assert) {
    var allFigureShorthands = ['SYL', 'SGL', 'SYC', 'SGC', 'BYL', 'BGL', 'BYC', 'BGC'];
    var generatedFigureShorthands = ELUS.generateAllFigures().map(function(figure) { 
        return figure.shorthand; 
    });
    assert.ok(generatedFigureShorthands.length == allFigureShorthands.length);
    assert.ok(allFigureShorthands.every(element => generatedFigureShorthands.indexOf(element) >= 0));
});

QUnit.test('ELUS.getNextFigureTemplate() test', function(assert) {
    var figure = new ELUS.Figure('SGC');
    assert.ok(ELUS.getNextFigureTemplate(new ELUS.Rule('-?c='), figure) == 'c=');
    assert.ok(ELUS.getNextFigureTemplate(new ELUS.Rule('-?c!'), figure) == 'c!');
    assert.ok(ELUS.getNextFigureTemplate(new ELUS.Rule('hL?cG:s='), figure) == 's=');
    assert.ok(ELUS.getNextFigureTemplate(new ELUS.Rule('cG?sB:hC'), figure) == 'sB');
    assert.ok(ELUS.getNextFigureTemplate(new ELUS.Rule('sB?hC:hL'), figure) == 'hL');
});

// TODO: getMatchingFigures
// TODO: getNonMatchingFigures
// TODO: getNextChoicesShuffled
// TODO: indexOfFigure
// TODO: isCorrectFigure
