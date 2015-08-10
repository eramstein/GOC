'use strict';

/*
    Main module for the D3 charts
    (not using closures because of weird interactions with Angular... so we have a few global vars and files have to be loaded in the right order)

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
        'bubles': new CHARTS_CONSTRUCTORS.ConstantsBubles(svg),
        'blobs': new CHARTS_CONSTRUCTORS.ConstantsBlobs(svg)
    };

    this.baloons = new CHARTS_CONSTRUCTORS.Baloons(this);
    this.boxplots = new CHARTS_CONSTRUCTORS.Boxplots(this);
    this.scatterplot = new CHARTS_CONSTRUCTORS.Scatterplot(this);
    this.bublebars = new CHARTS_CONSTRUCTORS.Bublebars(this);

    this.oneblob = new CHARTS_CONSTRUCTORS.Oneblob(this);
    this.barchart = new CHARTS_CONSTRUCTORS.Barchart(this);
    this.donut = new CHARTS_CONSTRUCTORS.Donut(this);
    this.multibar = new CHARTS_CONSTRUCTORS.Multibar(this);
};

//CHARTS_CONSTRUCTORS are functions to draw chart elements
var CHARTS_CONSTRUCTORS = {};
