/**
 * @license
 * Copyright (C) 2015 The Android Open Source Project
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

import 'ba-linkify/ba-linkify';
import {getBaseUrl} from '../../../utils/url-util';
import {CommentLinkInfo} from '../../../types/common';

/**
 * Pattern describing URLs with supported protocols.
 */
const URL_PROTOCOL_PATTERN = /^(.*)(https?:\/\/|mailto:)/;

export type LinkTextParserCallback = ((text: string, href: string) => void) &
  ((text: null, href: null, fragment: DocumentFragment) => void);

export interface CommentLinkItem {
  position: number;
  length: number;
  html: HTMLAnchorElement | DocumentFragment;
}

export type LinkTextParserConfig = {[name: string]: CommentLinkInfo};

export class GrLinkTextParser {
  private readonly baseUrl = getBaseUrl();

  /**
   * Construct a parser for linkifying text. Will linkify plain URLs that appear
   * in the text as well as custom links if any are specified in the linkConfig
   * parameter.
   *
   * @constructor
   * @param linkConfig Comment links as specified by the commentlinks field on a
   *     project config.
   * @param callback The callback to be fired when an intermediate parse result
   *     is emitted. The callback is passed text and href strings if a link is to
   *     be created, or a document fragment otherwise.
   * @param removeZeroWidthSpace If true, zero-width spaces will be removed from
   *     R=<email> and CC=<email> expressions.
   */
  constructor(
    private readonly linkConfig: LinkTextParserConfig,
    private readonly callback: LinkTextParserCallback,
    private readonly removeZeroWidthSpace?: boolean
  ) {
    Object.preventExtensions(this);
  }

  /**
   * Emit a callback to create a link element.
   *
   * @param text The text of the link.
   * @param href The URL to use as the href of the link.
   */
  addText(text: string, href: string) {
    if (!text) {
      return;
    }
    this.callback(text, href);
  }

  /**
   * Given the source text and a list of CommentLinkItem objects that were
   * generated by the commentlinks config, emit parsing callbacks.
   *
   * @param text The chuml of source text over which the outputArray items range.
   * @param outputArray The list of items to add resulting from commentlink
   *     matches.
   */
  processLinks(text: string, outputArray: CommentLinkItem[]) {
    this.sortArrayReverse(outputArray);
    const fragment = document.createDocumentFragment();
    let cursor = text.length;

    // Start inserting linkified URLs from the end of the String. That way, the
    // string positions of the items don't change as we iterate through.
    outputArray.forEach(item => {
      // Add any text between the current linkified item and the item added
      // before if it exists.
      if (item.position + item.length !== cursor) {
        fragment.insertBefore(
          document.createTextNode(
            text.slice(item.position + item.length, cursor)
          ),
          fragment.firstChild
        );
      }
      fragment.insertBefore(item.html, fragment.firstChild);
      cursor = item.position;
    });

    // Add the beginning portion at the end.
    if (cursor !== 0) {
      fragment.insertBefore(
        document.createTextNode(text.slice(0, cursor)),
        fragment.firstChild
      );
    }

    this.callback(null, null, fragment);
  }

  /**
   * Sort the given array of CommentLinkItems such that the positions are in
   * reverse order.
   */
  sortArrayReverse(outputArray: CommentLinkItem[]) {
    outputArray.sort((a, b) => b.position - a.position);
  }

  addItem(
    text: string,
    href: string,
    html: null,
    position: number,
    length: number,
    outputArray: CommentLinkItem[]
  ): void;

  addItem(
    text: null,
    href: null,
    html: string,
    position: number,
    length: number,
    outputArray: CommentLinkItem[]
  ): void;

