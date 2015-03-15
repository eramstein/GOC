'use strict';

/*global CHARTS_CONFIG: true*/

var CHARTS_CONFIG = {
    'transitionTime':750,
    'aspectRatio': [960, 500], //TODO: this is hardcoed in the chart directive HTML template SVG element. Angular doesn't support viewBox well   
    'bubleSize': {'default': 10, 'min': 1, 'max': 30},
    'colorScales': {
        'default': ['#9E0041','#C32F4B','#E1514B','#F47245','#FB9F59','#FEC574','#FAE38C','#EAF195','#C7E89E','#9CD6A4','#6CC4A4','#4D9DB4','#4776B4','#5E4EA1']
    }
};

//some redundancy for sugar
CHARTS_CONFIG.width = CHARTS_CONFIG.aspectRatio[0];
CHARTS_CONFIG.height = CHARTS_CONFIG.aspectRatio[1];

