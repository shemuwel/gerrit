/**
 * @license
 * Copyright (C) 2021 The Android Open Source Project
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
import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators';
import {sharedStyles} from '../../../styles/shared-styles';
import {
  ChangeInfo,
  RelatedChangeAndCommitInfo,
  CommitId,
} from '../../../types/common';
import {ChangeStatus} from '../../../constants/constants';
import {isChangeInfo} from '../../../utils/change-util';
import {ifDefined} from 'lit/directives/if-defined';

@customElement('gr-related-change')
export class GrRelatedChange extends LitElement {
  @property()
  change?: ChangeInfo | RelatedChangeAndCommitInfo;

  @property()
  href?: string;

  @property()
  label?: string;

  @property()
  showSubmittableCheck = false;

  @property()
  showChangeStatus = false;

  /*
   * Needed for calculation if change is direct or indirect ancestor/descendant
   * to current change.
   */
  @property()
  connectedRevisions?: CommitId[];

  static override get styles() {
    return [
      sharedStyles,
      css`
        a {
          display: block;
        }
        :host,
        .changeContainer,
        a {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .changeContainer {
          display: flex;
        }
        .strikethrough {
          color: var(--deemphasized-text-color);
          text-decoration: line-through;
        }
        .status {
          color: var(--deemphasized-text-color);
          font-weight: var(--font-weight-bold);
          margin-left: var(--spacing-xs);
        }
        .notCurrent {
          color: var(--warning-foreground);
        }
        .indirectAncestor {
          color: var(--indirect-ancestor-text-color);
        }
        .submittableCheck {
          padding-left: var(--spacing-s);
          color: var(--positive-green-text-color);
          display: none;
        }
        .submittableCheck.submittable {
          display: inline;
        }
        .hidden,
        .mobile {
          display: none;
        }
        .submittableCheck {
          padding-left: var(--spacing-s);
          color: var(--positive-green-text-color);
          display: none;
        }
        .submittableCheck.submittable {
          display: inline;
        }
      `,
    ];
  }

  override render() {
    const change = this.change;
    if (!change) throw new Error('Missing change');
    const linkClass = this._computeLinkClass(change);
    return html`
      <div class="changeContainer">
        <a
          href=${ifDefined(this.href)}
          aria-label=${ifDefined(this.label)}
          class=${linkClass}
          ><slot></slot
        ></a>
        ${this.showSubmittableCheck
          ? html`<span
              tabindex="-1"
              title="Submittable"
              class="submittableCheck ${linkClass}"
              role="img"
              aria-label="Submittable"
              >✓</span
            >`
          : ''}
        ${this.showChangeStatus && !isChangeInfo(change)
          ? html`<span class=${this._computeChangeStatusClass(change)}>
              (${this._computeChangeStatus(change)})
            </span>`
          : ''}
      </div>
    `;
  }

  _computeLinkClass(change: ChangeInfo | RelatedChangeAndCommitInfo) {
    const statuses = [];
    if (change.status === ChangeStatus.ABANDONED) {
      statuses.push('strikethrough');
    }
    if (change.submittable) {
      statuses.push('submittable');
    }
    return statuses.join(' ');
  }

  _computeChangeStatusClass(change: RelatedChangeAndCommitInfo) {
    const classes = ['status'];
    if (change._revision_number !== change._current_revision_number) {
      classes.push('notCurrent');
    } else if (this._isIndirectAncestor(change)) {
      classes.push('indirectAncestor');
    } else if (change.submittable) {
      classes.push('submittable');
    } else if (change.status === ChangeStatus.NEW) {
      classes.push('hidden');
    }
    return classes.join(' ');
  }

  _computeChangeStatus(change: RelatedChangeAndCommitInfo) {
    switch (change.status) {
      case ChangeStatus.MERGED:
        return 'Merged';
      case ChangeStatus.ABANDONED:
        return 'Abandoned';
    }
    if (change._revision_number !== change._current_revision_number) {
      return 'Not current';
    } else if (this._isIndirectAncestor(change)) {
      return 'Indirect ancestor';
    } else if (change.submittable) {
      return 'Submittable';
    }
    return '';
  }

  _isIndirectAncestor(change: RelatedChangeAndCommitInfo) {
    return (
      this.connectedRevisions &&
      !this.connectedRevisions.includes(change.commit.commit)
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gr-related-change': GrRelatedChange;
  }
}
