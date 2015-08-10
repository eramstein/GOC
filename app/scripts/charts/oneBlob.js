
CHARTS_CONSTRUCTORS.Oneblob = function(chart){

    var _this = this;
    var _data;
    var _svg = d3.select(chart.svg);
    var _margins = CHARTS_CONFIG.margins;
    var _rect;
    var _text;   

    _this.scale = d3.scale.linear()
            .range([0, Math.sqrt(chart.constants.blobs.surface)]);

    this.build = function() {
        _rect = _svg.select('#blobs').append('svg:rect').attr('class' ,'oneblob')
                    .style('fill', CHARTS_CONFIG.defaultBubleColor)
                    .attr('x', CHARTS_CONFIG.centerX)
                    .attr('y', CHARTS_CONFIG.centerY)
                    .attr('width', 0)
                    .attr('height', 0);
        _text = _svg.select('#blobs').append('svg:text').attr('class' ,'oneblob blob-val');
       
    };
    
    this.update = function(data) { 

        if(!_data){
          _this.scale.domain([0, data]);
        } 

        var x = CHARTS_CONFIG.centerX - _this.scale(data) / 2;
        var y = CHARTS_CONFIG.centerY - _this.scale(data) / 2;
        var side = _this.scale(data);

        var transitionTime = CHARTS_CONFIG.transitionTime;
        var delayTime = 0;

        //---------------------------------------------------------------------------------------
        // TRANSITION FROM BARS  
        //---------------------------------------------------------------------------------------

        if(chart.constants.blobs.shapeType === 'bars'){
          transitionFromBars();            
        }

        function transitionFromBars() {
            updateScale(data);

            _svg.selectAll('.value-label').remove();
            _svg.selectAll('.item-label').remove();

            //cover blob
            var yCumul = y;

            _svg.selectAll('.bar').transition().duration(transitionTime)
                .attr('x', x)
                .attr('y', function (d) {                  
                    var y = yCumul;                    
                    yCumul += side * this.width.baseVal.value * this.height.baseVal.value / chart.constants.blobs.surface;
                    return y;
                })
                .attr('width', function (d) {
                    return side;
                })
                .attr('height', function (d) {
                    return side * this.width.baseVal.value * this.height.baseVal.value / chart.constants.blobs.surface;
                })
                .each('end', function () {
                    _svg.selectAll('.bar').remove();                                        
                });
            
            delayTime = transitionTime;
            transitionTime = 0;

            makeOneBlob();
        }


        //---------------------------------------------------------------------------------------
        // TRANSITION FROM DONUT  
        //---------------------------------------------------------------------------------------
       
        if(chart.constants.blobs.shapeType === 'donut'){

            //go back to bars           
            chart.barchart.build();
            chart.barchart.update(chart.constants.blobs.shapeData);            

            //go back to oneblob
            setTimeout(transitionFromBars, CHARTS_CONFIG.transitionTime + 200);
        }

        //---------------------------------------------------------------------------------------
        // MAKE ONEBLOB  
        //---------------------------------------------------------------------------------------  
        
        if(chart.constants.blobs.shapeType !== 'donut' && chart.constants.blobs.shapeType !== 'bars'){
          makeOneBlob();
        }

        function makeOneBlob() {
          // old scale
          _rect.transition().duration(transitionTime).delay(delayTime)
               .attr('x', CHARTS_CONFIG.centerX - side / 2)
               .attr('y', CHARTS_CONFIG.centerY - side / 2)
               .attr('width', side)
               .attr('height', side)
               .each('end', updateScale(data));

          _text.transition().duration(transitionTime).delay(delayTime + 250)
               .attr('x', CHARTS_CONFIG.centerX)
               .attr('y', CHARTS_CONFIG.centerY)
               .text(CHARTS_UTILS.formatNum(data));        

          // new scale    
          _rect.transition().duration(transitionTime / 3)
               .delay(delayTime + transitionTime + 100)
               .attr('x', x)
               .attr('y', y)
               .attr('width', side)
               .attr('height', side);

          chart.constants.blobs.shapeInfo = {
              'x': x,
              'y': y,
              'side': side
          };
        }

        function updateScale(newData) {
          _data = newData;
          _this.scale.domain([0, _data]);
          x = CHARTS_CONFIG.centerX - _this.scale(data) / 2;
          y = CHARTS_CONFIG.centerY - _this.scale(data) / 2;
          side = _this.scale(data);
        }        

        chart.constants.blobs.shapeType = 'oneblob';

        
        
    };

    this.clear = function() {
       
    };

};