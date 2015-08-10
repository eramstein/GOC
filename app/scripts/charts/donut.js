

CHARTS_CONSTRUCTORS.Donut = function(chart){    

    var _this = this;
    var _data;
    var _svg = d3.select(chart.svg);
    var _margins = CHARTS_CONFIG.margins;
    var _paths;
    var _valueLabels;
    var _itemLabels;
    var _labelWidth = CHARTS_CONFIG.labelsWidth;
    var _width = CHARTS_CONFIG.width - _margins.left - _margins.right;
    var _height = CHARTS_CONFIG.height - _margins.top - _margins.bottom;
    var _previousDims;

    var _color = d3.scale.ordinal().range(CHARTS_CONFIG.colorScales.twocolors);

    var _pie = d3.layout.pie()
            .value(function(d) { return d.value; });

    var _arc = d3.svg.arc();

    var _arcFixed = d3.svg.arc()
            .innerRadius(Math.sqrt((Math.PI * Math.pow(_height / 2, 2) - chart.constants.blobs.surface) / Math.PI))
            .outerRadius(_height / 2);

    var _valueArc = d3.svg.arc()
                            .outerRadius(_height / 2)
                            .innerRadius(Math.sqrt((Math.PI * Math.pow(_height / 2, 2) - chart.constants.blobs.surface) / Math.PI));

    var _itemArc = d3.svg.arc()
                    .outerRadius(_height / 2 + 50)
                    .innerRadius(Math.sqrt((Math.PI * Math.pow(_height / 2, 2) - chart.constants.blobs.surface) / Math.PI) + 50);

    this.build = function() {
        
    };
    
    this.update = function(data, dims) { 

        var dataTotal = 0;

        data = _.sortBy(data, function (d) {
            return - d.value;
        });

        _.each(data, function(d, i) {
            dataTotal += d.value;
            d.order = i;
        });  

        var enterPaths = function () {
            _paths = _svg.selectAll('.donutpath')
              .data(_pie(data), function(d) {return d.data.key; });

            _paths.enter().append('path')
              .attr('class','donutpath')
              .style('fill', function (d, i) {
                  return CHARTS_CONFIG.defaultBubleColor;
              })       
              .each(function(d) { this._current = d; });
        };

        //---------------------------------------------------------------------------------------
        // LABELS
        //---------------------------------------------------------------------------------------

        var enterLabels = function () {            

             _valueLabels = _svg.selectAll('.value-label')
              .data(_pie(data), function(d) {return d.data.key; });

             _valueLabels.enter().append('text')
              .attr('class','value-label')
              .style('text-anchor','middle')              
              .style('fill','white');

            _valueLabels.exit().remove();

            _itemLabels = _svg.selectAll('.item-label')
              .data(_pie(data), function(d) {return d.data.key; });

            _itemLabels.enter().append('text')
              .attr('class','item-label')
              .style('text-anchor','middle');

            _itemLabels.exit().remove();

        };

        var updateLabels = function (transitionTime) {          

            _valueLabels
                .data(_pie(data), function(d) {return d.data.key; })
                .transition()            
                    .duration(transitionTime)
                .attr('transform', function(d) {                     
                    return 'translate(' + (_valueArc.centroid(d)[0] + _width / 2) + ',' + (_valueArc.centroid(d)[1] + _height / 2 + _margins.top) + ')'; 
                })
                .text(function(d) { return d.value > dataTotal/50 ? CHARTS_UTILS.formatNum(d.value) : ''; });           

            _itemLabels
                .data(_pie(data), function(d) {return d.data.key; })
                .transition()            
                    .duration(transitionTime)
                .attr('transform', function(d) { 
                    return 'translate(' + (_itemArc.centroid(d)[0] + _width / 2) + ',' + (_itemArc.centroid(d)[1] + _height / 2 + _margins.top) + ')'; 
                })
                .text(function(d) { return d.value > dataTotal/50 ? d.data.key : ''; });

        };

        var buildLabels = function () {
            enterLabels();
            updateLabels(0);
        };

        //---------------------------------------------------------------------------------------
        // TRANSITION FROM BARS  
        //---------------------------------------------------------------------------------------

        //function handling the bar to arc transformation
        function barToArcTween(d, i) {
            //returns a function used by the transition to compute paths attributes while interpolating from 0 to 1
            //we use a closure to keep track of the initial attributes values during the transition
            //note: "this" refers to the path element (see D3 docs about the tween function)
         
            var path = d3.select(this),
                x0 = _labelWidth,
                y0 = (d.data.order + 1) * (chart.constants.blobs.shapeInfo.barHeight + 1) + _margins.top,
                initialDistance = 10000,
                barLength = (chart.constants.blobs.surface * d.value / dataTotal) / chart.constants.blobs.shapeInfo.barHeight;

            //return one of the appropriate interpolation functions below
            return morph;
           
            function morph(t) {                
                //(original idea of interpolating on initially huge D3.js arcs is from Mike Bostock here: http://bl.ocks.org/mbostock/1256572)
                //the idea is to start with huge arcs (hundreds of thousands pixels radius), take a very small slice of them (start and end anles very close) and translate them back to the origin
                //this make it look like rectangles initially. initial all arcs have similar angles to keep the pseudo-rectangles aligned.
                //from there the arcs become smaller, the translation becomes smaller to keep them within the svg, and the angles get bigger so the arcs stay the same size and become curvier
                //all these parameters converge towards d, which is the {innerRadius, outerRadius, startAngle, endAngle} object coming from pie(data), and the arcs finally form a donut chart
                var r = (_height / 2) / Math.min(1, t + 1 / initialDistance), //r is the radius of the arcs. starts huge and converges towards h/2 and some padding. note: the bigger bars you want, the bigger the initial arcs have to be to avoid anti-aliasing effects
                    a = Math.cos(t * Math.PI / 2), //a is a cosinus scale (goes from 1 to 0, starts slow, then goes fast, then ends slow. used to change the arcs angles angles and rotate them
                    yy = -r + a * y0 + (1 - a) * (_height + _margins.top), //y position of the arcs. compensates for the arcs radius. starts at the initial rect position and converges to the center
                    xx = ((a) * x0 + (1 - a) * _width / 2), //x position of the arcs. starts at x0 and converges towards the center          
                    f = {
                        innerRadius: (r - chart.constants.blobs.shapeInfo.barHeight) * a + Math.sqrt((Math.PI * Math.pow(r, 2) - chart.constants.blobs.surface) / Math.PI) * (1 - a), // the radius difference starts at ber height and converges towards the value that keeps the surface identical
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
        
        var transitionFromBars = function () {
            enterPaths();

            _paths.transition()            
            .duration(CHARTS_CONFIG.transitionTime)
            .style('fill', function (d, i) {
                  return _color(i);
            })
            .tween('arc', barToArcTween);   

            setTimeout(buildLabels, CHARTS_CONFIG.transitionTime); 
            
        };

        if(chart.constants.blobs.shapeType === 'bars'){
            transitionFromBars();            
        } 


        //---------------------------------------------------------------------------------------
        // TRANSITION FROM SAME DONUT (filters)
        //---------------------------------------------------------------------------------------

        function arcTween(a) {            
          var i = d3.interpolate(this._current, a);
          this._current = i(0);        
          return function(t) {       
            return _arcFixed(i(t));
          };
        }

        function updateDonut() {

            enterPaths();

            _paths.transition().duration(CHARTS_CONFIG.transitionTime)
              .attrTween('d', arcTween);

            _paths.exit().remove();

            enterLabels();
            updateLabels(CHARTS_CONFIG.transitionTime);
        }

        if(chart.constants.blobs.shapeType === 'donut' && _.isEqual(dims, _previousDims)){
             updateDonut();
        }


        //---------------------------------------------------------------------------------------
        // STORE CHART STATE
        //---------------------------------------------------------------------------------------
       
        chart.constants.blobs.shapeType = 'donut';  
        chart.constants.blobs.shapeData = data; 
        _previousDims = _.clone(dims);

    };

    this.clear = function(newChartType) {
        if(newChartType !== 'donut' && newChartType !== 'barchart' && newChartType !== 'oneblob'){
            _svg.selectAll('.donutpath').remove();
        }
        _svg.selectAll('.value-label').remove();
        _svg.selectAll('.item-label').remove();
    };

};