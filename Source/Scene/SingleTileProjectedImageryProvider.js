define([
        '../Core/Check',
        '../Core/Credit',
        '../Core/defineProperties',
        '../Core/DeveloperError',
        '../Core/Event',
        '../Core/SingleTileProjectedTilingScheme',
        '../Core/Rectangle',
        '../Core/Resource',
        '../Core/RuntimeError',
        '../Core/TileProviderError',
        '../ThirdParty/when'
    ], function(
        Check,
        Credit,
        defineProperties,
        DeveloperError,
        Event,
        SingleTileProjectedTilingScheme,
        Rectangle,
        Resource,
        RuntimeError,
        TileProviderError,
        when) {
    'use strict';

    /**
     * Provides a single, top-level imagery tile in any projection.
     *
     * @alias SingleTileProjectedImageryProvider
     * @constructor
     *
     * @param {Object} options Object with the following properties:
     * @param {Resource|String} options.url The url for the tile.
     * @param {Rectangle} options.rectangle The rectangle covered by the image in the source SRS.
     * @param {MapProjection} options.projection The map projection for the source SRS.
     * @param {Credit|String} [options.credit] A credit for the data source, which is displayed on the canvas.
     *
     * @see ArcGisMapServerImageryProvider
     * @see BingMapsImageryProvider
     * @see GoogleEarthEnterpriseMapsProvider
     * @see createOpenStreetMapImageryProvider
     * @see createTileMapServiceImageryProvider
     * @see WebMapServiceImageryProvider
     * @see WebMapTileServiceImageryProvider
     * @see UrlTemplateImageryProvider
     */
    function SingleTileProjectedImageryProvider(options) {
        //>>includeStart('debug', pragmas.debug);
        Check.defined('options', options);
        Check.typeOf.string('options.url', options.url);
        Check.defined('options.rectangle', options.rectangle);
        Check.defined('options.projection', options.projection);
        //>>includeEnd('debug');

        var resource = Resource.createIfNeeded(options.url);

        var rectangle = Rectangle.clone(options.rectangle);
        this._tilingScheme = new SingleTileProjectedTilingScheme({
            projectedRectangle : rectangle,
            projection : options.projection
        });
        this._projection = options.projection;
        this._resource = resource;
        this._image = undefined;
        this._texture = undefined;
        this._tileWidth = 0;
        this._tileHeight = 0;

        this._errorEvent = new Event();

        this._ready = false;
        this._readyPromise = when.defer();

        var credit = options.credit;
        if (typeof credit === 'string') {
            credit = new Credit(credit);
        }
        this._credit = credit;

        var that = this;
        var error;

        function success(image) {
            that._image = image;
            that._tileWidth = image.width;
            that._tileHeight = image.height;
            that._ready = true;
            that._readyPromise.resolve(true);
            TileProviderError.handleSuccess(that._errorEvent);
        }

        function failure(e) {
            var message = 'Failed to load image ' + resource.url + '.';
            error = TileProviderError.handleError(
                    error,
                    that,
                    that._errorEvent,
                    message,
                    0, 0, 0,
                    doRequest,
                    e);
            that._readyPromise.reject(new RuntimeError(message));
        }

        function doRequest() {
            when(resource.fetchImage(), success, failure);
        }

        doRequest();
    }

    defineProperties(SingleTileProjectedImageryProvider.prototype, {
        /**
         * Gets the URL of the single, top-level imagery tile.
         * @memberof SingleTileProjectedImageryProvider.prototype
         * @type {String}
         * @readonly
         */
        url : {
            get : function() {
                return this._resource.url;
            }
        },

        /**
         * Gets the proxy used by this provider.
         * @memberof SingleTileProjectedImageryProvider.prototype
         * @type {Proxy}
         * @readonly
         */
        proxy : {
            get : function() {
                return this._resource.proxy;
            }
        },

        /**
         * Gets the width of each tile, in pixels. This function should
         * not be called before {@link SingleTileProjectedImageryProvider#ready} returns true.
         * @memberof SingleTileProjectedImageryProvider.prototype
         * @type {Number}
         * @readonly
         */
        tileWidth : {
            get : function() {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('tileWidth must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return this._tileWidth;
            }
        },

        /**
         * Gets the height of each tile, in pixels.  This function should
         * not be called before {@link SingleTileProjectedImageryProvider#ready} returns true.
         * @memberof SingleTileProjectedImageryProvider.prototype
         * @type {Number}
         * @readonly
         */
        tileHeight: {
            get : function() {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('tileHeight must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return this._tileHeight;
            }
        },

        /**
         * Gets the maximum level-of-detail that can be requested.  This function should
         * not be called before {@link SingleTileProjectedImageryProvider#ready} returns true.
         * @memberof SingleTileProjectedImageryProvider.prototype
         * @type {Number}
         * @readonly
         */
        maximumLevel : {
            get : function() {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('maximumLevel must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return 0;
            }
        },

        /**
         * Gets the minimum level-of-detail that can be requested.  This function should
         * not be called before {@link SingleTileProjectedImageryProvider#ready} returns true.
         * @memberof SingleTileProjectedImageryProvider.prototype
         * @type {Number}
         * @readonly
         */
        minimumLevel : {
            get : function() {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('minimumLevel must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return 0;
            }
        },

        /**
         * Gets the tiling scheme used by this provider.  This function should
         * not be called before {@link SingleTileProjectedImageryProvider#ready} returns true.
         * @memberof SingleTileProjectedImageryProvider.prototype
         * @type {TilingScheme}
         * @readonly
         */
        tilingScheme : {
            get : function() {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('tilingScheme must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return this._tilingScheme;
            }
        },

        /**
         * Gets the rectangle, in radians, of the imagery provided by this instance.  This function should
         * not be called before {@link SingleTileProjectedImageryProvider#ready} returns true.
         * @memberof SingleTileProjectedImageryProvider.prototype
         * @type {Rectangle}
         * @readonly
         */
        rectangle : {
            get : function() {
                return this._tilingScheme.rectangle;
            }
        },

        /**
         * Gets the tile discard policy.  If not undefined, the discard policy is responsible
         * for filtering out "missing" tiles via its shouldDiscardImage function.  If this function
         * returns undefined, no tiles are filtered.  This function should
         * not be called before {@link SingleTileProjectedImageryProvider#ready} returns true.
         * @memberof SingleTileProjectedImageryProvider.prototype
         * @type {TileDiscardPolicy}
         * @readonly
         */
        tileDiscardPolicy : {
            get : function() {
                //>>includeStart('debug', pragmas.debug);
                if (!this._ready) {
                    throw new DeveloperError('tileDiscardPolicy must not be called before the imagery provider is ready.');
                }
                //>>includeEnd('debug');

                return undefined;
            }
        },

        /**
         * Gets an event that is raised when the imagery provider encounters an asynchronous error.  By subscribing
         * to the event, you will be notified of the error and can potentially recover from it.  Event listeners
         * are passed an instance of {@link TileProviderError}.
         * @memberof SingleTileProjectedImageryProvider.prototype
         * @type {Event}
         * @readonly
         */
        errorEvent : {
            get : function() {
                return this._errorEvent;
            }
        },

        /**
         * Gets a value indicating whether or not the provider is ready for use.
         * @memberof SingleTileProjectedImageryProvider.prototype
         * @type {Boolean}
         * @readonly
         */
        ready : {
            get : function() {
                return this._ready;
            }
        },

        /**
         * Gets a promise that resolves to true when the provider is ready for use.
         * @memberof SingleTileProjectedImageryProvider.prototype
         * @type {Promise.<Boolean>}
         * @readonly
         */
        readyPromise : {
            get : function() {
                return this._readyPromise.promise;
            }
        },

        /**
         * Gets the credit to display when this imagery provider is active.  Typically this is used to credit
         * the source of the imagery.  This function should not be called before {@link SingleTileProjectedImageryProvider#ready} returns true.
         * @memberof SingleTileProjectedImageryProvider.prototype
         * @type {Credit}
         * @readonly
         */
        credit : {
            get : function() {
                return this._credit;
            }
        },

        /**
         * Gets a value indicating whether or not the images provided by this imagery provider
         * include an alpha channel.  If this property is false, an alpha channel, if present, will
         * be ignored.  If this property is true, any images without an alpha channel will be treated
         * as if their alpha is 1.0 everywhere.  When this property is false, memory usage
         * and texture upload time are reduced.
         * @memberof SingleTileProjectedImageryProvider.prototype
         * @type {Boolean}
         * @readonly
         */
        hasAlphaChannel : {
            get : function() {
                return true;
            }
        }
    });

    /**
     * Gets the credits to be displayed when a given tile is displayed.
     *
     * @param {Number} x The tile X coordinate.
     * @param {Number} y The tile Y coordinate.
     * @param {Number} level The tile level;
     * @returns {Credit[]} The credits to be displayed when the tile is displayed.
     *
     * @exception {DeveloperError} <code>getTileCredits</code> must not be called before the imagery provider is ready.
     */
    SingleTileProjectedImageryProvider.prototype.getTileCredits = function(x, y, level) {
        return undefined;
    };

    /**
     * Requests the image for a given tile.  This function should
     * not be called before {@link SingleTileProjectedImageryProvider#ready} returns true.
     *
     * @param {Number} x The tile X coordinate.
     * @param {Number} y The tile Y coordinate.
     * @param {Number} level The tile level.
     * @param {Request} [request] The request object. Intended for internal use only.
     * @returns {Promise.<Image|Canvas>|undefined} A promise for the image that will resolve when the image is available, or
     *          undefined if there are too many active requests to the server, and the request
     *          should be retried later.  The resolved image may be either an
     *          Image or a Canvas DOM object.
     *
     * @exception {DeveloperError} <code>requestImage</code> must not be called before the imagery provider is ready.
     */
    SingleTileProjectedImageryProvider.prototype.requestImage = function(x, y, level, request) {
        //>>includeStart('debug', pragmas.debug);
        if (!this._ready) {
            throw new DeveloperError('requestImage must not be called before the imagery provider is ready.');
        }
        //>>includeEnd('debug');

        return this._image;
    };

    /**
     * Picking features is not currently supported by this imagery provider, so this function simply returns
     * undefined.
     *
     * @param {Number} x The tile X coordinate.
     * @param {Number} y The tile Y coordinate.
     * @param {Number} level The tile level.
     * @param {Number} longitude The longitude at which to pick features.
     * @param {Number} latitude  The latitude at which to pick features.
     * @return {Promise.<ImageryLayerFeatureInfo[]>|undefined} A promise for the picked features that will resolve when the asynchronous
     *                   picking completes.  The resolved value is an array of {@link ImageryLayerFeatureInfo}
     *                   instances.  The array may be empty if no features are found at the given location.
     *                   It may also be undefined if picking is not supported.
     */
    SingleTileProjectedImageryProvider.prototype.pickFeatures = function(x, y, level, longitude, latitude) {
        return undefined;
    };

    return SingleTileProjectedImageryProvider;
});