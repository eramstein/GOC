
CHARTS_CONSTRUCTORS.Multibar = function(chart){

    var _this = this;
    var _data;
    var _svg = d3.select(chart.svg);
    var _margins = CHARTS_CONFIG.margins;
    var _rects;
    var _valueLabels;
    var _itemLabels;
    var _barHeight;
    var _labelWidth = CHARTS_CONFIG.labelsWidth;
    var _width = CHARTS_CONFIG.width - _labelWidth - _margins.left - _margins.right;
    var _height = CHARTS_CONFIG.height - _margins.top - _margins.bottom;
    var _previousDims;

    this.build = function() {
        
    };
    
    this.update = function(data, dims) { 

        var dataTotal = 0;
        _.each(data, function(d) {
            dataTotal += d.value;
        });

        data = _.sortBy(data, function (d) {
            return - d.value;
        });

        var enter = function () {

            _rects = _svg.selectAll('.bar')
              .data(data, function(d) {return d.key; })
            .enter().append('rect')
              .attr('class','bar')
              .style('fill', CHARTS_CONFIG.defaultBubleColor);

            _valueLabels = _svg.selectAll('.value-label')
              .data(data, function(d) {return d.key; })
            .enter().append('text')
              .attr('class','value-label')
              .style('text-anchor','end')
              .style('fill','white');

            _itemLabels = _svg.selectAll('.item-label')
              .data(data, function(d) {return d.key; })
            .enter().append('text')
              .attr('class','item-label')
              .style('text-anchor','end');

        };

        var move = function (labelDelay, labelDuration) {
            labelDelay = labelDelay || 0;
            labelDuration = labelDuration || 0;
            //resize rects so that they have all the same height, but now their width is proportional to their value
            //adjust bar height so that the biggest value gets the full width while keeping surface proportional            
            _barHeight = chart.constants.blobs.surface * (data[0].value / dataTotal) / _width; 
            _barHeight = Math.max(_barHeight, 16);

            _rects.data(data, function(d) {return d.key; })
                .transition().duration(CHARTS_CONFIG.transitionTime)
                .attr('x', function (d) {
                    return _labelWidth;
                })
                .attr('y', function (d, i) {                    
                    return (_barHeight + 1) * i + _margins.top;
                })
                .attr('width', function (d) {
                    return (chart.constants.blobs.surface * d.value / dataTotal) / _barHeight;
                })
                .attr('height', function (d) {
                    return _barHeight;
                });

            //labels
            _valueLabels.data(data, function(d) {return d.key; })
                .transition().duration(labelDuration).delay(labelDelay)
                .attr('x', function (d) {
                    return _labelWidth + (chart.constants.blobs.surface * d.value / dataTotal) / _barHeight - 8;
                })
                .attr('y', function (d, i) {
                    return (_barHeight + 1) * i + _margins.top + _barHeight / 2 + 4; //TODO not good way to venter vertically
                })
                .text(function (d) {
                    return d.value;
                });

            _itemLabels.data(data, function(d) {return d.key; })
                .transition().duration(labelDuration).delay(labelDelay)
                .attr('x', function (d) {
                    return _labelWidth - 10;
                })
                .attr('y', function (d, i) {
                    return (_barHeight + 1) * i + _margins.top + _barHeight / 2 + 4; //TODO not good way to venter vertically
                })
                .text(function (d) {
                    return d.value ? d.key : '';
                });
        };
        

        //---------------------------------------------------------------------------------------
        // TRANSITION FROM BAR CHART  
        //---------------------------------------------------------------------------------------
        
        var transitionFromBarchart = function () {

            _svg.selectAll('.oneblob').remove();

            //cover previous blob rect with the new ones - each rect height is proportional to its value
            var blob = chart.constants.blobs.shapeInfo;
            var yCumul = blob.y;
            _rects
                .attr('x', blob.x)
                .attr('y', function (d) {
                    var y = yCumul;
                    yCumul += blob.side * d.value / dataTotal;
                    return y;
                })
                .attr('width', function (d) {
                    return blob.side;
                })
                .attr('height', function (d) {
                    return blob.side * d.value / dataTotal;
                });

            move(CHARTS_CONFIG.transitionTime, 0);
            
        };

        if(chart.constants.blobs.shapeType === 'bars'){
            enter();
            transitionFromBarchart();            
        }

        //---------------------------------------------------------------------------------------
        // STORE CHART STATE
        //---------------------------------------------------------------------------------------

        function storeChartState(){
            chart.constants.blobs.shapeType = 'multibars';  
        }
        storeChartState();        
        _previousDims = _.clone(dims);

    };

    this.clear = function(newChartType) {
        if(newChartType !== 'barchart'){
            _svg.selectAll('.bar').remove();
        }
        _svg.selectAll('.value-label').remove();
        _svg.selectAll('.item-label').remove();
    };

};