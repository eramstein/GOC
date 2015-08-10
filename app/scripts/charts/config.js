'use strict';

/*global CHARTS_CONFIG: true*/

var CHARTS_CONFIG = {
    'defaultBubleColor': 'steelblue',
    'transitionTime':750,
    'aspectRatio': [960, 500], //TODO: this is hardcoed in the chart directive HTML template SVG element. Angular doesn't support viewBox well   
    'bubleSize': {'default': 10, 'min': 1, 'max': 30},
    'colorScales': {
        'default': ['#9E0041','#C32F4B','#E1514B','#F47245','#FB9F59','#FEC574','#FAE38C','#EAF195','#C7E89E','#9CD6A4','#6CC4A4','#4D9DB4','#4776B4','#5E4EA1'],
        'twocolors': ['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ec7014', '#fe9929', '#feb24c', '#fec44f']
    },
    'margins': {'top': 40, 'right': 50, 'bottom': 40, 'left': 50},
    'labelsWidth': 200
};

//some redundancy for sugar
CHARTS_CONFIG.width = CHARTS_CONFIG.aspectRatio[0];
CHARTS_CONFIG.height = CHARTS_CONFIG.aspectRatio[1];
CHARTS_CONFIG.centerX = CHARTS_CONFIG.aspectRatio[0]/2;
CHARTS_CONFIG.centerY = CHARTS_CONFIG.aspectRatio[1]/2;

