'use strict';

/*
    This file handles the bubles that stay constant across all visualizations on nominal/ordinal dims
*/

CHARTS_CONSTRUCTORS.ConstantsBubles = function(svg) {
    
    svg = d3.select(svg);

    var size;
    var color;

    //initial creation of a group of circles
    //sets the enter() and exit() methods, update() will be implemented by each chart type specifically   
    var circlesSetup = function (data, key) {
        var bubles = svg.append('svg:g').attr('id', 'bubles');

        bubles.selectAll('.buble')
          .data(data, function(d) {return d[key]; })
        .enter().append('circle')
          .attr('class', 'buble');
 
        bubles.selectAll('.buble')
          .data(data, function(d) {return d[key]; })
        .exit()
        .transition().duration(CHARTS_CONFIG.transitionTime)
              .attr('r', function(d) { return 0; });

    };

    this.circles = {
            'setup': circlesSetup
    };

    this.size = size;
    this.color = color;

};