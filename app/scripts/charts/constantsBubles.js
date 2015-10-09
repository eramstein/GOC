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
    var bubles;

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

    var colorLegend = legend.append('svg:g').attr('id', 'color-legend');
    var colorLegendGradient = legend.append('svg:defs')
          .append('svg:linearGradient')
            .attr('id', 'colorLegendGradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%')
            .attr('spreadMethod', 'pad');
    colorLegendGradient.append('svg:stop')
        .attr('offset', '0%')
        .attr('stop-color', '#006600')
        .attr('stop-opacity', 1);
    colorLegendGradient.append('svg:stop')
        .attr('offset', '100%')
        .attr('stop-color', '#ffffff')
        .attr('stop-opacity', 1);

    var colorLegendNumberScale = colorLegend.append('svg:g').style('display', 'none');
    colorLegendNumberScale.append('svg:rect')
        .attr('width', 20)
        .attr('height', 100)
        .style('fill', 'url(#colorLegendGradient)');
    colorLegendNumberScale.append('svg:text')
        .attr('id', 'color-legend-text-max')
        .attr('class', 'color-gradient-text')
        .attr('x', 25)
        .attr('y', 5);
    colorLegendNumberScale.append('svg:text')
        .attr('id', 'color-legend-text-min')
        .attr('class', 'color-gradient-text')
        .attr('x', 25)
        .attr('y', 100);

    //---------------------------------------------------------------------------------------
    // SIZING
    //---------------------------------------------------------------------------------------

    //scale for buble sizes - we use a square root scale because the size of the buble increases faster than its radius (PI² vs PI)
    _this.sizeScale = d3.scale.sqrt().range([CHARTS_CONFIG.bubleSize.min, CHARTS_CONFIG.bubleSize.max]);

    //re-size bubles
    this.changeSize = function (dim) { 
        _this.sizeBy = dim;
        sizeLegend.selectAll('.size-legend-circle').remove();
        sizeLegend.selectAll('.size-legend-text').remove();

        if(dim){          
          //set the domain of the size scale to the fit the full dataset, so that it remains constant while filtering
          var stats = CHARTS_UTILS.getStats(_data, dim);
          _this.sizeScale.domain([0, stats.max]);

          //update legend
          sizeLegend.selectAll('.size-legend-circle')
            .data([stats.min, stats.med, stats.max])
            .transition().duration(CHARTS_CONFIG.transitionTime)
            .attr('r', function (d) { return _this.sizeScale(d); });

          sizeLegend.selectAll('.size-legend-text')
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

    //color scale
    // _this.colorScale = d3.scale.ordinal().range(CHARTS_CONFIG.colorScales.default);
    
    this.changeColor = function(dim, dataType) {
      _this.colorBy = dim;
      colorLegend.selectAll('.color-legend-rect').remove();
      colorLegend.selectAll('.color-legend-text').remove();
      colorLegendNumberScale.style('display', 'none');

      //number dimension: use a gradient
      if(dataType === 'number'){
        var stats = CHARTS_UTILS.getStats(_data, dim);
        _this.colorScaleType = 'quantitative';
        _this.colorInterpolator = d3.interpolateRgb('#ffffff', '#006600');
        _this.colorScale = d3.scale.linear();        
        _this.colorScale.domain([stats.min, stats.max])
                        .range([0,1]);
        
        bubles.selectAll('.buble')
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('fill', function(d) { return _this.colorInterpolator(_this.colorScale(d[dim + '_sum']));});

        colorLegendNumberScale.select('#color-legend-text-min').text(stats.min);
        colorLegendNumberScale.select('#color-legend-text-max').text(stats.max);
        colorLegendNumberScale.style('display', 'block');
      }

      //text dimension: use different colors for each category
      if(dataType === 'text'){     
        _this.colorScaleType = 'nominal'; 
        var uniqueValues = CHARTS_UTILS.getDistinctValues(_data, dim);
        if (uniqueValues.length < 10) {
          _this.colorScale = d3.scale.category10();
        } else {
          _this.colorScale = d3.scale.category20();
        }

        bubles.selectAll('.buble')
          .attr('fill', function(d) { return _this.colorScale(d[dim]);});

        colorLegend.selectAll('.color-legend-rect')
            .data(uniqueValues, function (d) { return d; })
          .enter().append('rect')
            .attr('class', 'color-legend-rect')
            .attr('width', 16)
            .attr('height', 16)
            .attr('x', 0)
            .attr('y', function (d, i) { return i * 17;})
            .attr('fill', function (d) { return _this.colorScale(d); });

        colorLegend.selectAll('.color-legend-text')
            .data(uniqueValues, function (d) { return d; })
          .enter().append('text')
            .attr('class', 'color-legend-text')
            .attr('x', 23)
            .attr('y', function (d, i) { return (i + 1) * 17 - 5;})
            .text(function (d) { return d; });
      }
    };

    //---------------------------------------------------------------------------------------
    // BUILD NEW SET OF BUBLES
    //---------------------------------------------------------------------------------------

    //sets the enter() and exit() methods, update() will be implemented by each chart type specifically   
    this.makeNew = function (data, key) {

        svg.select('#blobs').remove();
        svg.select('#bubles').remove();
        bubles = svg.append('svg:g').attr('id', 'bubles');

        _this.setData(data, key);

    };

    this.setData = function (data, key) {

        _data = data;

        //add a key to each element        
        _.forEach(data, function (d, i) {
          d.key = d[key];
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
              if(_this.colorBy){
                return _this.colorScale(d[_this.colorBy]);
              } else {
                return CHARTS_CONFIG.defaultBubleColor;
              }
          });
        
        //on exit
        bubles.selectAll('.buble')
          .data(data, function(d) {return d.key; })
        .exit()
        .attr('class', 'buble-being-removed')
        //.transition().duration(CHARTS_CONFIG.transitionTime)
              .attr('r', function(d) { return 0; })
        .remove();

    };

};