'use strict';

/*global CHARTS_UTILS: true*/

var CHARTS_UTILS = {
    getUniqueValues: function(data, dim) {
        return  _.countBy(data, dim);     
    },

    //typically for buble charts - get min, max, med and quartiles for the currently displayed bubles
    //data is an array of objects where the attributes are like dimname_agg (e.g. price_sum)
    getStats: function(data, dim){
        //TODO: we can only size by sums
        var sorted = _.pluck(_.sortBy(data, dim + '_sum'), dim + '_sum');
        var size = sorted.length;
        var medPos = Math.floor(size/2);
        var q1Pos = Math.floor(3*size/4);
        var q3Pos = Math.floor(size/4);
        return {
            'min': sorted[0],
            'max': sorted[size - 1],
            'med': sorted[medPos],
            'Q1': sorted[q1Pos],
            'Q3': sorted[q3Pos]
        };
    }
};
