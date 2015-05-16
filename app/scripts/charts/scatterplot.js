'use strict';

CHARTS_CONSTRUCTORS.Scatterplot = function(chart){

    var _this = this;
    var _data;
    var _svg = d3.select(chart.svg);
    var _margin = CHARTS_CONFIG.margins;
    var _previousScaleSize;

    this.xScale = d3.scale.linear()
        .range([_margin.left, (CHARTS_CONFIG.width - _margin.right )]);

    this.yScale = d3.scale.linear()
        .range([(CHARTS_CONFIG.height - _margin.bottom), _margin.top]);
    

    this.build = function() {

         _previousScaleSize = [0, 0];

        // draw axis
        this.xAxis = _svg.append('g')
          .attr('class', 'boxplot-x-axis')
          .attr('transform', 'translate(0,' + (CHARTS_CONFIG.height - _margin.bottom ) + ')');

        this.xAxisLabel = this.xAxis.append('text')
          .attr('class', 'boxplot-xdim-label')
          .attr('x', CHARTS_CONFIG.width - _margin.right - 20)
          .attr('y', -5);

        this.xaLineMin = this.xAxis.append('line')
          .attr('y1', 0.5)
          .attr('y2', 0.5)
          .style('stroke', '#000');
        this.xaTextMin = this.xAxis.append('text')
          .attr('y', 17);
        this.xaTextMax = this.xAxis.append('text')
          .attr('y', 17);
        this.xaLineQ = this.xAxis.append('line')
          .attr('y1', 0.5)
          .attr('y2', 0.5)
          .style('stroke-width', 3)
          .style('stroke', '#000');
        this.xaTextQ1 = this.xAxis.append('text')
          .attr('y', 17);
        this.xaTextQ3 = this.xAxis.append('text')
          .attr('y', 17);
        this.xaLineMed = this.xAxis.append('line')
          .attr('y1', 0.5)
          .attr('y2', 0.5)
          .style('stroke', '#fff')
          .style('stroke-width', 4);
        this.xaTextMed = this.xAxis.append('text')
          .attr('y', 17);

        this.yAxis = _svg.append('g')
            .attr('class', 'boxplot-y-axis')
            .attr('transform', 'translate(' + (_margin.left + 0.5) + ',0)');

        this.yAxisLabel = this.yAxis.append('text')
          .attr('class', 'boxplot-ydim-label')
          .attr('transform', 'translate(0, ' + _margin.top + ') rotate(-90)')
          .attr('y', 16);

        this.yaLineMin = this.yAxis.append('line')
          .attr('x1', 0)
          .attr('x2', 0)
          .style('stroke', '#000');
        this.yaTextMin = this.yAxis.append('text')
          .attr('x', -5);
        this.yaTextMax = this.yAxis.append('text')
          .attr('x', -5);
        this.yaLineQ = this.yAxis.append('line')
          .attr('x1', 0)
          .attr('x2', 0)
          .style('stroke-width', 3)
          .style('stroke', '#000');
        this.yaTextQ1 = this.yAxis.append('text')
          .attr('x', -5);
        this.yaTextQ3 = this.yAxis.append('text')
          .attr('x', -5);
        this.yaLineMed = this.yAxis.append('line')
          .attr('x1', 0)
          .attr('x2', 0)
          .style('stroke', '#fff')
          .style('stroke-width', 4);
        this.yaTextMed = this.yAxis.append('text')
          .attr('x', -5);

        // gray zones
        this.grayRectXQ = _svg.append('rect')
          .attr('y', _margin.top)
          .attr('height', CHARTS_CONFIG.height - _margin.bottom - _margin.top)
          .attr('class', 'scatterplot-gray-zone');
        this.grayRectXM = _svg.append('rect')
          .attr('y', _margin.top)
          .attr('height', CHARTS_CONFIG.height - _margin.bottom - _margin.top)
          .attr('class', 'scatterplot-gray-zone');
        this.grayRectYQ = _svg.append('rect')
          .attr('x', _margin.left)
          .attr('width', CHARTS_CONFIG.width - _margin.left - _margin.right)
          .attr('class', 'scatterplot-gray-zone');
        this.grayRectYM = _svg.append('rect')
          .attr('id', 'lastGrayArea')
          .attr('x', _margin.left)
          .attr('width', CHARTS_CONFIG.width - _margin.left - _margin.right)
          .attr('class', 'scatterplot-gray-zone');

    };
    
    this.update = function(data, dims) { 
        _data = data;

        var xMed, yMed, xMin, yMin, xMax, yMax, xQ1, yQ1, xQ3, yQ3;

        var xStats =  CHARTS_UTILS.getStats(_data, dims[1].dim, dims[1].agg);
        var yStats =  CHARTS_UTILS.getStats(_data, dims[0].dim, dims[0].agg);

        xMin = xStats.min;
        yMin = yStats.min;
        xMax = xStats.max;
        yMax = yStats.max;
        xMed = xStats.med;
        yMed = yStats.med;
        xQ1 = xStats.Q1;
        yQ1 = yStats.Q1;
        xQ3 = xStats.Q3;
        yQ3 = yStats.Q3;
        
        // change scale unless the new one is within the old one and not 5 times smaller
          // if( (!
          //       (( xMax < _previousScaleSize[0][1] && xMin > _previousScaleSize[0][0] && yMax < _previousScaleSize[1][1] && yMin > _previousScaleSize[1][0]) &&
          //       ( (xMax - xMin) > (_previousScaleSize[0][1]-_previousScaleSize[0][0]) / 5 && (yMax - yMin) > (_previousScaleSize[1][1]-_previousScaleSize[1][0]) / 5 ))
          //     ) || 
          //     (_previousScaleSize[0] === 0 && _previousScaleSize[1] === 0)
          //   ){
          //   this.xScale.domain([xMin, xMax]);
          //   this.yScale.domain([yMin, yMax]);
          //   _previousScaleSize = [[xMin, xMax], [yMin, yMax]];
          // } 

        this.xScale.domain([xMin, xMax]);
        this.yScale.domain([yMin, yMax]);

        //calc text labels y positions (avoid overlaps)
        var yMaxText = _this.yScale(yMax);
        var yQ3Text = CHARTS_UTILS.shiftText(_this.yScale(yQ3), yMaxText);
        var yMedText = CHARTS_UTILS.shiftText(_this.yScale(yMed), yQ3Text);
        var yQ1Text = CHARTS_UTILS.shiftText(_this.yScale(yQ1), yMedText);
        var yMinText = CHARTS_UTILS.shiftText(_this.yScale(yMin), yQ1Text);

        //update axis
        _this.xAxisLabel
            .text(dims[1].dim);
        _this.xaLineMin
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('x1', _this.xScale(xMin))
          .attr('x2', _this.xScale(xMax));
        _this.xaTextMin
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('x', _this.xScale(xMin))
          .text(CHARTS_UTILS.formatNum(xMin));
        _this.xaTextMax
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('x', _this.xScale(xMax))
          .text(CHARTS_UTILS.formatNum(xMax));
        _this.xaLineQ
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('x1', _this.xScale(xQ1))
          .attr('x2', _this.xScale(xQ3));
        _this.xaTextQ1
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('x', _this.xScale(xQ1))
          .text(CHARTS_UTILS.formatNum(xQ1));
        _this.xaTextQ3
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('x', _this.xScale(xQ3))
          .text(CHARTS_UTILS.formatNum(xQ3));
        _this.xaLineMed
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('x1', _this.xScale(xMed)-1.5)
          .attr('x2', _this.xScale(xMed)+1.5);
        _this.xaTextMed
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('x', _this.xScale(xMed))
          .text(CHARTS_UTILS.formatNum(xMed));

        _this.yAxisLabel
          .text(dims[0].dim);
        _this.yaLineMin
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('y1', _this.yScale(yMin))
          .attr('y2', _this.yScale(yMax));
        _this.yaTextMin
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('y', yMinText)
          .text(CHARTS_UTILS.formatNum(yMin));
        _this.yaTextMax
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('y', yMaxText)
          .text(CHARTS_UTILS.formatNum(yMax));
        _this.yaLineQ
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('y1', _this.yScale(yQ1))
          .attr('y2', _this.yScale(yQ3));
        _this.yaTextQ1
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('y', yQ1Text)
          .text(CHARTS_UTILS.formatNum(yQ1));
        _this.yaTextQ3
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('y', yQ3Text)
          .text(CHARTS_UTILS.formatNum(yQ3));
        _this.yaLineMed
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('y1', _this.yScale(yMed)-1.5)
          .attr('y2', _this.yScale(yMed)+1.5);
        _this.yaTextMed
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('y',yMedText)
          .text(CHARTS_UTILS.formatNum(yMed));

        //update gray rectangles
        _this.grayRectXQ
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('x', _this.xScale(xQ1)+0.5)          
          .attr('width', _this.xScale(xMed) - _this.xScale(xQ1)-1);
        _this.grayRectXM
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('x', _this.xScale(xMed)+1.5)
          .attr('width', _this.xScale(xQ3) - _this.xScale(xMed)-1.5);
        _this.grayRectYQ
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('y',  _this.yScale(yQ3))
          .attr('height', _this.yScale(yMed) - _this.yScale(yQ3) -1.5);
        _this.grayRectYM
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('y',  _this.yScale(yMed) + 1)
          .attr('height', _this.yScale(yQ1) - _this.yScale(yMed) - 1.5);

        // redraw bubles to put them on top
       $('#bubles').insertAfter('#lastGrayArea');
        // position, size and color bubles       
        _svg.selectAll('.buble')
          .data(_data, function(d) {return d.key; })
          .transition().duration(CHARTS_CONFIG.transitionTime)
              .attr('cx', function(d) {return _this.xScale(d[dims[1].dim + '_' + dims[1].agg]); })
              .attr('cy', function(d) {return _this.yScale(d[dims[0].dim + '_' + dims[0].agg]); });
        
    };

    this.onResize = function() {
    };

    this.clear = function() {
        _svg.selectAll('.boxplots-x-label-text').remove();
        _svg.selectAll('.boxplots-y-label-text').remove();
        _svg.selectAll('.boxplot-x-axis').remove();
        _svg.selectAll('.boxplot-y-axis').remove();
        _svg.selectAll('.boxplot-xdim-label').remove();
        _svg.selectAll('.boxplot-ydim-label').remove();
        _svg.selectAll('.scatterplot-gray-zone').remove();
    };

};