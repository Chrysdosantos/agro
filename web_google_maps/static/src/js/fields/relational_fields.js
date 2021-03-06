odoo.define('web_google_maps.relational_fields', function (require) {
    var core = require('web.core');
    var relational_fields = require('web.relational_fields');
    var MapRenderer = require('web_google_maps.MapRenderer').MapRenderer;

    var qweb = core.qweb;

    relational_fields.FieldOne2Many.include({
        /**
         * Override
         */
        _getRenderer: function () {
            if (this.view.arch.tag === 'map') {
                return MapRenderer;
            }
            return this._super();
        },
        /**
         * Override
         */
        _render: function () {
            if (!this.view || this.renderer) {
                return this._super();
            }
            var arch = this.view.arch;
            var viewType;
            if (arch.tag == 'map') {
                viewType = 'map';
                var record_options = {
                    editable: true,
                    deletable: true,
                    read_only_mode: this.isReadonly,
                };
                var Rendered = this._getRenderer();
                this.renderer = new Rendered(this, this.value, {
                    arch: arch,
                    record_options: record_options,
                    viewType: viewType,
                    fieldLat: arch.attrs.lat,
                    fieldLng: arch.attrs.lng,
                    markerColor: arch.attrs.color,
                    mapLibrary: arch.attrs.library || 'geometry',
                    drawingMode: arch.attrs.drawing_mode,
                    drawingPath: arch.attrs.drawing_path,
                });
                this.$el.addClass('o_field_x2many o_field_x2many_' + viewType);
                return this.renderer.appendTo(this.$el);
            }
            return this._super();
        },
        /**
         * Override
         */
        _renderButtons: function () {
            this._super.apply(this, arguments);
            if (this.view.arch.tag === 'map' && this.activeActions.create) {
                var options = { create_text: this.nodeOptions.create_text, widget: this };
                this.$buttons = $(qweb.render('MapView.buttons', options));
                this.$buttons.on('click', 'button.o-map-button-new', this._onAddRecord.bind(this));
                this.$buttons.on(
                    'click',
                    'button.o-map-button-center-map',
                    this._onMapCenter.bind(this)
                );
            }
        },
        _onMapCenter: function (event) {
            event.stopPropagation();
            if (this.renderer.mapLibrary === 'geometry') {
                this.renderer.mapGeometryCentered(true);
            } else if (this.renderer.mapLibrary === 'drawing') {
                this.renderer.mapShapesCentered();
            }
        },
        is_action_enabled: function (action) {
            return this.activeActions[action];
        },
    });
});
