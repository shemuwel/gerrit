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

import '../../../test/common-test-setup-karma';
import './gr-confirm-rebase-dialog';
import {GrConfirmRebaseDialog, RebaseChange} from './gr-confirm-rebase-dialog';
import {queryAndAssert, stubRestApi} from '../../../test/test-utils';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions';
import {NumericChangeId} from '../../../types/common';
import {createChangeViewChange} from '../../../test/test-data-generators';
import {fixture, html} from '@open-wc/testing-helpers';

suite('gr-confirm-rebase-dialog tests', () => {
  let element: GrConfirmRebaseDialog;

  setup(async () => {
    element = await fixture(
      html`<gr-confirm-rebase-dialog></gr-confirm-rebase-dialog>`
    );
  });

  test('render', async () => {
    expect(element).shadowDom.to.equal(/* HTML*/ `
      <gr-dialog
        id="confirmDialog"
        confirm-label="Rebase"
        role="dialog"
      >
        <div class="header" slot="header">Confirm rebase</div>
        <div class="main" slot="main">
          <div
            id="rebaseOnParent"
            class="rebaseOption"
            hidden=""
          >
            <input id="rebaseOnParentInput" name="rebaseOptions" type="radio" />
            <label id="rebaseOnParentLabel" for="rebaseOnParentInput">
              Rebase on parent change
            </label>
          </div>
          <div
            id="parentUpToDateMsg"
            class="message"
            hidden=""
          >
            This change is up to date with its parent.
          </div>
          <div
            id="rebaseOnTip"
            class="rebaseOption"
            hidden=""
          >
            <input
              disabled=""
              id="rebaseOnTipInput"
              name="rebaseOptions"
              type="radio"
            />
            <label id="rebaseOnTipLabel" for="rebaseOnTipInput">
              Rebase on top of the  branch<span hidden=""
              >
                (breaks relation chain)
              </span>
            </label>
          </div>
          <div
            id="tipUpToDateMsg"
            class="message"
          >
            Change is up to date with the target branch already ()
          </div>
          <div id="rebaseOnOther" class="rebaseOption">
            <input
              id="rebaseOnOtherInput"
              name="rebaseOptions"
              type="radio"
            />
            <label id="rebaseOnOtherLabel" for="rebaseOnOtherInput">
              Rebase on a specific change, ref, or commit
              <span hidden=""> (breaks relation chain) </span>
            </label>
          </div>
          <div class="parentRevisionContainer">
            <gr-autocomplete
              id="parentInput"
              no-debounce=""
              allow-non-suggested-values
              placeholder="Change number, ref, or commit hash"
              text=""
            >
            </gr-autocomplete>
          </div>
        </div>
      </gr-dialog>
    `);
  });

  test('controls with parent and rebase on current available', async () => {
    element.rebaseOnCurrent = true;
    element.hasParent = true;
    await element.updateComplete;

    assert.isTrue(
      queryAndAssert<HTMLInputElement>(element, '#rebaseOnParentInput').checked
    );
    assert.isFalse(
      queryAndAssert(element, '#rebaseOnParent').hasAttribute('hidden')
    );
    assert.isTrue(
      queryAndAssert(element, '#parentUpToDateMsg').hasAttribute('hidden')
    );
    assert.isFalse(
      queryAndAssert(element, '#rebaseOnTip').hasAttribute('hidden')
    );
    assert.isTrue(
      queryAndAssert(element, '#tipUpToDateMsg').hasAttribute('hidden')
    );
  });

  test('controls with parent rebase on current not available', async () => {
    element.rebaseOnCurrent = false;
    element.hasParent = true;
    await element.updateComplete;

    assert.isTrue(
      queryAndAssert<HTMLInputElement>(element, '#rebaseOnTipInput').checked
    );
    assert.isTrue(
      queryAndAssert(element, '#rebaseOnParent').hasAttribute('hidden')
    );
    assert.isFalse(
      queryAndAssert(element, '#parentUpToDateMsg').hasAttribute('hidden')
    );
    assert.isFalse(
      queryAndAssert(element, '#rebaseOnTip').hasAttribute('hidden')
    );
    assert.isTrue(
      queryAndAssert(element, '#tipUpToDateMsg').hasAttribute('hidden')
    );
  });

  test('controls without parent and rebase on current available', async () => {
    element.rebaseOnCurrent = true;
    element.hasParent = false;
    await element.updateComplete;

    assert.isTrue(
      queryAndAssert<HTMLInputElement>(element, '#rebaseOnTipInput').checked
    );
    assert.isTrue(
      queryAndAssert(element, '#rebaseOnParent').hasAttribute('hidden')
    );
    assert.isTrue(
      queryAndAssert(element, '#parentUpToDateMsg').hasAttribute('hidden')
    );
    assert.isFalse(
      queryAndAssert(element, '#rebaseOnTip').hasAttribute('hidden')
    );
    assert.isTrue(
      queryAndAssert(element, '#tipUpToDateMsg').hasAttribute('hidden')
    );
  });

  test('controls without parent rebase on current not available', async () => {
    element.rebaseOnCurrent = false;
    element.hasParent = false;
    await element.updateComplete;

    assert.isTrue(element.rebaseOnOtherInput.checked);
    assert.isTrue(
      queryAndAssert(element, '#rebaseOnParent').hasAttribute('hidden')
    );
    assert.isTrue(
      queryAndAssert(element, '#parentUpToDateMsg').hasAttribute('hidden')
    );
    assert.isTrue(
      queryAndAssert(element, '#rebaseOnTip').hasAttribute('hidden')
    );
    assert.isFalse(
      queryAndAssert(element, '#tipUpToDateMsg').hasAttribute('hidden')
    );
  });

  test('input cleared on cancel or submit', async () => {
    element.text = '123';
    await element.updateComplete;
    queryAndAssert(element, '#confirmDialog').dispatchEvent(
      new CustomEvent('confirm', {
        composed: true,
        bubbles: true,
      })
    );
    assert.equal(element.text, '');

    element.text = '123';
    await element.updateComplete;

    queryAndAssert(element, '#confirmDialog').dispatchEvent(
      new CustomEvent('cancel', {
        composed: true,
        bubbles: true,
      })
    );
    assert.equal(element.text, '');
  });

  test('_getSelectedBase', async () => {
    element.text = '5fab321c';
    await element.updateComplete;

    queryAndAssert<HTMLInputElement>(element, '#rebaseOnParentInput').checked =
      true;
    assert.equal(element.getSelectedBase(), null);
    queryAndAssert<HTMLInputElement>(element, '#rebaseOnParentInput').checked =
      false;
    queryAndAssert<HTMLInputElement>(element, '#rebaseOnTipInput').checked =
      true;
    assert.equal(element.getSelectedBase(), '');
    queryAndAssert<HTMLInputElement>(element, '#rebaseOnTipInput').checked =
      false;
    assert.equal(element.getSelectedBase(), element.text);
    element.text = '101: Test';
    await element.updateComplete;

    assert.equal(element.getSelectedBase(), '101');
  });

  suite('parent suggestions', () => {
    let recentChanges: RebaseChange[];
    let getChangesStub: sinon.SinonStub;
    setup(() => {
      recentChanges = [
        {
          name: '123: my first awesome change',
          value: 123 as NumericChangeId,
        },
        {
          name: '124: my second awesome change',
          value: 124 as NumericChangeId,
        },
        {
          name: '245: my third awesome change',
          value: 245 as NumericChangeId,
        },
      ];

      getChangesStub = stubRestApi('getChanges').returns(
        Promise.resolve([
          {
            ...createChangeViewChange(),
            _number: 123 as NumericChangeId,
            subject: 'my first awesome change',
          },
          {
            ...createChangeViewChange(),
            _number: 124 as NumericChangeId,
            subject: 'my second awesome change',
          },
          {
            ...createChangeViewChange(),
            _number: 245 as NumericChangeId,
            subject: 'my third awesome change',
          },
        ])
      );
    });

    test('_getRecentChanges', async () => {
      const recentChangesSpy = sinon.spy(element, 'getRecentChanges');
      await element.getRecentChanges();
      await element.updateComplete;

      assert.deepEqual(element.recentChanges, recentChanges);
      assert.equal(getChangesStub.callCount, 1);

      // When called a second time, should not re-request recent changes.
      await element.getRecentChanges();
      await element.updateComplete;

      assert.equal(recentChangesSpy.callCount, 2);
      assert.equal(getChangesStub.callCount, 1);
    });

    test('_filterChanges', async () => {
      assert.equal(element.filterChanges('123', recentChanges).length, 1);
      assert.equal(element.filterChanges('12', recentChanges).length, 2);
      assert.equal(element.filterChanges('awesome', recentChanges).length, 3);
      assert.equal(element.filterChanges('third', recentChanges).length, 1);

      element.changeNumber = 123 as NumericChangeId;
      await element.updateComplete;

      assert.equal(element.filterChanges('123', recentChanges).length, 0);
      assert.equal(element.filterChanges('124', recentChanges).length, 1);
      assert.equal(element.filterChanges('awesome', recentChanges).length, 2);
    });

    test('input text change triggers function', async () => {
      const recentChangesSpy = sinon.spy(element, 'getRecentChanges');
      element.parentInput.noDebounce = true;
      MockInteractions.pressAndReleaseKeyOn(
        queryAndAssert(queryAndAssert(element, '#parentInput'), '#input'),
        13,
        null,
        'enter'
      );
      element.text = '1';
      await element.updateComplete;

      assert.isTrue(recentChangesSpy.calledOnce);
      element.text = '12';
      await element.updateComplete;

      assert.isTrue(recentChangesSpy.calledTwice);
    });
  });
});
