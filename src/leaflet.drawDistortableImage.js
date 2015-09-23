// Add distortableimage keys to L.drawLocal
L.drawLocal.draw.toolbar.buttons.distortableimage = 'Add a distortable image';
L.drawLocal.draw.handlers.distortableimage = {
    tooltip: {
        start: 'Click and drag to draw bounding box for image.'
    }
};

// Add distortableimage option to L.DrawToolbar.Control
L.DrawToolbar.Control.prototype.options.distortableimage = {};

// Extend L.DrawToolbar.Control
L.DrawToolbar.Control.prototype.initialize = function (options) {
    L.setOptions(this, options);

    this._actions = {};
    this.options.actions = {};

    if (this.options.polygon) {
        this.options.actions.polygon = {
            action: L.Draw.Control.Polygon,
            options: L.Util.extend(this.options.polygon, { DrawAction: L.Draw.Polygon })
        }
    }

    if (this.options.polyline) {
        this.options.actions.polyline = {
            action: L.Draw.Control.Polyline,
            options: L.Util.extend(this.options.polyline, { DrawAction: L.Draw.Polyline })
        }
    }

    if (this.options.circle) {
        this.options.actions.circle = {
            action: L.Draw.Control.Circle,
            options: L.Util.extend(this.options.circle, { DrawAction: L.Draw.Circle })
        }
    }

    if (this.options.rectangle) {
        this.options.actions.rectangle = {
            action: L.Draw.Control.Rectangle,
            options: L.Util.extend(this.options.rectangle, { DrawAction: L.Draw.Rectangle })
        }
    }

    if (this.options.marker) {
        this.options.actions.marker = {
            action: L.Draw.Control.Marker,
            options: L.Util.extend(this.options.marker, { DrawAction: L.Draw.Marker })
        }
    }

    if (this.options.distortableimage) {
        this.options.actions.distortableimage = {
            action: L.Draw.Control.DistortableImage,
            options: L.Util.extend(this.options.distortableimage, { DrawAction: L.Draw.DistortableImage })
        }
    }

    L.Toolbar.Control.prototype.initialize.call(this, options);
};

// Draw Control (would go at bottom of src/draw/control/Draw.Control.ToolbarAction.js)
L.Draw.Control.DistortableImage = L.Draw.Control.ToolbarAction.extend({
    options: {
        subToolbar: new L.Toolbar({ actions: [L.Draw.Control.Cancel] }),

        toolbarIcon: {
            className: 'leaflet-draw-edit-edit',
            tooltip: L.drawLocal.draw.toolbar.buttons.distortableimage
        }
    }
});

// Draw Control Handler (would go in a new src/draw/handler/Draw.DistortableImage.js)
L.Draw.DistortableImage = L.Draw.Rectangle.extend({
    statics: {
        TYPE: 'distortableimage'
    },

    options: {
        shapeOptions: {
            stroke: true,
            color: '#000',
            weight: 2,
            opacity: 0.5,
            fill: true,
            fillColor: null, //same as color by default
            fillOpacity: 0.2,
            clickable: true,
            dashArray: '5, 10'
        },
        metric: true // Whether to use the metric meaurement system or imperial,
    },

    initialize: function (map, options) {
        // Save the type so super can fire, need to do this as cannot do this.TYPE :(
        this.type = L.Draw.DistortableImage.TYPE;

        this._initialLabelText = L.drawLocal.draw.handlers.distortableimage.tooltip.start;

        if (options.createdEventHandler || this.options.createdEventHandler)
            this._createdEventHandler = options.createdEventHandler ? options.createdEventHandler : this.options.createdEventHandler;

        L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
    },

    _fireCreatedEvent: function () {
        var that = this,
            rectangle = new L.Rectangle(this._shape.getBounds(), this.options.shapeOptions).addTo(this._map);

        this._tempRect = rectangle;

        if (this._createdEventHandler)
        {
            this._createdEventHandler.call(this);
        } else {
            var popupContent = '<div><label for="imgUrlInput">Enter URL for image</label><input type="text" id="imgUrlInput" name="imgUrlInput"><input type="submit" id="imgUrlSubmit"></div>';
            rectangle.bindPopup(popupContent).openPopup();

            document.getElementById('imgUrlSubmit').onclick = function() {
                that._onSubmit(document.getElementById('imgUrlInput').value);
            };
        }

        this._map
            .on('click', this._cancelCreate, this);
    },

    _onSubmit: function(url) {
        var bounds = this._tempRect.getBounds(),
            corners = {
                corners: [
                    bounds.getNorthWest(),
                    bounds.getNorthEast(),
                    bounds.getSouthWest(),
                    bounds.getSouthEast()
                ]
            },
            img = new L.DistortableImageOverlay(url, corners);

        this._map.removeLayer(this._tempRect);
        this._map.addLayer(img);

        L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, img);
    },

    _cancelCreate: function() {
        if (this._tempRect)
        {
            this._map.removeLayer(this._tempRect);
            this._tempRect = null;
        }
    }
});