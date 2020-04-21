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
import '../../../scripts/bundled-polymer.js';

import '../gr-button/gr-button.js';
import '../../../styles/shared-styles.js';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import {LegacyElementMixin} from '@polymer/polymer/lib/legacy/legacy-element-mixin.js';
import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {htmlTemplate} from './gr-alert_html.js';
import {getRootElement} from '../../../scripts/rootElement.js';

/** @extends Polymer.Element */
class GrAlert extends GestureEventListeners(
    LegacyElementMixin(
        PolymerElement)) {
  static get template() { return htmlTemplate; }

  static get is() { return 'gr-alert'; }
  /**
   * Fired when the action button is pressed.
   *
   * @event action
   */

  static get properties() {
    return {
      text: String,
      actionText: String,
      /** @type {?string} */
      type: String,
      shown: {
        type: Boolean,
        value: true,
        readOnly: true,
        reflectToAttribute: true,
      },
      toast: {
        type: Boolean,
        value: true,
        reflectToAttribute: true,
      },

      _hideActionButton: Boolean,
      _boundTransitionEndHandler: {
        type: Function,
        value() { return this._handleTransitionEnd.bind(this); },
      },
      _actionCallback: Function,
    };
  }

  /** @override */
  attached() {
    super.attached();
    this.addEventListener('transitionend', this._boundTransitionEndHandler);
  }

  /** @override */
  detached() {
    super.detached();
    this.removeEventListener('transitionend',
        this._boundTransitionEndHandler);
  }

  show(text, opt_actionText, opt_actionCallback) {
    this.text = text;
    this.actionText = opt_actionText;
    this._hideActionButton = !opt_actionText;
    this._actionCallback = opt_actionCallback;
    getRootElement().appendChild(this);
    this._setShown(true);
  }

  hide() {
    this._setShown(false);
    if (this._hasZeroTransitionDuration()) {
      getRootElement().removeChild(this);
    }
  }

  _hasZeroTransitionDuration() {
    const style = window.getComputedStyle(this);
    // transitionDuration is always given in seconds.
    const duration = Math.round(parseFloat(style.transitionDuration) * 100);
    return duration === 0;
  }

  _handleTransitionEnd(e) {
    if (this.shown) { return; }

    getRootElement().removeChild(this);
  }

  _handleActionTap(e) {
    e.preventDefault();
    if (this._actionCallback) { this._actionCallback(); }
  }
}

customElements.define(GrAlert.is, GrAlert);
