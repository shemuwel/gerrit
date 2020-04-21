/**
 * @license
 * Copyright (C) 2016 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import '../../scripts/bundled-polymer.js';

import '../../elements/shared/gr-tooltip/gr-tooltip.js';
import {flush} from '@polymer/polymer/lib/legacy/polymer.dom.js';
import {getRootElement} from '../../scripts/rootElement.js';

const BOTTOM_OFFSET = 7.2; // Height of the arrow in tooltip.

/** @polymerBehavior Gerrit.TooltipBehavior */
export const TooltipBehavior = {

  properties: {
    hasTooltip: {
      type: Boolean,
      observer: '_setupTooltipListeners',
    },
    positionBelow: {
      type: Boolean,
      value: false,
      reflectToAttribute: true,
    },

    _isTouchDevice: {
      type: Boolean,
      value() {
        return 'ontouchstart' in document.documentElement;
      },
    },
    _tooltip: Object,
    _titleText: String,
    _hasSetupTooltipListeners: {
      type: Boolean,
      value: false,
    },
  },

  /** @override */
  detached() {
    // NOTE: if you define your own `detached` in your component
    // then this won't take affect (as its not a class yet)
    this._handleHideTooltip();
    this.removeEventListener('mouseenter', this._mouseenterHandler);
  },

  _setupTooltipListeners() {
    if (!this._mouseenterHandler) {
      this._mouseenterHandler = this._handleShowTooltip.bind(this);
    }

    if (!this.hasTooltip) {
      // if attribute set to false, remove the listener
      this.removeEventListener('mouseenter', this._mouseenterHandler);
      this._hasSetupTooltipListeners = false;
      return;
    }

    if (this._hasSetupTooltipListeners) {
      return;
    }
    this._hasSetupTooltipListeners = true;

    this.addEventListener('mouseenter', this._mouseenterHandler);
  },

  _handleShowTooltip(e) {
    if (this._isTouchDevice) { return; }

    if (!this.hasAttribute('title') ||
        this.getAttribute('title') === '' ||
        this._tooltip) {
      return;
    }

    // Store the title attribute text then set it to an empty string to
    // prevent it from showing natively.
    this._titleText = this.getAttribute('title');
    this.setAttribute('title', '');

    const tooltip = document.createElement('gr-tooltip');
    tooltip.text = this._titleText;
    tooltip.maxWidth = this.getAttribute('max-width');
    tooltip.positionBelow = this.getAttribute('position-below');

    // Set visibility to hidden before appending to the DOM so that
    // calculations can be made based on the element’s size.
    tooltip.style.visibility = 'hidden';
    getRootElement().appendChild(tooltip);
    this._positionTooltip(tooltip);
    tooltip.style.visibility = null;

    this._tooltip = tooltip;
    this.listen(window, 'scroll', '_handleWindowScroll');
    this.listen(this, 'mouseleave', '_handleHideTooltip');
    this.listen(this, 'click', '_handleHideTooltip');
  },

  _handleHideTooltip(e) {
    if (this._isTouchDevice) { return; }
    if (!this.hasAttribute('title') ||
        this._titleText == null) {
      return;
    }

    this.unlisten(window, 'scroll', '_handleWindowScroll');
    this.unlisten(this, 'mouseleave', '_handleHideTooltip');
    this.unlisten(this, 'click', '_handleHideTooltip');
    this.setAttribute('title', this._titleText);
    if (this._tooltip && this._tooltip.parentNode) {
      this._tooltip.parentNode.removeChild(this._tooltip);
    }
    this._tooltip = null;
  },

  _handleWindowScroll(e) {
    if (!this._tooltip) { return; }

    this._positionTooltip(this._tooltip);
  },

  _positionTooltip(tooltip) {
    // This flush is needed for tooltips to be positioned correctly in Firefox
    // and Safari.
    flush();
    const rect = this.getBoundingClientRect();
    const boxRect = tooltip.getBoundingClientRect();
    const parentRect = tooltip.parentElement.getBoundingClientRect();
    const top = rect.top - parentRect.top;
    const left =
        rect.left - parentRect.left + (rect.width - boxRect.width) / 2;
    const right = parentRect.width - left - boxRect.width;
    if (left < 0) {
      tooltip.updateStyles({
        '--gr-tooltip-arrow-center-offset': left + 'px',
      });
    } else if (right < 0) {
      tooltip.updateStyles({
        '--gr-tooltip-arrow-center-offset': (-0.5 * right) + 'px',
      });
    }
    tooltip.style.left = Math.max(0, left) + 'px';

    if (!this.positionBelow) {
      tooltip.style.top = Math.max(0, top) + 'px';
      tooltip.style.transform = 'translateY(calc(-100% - ' + BOTTOM_OFFSET +
          'px))';
    } else {
      tooltip.style.top = top + rect.height + BOTTOM_OFFSET + 'px';
    }
  },
};

// TODO(dmfilippov) Remove the following lines with assignments
// Plugins can use the behavior because it was accessible with
// the global Gerrit... variable. To avoid breaking changes in plugins
// temporary assign global variables.
window.Gerrit = window.Gerrit || {};
window.Gerrit.TooltipBehavior = TooltipBehavior;