  /**
   * Create a CommentLinkItem and append it to the given output array. This
   * method can be called in either of two ways:
   * - With `text` and `href` parameters provided, and the `html` parameter
   *   passed as `null`. In this case, the new CommentLinkItem will be a link
   *   element with the given text and href value.
   * - With the `html` paremeter provided, and the `text` and `href` parameters
   *   passed as `null`. In this case, the string of HTML will be parsed and the
   *   first resulting node will be used as the resulting content.
   *
   * @param text The text to use if creating a link.
   * @param href The href to use as the URL if creating a link.
   * @param html The html to parse and use as the result.
   * @param  position The position inside the source text where the item
   *     starts.
   * @param length The number of characters in the source text
   *     represented by the item.
   * @param outputArray The array to which the
   *     new item is to be appended.
   */
  addItem(
    text: string | null,
    href: string | null,
    html: string | null,
    position: number,
    length: number,
    outputArray: CommentLinkItem[]
  ): void {
    if (href) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = text;
      a.target = '_blank';
      a.rel = 'noopener';
      outputArray.push({
        html: a,
        position,
        length,
      });
    } else if (html) {
      // addItem has 2 overloads. If href is null, then html
      // can't be null.
      // TODO(TS): remove if(html) and keep else block without condition
      const fragment = document.createDocumentFragment();
      // Create temporary div to hold the nodes in.
      const div = document.createElement('div');
      div.innerHTML = html;
      while (div.firstChild) {
        fragment.appendChild(div.firstChild);
      }
      outputArray.push({
        html: fragment,
        position,
        length,
      });
    }
  }

  /**
   * Create a CommentLinkItem for a link and append it to the given output
   * array.
   *
   * @param text The text for the link.
   * @param href The href to use as the URL of the link.
   * @param position The position inside the source text where the link
   *     starts.
   * @param length The number of characters in the source text
   *     represented by the link.
   * @param outputArray The array to which the
   *     new item is to be appended.
   */
  addLink(
    text: string,
    href: string,
    position: number,
    length: number,
    outputArray: CommentLinkItem[]
  ) {
    // TODO(TS): remove !test condition
    if (!text || this.hasOverlap(position, length, outputArray)) {
      return;
    }
    if (
      !!this.baseUrl &&
      href.startsWith('/') &&
      !href.startsWith(this.baseUrl)
    ) {
      href = this.baseUrl + href;
    }
    this.addItem(text, href, null, position, length, outputArray);
  }

  /**
   * Create a CommentLinkItem specified by an HTMl string and append it to the
   * given output array.
   *
   * @param html The html to parse and use as the result.
   * @param position The position inside the source text where the item
   *     starts.
   * @param length The number of characters in the source text
   *     represented by the item.
   * @param outputArray The array to which the
   *     new item is to be appended.
   */
  addHTML(
    html: string,
    position: number,
    length: number,
    outputArray: CommentLinkItem[]
  ) {
    if (this.hasOverlap(position, length, outputArray)) {
      return;
    }
    if (
      !!this.baseUrl &&
      html.match(/<a href="\//g) &&
      !new RegExp(`<a href="${this.baseUrl}`, 'g').test(html)
    ) {
      html = html.replace(/<a href="\//g, `<a href="${this.baseUrl}/`);
    }
    this.addItem(null, null, html, position, length, outputArray);
  }

  /**
   * Does the given range overlap with anything already in the item list.
   */
  hasOverlap(position: number, length: number, outputArray: CommentLinkItem[]) {
    const endPosition = position + length;
    for (let i = 0; i < outputArray.length; i++) {
      const arrayItemStart = outputArray[i].position;
      const arrayItemEnd = outputArray[i].position + outputArray[i].length;
      if (
        (position >= arrayItemStart && position < arrayItemEnd) ||
        (endPosition > arrayItemStart && endPosition <= arrayItemEnd) ||
        (position === arrayItemStart && position === arrayItemEnd)
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Parse the given source text and emit callbacks for the items that are
   * parsed.
   */
  parse(text?: string | null) {
    if (text) {
      window.linkify(text, {
        callback: (text: string, href?: string) => this.parseChunk(text, href),
      });
    }
  }

  /**
   * Callback that is pased into the linkify function. ba-linkify will call this
   * method in either of two ways:
   * - With both a `text` and `href` parameter provided: this indicates that
   *   ba-linkify has found a plain URL and wants it linkified.
   * - With only a `text` parameter provided: this represents the non-link
   *   content that lies between the links the library has found.
   *
   */
  parseChunk(text: string, href?: string) {
    // TODO(wyatta) switch linkify sequence, see issue 5526.
    if (this.removeZeroWidthSpace) {
      // Remove the zero-width space added in gr-change-view.
      text = text.replace(/^(CC|R)=\u200B/gm, '$1=');
    }

    // If the href is provided then ba-linkify has recognized it as a URL. If
    // the source text does not include a protocol, the protocol will be added
    // by ba-linkify. Create the link if the href is provided and its protocol
    // matches the expected pattern.
    if (href) {
      const result = URL_PROTOCOL_PATTERN.exec(href);
      if (result) {
        const prefixText = result[1];
        if (prefixText.length > 0) {
          // Fix for simple cases from
          // https://bugs.chromium.org/p/gerrit/issues/detail?id=11697
          // When leading whitespace is missed before link,
          // linkify add this text before link as a schema name to href.
          // We suppose, that prefixText just a single word
          // before link and add this word as is, without processing
          // any patterns in it.
          this.parseLinks(prefixText, {});
          text = text.substring(prefixText.length);
          href = href.substring(prefixText.length);
        }
        this.addText(text, href);
        return;
      }
    }
    // For the sections of text that lie between the links found by
    // ba-linkify, we search for the project-config-specified link patterns.
    this.parseLinks(text, this.linkConfig);
  }

  /**
   * Walk over the given source text to find matches for comemntlink patterns
   * and emit parse result callbacks.
   *
   * @param text The raw source text.
   * @param config A comment links specification object.
   */
  parseLinks(text: string, config: LinkTextParserConfig) {
    // The outputArray is used to store all of the matches found for all
    // patterns.
    const outputArray: CommentLinkItem[] = [];
    for (const [configName, linkInfo] of Object.entries(config)) {
      // TODO(TS): it seems, the following line can be rewritten as:
      // if(enabled === false || enabled === 0 || enabled === '')
      // Should be double-checked before update
      // eslint-disable-next-line eqeqeq
      if (linkInfo.enabled != null && linkInfo.enabled == false) {
        continue;
      }
      // PolyGerrit doesn't use hash-based navigation like the GWT UI.
      // Account for this.
      const html = linkInfo.html;
      const link = linkInfo.link;
      if (html) {
        linkInfo.html = html.replace(/<a href="#\//g, '<a href="/');
      } else if (link) {
        if (link[0] === '#') {
          linkInfo.link = link.substr(1);
        }
      }

      const pattern = new RegExp(linkInfo.match, 'g');

      let match;
      let textToCheck = text;
      let susbtrIndex = 0;

      while ((match = pattern.exec(textToCheck))) {
        textToCheck = textToCheck.substr(match.index + match[0].length);
        let result = match[0].replace(
          pattern,
          // Either html or link has a value. Otherwise an exception is thrown
          // in the code below.
          (linkInfo.html || linkInfo.link)!
        );

        if (linkInfo.html) {
          let i;
          // Skip portion of replacement string that is equal to original to
          // allow overlapping patterns.
          for (i = 0; i < result.length; i++) {
            if (result[i] !== match[0][i]) {
              break;
            }
          }
          result = result.slice(i);

          this.addHTML(
            result,
            susbtrIndex + match.index + i,
            match[0].length - i,
            outputArray
          );
        } else if (linkInfo.link) {
          this.addLink(
            match[0],
            result,
            susbtrIndex + match.index,
            match[0].length,
            outputArray
          );
        } else {
          throw Error(
            'linkconfig entry ' +
              configName +
              ' doesn’t contain a link or html attribute.'
          );
        }

        // Update the substring location so we know where we are in relation to
        // the initial full text string.
        susbtrIndex = susbtrIndex + match.index + match[0].length;
      }
    }
    this.processLinks(text, outputArray);
  }
}
