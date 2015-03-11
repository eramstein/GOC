'use strict';

/*global CHARTS_UTILS: true*/

var CHARTS_UTILS = {
    getUniqueValues: function (data, dim) {
        return  _.countBy(data, dim);     
    }
};
