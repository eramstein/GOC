'use strict';

/*
    This file handles the bubles that stay constant across all visualizations on nominal/ordinal dims
*/

CHARTS_CONSTRUCTORS.ConstantsBubles = function(svg) {
    
    svg = d3.select(svg);        

    //initial creation of a group of circles
    var bubles = svg.append('svg:g').attr('id', 'bubles');

    this.sizeBy = null;
    this.colorBy = null;

    //re-size bubles
    this.changeSize = function (dim) {
        this.sizeBy = dim;
    };

    //re-color bubles
    this.changeColor = function (dim) {
        this.colorBy = dim;
    };

    //sets the enter() and exit() methods, update() will be implemented by each chart type specifically   
    this.update = function (data, key) {

        bubles.selectAll('.buble')
          .data(data, function(d) {return d[key]; })
        .enter().append('circle')
          .attr('class', 'buble')
          .attr('r', function (d) {
              if(this.sizeBy){

              } else {
                return 10;
              }
          })
          .attr('fill', function (d) {
              if(this.colorBy){

              } else {
                return 'steelblue';
              }
          });
 
        bubles.selectAll('.buble')
          .data(data, function(d) {return d[key]; })
        .exit()
        .transition().duration(CHARTS_CONFIG.transitionTime)
              .attr('r', function(d) { return 0; })
        .remove();

    };

};