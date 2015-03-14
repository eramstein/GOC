'use strict';

CHARTS_CONSTRUCTORS.Baloons = function(chart){

    var _this = this;
    var _data;
    var _svg = chart.svg;

    var layoutConfig = {
        gravity: 0,
        //note: a slightly negative gravity (-0.01) would make it look a bit nicer, but aligning labels would harder since the centers would "repel" each other, so you would need something like
        //.attr('x', x - (Math.ceil(columnCount/2) - currentColumn) * CHARTS_CONFIG.width / (columnCount * 10) )
        damper: 0.1,
        friction: 0.9,  
        charge: function(d) {
            return -Math.pow(d.radius, 2.0) / 8;
        }
    };

    //the d3 force layout handles the attraction of nodes towards centers and how they repel each other
    //we match each node with a buble - the bubles follow their corresponding node
    var force = d3.layout.force()
                    .size([CHARTS_CONFIG.width, CHARTS_CONFIG.height])
                    .gravity(layoutConfig.gravity)
                    .charge(layoutConfig.charge)
                    .friction(layoutConfig.friction);    

    //centers are the attraction points
    function createCenters(dims){
        var currentColumn;
        var currentRow;
        var uniqueValuesX;
        var uniqueValuesY;
        var columnCount;
        var rowCount;
        var x;
        var y;
        _this.centers = {};
        //if no viewBy dim, one center only
        if(dims.length === 0){
            _this.centers = {'all': {'x': CHARTS_CONFIG.width/2, 'y': CHARTS_CONFIG.height/2}};
        }
        //if 1 viewBy dim, create grid of centers with an adequate number of rows to spread them
        if(dims.length === 1){

            currentColumn = 0;
            currentRow = 0;
            uniqueValuesX = CHARTS_UTILS.getUniqueValues(_data, dims[0].dim);
            columnCount = _.keys(uniqueValuesX).length;
            rowCount = Math.floor(Math.sqrt(columnCount / CHARTS_CONFIG.width * CHARTS_CONFIG.height)); // number of rows

            _.each(uniqueValuesX, function (v, k) {
                currentColumn++;
                if(currentColumn > columnCount){
                    currentRow++;
                }

                x = CHARTS_CONFIG.width * (currentColumn - 0.5) / columnCount;
                y = CHARTS_CONFIG.height * (currentRow + 0.5) / rowCount;

                _this.centers[k] = {'x': x, 'y': y};

                d3.select(_svg).append('text')
                  .attr('x', x)
                  .attr('y', y - (CHARTS_CONFIG.height/rowCount)/4)
                  .attr('class', 'baloon-center-label')
                  .text(k);
            });
        }
        //if 2 viewBy dims, create grid of centers with dims[0] as columns and dims[1] as rows
        if(dims.length === 2){

            currentColumn = 0;
            currentRow = 0;
            uniqueValuesX = CHARTS_UTILS.getUniqueValues(_data, dims[0].dim);
            uniqueValuesY = CHARTS_UTILS.getUniqueValues(_data, dims[1].dim);
            columnCount = _.keys(uniqueValuesX).length;
            rowCount = _.keys(uniqueValuesY).length;

            _.each(uniqueValuesX, function (v, k) {

                currentRow = 0;
                currentColumn++;
                x = (CHARTS_CONFIG.width - 100) * (currentColumn - 0.5) / columnCount + 100;

                d3.select(_svg).append('text')
                      .attr('x', x) 
                      .attr('y', 30)
                      .attr('class', 'baloon-center-label')
                      .text(k);            

                _.each(uniqueValuesY, function (v2, k2) {                   
                    y = CHARTS_CONFIG.height * (currentRow + 0.5) / rowCount;

                    _this.centers[k + '-' + k2] = {'x': x, 'y': y};

                    d3.select(_svg).append('text')
                      .attr('x', 60)
                      .attr('y', CHARTS_CONFIG.height / rowCount * (currentRow + 0.5) )
                      .attr('class', 'baloon-center-label')
                      .text(k2);

                    currentRow++;
                });                
            });
        }
    }

    //create one node for each buble - they start at the current position of their corresponding buble
    function createNodes(dims){        
        var bubles = d3.select(_svg).selectAll('.buble')[0];
        _this.nodes = [];

        _.forEach(bubles, function (d) {
            var newD = d.__data__;
            var targetCenter;
            if(dims.length===0) { targetCenter = 'all'; }
            if(dims.length===1) { targetCenter = newD[dims[0].dim]; }
            if(dims.length===2) { targetCenter = newD[dims[0].dim] + '-' + newD[dims[1].dim]; }
            newD.radius = 10;
            newD.x = d.cx.baseVal.value;
            newD.y = d.cy.baseVal.value;
            newD.targetCenter = targetCenter;
            _this.nodes.push(newD);
        });

        force.nodes(_this.nodes);
    }

    function resizeNodes() {
        var sizeBy = chart.constants.bubles.sizeBy;
        _.forEach(_this.nodes, function (d) {
            d.radius = chart.constants.bubles.getSize(sizeBy, d);
        });
    }

    //add the node specific data to the bubles so that they can track the x and y position of their corresponding node
    //make bubles follow their node
    function associateBublesToNodes(){

        var bubles = d3.select(_svg).selectAll('.buble')
                       .data(_this.nodes, function(d) {return d.key; });               
       
        force.on('tick', function(e) {
            bubles.each(moveTowardsCenters(e.alpha))
              .attr('cx', function(d) { return d.x;})
              .attr('cy', function(d) { return d.y;});
        });

        function moveTowardsCenters(alpha) {
            return function(d) {
                var target = _this.centers[d.targetCenter];
                d.x = d.x + (target.x - d.x) * layoutConfig.damper * alpha;
                d.y = d.y + (target.y - d.y) * layoutConfig.damper * alpha;
            };
        }
    }

    //automatically stop the force layout after 10 seconds, unless another start happened in between
    var forceStartedOn;
    var stopAfter = 10000;
    function startForce() {        
        force.start();
        forceStartedOn = Date.now;
        setTimeout(stopForceIfNotStartingUp, stopAfter);
    }
    function stopForceIfNotStartingUp() {
        if(Date.now >= forceStartedOn + stopAfter) {
            force.stop();
        }
    }

    this.build = function() {
        
    };
    
    this.update = function(data, dims) {
        _data = data;
        d3.select(_svg).selectAll('.baloon-center-label').remove();
        createCenters(dims);
        createNodes(dims);
        resizeNodes(); 
        associateBublesToNodes();
        startForce();        
    };

    this.onResize = function() {
        resizeNodes();
        startForce();
    };

    this.clear = function() {
        //we need to re-data() the bubles since it gets overwritten when they are linked to nodes
        d3.select(_svg).selectAll('.buble').data(_data, function(d) {return d.key; });
        d3.select(_svg).selectAll('.baloon-center-label').remove();
        force.stop();
    };

};