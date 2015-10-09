'use strict';

angular.module('gocApp')
  .directive('filterCheckboxes', function ($rootScope, Data) {
    return {
      templateUrl: '/views/templates/filterCheckboxes.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {

        // INTERACTIONS WITH THE REST OF THE APP VIA FILTERSMANAGER
        // -----------------------------------------------------
        scope.$on('FILTERS_CHANGED', function(event, args) {
            if(args.dim !== attrs.dim){
                buildChart();
            }           
        });
        scope.changeFilter = function (val) {
            $rootScope.$broadcast('CHANGE_FILTERS', {'dim': attrs.dim, 'val': val, 'scaleType': 'nominal'});
        };
        scope.dimName = attrs.label;

        // BUILD UI WITH D3
        // -----------------------------------------------------

        var dims = Data.dimensions;        
        var rowHeight = 20;
        var rowWidth = 180; // TODO, magic number
        var margin = [0, 0];
        var data = dims[attrs.dim].groupOn();
        var dimSize = data.length;
        
        var svg = d3.select(element[0]).append('svg')
              .attr('width', rowWidth + 'px') 
              .attr('height', dimSize * rowHeight)
            .append('g')
              .attr('transform', 'translate(' + margin[0] + ',' + margin[1] + ')');

        var xScale = d3.scale.linear()       
              .range([0, rowWidth - margin[0]]);

        var buildChart = function () {
          data = dims[attrs.dim].groupOn();

          data = data.sort(function (a, b) {
            return a.value < b.value;
          });
          
          var max = d3.max(data, function(d) { return +d.value;} );
          xScale.domain([0, max]);

          var items = svg.selectAll('.filter-checkbox-item').data(data, function (d) {return d.key; });

          //ENTER
          var itemEnter = items.enter().append('g')
                               .attr('class', 'filter-checkbox-item')
                               .style('cursor', 'pointer')
                               .on('click', function(d, i) {
                                  scope.changeFilter(d.key);
                                  d3.select(this).classed('filter-on', !d3.select(this).classed('filter-on'));
                               });

          itemEnter.append('rect');          
          itemEnter.append('text').attr('dy', '1.1em');

          //UPDATE
          items
            .transition()
            .duration(750)
            .attr('transform', function (d) {
              var position = 0;
              _.forEach(data, function(value, i){
                  if(value.key === d.key) {
                    position = i;
                  }
              });
              return 'translate(' + 0 + ',' + (position * rowHeight) + ')';
          });

          items.selectAll('rect')
            .transition()
            .duration(750)
            .attr('width', function (d) {
              return xScale(d.value);
            })
            .attr('height', rowHeight - 1);

          items.selectAll('text')
            .transition()
            .duration(750)
            .attr('x', function (d) {
              return 5;
            })
            .text(function (d) {
              return d.key + ' (' + d.value + ')';
            });

        };

        buildChart();

      }
    };
  });
