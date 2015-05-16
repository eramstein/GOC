'use strict';

CHARTS_CONSTRUCTORS.Bublebars = function(chart){

    var _this = this;
    var _data;
    var _svg = d3.select(chart.svg);
    var _yDim;

    var margin = CHARTS_CONFIG.margins.left;

    this.yScale = d3.scale.linear()
        .range([CHARTS_CONFIG.height - CHARTS_CONFIG.margins.bottom, CHARTS_CONFIG.margins.top]);

    function _reColor() {
      var colorScale;
      var colorVal;
      if(chart.constants.bubles.colorScaleType === 'quantitative'){
        colorVal = chart.constants.bubles.colorBy + '_sum';
        colorScale = function(d) {
          return chart.constants.bubles.colorInterpolator(chart.constants.bubles.colorScale(d));
        };
      } else {
        colorVal = chart.constants.bubles.colorBy;
        colorScale = chart.constants.bubles.colorScale;
      }

      _svg.selectAll('.bublebar')
        .data(_data, function(d) {return d.key; })
        .style('fill', function(d) {
          return colorScale ? colorScale(d[colorVal]) : CHARTS_CONFIG.defaultBubleColor; 
        });
    }

    this.build = function() {

      _this.axisGroup = _svg.append('g')
        .attr('class', 'boxplot-y-axis')
        .attr('transform', 'translate(' + (margin + 0.5) + ',0)');

      _this.yaLineMin =  _this.axisGroup.append('line')
        .style('stroke', '#000')
        .attr('x1', 0)
        .attr('x2', 0);
      _this.yaTextMin =  _this.axisGroup.append('text')
        .attr('x', -5);
      _this.yaTextMax =  _this.axisGroup.append('text')
        .attr('x', -5);
      _this.yaLineQ =  _this.axisGroup.append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .style('stroke', '#000')
        .style('stroke-width', 3);
      _this.yaTextQ1 =  _this.axisGroup.append('text')
        .attr('x', -5);
      _this.yaTextQ3 =  _this.axisGroup.append('text')
        .attr('x', -5);
      _this.yaLineMed =  _this.axisGroup.append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .style('stroke', '#fff')
        .style('stroke-width', 4);
      _this.yaTextMed =  _this.axisGroup.append('text')
        .attr('x', -5);  

    };
    
    this.update = function(data, dims) { 
        _data = data;
        _yDim = dims[0];        

        //Y scale
        var yStats = CHARTS_UTILS.getStats(_data, _yDim.dim, _yDim.agg);
        _this.yScale.domain([yStats.min, yStats.max]);

        //calc text labels y positions (avoid overlaps)
        var yMaxText = _this.yScale(yStats.max);
        var yQ3Text = CHARTS_UTILS.shiftText(_this.yScale(yStats.Q3), yMaxText);
        var yMedText = CHARTS_UTILS.shiftText(_this.yScale(yStats.med), yQ3Text);
        var yQ1Text = CHARTS_UTILS.shiftText(_this.yScale(yStats.Q1), yMedText);
        var yMinText = CHARTS_UTILS.shiftText(_this.yScale(yStats.min), yQ1Text);

        //boxplots
        _this.yaLineMin
          .attr('y1', _this.yScale(yStats.min))
          .attr('y2', _this.yScale(yStats.max));
        _this.yaTextMin
          .attr('y', yMinText)
          .text(CHARTS_UTILS.formatNum(yStats.min));
        _this.yaTextMax
          .attr('y', yMaxText)
          .text(CHARTS_UTILS.formatNum(yStats.max));
        _this.yaLineQ
          .attr('y1', _this.yScale(yStats.Q1))
          .attr('y2', _this.yScale(yStats.Q3));
        _this.yaTextQ1
          .attr('y', yQ1Text)
          .text(CHARTS_UTILS.formatNum(yStats.Q1));
        _this.yaTextQ3
          .attr('y', yQ3Text)
          .text(CHARTS_UTILS.formatNum(yStats.Q3));
        _this.yaLineMed
          .attr('y1', _this.yScale(yStats.med)-1.5)
          .attr('y2', _this.yScale(yStats.med)+1.5);
        _this.yaTextMed
          .attr('y', yMedText)
          .text(CHARTS_UTILS.formatNum(yStats.med));

        //sort bubles
        _data = _.sortBy(_data, function (d) {
            return d[_yDim.dim + '_' + _yDim.agg];
        });

        //set barWidth
        var barWidth = 25;
        if(_data.length>20){
            barWidth = (CHARTS_CONFIG.width - margin - 20)/_data.length;
        }

        //set buble moving delay based on the number of bubles, so that the total transition time stays the same
        var delayMs = Math.round(CHARTS_CONFIG.transitionTime / _data.length);

        //bars below the bubles
        _svg.selectAll('.bublebar')
          .data(_data, function(d) {return d.key; })
        .enter().append('rect')
          .attr('class','bublebar') 
          .attr('width',20)
          .attr('height',0);

        _svg.selectAll('.bublebar')
          .data(_data, function(d) {return d.key; })
          .transition().duration(CHARTS_CONFIG.transitionTime / 3 * 2)
          .delay(function(d, i) {return i*delayMs;})
            .attr('x', function(d, i) {return margin + Math.min(barWidth*(i+1), (CHARTS_CONFIG.width - margin)/_data.length*(i+1)) - 10; })
            .attr('y', function(d) { return _this.yScale(d[_yDim.dim + '_' + _yDim.agg]) + 10; })
            .attr('height', function(d) { return CHARTS_CONFIG.height - _this.yScale(d[_yDim.dim + '_' + _yDim.agg]) - CHARTS_CONFIG.margins.bottom; });

        _svg.selectAll('.bublebar')
          .data(_data, function(d) {return d.key; })
        .exit().remove();

        //position bubles
        _svg.selectAll('.buble')
          .data(_data, function(d) {return d.key; })
          .transition().duration(CHARTS_CONFIG.transitionTime / 3 * 2)
          .delay(function(d, i) {return i*delayMs;})
              .attr('cx', function(d, i) {return margin + Math.min(barWidth*(i+1), (CHARTS_CONFIG.width - margin)/_data.length*(i+1)); })
              .attr('cy', function(d) {return _this.yScale(d[_yDim.dim + '_' + _yDim.agg]); });

        //color
        _reColor();
        
    };

    this.onResize = function() {
    };

    this.onRecolor = function() {
      _reColor();
    };

    this.clear = function() {
        _svg.selectAll('.boxplot-y-axis').remove();
        _svg.selectAll('.boxplot-ydim-label').remove();
        _svg.selectAll('.bublebar').remove();
    };

};