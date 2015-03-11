'use strict';

/*global CHARTS_CONFIG: true*/

var CHARTS_CONFIG = {
    'transitionTime':750,
    'aspectRatio': [960, 500] //TODO: this is hardcoed in the chart directive HTML template SVG element. Angular doesn't support viewBox well    
};

//some redundancy for sugar
CHARTS_CONFIG.width = CHARTS_CONFIG.aspectRatio[0];
CHARTS_CONFIG.height = CHARTS_CONFIG.aspectRatio[1];
