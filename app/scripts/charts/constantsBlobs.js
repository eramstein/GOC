'use strict';

/*
    This file handles the blobs state and constant elements
*/

CHARTS_CONSTRUCTORS.ConstantsBlobs = function(svg) {
    
    var _this = this;

    svg = d3.select(svg);   

    this.surface = Math.pow(((CHARTS_CONFIG.height) / 2),2);

    //---------------------------------------------------------------------------------------
    // STATE
    //---------------------------------------------------------------------------------------

    this.shapeType = null;
    this.shapeInfo = {};
    this.shapeData = [];

    //---------------------------------------------------------------------------------------
    // BUILD NEW SET OF BLOBS
    //---------------------------------------------------------------------------------------

    //simply clear content
    this.makeNew = function () {
        svg.select('#bubles').remove();
        svg.select('#blobs').remove();
        svg.append('svg:g').attr('id', 'blobs');
    };

};