/**
 * @license
 * Copyright (C) 2020 The Android Open Source Project
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
import {html} from '@polymer/polymer/lib/utils/html-tag';

export const htmlTemplate = html`
  <style include="gr-font-styles">
    /* Workaround for empty style block - see https://github.com/Polymer/tools/issues/408 */
  </style>
  <style include="gr-paper-styles">
    /* Workaround for empty style block - see https://github.com/Polymer/tools/issues/408 */
  </style>
  <style include="shared-styles">
    :host {
      color: var(--primary-text-color);
    }
    h2 {
      font-family: var(--header-font-family);
      font-size: var(--font-size-h2);
      font-weight: var(--font-weight-h2);
      line-height: var(--line-height-h2);
    }
    .newEmailInput {
      width: 20em;
    }
    #email {
      margin-bottom: var(--spacing-l);
    }
    .main section.darkToggle {
      display: block;
    }
    .filters p,
    .darkToggle p {
      margin-bottom: var(--spacing-l);
    }
    .queryExample em {
      color: violet;
    }
    .toggle {
      align-items: center;
      display: flex;
      margin-bottom: var(--spacing-l);
      margin-right: var(--spacing-l);
    }
  </style>
  <style include="gr-form-styles">
    /* Workaround for empty style block - see https://github.com/Polymer/tools/issues/408 */
  </style>
  <style include="gr-menu-page-styles">
    /* Workaround for empty style block - see https://github.com/Polymer/tools/issues/408 */
  </style>
  <style include="gr-page-nav-styles">
    /* Workaround for empty style block - see https://github.com/Polymer/tools/issues/408 */
  </style>
  <div class="loading" hidden$="[[!_loading]]">Loading...</div>
  <div hidden$="[[_loading]]" hidden="">
    <gr-page-nav class="navStyles">
      <ul>
        <li><a href="#Profile">Profile</a></li>
        <li><a href="#Preferences">Preferences</a></li>
        <li><a href="#DiffPreferences">Diff Preferences</a></li>
        <li><a href="#EditPreferences">Edit Preferences</a></li>
        <li><a href="#Menu">Menu</a></li>
        <li><a href="#ChangeTableColumns">Change Table Columns</a></li>
        <li><a href="#Notifications">Notifications</a></li>
        <li><a href="#EmailAddresses">Email Addresses</a></li>
        <template is="dom-if" if="[[_showHttpAuth(_serverConfig)]]">
          <li><a href="#HTTPCredentials">HTTP Credentials</a></li>
        </template>
        <li hidden$="[[!_serverConfig.sshd]]">
          <a href="#SSHKeys"> SSH Keys </a>
        </li>
        <li hidden$="[[!_serverConfig.receive.enable_signed_push]]">
          <a href="#GPGKeys"> GPG Keys </a>
        </li>
        <li><a href="#Groups">Groups</a></li>
        <li><a href="#Identities">Identities</a></li>
        <template
          is="dom-if"
          if="[[_serverConfig.auth.use_contributor_agreements]]"
        >
          <li>
            <a href="#Agreements">Agreements</a>
          </li>
        </template>
        <li><a href="#MailFilters">Mail Filters</a></li>
        <gr-endpoint-decorator name="settings-menu-item">
        </gr-endpoint-decorator>
      </ul>
    </gr-page-nav>
    <div class="main gr-form-styles">
      <h1 class="heading-1">User Settings</h1>
      <h2 id="Theme">Theme</h2>
      <section class="darkToggle">
        <div class="toggle">
          <paper-toggle-button
            aria-labelledby="darkThemeToggleLabel"
            checked="[[_isDark]]"
            on-change="_handleToggleDark"
            on-click="_onTapDarkToggle"
          ></paper-toggle-button>
          <div id="darkThemeToggleLabel">
            Dark theme (the toggle reloads the page)
          </div>
        </div>
      </section>
      <h2 id="Profile" class$="[[_computeHeaderClass(_accountInfoChanged)]]">
        Profile
      </h2>
      <fieldset id="profile">
        <gr-account-info
          id="accountInfo"
          has-unsaved-changes="{{_accountInfoChanged}}"
        ></gr-account-info>
        <gr-button
          on-click="_handleSaveAccountInfo"
          disabled="[[!_accountInfoChanged]]"
          >Save changes</gr-button
        >
      </fieldset>
      <h2 id="Preferences" class$="[[_computeHeaderClass(_prefsChanged)]]">
        Preferences
      </h2>
      <fieldset id="preferences">
        <section>
          <label class="title" for="changesPerPageSelect"
            >Changes per page</label
          >
          <span class="value">
            <gr-select
              bind-value="[[_convertToString(_localPrefs.changes_per_page)]]"
              on-change="_handleChangesPerPage"
            >
              <select id="changesPerPageSelect">
                <option value="10">10 rows per page</option>
                <option value="25">25 rows per page</option>
                <option value="50">50 rows per page</option>
                <option value="100">100 rows per page</option>
              </select>
            </gr-select>
          </span>
        </section>
        <section>
          <label class="title" for="dateTimeFormatSelect"
            >Date/time format</label
          >
          <span class="value">
            <gr-select
              bind-value="[[_convertToString(_localPrefs.date_format)]]"
              on-change="_handleDateFormat"
            >
              <select id="dateTimeFormatSelect">
                <option value="STD">Jun 3 ; Jun 3, 2016</option>
                <option value="US">06/03 ; 06/03/16</option>
                <option value="ISO">06-03 ; 2016-06-03</option>
                <option value="EURO">3. Jun ; 03.06.2016</option>
                <option value="UK">03/06 ; 03/06/2016</option>
              </select>
            </gr-select>
            <gr-select
              bind-value="[[_convertToString(_localPrefs.time_format)]]"
              aria-label="Time Format"
              on-change="_handleTimeFormat"
            >
              <select id="timeFormatSelect">
                <option value="HHMM_12">4:10 PM</option>
                <option value="HHMM_24">16:10</option>
              </select>
            </gr-select>
          </span>
        </section>
        <section>
          <label class="title" for="emailNotificationsSelect"
            >Email notifications</label
          >
          <span class="value">
            <gr-select
              bind-value="[[_convertToString(_localPrefs.email_strategy)]]"
              on-change="_handleEmailStrategy"
            >
              <select id="emailNotificationsSelect">
                <option value="CC_ON_OWN_COMMENTS">Every comment</option>
                <option value="ENABLED">Only comments left by others</option>
                <option value="ATTENTION_SET_ONLY">
                  Only when I am in the attention set
                </option>
                <option value="DISABLED">None</option>
              </select>
            </gr-select>
          </span>
        </section>
        <section hidden$="[[!_convertToString(_localPrefs.email_format)]]">
          <label class="title" for="emailFormatSelect">Email format</label>
          <span class="value">
            <gr-select
              bind-value="[[_convertToString(_localPrefs.email_format)]]"
              on-change="_handleEmailFormat"
            >
              <select id="emailFormatSelect">
                <option value="HTML_PLAINTEXT">HTML and plaintext</option>
                <option value="PLAINTEXT">Plaintext only</option>
              </select>
            </gr-select>
          </span>
        </section>
        <section hidden$="[[!_localPrefs.default_base_for_merges]]">
          <span class="title">Default Base For Merges</span>
          <span class="value">
            <gr-select
              bind-value="[[_convertToString(_localPrefs.default_base_for_merges)]]"
              on-change="_handleDefaultBaseForMerges"
            >
              <select id="defaultBaseForMergesSelect">
                <option value="AUTO_MERGE">Auto Merge</option>
                <option value="FIRST_PARENT">First Parent</option>
              </select>
            </gr-select>
          </span>
        </section>
        <section>
          <label class="title" for="relativeDateInChangeTable"
            >Show Relative Dates In Changes Table</label
          >
          <span class="value">
            <input
              id="relativeDateInChangeTable"
              type="checkbox"
              checked$="[[_localPrefs.relative_date_in_change_table]]"
              on-change="_handleRelativeDateInChangeTable"
            />
          </span>
        </section>
        <section>
          <span class="title">Diff view</span>
          <span class="value">
            <gr-select
              bind-value="[[_convertToString(_localPrefs.diff_view)]]"
              on-change="_handleDiffView"
            >
              <select id="diffViewSelect">
                <option value="SIDE_BY_SIDE">Side by side</option>
                <option value="UNIFIED_DIFF">Unified diff</option>
              </select>
            </gr-select>
          </span>
        </section>
        <section>
          <label for="showSizeBarsInFileList" class="title"
            >Show size bars in file list</label
          >
          <span class="value">
            <input
              id="showSizeBarsInFileList"
              type="checkbox"
              checked$="[[_localPrefs.size_bar_in_change_table]]"
              on-change="_handleShowSizeBarsInFileListChanged"
            />
          </span>
        </section>
        <section>
          <label for="publishCommentsOnPush" class="title"
            >Publish comments on push</label
          >
          <span class="value">
            <input
              id="publishCommentsOnPush"
              type="checkbox"
              checked$="[[_localPrefs.publish_comments_on_push]]"
              on-change="_handlePublishCommentsOnPushChanged"
            />
          </span>
        </section>
        <section>
          <label for="workInProgressByDefault" class="title"
            >Set new changes to "work in progress" by default</label
          >
          <span class="value">
            <input
              id="workInProgressByDefault"
              type="checkbox"
              checked$="[[_localPrefs.work_in_progress_by_default]]"
              on-change="_handleWorkInProgressByDefault"
            />
          </span>
        </section>
        <section>
          <label for="disableKeyboardShortcuts" class="title"
            >Disable all keyboard shortcuts</label
          >
          <span class="value">
            <input
              id="disableKeyboardShortcuts"
              type="checkbox"
              checked$="[[_localPrefs.disable_keyboard_shortcuts]]"
              on-change="_handleDisableKeyboardShortcutsChanged"
            />
          </span>
        </section>
        <section>
          <label for="disableTokenHighlighting" class="title"
            >Disable token highlighting on hover</label
          >
          <span class="value">
            <input
              id="disableTokenHighlighting"
              type="checkbox"
              checked$="[[_localPrefs.disable_token_highlighting]]"
              on-change="_handleDisableTokenHighlightingChanged"
            />
          </span>
        </section>
        <section>
          <label for="insertSignedOff" class="title">
            Insert Signed-off-by Footer For Inline Edit Changes
          </label>
          <span class="value">
            <input
              id="insertSignedOff"
              type="checkbox"
              checked$="[[_localPrefs.signed_off_by]]"
              on-change="_handleInsertSignedOff"
            />
          </span>
        </section>
        <gr-button
          id="savePrefs"
          on-click="_handleSavePreferences"
          disabled="[[!_prefsChanged]]"
          >Save changes</gr-button
        >
      </fieldset>
      <h2
        id="DiffPreferences"
        class$="[[_computeHeaderClass(_diffPrefsChanged)]]"
      >
        Diff Preferences
      </h2>
      <fieldset id="diffPreferences">
        <gr-diff-preferences
          id="diffPrefs"
          on-has-unsaved-changes-changed="_handleHasUnsavedChangesChanged"
        ></gr-diff-preferences>
        <gr-button
          id="saveDiffPrefs"
          on-click="_handleSaveDiffPreferences"
          disabled$="[[!_diffPrefsChanged]]"
          >Save changes</gr-button
        >
      </fieldset>
      <gr-edit-preferences id="editPrefs"></gr-edit-preferences>
      <gr-menu-editor></gr-menu-editor>
      <h2
        id="ChangeTableColumns"
        class$="[[_computeHeaderClass(_changeTableChanged)]]"
      >
        Change Table Columns
      </h2>
      <fieldset id="changeTableColumns">
        <gr-change-table-editor
          show-number="[[_showNumber]]"
          on-show-number-changed="_handleShowNumberChanged"
          server-config="[[_serverConfig]]"
          displayed-columns="[[_localChangeTableColumns]]"
          on-displayed-columns-changed="_handleDisplayedColumnsChanged"
        >
        </gr-change-table-editor>
        <gr-button
          id="saveChangeTable"
          on-click="_handleSaveChangeTable"
          disabled="[[!_changeTableChanged]]"
          >Save changes</gr-button
        >
      </fieldset>
      <h2
        id="Notifications"
        class$="[[_computeHeaderClass(_watchedProjectsChanged)]]"
      >
        Notifications
      </h2>
      <fieldset id="watchedProjects">
        <gr-watched-projects-editor
          has-unsaved-changes="{{_watchedProjectsChanged}}"
          id="watchedProjectsEditor"
        ></gr-watched-projects-editor>
        <gr-button
          on-click="_handleSaveWatchedProjects"
          disabled$="[[!_watchedProjectsChanged]]"
          id="_handleSaveWatchedProjects"
          >Save changes</gr-button
        >
      </fieldset>
      <h2 id="EmailAddresses" class$="[[_computeHeaderClass(_emailsChanged)]]">
        Email Addresses
      </h2>
      <fieldset id="email">
        <gr-email-editor
          id="emailEditor"
          has-unsaved-changes="[[_emailsChanged]]"
          on-has-unsaved-changes-changed="_handleHasSavedChanges"
        ></gr-email-editor>
        <gr-button on-click="_handleSaveEmails" disabled$="[[!_emailsChanged]]"
          >Save changes</gr-button
        >
      </fieldset>
      <fieldset id="newEmail">
        <section>
          <span class="title">New email address</span>
          <span class="value">
            <iron-input
              class="newEmailInput"
              bind-value="{{_newEmail}}"
              type="text"
              on-keydown="_handleNewEmailKeydown"
              placeholder="email@example.com"
            >
              <input
                class="newEmailInput"
                type="text"
                disabled="[[_addingEmail]]"
                on-keydown="_handleNewEmailKeydown"
                placeholder="email@example.com"
              />
            </iron-input>
          </span>
        </section>
        <section
          id="verificationSentMessage"
          hidden$="[[!_lastSentVerificationEmail]]"
        >
          <p>
            A verification email was sent to
            <em>[[_lastSentVerificationEmail]]</em>. Please check your inbox.
          </p>
        </section>
        <gr-button
          disabled="[[!_computeAddEmailButtonEnabled(_newEmail, _addingEmail)]]"
          on-click="_handleAddEmailButton"
          >Send verification</gr-button
        >
      </fieldset>
      <template is="dom-if" if="[[_showHttpAuth(_serverConfig)]]">
        <div>
          <h2 id="HTTPCredentials">HTTP Credentials</h2>
          <fieldset>
            <gr-http-password id="httpPass"></gr-http-password>
          </fieldset>
        </div>
      </template>
      <div hidden$="[[!_serverConfig.sshd]]">
        <h2 id="SSHKeys" class$="[[_computeHeaderClass(_keysChanged)]]">
          SSH keys
        </h2>
        <gr-ssh-editor
          id="sshEditor"
          has-unsaved-changes-changed="handleUnsavedChangesChanged"
        ></gr-ssh-editor>
      </div>
      <div hidden$="[[!_serverConfig.receive.enable_signed_push]]">
        <h2 id="GPGKeys" class$="[[_computeHeaderClass(_gpgKeysChanged)]]">
          GPG keys
        </h2>
        <gr-gpg-editor
          id="gpgEditor"
          has-unsaved-changes="{{_gpgKeysChanged}}"
        ></gr-gpg-editor>
      </div>
      <h2 id="Groups">Groups</h2>
      <fieldset>
        <gr-group-list id="groupList"></gr-group-list>
      </fieldset>
      <h2 id="Identities">Identities</h2>
      <fieldset>
        <gr-identities
          id="identities"
          server-config="[[_serverConfig]]"
        ></gr-identities>
      </fieldset>
      <template
        is="dom-if"
        if="[[_serverConfig.auth.use_contributor_agreements]]"
      >
        <h2 id="Agreements">Agreements</h2>
        <fieldset>
          <gr-agreements-list id="agreementsList"></gr-agreements-list>
        </fieldset>
      </template>
      <h2 id="MailFilters">Mail Filters</h2>
      <fieldset class="filters">
        <p>
          Gerrit emails include metadata about the change to support writing
          mail filters.
        </p>
        <p>
          Here are some example Gmail queries that can be used for filters or
          for searching through archived messages. View the
          <a
            href$="[[_getFilterDocsLink(_docsBaseUrl)]]"
            target="_blank"
            rel="nofollow"
            >Gerrit documentation</a
          >
          for the complete set of footers.
        </p>
        <table>
          <tbody>
            <tr>
              <th>Name</th>
              <th>Query</th>
            </tr>
            <tr>
              <td>Changes requesting my review</td>
              <td>
                <code class="queryExample">
                  "Gerrit-Reviewer: <em>Your Name</em>
                  &lt;<em>your.email@example.com</em>&gt;"
                </code>
              </td>
            </tr>
            <tr>
              <td>Changes requesting my attention</td>
              <td>
                <code class="queryExample">
                  "Gerrit-Attention: <em>Your Name</em>
                  &lt;<em>your.email@example.com</em>&gt;"
                </code>
              </td>
            </tr>
            <tr>
              <td>Changes from a specific owner</td>
              <td>
                <code class="queryExample">
                  "Gerrit-Owner: <em>Owner name</em>
                  &lt;<em>owner.email@example.com</em>&gt;"
                </code>
              </td>
            </tr>
            <tr>
              <td>Changes targeting a specific branch</td>
              <td>
                <code class="queryExample">
                  "Gerrit-Branch: <em>branch-name</em>"
                </code>
              </td>
            </tr>
            <tr>
              <td>Changes in a specific project</td>
              <td>
                <code class="queryExample">
                  "Gerrit-Project: <em>project-name</em>"
                </code>
              </td>
            </tr>
            <tr>
              <td>Messages related to a specific Change ID</td>
              <td>
                <code class="queryExample">
                  "Gerrit-Change-Id: <em>Change ID</em>"
                </code>
              </td>
            </tr>
            <tr>
              <td>Messages related to a specific change number</td>
              <td>
                <code class="queryExample">
                  "Gerrit-Change-Number: <em>change number</em>"
                </code>
              </td>
            </tr>
          </tbody>
        </table>
      </fieldset>
      <gr-endpoint-decorator name="settings-screen"> </gr-endpoint-decorator>
    </div>
  </div>
`;
