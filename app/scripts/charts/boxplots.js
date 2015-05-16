'use strict';

CHARTS_CONSTRUCTORS.Boxplots = function(chart){

    var _this = this;
    var _data;
    var _svg = d3.select(chart.svg);
    var _xDim;
    var _yDim;

    this.xScale = d3.scale.ordinal()
        .rangeBands([CHARTS_CONFIG.margins.left, CHARTS_CONFIG.width - CHARTS_CONFIG.margins.right]);

    this.yScale = d3.scale.linear()
        .range([CHARTS_CONFIG.height - CHARTS_CONFIG.margins.bottom, CHARTS_CONFIG.margins.top]);

    this.yAxisLabel = _svg.append('text')
      .attr('class', 'boxplot-ydim-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', 12)
      .attr('x', - CHARTS_CONFIG.height / 3);

    this.build = function() {
        
    };
    
    this.update = function(data, dims) { 
        _data = data;

        //find which dimension is the xDim (text), and which is the yDim (number)
        //if only 1 dim is passed, it's yDim
        if(dims[0].type === 'number'){
            _xDim = dims.length === 2 ? dims[1] : {'dim': ''};
            _yDim = dims[0];
        }
        else {
            _xDim = dims[0];
            _yDim = dims[1];
        }       

        //X axis labels
        var xLabels = _xDim ? CHARTS_UTILS.getDistinctValues(_data, _xDim.dim) : [''];
        _this.xScale.domain(xLabels);

        _svg.selectAll('.boxplots-x-label-text').remove();
        _svg.selectAll('.boxplots-x-label-text').data(xLabels).enter().append('text')
          .transition().duration(CHARTS_CONFIG.transitionTime)
          .attr('x', function (d) {
              return _this.xScale(d);
          })
          .attr('y', 20)
          .attr('class', 'text-dim-label boxplots-x-label-text')
          .text(function (d) {            
              return d;
          });

        //Y axis label
        _this.yAxisLabel
          .text(_yDim.dim);

        //Y scale
        var yStats = CHARTS_UTILS.getStats(_data, _yDim.dim, _yDim.agg);
        _this.yScale.domain([yStats.min, yStats.max]);

        //boxplots
        _svg.selectAll('.boxplot-y-axis').remove();
        _.forEach(xLabels, function(xVal) {
            //get y data for that category
            var yData;
            if(_xDim){
              yData = _.filter(_data, function (d) {
                  return d[_xDim.dim] === xVal;
              });
            } else {
              yData = _data;
            }
            
            var yStats =  CHARTS_UTILS.getStats(yData, _yDim.dim, _yDim.agg);

            if(yData.length>1){

                //calc text labels y positions (avoid overlaps)
                var yMaxText = _this.yScale(yStats.max);
                var yQ3Text = CHARTS_UTILS.shiftText(_this.yScale(yStats.Q3), yMaxText);
                var yMedText = CHARTS_UTILS.shiftText(_this.yScale(yStats.med), yQ3Text);
                var yQ1Text = CHARTS_UTILS.shiftText(_this.yScale(yStats.Q1), yMedText);
                var yMinText = CHARTS_UTILS.shiftText(_this.yScale(yStats.min), yQ1Text);

                //draw plots
                var newGroup = _svg.append('g')
                      .attr('class','boxplot-y-axis')
                      .attr('y', -5)
                      .attr('transform', 'translate(0.5,0)');
                var yaLineMin = newGroup.append('line')
                  .style('stroke', '#000')
                  .attr('x1',  _this.xScale(xVal))
                  .attr('x2',  _this.xScale(xVal));
                var yaTextMin = newGroup.append('text')                  
                  .attr('x',  _this.xScale(xVal)-5);
                var yaTextMax = newGroup.append('text')                  
                  .attr('x',  _this.xScale(xVal)-5);
                var yaLineQ = newGroup.append('line')
                  .attr('x1', _this.xScale(xVal))
                  .attr('x2', _this.xScale(xVal))
                  .style('stroke', '#000')
                  .style('stroke-width', 3);
                var yaTextQ1 = newGroup.append('text')                  
                  .attr('x', _this.xScale(xVal)-5);
                var yaTextQ3 = newGroup.append('text')                  
                  .attr('x', _this.xScale(xVal)-5);
                var yaLineMed = newGroup.append('line')
                  .attr('x1', _this.xScale(xVal))
                  .attr('x2', _this.xScale(xVal))
                  .style('stroke', '#fff')
                  .style('stroke-width', 4);
                var yaTextMed = newGroup.append('text')                  
                  .attr('x', _this.xScale(xVal)-5);

                yaLineMin
                  .attr('y1', _this.yScale(yStats.min))
                  .attr('y2', _this.yScale(yStats.max));
                yaTextMin
                  .attr('y', yMinText)
                  .text(CHARTS_UTILS.formatNum(yStats.min));
                yaTextMax
                  .attr('y', yMaxText)
                  .text(CHARTS_UTILS.formatNum(yStats.max));
                yaLineQ
                  .attr('y1', _this.yScale(yStats.Q1))
                  .attr('y2', _this.yScale(yStats.Q3));
                yaTextQ1
                  .attr('y', yQ1Text)
                  .text(CHARTS_UTILS.formatNum(yStats.Q1));
                yaTextQ3
                  .attr('y', yQ3Text)
                  .text(CHARTS_UTILS.formatNum(yStats.Q3));
                yaLineMed
                  .attr('y1', _this.yScale(yStats.med)-1.5)
                  .attr('y2', _this.yScale(yStats.med)+1.5);
                yaTextMed
                  .attr('y', yMedText)
                  .text(CHARTS_UTILS.formatNum(yStats.med));
            }
            //case only 1 buble for the category
            else {
                var yaTextMedSingle = _svg.append('text')  
                  .attr('class','boxplot-y-axis')                
                  .attr('x', _this.xScale(xVal)-5)
                  .attr('y', _this.yScale(yStats.med)+3)
                  .text(CHARTS_UTILS.formatNum(yStats.med));
            }
        });

        //position bubles
        _svg.selectAll('.buble')
          .data(_data, function(d) {return d.key; })
          .transition().duration(CHARTS_CONFIG.transitionTime)
              .attr('cx', function(d) {return _this.xScale(d[_xDim.dim]) + 15; })
              .attr('cy', function(d) {return _this.yScale(d[_yDim.dim + '_' + _yDim.agg]); });
        
    };

    this.onResize = function() {
    };

    this.clear = function() {
        _svg.selectAll('.boxplots-x-label-text').remove();
        _svg.selectAll('.boxplot-y-axis').remove();
        _svg.selectAll('.boxplot-ydim-label').remove();
    };

};