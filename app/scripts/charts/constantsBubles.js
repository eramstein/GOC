'use strict';

/*
    This file handles the bubles that stay constant across all visualizations on nominal/ordinal dims,
    as welll as the legend for buble size and colors
*/

CHARTS_CONSTRUCTORS.ConstantsBubles = function(svg) {
    
    var _this = this;
    var _data;

    //---------------------------------------------------------------------------------------
    // INITAL SETUP
    //---------------------------------------------------------------------------------------

    svg = d3.select(svg);    
    
    //initial creation of a group of circles
    var bubles = svg.append('svg:g').attr('id', 'bubles');

    //store current state for size and color
    this.sizeBy = null;
    this.colorBy = null;

    //create legend
    var chartDirective = d3.select(d3.select(svg.node().parentNode).node().parentNode); // <-- TODO...
    var legend = chartDirective.select('.legend'); 

    var sizeLegend = legend.append('svg:g').attr('id', 'size-legend');
    sizeLegend.append('circle').attr('class', 'size-legend-circle buble').attr('cy', 0).attr('cx', 50);
    sizeLegend.append('circle').attr('class', 'size-legend-circle buble').attr('cy', 40).attr('cx', 50);
    sizeLegend.append('circle').attr('class', 'size-legend-circle buble').attr('cy', 100).attr('cx', 50);
    sizeLegend.append('text').attr('class', 'size-legend-text').attr('y', 4).attr('x', 50);
    sizeLegend.append('text').attr('class', 'size-legend-text').attr('y', 44).attr('x', 50);
    sizeLegend.append('text').attr('class', 'size-legend-text').attr('y', 104).attr('x', 50);

    //---------------------------------------------------------------------------------------
    // SIZING
    //---------------------------------------------------------------------------------------

    //scale for buble sizes - we use a square root scale because the size of the buble increases faster than its radius (PI² vs PI)
    _this.sizeScale = d3.scale.sqrt().range([CHARTS_CONFIG.bubleSize.min, CHARTS_CONFIG.bubleSize.max]);

    //re-size bubles
    this.changeSize = function (dim) { 
        this.sizeBy = dim;        
        if(dim){          
          //set the domain of the size scale to the fit the full dataset, so that it remains constant while filtering
          var stats = CHARTS_UTILS.getStats(_data, dim);
          _this.sizeScale.domain([0, stats.max]);

          //update legend
          legend.selectAll('.size-legend-circle')
            .data([stats.min, stats.med, stats.max])
            .transition().duration(CHARTS_CONFIG.transitionTime)
            .attr('r', function (d) { return _this.sizeScale(d); });

          legend.selectAll('.size-legend-text')
            .data([stats.min, stats.med, stats.max])
            .text(function (d) { return d; });
        }

        //resize circles
        bubles.selectAll('.buble')
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('r', function (d) {
            return _this.getSize(dim, d);
          });        
    };

    this.getSize = function (dim, d) {
      if(dim){
        //TODO: we can only size by sums
        return _this.sizeScale(d[dim + '_sum']);
      } else {              
        return CHARTS_CONFIG.bubleSize.default;
      }
    };

    //---------------------------------------------------------------------------------------
    // COLORING
    //---------------------------------------------------------------------------------------

    //re-color bubles
    this.changeColor = function (dim) {
        this.colorBy = dim;
    };

    //---------------------------------------------------------------------------------------
    // BUILD NEW SET OF BUBLES
    //---------------------------------------------------------------------------------------

    //sets the enter() and exit() methods, update() will be implemented by each chart type specifically   
    this.makeNew = function (data, key) {

        _data = data;

        //add a key to each element
        _.forEach(data, function (d, i) {
          d.key = key + i;
        });

        //on enter
        bubles.selectAll('.buble')
          .data(data, function(d) {return d.key; })
        .enter().append('circle')
          .attr('class', 'buble')
          .attr('r', function (d) {
              return _this.getSize(_this.sizeBy, d);
          })
          .attr('fill', function (d) {
              if(this.colorBy){

              } else {
                return 'steelblue';
              }
          });
        
        //on exit
        bubles.selectAll('.buble')
          .data(data, function(d) {return d.key; })
        .exit()
        .attr('class', 'buble-being-removed')
        .transition().duration(CHARTS_CONFIG.transitionTime)
              .attr('r', function(d) { return 0; })
        .remove();

    };

};