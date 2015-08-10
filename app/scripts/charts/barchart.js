
CHARTS_CONSTRUCTORS.Barchart = function(chart){

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
                .delay(function(d, i) { return i / data.length * CHARTS_CONFIG.transitionTime;})
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
                .transition().duration(labelDuration)
                .delay(function(d, i) { return labelDelay + i / data.length * CHARTS_CONFIG.transitionTime;})
                .attr('x', function (d) {
                    return _labelWidth + (chart.constants.blobs.surface * d.value / dataTotal) / _barHeight - 8;
                })
                .attr('y', function (d, i) {
                    return (_barHeight + 1) * i + _margins.top + _barHeight / 2 + 4; //TODO not good way to venter vertically
                })
                .text(function (d) {
                    return CHARTS_UTILS.formatNum(d.value);
                });

            _itemLabels.data(data, function(d) {return d.key; })
                .transition().duration(labelDuration)
                .delay(function(d, i) { return labelDelay + i / data.length * CHARTS_CONFIG.transitionTime;})
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
        // TRANSITION FROM ONEBLOB  
        //---------------------------------------------------------------------------------------
        
        var transitionFromOneblob = function () {

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

        if(chart.constants.blobs.shapeType === 'oneblob'){
            enter();
            transitionFromOneblob();            
        }

        //---------------------------------------------------------------------------------------
        // TRANSITION FROM ANOTHER BARCHART  
        //---------------------------------------------------------------------------------------
        
        var speedupTransitionTime = function(){
            CHARTS_CONFIG.transitionTime = CHARTS_CONFIG.transitionTime * 0.5;
        };
        var resetTransitionTime = function(){
            CHARTS_CONFIG.transitionTime = CHARTS_CONFIG.transitionTime * 2;
            storeChartState();
        };

        var transitionFromAnotherBarchart = function(){
            speedupTransitionTime();

            //go back to one blob                        
            chart.oneblob.build();
            chart.oneblob.update(dataTotal);            

            //do new bars after the blob transition has finished
            setTimeout(enter, CHARTS_CONFIG.transitionTime + 100);
            setTimeout(transitionFromOneblob, CHARTS_CONFIG.transitionTime + 200);
            setTimeout(resetTransitionTime, CHARTS_CONFIG.transitionTime + 300);            
        };

        if(chart.constants.blobs.shapeType === 'bars' &&  !_.isEqual(dims, _previousDims)){            
            transitionFromAnotherBarchart();
        }    

        //---------------------------------------------------------------------------------------
        // TRANSITION FROM DONUT  
        //---------------------------------------------------------------------------------------

        //TODO the whole thing is duplicated from the donus chart with some ugly tweaks (marked a !!UG!!)
        var _arc = d3.svg.arc(); 

        function transfoTween(d, i) {
            var path = d3.select(this),
                x0 = _labelWidth, // !!UG!!
                y0 = (d.data.order + 1) * (_barHeight + 1) + _margins.top,
                initialDistance = 10000,
                barLength = (chart.constants.blobs.surface * d.value / dataTotal) / _barHeight;

            return morph;
           
            function morph(t) {
                t = 1-t;
                var r = (_height / 2) / Math.min(1, t + 1 / initialDistance), //r is the radius of the arcs. starts huge and converges towards h/2 and some padding. note: the bigger bars you want, the bigger the initial arcs have to be to avoid anti-aliasing effects
                    a = Math.cos(t * Math.PI / 2), //a is a cosinus scale (goes from 1 to 0, starts slow, then goes fast, then ends slow. used to change the arcs angles angles and rotate them
                    yy = -r + a * y0 + (1 - a) * (_height + _margins.top), //y position of the arcs. compensates for the arcs radius. starts at the initial rect position and converges to the center
                    xx = ((a) * x0 + (1 - a) * (_width + _labelWidth) / 2), //x position of the arcs. starts at x0 and converges towards the center // !!UG!!         
                    f = {
                        innerRadius: (r - _barHeight) * a + Math.sqrt((Math.PI * Math.pow(r, 2) - chart.constants.blobs.surface) / Math.PI) * (1 - a), // the radius difference starts at ber height and converges towards the value that keeps the surface identical
                        outerRadius: r,
                        startAngle: a * (Math.PI - barLength / r) + (1 - a) * d.startAngle, //d.startAngle is the target angle (we get there when t=1 and therefore a=0). we start at approx PI to have all bars aligned as the intial rectangles 
                        endAngle: a * (Math.PI) + (1 - a) * d.endAngle
                    };

                transform(f, xx, yy);
            }

            function transform(f, xx, yy) {                          
                path.attr('transform', 'translate(' + xx + ',' + yy + ')');
                path.attr('d', _arc(f));
            }
        }

        if(chart.constants.blobs.shapeType === 'donut'){

            //morph arcs into bars and remove them in the end
            var _paths = _svg.selectAll('.donutpath')
                .transition()
                .duration(CHARTS_CONFIG.transitionTime + 10)
                .delay(function(d, i) { return i / data.length * (CHARTS_CONFIG.transitionTime + 10);})
                .tween('arc', transfoTween)
                .style('fill', CHARTS_CONFIG.defaultBubleColor)
                .each('end', function () {
                    $(this).remove();  
                });            

            //if dimensions are different, do another transition via oneblob
            if(dims && !_.isEqual(dims, _previousDims)){
                //at this point we have arcs with the old dim
                //make them rects with the old data
                var bkData = _.clone(data);
                var restoreState = function() {
                    data = bkData;
                    storeChartState();
                };
                data = chart.constants.blobs.shapeData;
                setTimeout(enter, CHARTS_CONFIG.transitionTime);
                setTimeout(move, CHARTS_CONFIG.transitionTime);
                setTimeout(restoreState, CHARTS_CONFIG.transitionTime + 10);
                //then transition to new bars
                setTimeout(transitionFromAnotherBarchart, CHARTS_CONFIG.transitionTime + 20);
            } else {
            //else just build real bars
                setTimeout(enter, CHARTS_CONFIG.transitionTime);
                setTimeout(move, CHARTS_CONFIG.transitionTime);
            }
        }  
        

        //---------------------------------------------------------------------------------------
        // TRANSITION FROM SAME BARCHART (filters)
        //---------------------------------------------------------------------------------------

        if(chart.constants.blobs.shapeType === 'bars' && _.isEqual(dims, _previousDims)){

            move(0, CHARTS_CONFIG.transitionTime);

        }

        //---------------------------------------------------------------------------------------
        // STORE CHART STATE
        //---------------------------------------------------------------------------------------

        function storeChartState(){
            chart.constants.blobs.shapeType = 'bars';  
            chart.constants.blobs.shapeInfo.barHeight = _barHeight;   
        }
        storeChartState();        
        _previousDims = _.clone(dims);

    };

    this.clear = function(newChartType) {
        if(newChartType !== 'oneblob' && newChartType !== 'barchart'){
            _svg.selectAll('.bar').remove();
        }
        _svg.selectAll('.value-label').remove();
        _svg.selectAll('.item-label').remove();
    };

};