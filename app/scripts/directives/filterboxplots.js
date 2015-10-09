'use strict';

angular.module('gocApp')
  .directive('filterBoxplots', function ($rootScope, Data) {
    return {
      templateUrl: '/views/templates/filterBoxplots.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {

        // INTERACTIONS WITH THE REST OF THE APP VIA FILTERSMANAGER
        // -----------------------------------------------------
        scope.$on('FILTERS_CHANGED', function(event, args) {
            if(args.dim !== attrs.dim){
                buildChart();
            }           
        });
        scope.changeFilter = function (extent) {                   
            $rootScope.$broadcast('CHANGE_FILTERS', {'dim': attrs.dim, 'val': extent, 'scaleType': 'quantitative'});
        };
        scope.dimName = attrs.label;
        

        // BUILD UI WITH D3
        // -----------------------------------------------------       

        var dims = Data.dimensions;  
        var rowHeight = 30;
        var rowWidth = 180; // TODO, magic number
        var margin = [5, 0];
        var data = dims[attrs.dim].getQuartiles();
                
        var svg = d3.select(element[0]).append('svg')
              .attr('width', rowWidth + 'px') 
              .attr('height', rowHeight)
            .append('g')
              .attr('transform', 'translate(' + margin[0] + ',' + margin[1] + ')');

        var xScale = d3.scale.linear()       
              .range([margin[0], rowWidth - margin[0]])
              .domain([data.min, data.max]);

        var newGroup = svg.append('g')
            .attr('class', 'boxplot-x-axis')
            .attr('transform', 'translate(0,0.5)');

        var xaLineMin = newGroup.append('line')
            .attr('y1', 15)
            .attr('y2', 15);
        var xaTextMin = newGroup.append('text')
            .attr('y', 10)
            .style('text-anchor', 'start');
        var xaTextMax = newGroup.append('text')
            .attr('y', 10)
            .style('text-anchor', 'end');
        var xaLineQ = newGroup.append('line')
            .attr('y1', 15)
            .attr('y2', 15)
            .style('stroke-width', 3);
        var xaLineMed = newGroup.append('line')
            .attr('class', 'med-line')
            .attr('y1', 15)
            .attr('y2', 15)
            .style('stroke-width', 4);
        var xaTextMed = newGroup.append('text')
            .attr('y', 26);

        var brush = d3.svg.brush()
            .x(xScale)
            .on('brushend', brushed)
            .on('brush', brushing);

        var brushTextMax = newGroup.append('text')
            .attr('class', 'filter-boxplot-value')
            .attr('y', 26)
            .style('text-anchor', 'end');
        var brushTextMin = newGroup.append('text')
            .attr('class', 'filter-boxplot-value')
            .attr('y', 10)
            .style('text-anchor', 'start');

        var brushRect = svg.append('g')
            .attr('class', 'x brush')
            .call(brush)
          .selectAll('rect')
            .attr('y', -6)
            .attr('height', rowHeight + 7);

        var xaTextMinWidth;
        var xaTextMedWidth;

        function brushed() {
            var extent = brush.extent(); 
            scope.filterApplied = true;  
            scope.$apply();
            scope.changeFilter(extent);                        
        }

        function brushing() {
            var extent = brush.extent();            

            var x0 = xScale(extent[0]);
            var x1 = xScale(extent[1]);
            brushTextMax
                .attr('x', x1)
                .text(CHARTS_UTILS.formatNum(extent[1]));
            brushTextMin
                .attr('x', x0)
                .text(CHARTS_UTILS.formatNum(extent[0]));

            //hide min/max/med value if inside brush
            xaTextMinWidth = xaTextMinWidth || xaTextMin.node().getComputedTextLength();
            xaTextMedWidth = xaTextMedWidth || xaTextMed.node().getComputedTextLength() / 2;
            var med = xScale(data.med);
            var hideMed = med - xaTextMedWidth < x1 && med > x0;
            var hideMin = xaTextMinWidth >= x0;            
            xaTextMed.classed('hidden', hideMed);
            xaTextMin.classed('hidden', hideMin);
        }

        scope.cancelFilter = function () {
            scope.changeFilter(null);
            scope.filterApplied = false;
            brush.clear();
            svg.selectAll('.brush').call(brush.extent([0,0]));
            brushTextMin.attr('x', -1000);
            brushTextMax.attr('x', -1000);
            xaTextMed.classed('hidden', false);
            xaTextMin.classed('hidden', false);
        };

        var buildChart = function () {
            // no change of data or scale, stay consistent 
            // NB: if we want to update scale and data, we need to implement a getQuartiles method that ignores current's dimension filters
            // ------------------------------------------------------
            data = dims[attrs.dim].getQuartiles();
            // xScale.domain([data.min, data.max]);            
            // var oldBrushExtent = brush.extent();
            // svg.select('.brush').call(brush.extent(oldBrushExtent));
            
            var xMaxText = xScale(data.max);
            var xMedText = xScale(data.med);
            var xMinText = xScale(data.min);        

            xaLineMin
                .transition().duration(CHARTS_CONFIG.transitionTime)
                .attr('x1', xScale(data.min))
                .attr('x2', xScale(data.max));
            xaTextMin
                .transition().duration(CHARTS_CONFIG.transitionTime)
                .attr('x', xMinText)
                .text(CHARTS_UTILS.formatNum(data.min));
            xaTextMax
                .transition().duration(CHARTS_CONFIG.transitionTime)
                .attr('x', xMaxText)
                .text(CHARTS_UTILS.formatNum(data.max));
            xaLineQ
                .transition().duration(CHARTS_CONFIG.transitionTime)
                .attr('x1', xScale(data.q1))
                .attr('x2', xScale(data.q3));
            xaLineMed
                .transition().duration(CHARTS_CONFIG.transitionTime)
                .attr('x1', xScale(data.med) - 1.5)
                .attr('x2', xScale(data.med) + 1.5);
            xaTextMed
                .transition().duration(CHARTS_CONFIG.transitionTime)
                .attr('x', xMedText)
                .text(CHARTS_UTILS.formatNum(data.med));

        };

        buildChart();
      }
    };
  });
