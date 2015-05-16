'use strict';

/*
    Handles configuration settings and their persistence
    -------------------------------------------------------------------
*/


angular.module('gocApp')
  .service('Config', function Config() {
    
    //available charts array and info about when they are relevant
    //  name: name of the CHARTS method used to display this chart
    //  primaryDatatypes: e.g. ['text'] means that this chart shows up only if the pivot dim ("show me") is a nominal dim
    //  secondaryDatatypes: e.g. [['text', 'number'], ['number']] means this chart type shows up if splitBy/posBy is either an text dim + a quant dim, or just a quant dim
    this.chartTypes = [
        {'name': 'baloons', 'label': 'Baloons', 'primaryDatatypes': ['text'], 'secondaryDatatypes': [[], ['text'], ['text', 'text']]},
        {'name': 'bublebars', 'label': 'Bars', 'primaryDatatypes': ['text'], 'secondaryDatatypes': [['number']]},
        {'name': 'boxplots', 'label': 'Box Plots', 'primaryDatatypes': ['text'], 'secondaryDatatypes': [['number'], ['number', 'text']]},
        {'name': 'scatterplot', 'label': 'Scatterplot', 'primaryDatatypes': ['text'], 'secondaryDatatypes': [['number', 'number']]}
    ];

    this.filterCheckboxTreshold = 6;

  });
