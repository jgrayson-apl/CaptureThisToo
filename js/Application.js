/*
 Copyright 2022 Esri

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import AppBase from "./support/AppBase.js";
import AppLoader from "./loaders/AppLoader.js";
import SignIn from './apl/SignIn.js';
import ViewLoading from './apl/ViewLoading.js';
import SlidesList from './apl/SlidesList.js';

//import SynchronizedViews from './support/SynchronizedViews.js';

class Application extends AppBase {

  // PORTAL //
  portal;

  constructor() {
    super();

    // LOAD APPLICATION BASE //
    super.load().then(() => {

      // APPLICATION LOADER //
      const applicationLoader = new AppLoader({app: this});
      applicationLoader.load().then(({portal, group, map, view}) => {
        //console.info(portal, group, map, view);

        // PORTAL //
        this.portal = portal;

        // VIEW SHAREABLE URL PARAMETERS //
        this.initializeViewShareable({view});

        // USER SIGN-IN //
        this.configUserSignIn();

        // SET APPLICATION DETAILS //
        this.setApplicationDetails({map, group});

        // APPLICATION //
        this.applicationReady({portal, group, map, view}).catch(this.displayError).then(() => {
          // HIDE APP LOADER //
          document.getElementById('app-loader').toggleAttribute('hidden', true);
        });

      }).catch(this.displayError);
    }).catch(this.displayError);

  }

  /**
   *
   */
  configUserSignIn() {

    const signInContainer = document.getElementById('sign-in-container');
    if (signInContainer) {
      const signIn = new SignIn({container: signInContainer, portal: this.portal});
    }

  }

  /**
   *
   * @param view
   */
  configView(view) {
    return new Promise((resolve, reject) => {
      if (view) {
        require([
          'esri/core/reactiveUtils',
          'esri/widgets/Popup',
          'esri/widgets/Home'
        ], (reactiveUtils, Popup, Home) => {

          // VIEW AND POPUP //
          view.set({
            supersampleScreenshotEnabled: true,
            constraints: {snapToZoom: false},
            ui: {components: []}
          });

          // FATAL ERROR RECOVERY //
          view.watch("fatalError", (error) => {
            error && view.tryFatalErrorRecovery();
          });

          // HOME //
          const home = new Home({view});
          view.ui.add(home, {position: 'top-left', index: 0});

          // VIEW LOADING INDICATOR //
          const viewLoading = new ViewLoading({view: view});
          view.ui.add(viewLoading, 'bottom-right');

          resolve();
        });
      } else { resolve(); }
    });
  }

  /**
   *
   * @param portal
   * @param group
   * @param map
   * @param view
   * @returns {Promise}
   */
  applicationReady({portal, group, map, view}) {
    return new Promise(async (resolve, reject) => {
      // VIEW READY //
      this.configView(view).then(() => {

        this.initializeMapContent({view});
        this.initializeOverview({view});

        resolve();
      }).catch(reject);
    });
  }

  /**
   *
   * @param view
   */
  initializeMapContent({view}) {
    require([
      'esri/widgets/Search',
      'esri/widgets/LayerList',
      'esri/widgets/BasemapLayerList',
      'esri/widgets/Bookmarks',
      'esri/widgets/BasemapGallery'
    ], (Search, LayerList, BasemapLayerList, Bookmarks, BasemapGallery) => {

      // SEARCH //
      const search = new Search({
        container: 'search-container',
        view: view,
        locationEnabled: false,
        popupEnabled: false,
        resultGraphicEnabled: false
      });

      // BASEMAP LAYER LIST //
      const basemapReferenceLayerList = new BasemapLayerList({
        container: 'basemap-reference-layers-container',
        view: view,
        visibleElements: {
          referenceLayers: true,
          baseLayers: false,
          errors: true,
          statusIndicators: true
        }
      });

      // LAYER LIST //
      const layerList = new LayerList({
        container: 'layers-container',
        view: view,
        visibleElements: {
          errors: true,
          statusIndicators: true
        }
      });

      // BASEMAP LAYER LIST //
      const basemapBaseLayerList = new BasemapLayerList({
        container: 'basemap-base-layers-container',
        view: view,
        visibleElements: {
          referenceLayers: false,
          baseLayers: true,
          errors: true,
          statusIndicators: true
        }
      });

      // BASEMAP GALLERY //
      const basemapGallery = new BasemapGallery({
        container: 'basemaps-container',
        view: view
      });

      if (view.type === '2d') {
        // BOOKMARKS //
        const bookmarks = new Bookmarks({
          container: 'bookmarks-container',
          view: view
        });
      } else {
        // SLIDES //
        const slides = new SlidesList({
          container: 'bookmarks-container',
          view: view
        });
      }

    });
  }

  /**
   *
   * @param view
   */
  initializeOverview({view}) {
    require([
      'esri/core/promiseUtils',
      'esri/core/reactiveUtils'
    ], (promiseUtils, reactiveUtils) => {

      //
      // DEVICE PIXEL RATIO
      //
      const devicePixelRatio = document.getElementById("device-pixel-ratio");
      devicePixelRatio.innerHTML = String(window.devicePixelRatio);

      //
      // BACKGROUND
      //
      const backgroundTransparentSwitch = document.getElementById('background-transparent-switch');
      const backgroundColorInput = document.getElementById('background-color-input');

      // DEFAULTS //
      const {starsEnabled, atmosphereEnabled} = view.environment || {starsEnabled: true, atmosphereEnabled: false};
      const _sceneBackground = view.environment?.background || {type: 'color'};

      const _updateViewBackground = () => {
        // DISABLE COLOR INPUT IF SETTING TRANSPARENT BACKGROUND //
        backgroundColorInput.toggleAttribute('disabled', backgroundTransparentSwitch.checked);
        // VIEW CONTAINER //
        view.container.classList.toggle('has-transparent-background', backgroundTransparentSwitch.checked);
        // SELECTED COLOR //
        const selectedColor = backgroundTransparentSwitch.checked ? 'transparent' : backgroundColorInput.value;
        switch (view.type) {
          case '2d':
            // MAP VIEW //
            view.background = {color: selectedColor};
            break;
          case '3d':
            // SCENE VIEW //
            view.environment = {
              background: {..._sceneBackground, color: selectedColor},
              starsEnabled: backgroundTransparentSwitch.checked ? false : starsEnabled,
              atmosphereEnabled: backgroundTransparentSwitch.checked ? false : atmosphereEnabled
            };
            break;
        }
      };
      backgroundTransparentSwitch.addEventListener('calciteSwitchChange', () => { _updateViewBackground(); });
      backgroundColorInput.addEventListener('calciteInputInput', () => { _updateViewBackground(); });

      //
      // IMAGE SIZE
      //
      const defaultSize = {width: 1920, height: 1080};
      const plenarySize = {width: 11894, height: 2160};
      const plenary2Size = {width: 16000, height: 6000};
      let captureSize = {...defaultSize};

      const _updateViewSize = () => {
        captureSize.width = Number(outputWidthInput.value);
        captureSize.height = Number(outputHeightInput.value);
        view.container.style.width = `${ captureSize.width }px`;
        view.container.style.height = `${ captureSize.height }px`;
        //overview.container.style.height = `${ (350 / (captureSize.width / captureSize.height)) }px`;
      };

      const outputWidthInput = document.getElementById("output-width-input");
      const outputHeightInput = document.getElementById("output-height-input");
      const _setInputSize = ({width, height}) => {
        outputWidthInput.value = width;
        outputHeightInput.value = height;
      };
      _setInputSize(captureSize);
      _updateViewSize();

      const captureSizeOption = document.getElementById('capture-size-option');
      captureSizeOption.value = 'DEFAULT';
      captureSizeOption.addEventListener('calciteSegmentedControlChange', () => {

        let canEdit = false;
        let newSize;

        switch (captureSizeOption.value) {
          case 'CUSTOM':
            canEdit = true;
            newSize = {
              width: Number(outputWidthInput.value),
              height: Number(outputHeightInput.value)
            };
            break;
          case 'PLENARY':
            newSize = {...plenarySize};
            break;
          case 'PLENARY_2':
            newSize = {...plenary2Size};
            break;
          default:
            newSize = {...defaultSize};
            break;
        }

        outputWidthInput.toggleAttribute('read-only', !canEdit);
        outputHeightInput.toggleAttribute('read-only', !canEdit);

        _setInputSize(newSize);
        _updateViewSize();
      });

      outputWidthInput.addEventListener("calciteInputNumberInput", _updateViewSize);
      outputHeightInput.addEventListener("calciteInputNumberInput", _updateViewSize);

      //
      // SWAP
      //
      const swapLink = document.getElementById("swap-link");
      swapLink.addEventListener("click", () => {
        const swap = outputWidthInput.value;
        outputWidthInput.value = outputHeightInput.value;
        outputHeightInput.value = swap;
        _updateViewSize();
      });

      //
      // READY ALRERT
      //
      const screenshotReadyAlert = document.getElementById('screenshot-ready-alert');
      const screenshotReadyLink = document.getElementById('screenshot-ready-link');
      screenshotReadyLink.addEventListener('click', () => {
        screenshotReadyAlert.toggleAttribute('open', false);
        this.togglePanel('images', true);
      });

      //
      // SNAPSHOTS LIST
      //
      const snapshotsList = document.getElementById('snapshots-list');
      const clearScreenshotsAction = document.getElementById('clear-screenshots-action');
      clearScreenshotsAction.addEventListener('click', () => {
        snapshotsList.replaceChildren();
      });

      //
      // SCREENSHOT BUTTON
      //
      const screenshotBtn = document.getElementById('screenshot-btn');
      reactiveUtils.watch(() => view.updating, (updating) => {
        screenshotBtn.toggleAttribute('disabled', updating);
      }, {initial: true});

      //
      // SCREENSHOT CARD
      //
      const scaleFormatter = new Intl.NumberFormat('default', {minimumFractionDigits: 0, maximumFractionDigits: 0});
      const screenshotCardTemplate = document.getElementById('screenshot-card-template');
      const _createCaptureCard = (screenshotSize) => {
        const templateNode = screenshotCardTemplate.content.cloneNode(true);

        const snapshotCard = templateNode.querySelector('calcite-card');
        const titleNode = snapshotCard.querySelector('[slot="title"]');
        const subtitleNode = snapshotCard.querySelector('[slot="subtitle"]');
        const thumbnailNode = snapshotCard.querySelector('[slot="thumbnail"]');
        const footerNode = snapshotCard.querySelector('[slot="footer-start"]');
        const trashBtn = snapshotCard.querySelector('[slot="footer-end"]');

        titleNode.innerHTML = (new Date()).toLocaleTimeString();
        subtitleNode.innerHTML = `Lon: ${ view.center.longitude.toFixed(4) } | Lat: ${ view.center.latitude.toFixed(4) } | Scale: 1:${ scaleFormatter.format(view.scale) }`;
        footerNode.innerHTML = `width:${ screenshotSize.width.toLocaleString() } px | height:${ screenshotSize.height.toLocaleString() } px`;
        trashBtn.addEventListener('click', () => { snapshotCard.remove(); });

        return {snapshotCard, thumbnailNode};
      };

      //
      // SCREENSHOT BUTTON CLICK
      //
      screenshotBtn.addEventListener("click", () => {

        const screenshotSize = {
          width: (captureSize.width * window.devicePixelRatio),
          height: (captureSize.height * window.devicePixelRatio)
        };

        const {snapshotCard, thumbnailNode} = _createCaptureCard(screenshotSize);
        snapshotsList.append(snapshotCard);

        screenshotBtn.toggleAttribute('loading', true);
        reactiveUtils.whenOnce(() => !view.updating).then(() => {
          view.focus();
          view.takeScreenshot({...screenshotSize}).then(async screenshot => {

            thumbnailNode.src = screenshot.dataUrl;

            screenshotBtn.toggleAttribute('loading', false);
            screenshotReadyAlert.toggleAttribute('open', true);

            requestAnimationFrame(() => {
              this.setShadowElementStyle(snapshotCard, '.card-content', 'padding', '0');
              this.setShadowElementStyle(snapshotCard, '.header', 'padding-block', '0.5rem');
              this.setShadowElementStyle(snapshotCard, '.footer', 'padding-block', '0.5rem');
            });

          });
        });

      });
    });
  }

}

export default new Application();
