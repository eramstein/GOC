'use strict';

/*global CHARTS_UTILS: true*/

var CHARTS_UTILS = {
    
    //typically for buble charts - get min, max, med and quartiles for the currently displayed bubles
    //data is an array of objects where the attributes are like dimname_agg (e.g. price_sum)
    getStats: function(data, dim, agg){
        agg = agg || 'sum';
        var sorted = _.pluck(_.sortBy(data, dim + '_' + agg), dim + '_' + agg);
        return {
            'min': d3.min(sorted),
            'max': d3.max(sorted),
            'med': d3.median(sorted),
            'Q1': d3.quantile(sorted, 0.25),
            'Q3': d3.quantile(sorted, 0.75)
        };
    },

    getDistinctValues: function(data, dim){        
        return _(data).pluck(dim).uniq().value();
    },

    shiftText: function(pos, prevTextPos) {
        if(prevTextPos > pos-10){
            return pos + (10 - (pos- prevTextPos) );
        }
        else {
            return pos;
        }
    },

    formatNum: function(argument) {
        var formatNumExecute = d3.format(',.0f');
        var formatSmallNumExecute = d3.format(',.1f');
        if (isNaN(argument)) {
            return '';
        } else {
            if (argument > 10) {
                return formatNumExecute(argument);
            } else {
                return formatSmallNumExecute(argument);
            }
        }
    },

    addMargins: function (svg) {
        var margins = CHARTS_CONFIG.margins;
        var width = CHARTS_CONFIG.width - margins.left - margins.right;
        var height = CHARTS_CONFIG.height - margins.top - margins.bottom;

        svg = svg
            .attr('width', width + margins.left + margins.right)
            .attr('height', height + margins.top + margins.bottom)
            .attr('id','chart_container_svg')
          .append('g')
            .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

        return(svg);
    }

};
