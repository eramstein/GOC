'use strict';

/*
    Main module for the D3 charts
    (not using closures because of weird interactions with Angular... so we have 3 global vars and files have to be loaded in the right order)

    CHARTS(svg) constructs an object providing methods to draw and update charts in the passed svg element
    
    {
        constants: {
            bubles: {
            }
        },
        scatterplot: {
            create()
            update()
            remove()
        },
        other chart types...
    }
*/

/*global CHARTS: true*/
/*global CHARTS_CONSTRUCTORS: true*/


var CHARTS = function(svg) {
    this.svg = svg;
    this.constants = {
        'bubles': new CHARTS_CONSTRUCTORS.ConstantsBubles(svg)
    };

    this.baloons = new CHARTS_CONSTRUCTORS.Baloons(svg);
};

var CHARTS_CONSTRUCTORS = {};