odoo.define('web_google_maps.MapView', function (require) {
    'use strict';

    var BasicView = require('web.BasicView');
    var core = require('web.core');
    var pyUtils = require('web.py_utils');

    var MapModel = require('web_google_maps.MapModel');
    var MapRenderer = require('web_google_maps.MapRenderer').MapRenderer;
    var MapController = require('web_google_maps.MapController');

    var _lt = core._lt;

    var MapView = BasicView.extend({
        accesskey: 'm',
        display_name: _lt('Map'),
        icon: 'fa-map-o',
        config: _.extend({}, BasicView.prototype.config, {
            Model: MapModel,
            Renderer: MapRenderer,
            Controller: MapController,
        }),
        viewType: 'map',
        mobile_friendly: true,
        init: function (viewInfo, params) {
            this._super.apply(this, arguments);

            var arch = this.arch;
            var attrs = arch.attrs;

            if (!_.isObject(attrs.options)) {
                attrs.options = attrs.options ? pyUtils.py_eval(attrs.options) : {};
            }

            var activeActions = this.controllerParams.activeActions;
            var mode = arch.attrs.editable && !params.readonly ? 'edit' : 'readonly';
            var mapLibrary = attrs.library || 'geometry';

            this.loadParams.limit = this.loadParams.limit || 80;
            this.loadParams.openGroupByDefault = true;
            this.loadParams.type = 'list';

            this.loadParams.groupBy = arch.attrs.default_group_by
                ? [arch.attrs.default_group_by]
                : params.groupBy || [];

            this.rendererParams.arch = arch;

            this.rendererParams.mapLibrary = mapLibrary;

            if (mapLibrary === 'drawing') {
                this.rendererParams.drawingMode = attrs.drawing_mode;
                this.rendererParams.drawingPath = attrs.drawing_path;
            } else if (mapLibrary === 'geometry') {
                var colors = this._setMarkersColor(attrs.colors);
                this.rendererParams.markerColor = attrs.color;
                this.rendererParams.markerColors = colors;
                this.rendererParams.fieldLat = attrs.lat;
                this.rendererParams.fieldLng = attrs.lng;
                this.rendererParams.markerClusterConfig = {
                    gridSize: attrs.options.cluster_grid_size || 40,
                    maxZoom: attrs.options.cluster_max_zoom_level || 7,
                    zoomOnClick: attrs.options.cluster_zoom_on_click || true,
                    imagePath: attrs.options.cluster_image_path || '/web_google_maps/static/lib/markercluster/img/m',
                }
            }

            this.rendererParams.record_options = {
                editable: activeActions.edit,
                deletable: activeActions.delete,
                read_only_mode: params.readOnlyMode || true,
            };

            this.controllerParams.mode = mode;
            this.controllerParams.hasButtons = true;
        },
        _setMarkersColor: function (colors) {
            var pair, color, expr;
            if (!colors) {
                return false;
            }
            return _(colors.split(';'))
                .chain()
                .compact()
                .map(function (color_pair) {
                    pair = color_pair.split(':');
                    color = pair[0];
                    expr = pair[1];
                    return [color, py.parse(py.tokenize(expr)), expr];
                })
                .value();
        },
    });

    return MapView;
});
