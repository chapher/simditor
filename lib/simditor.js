(function() {
  var BlockquoteButton, BoldButton, Button, CodeButton, CodePopover, Formatter, HrButton, ImageButton, ImagePopover, IndentButton, InputManager, ItalicButton, Keystroke, LinkButton, LinkPopover, ListButton, OrderListButton, OutdentButton, Popover, Selection, Simditor, TableButton, TitleButton, Toolbar, UnderlineButton, UndoManager, UnorderListButton, Util, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Selection = (function(_super) {
    __extends(Selection, _super);

    Selection.className = 'Selection';

    function Selection() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      Selection.__super__.constructor.apply(this, args);
      this.sel = document.getSelection();
      this.editor = this.widget;
    }

    Selection.prototype._init = function() {};

    Selection.prototype.clear = function() {
      return this.sel.removeAllRanges();
    };

    Selection.prototype.getRange = function() {
      if (!this.editor.inputManager.focused || !this.sel.rangeCount) {
        return null;
      }
      return this.sel.getRangeAt(0);
    };

    Selection.prototype.selectRange = function(range) {
      this.sel.removeAllRanges();
      return this.sel.addRange(range);
    };

    Selection.prototype.rangeAtEndOf = function(node, range) {
      var endNode, endNodeLength, result,
        _this = this;
      if (range == null) {
        range = this.getRange();
      }
      if (!((range != null) && range.collapsed)) {
        return;
      }
      node = $(node)[0];
      endNode = range.endContainer;
      endNodeLength = this.editor.util.getNodeLength(endNode);
      if (!(range.endOffset === endNodeLength - 1 && $(endNode).contents().last().is('br')) && range.endOffset !== endNodeLength) {
        return false;
      }
      if (node === endNode) {
        return true;
      } else if (!$.contains(node, endNode)) {
        return false;
      }
      result = true;
      $(endNode).parentsUntil(node).addBack().each(function(i, n) {
        var $lastChild, nodes;
        nodes = $(n).parent().contents().filter(function() {
          return !(this.nodeType === 3 && !this.nodeValue);
        });
        $lastChild = nodes.last();
        if (!($lastChild.get(0) === n || ($lastChild.is('br') && $lastChild.prev().get(0) === n))) {
          result = false;
          return false;
        }
      });
      return result;
    };

    Selection.prototype.rangeAtStartOf = function(node, range) {
      var result, startNode,
        _this = this;
      if (range == null) {
        range = this.getRange();
      }
      if (!((range != null) && range.collapsed)) {
        return;
      }
      node = $(node)[0];
      startNode = range.startContainer;
      if (range.startOffset !== 0) {
        return false;
      }
      if (node === startNode) {
        return true;
      } else if (!$.contains(node, startNode)) {
        return false;
      }
      result = true;
      $(startNode).parentsUntil(node).addBack().each(function(i, n) {
        var nodes;
        nodes = $(n).parent().contents().filter(function() {
          return !(this.nodeType === 3 && !this.nodeValue);
        });
        if (nodes.first().get(0) !== n) {
          return result = false;
        }
      });
      return result;
    };

    Selection.prototype.insertNode = function(node, range) {
      if (range == null) {
        range = this.getRange();
      }
      if (range == null) {
        return;
      }
      node = $(node)[0];
      range.insertNode(node);
      return this.setRangeAfter(node);
    };

    Selection.prototype.setRangeAfter = function(node, range) {
      if (range == null) {
        range = this.getRange();
      }
      if (range == null) {
        return;
      }
      node = $(node)[0];
      range.setEndAfter(node);
      range.collapse(false);
      return this.selectRange(range);
    };

    Selection.prototype.setRangeBefore = function(node, range) {
      if (range == null) {
        range = this.getRange();
      }
      if (range == null) {
        return;
      }
      node = $(node)[0];
      range.setEndBefore(node);
      range.collapse(false);
      return this.selectRange(range);
    };

    Selection.prototype.setRangeAtStartOf = function(node, range) {
      if (range == null) {
        range = this.getRange();
      }
      node = $(node).get(0);
      range.setEnd(node, 0);
      range.collapse(false);
      return this.selectRange(range);
    };

    Selection.prototype.setRangeAtEndOf = function(node, range) {
      var $node, contents, lastChild, lastText, nodeLength;
      if (range == null) {
        range = this.getRange();
      }
      $node = $(node);
      node = $node.get(0);
      if ($node.is('pre')) {
        contents = $node.contents();
        if (contents.length > 0) {
          lastChild = contents.last();
          lastText = lastChild.text();
          if (lastText.charAt(lastText.length - 1) === '\n') {
            range.setEnd(lastChild[0], this.editor.util.getNodeLength(lastChild[0]) - 1);
          } else {
            range.setEnd(lastChild[0], this.editor.util.getNodeLength(lastChild[0]));
          }
        } else {
          range.setEnd(node, 0);
        }
      } else {
        nodeLength = this.editor.util.getNodeLength(node);
        if (node.nodeType !== 3 && nodeLength > 0 && $(node).contents().last().is('br')) {
          nodeLength -= 1;
        }
        range.setEnd(node, nodeLength);
      }
      range.collapse(false);
      return this.selectRange(range);
    };

    Selection.prototype.deleteRangeContents = function(range) {
      if (range == null) {
        range = this.getRange();
      }
      return range.deleteContents();
    };

    Selection.prototype.breakBlockEl = function(el, range) {
      var $el;
      if (range == null) {
        range = this.getRange();
      }
      $el = $(el);
      if (!range.collapsed) {
        return $el;
      }
      range.setStartBefore($el.get(0));
      if (range.collapsed) {
        return $el;
      }
      return $el.before(range.extractContents());
    };

    Selection.prototype.save = function() {
      var endCaret, range, startCaret;
      if (this._selectionSaved) {
        return;
      }
      range = this.getRange();
      startCaret = $('<span/>').addClass('simditor-caret-start');
      endCaret = $('<span/>').addClass('simditor-caret-end');
      range.insertNode(startCaret[0]);
      range.collapse(false);
      range.insertNode(endCaret[0]);
      this.sel.removeAllRanges();
      return this._selectionSaved = true;
    };

    Selection.prototype.restore = function() {
      var endCaret, endContainer, endOffset, range, startCaret, startContainer, startOffset;
      if (!this._selectionSaved) {
        return false;
      }
      startCaret = this.editor.body.find('.simditor-caret-start');
      endCaret = this.editor.body.find('.simditor-caret-end');
      if (startCaret.length && endCaret.length) {
        startContainer = startCaret.parent();
        startOffset = startContainer.contents().index(startCaret);
        endContainer = endCaret.parent();
        endOffset = endContainer.contents().index(endCaret);
        if (startContainer[0] === endContainer[0]) {
          endOffset -= 1;
        }
        range = document.createRange();
        range.setStart(startContainer.get(0), startOffset);
        range.setEnd(endContainer.get(0), endOffset);
        startCaret.remove();
        endCaret.remove();
        this.selectRange(range);
        this.editor.body.focus();
      } else {
        startCaret.remove();
        endCaret.remove();
      }
      this._selectionSaved = false;
      return range;
    };

    return Selection;

  })(Plugin);

  Formatter = (function(_super) {
    __extends(Formatter, _super);

    Formatter.className = 'Formatter';

    function Formatter() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      Formatter.__super__.constructor.apply(this, args);
      this.editor = this.widget;
    }

    Formatter.prototype._init = function() {
      var _this = this;
      return this.editor.body.on('click', 'a', function(e) {
        return false;
      });
    };

    Formatter.prototype._allowedTags = ['br', 'a', 'img', 'b', 'strong', 'i', 'u', 'p', 'ul', 'ol', 'li', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4'];

    Formatter.prototype._allowedAttributes = {
      img: ['src', 'alt', 'width', 'height', 'data-origin-src', 'data-origin-size', 'data-origin-name'],
      a: ['href', 'target'],
      pre: ['data-lang'],
      p: ['data-indent'],
      h1: ['data-indent'],
      h2: ['data-indent'],
      h3: ['data-indent'],
      h4: ['data-indent']
    };

    Formatter.prototype.decorate = function($el) {
      if ($el == null) {
        $el = this.editor.body;
      }
      return this.editor.trigger('decorate', [$el]);
    };

    Formatter.prototype.undecorate = function($el) {
      if ($el == null) {
        $el = this.editor.body.clone();
      }
      this.editor.trigger('undecorate', [$el]);
      return $.trim($el.html());
    };

    Formatter.prototype.autolink = function($el) {
      var $node, findLinkNode, lastIndex, linkNodes, match, re, replaceEls, text, uri, _i, _len;
      if ($el == null) {
        $el = this.editor.body;
      }
      linkNodes = [];
      findLinkNode = function($parentNode) {
        return $parentNode.contents().each(function(i, node) {
          var $node, text;
          $node = $(node);
          if ($node.is('a') || $node.closest('a', $el).length) {
            return;
          }
          if ($node.contents().length) {
            return findLinkNode($node);
          } else if ((text = $node.text()) && /https?:\/\/|www\./ig.test(text)) {
            return linkNodes.push($node);
          }
        });
      };
      findLinkNode($el);
      re = /(https?:\/\/|www\.)[\w\-\.\?&=\/#%:]+/ig;
      for (_i = 0, _len = linkNodes.length; _i < _len; _i++) {
        $node = linkNodes[_i];
        text = $node.text();
        replaceEls = [];
        match = null;
        lastIndex = 0;
        while ((match = re.exec(text)) !== null) {
          replaceEls.push(document.createTextNode(text.substring(lastIndex, match.index)));
          lastIndex = re.lastIndex;
          uri = /^(http(s)?:\/\/|\/)/.test(match[0]) ? match[0] : 'http://' + match[0];
          replaceEls.push($('<a href="' + uri + '" rel="nofollow">' + match[0] + '</a>')[0]);
        }
        replaceEls.push(document.createTextNode(text.substring(lastIndex)));
        $node.replaceWith($(replaceEls));
      }
      return $el;
    };

    Formatter.prototype.format = function($el) {
      var $node, blockNode, n, node, _i, _j, _len, _len1, _ref, _ref1;
      if ($el == null) {
        $el = this.editor.body;
      }
      if ($el.is(':empty')) {
        $el.append('<p>' + this.editor.util.phBr + '</p>');
        return $el;
      }
      _ref = $el.contents();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        this.cleanNode(n, true);
      }
      _ref1 = $el.contents();
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        node = _ref1[_j];
        $node = $(node);
        if ($node.is('br')) {
          if (typeof blockNode !== "undefined" && blockNode !== null) {
            blockNode = null;
          }
          $node.remove();
        } else if (this.editor.util.isBlockNode(node) || $node.is('img')) {
          blockNode = null;
        } else {
          if (blockNode == null) {
            blockNode = $('<p/>').insertBefore(node);
          }
          blockNode.append(node);
        }
      }
      return $el;
    };

    Formatter.prototype.cleanNode = function(node, recursive) {
      var $node, $p, $td, allowedAttributes, attr, contents, isDecoration, n, text, _i, _j, _len, _len1, _ref, _ref1,
        _this = this;
      $node = $(node);
      if ($node[0].nodeType === 3) {
        text = $node.text().replace(/(\r\n|\n|\r)/gm, '');
        $node.replaceWith($('<div/>').html(text).contents());
        return;
      }
      contents = $node.contents();
      isDecoration = $node.is('[class^="simditor-"]');
      if ($node.is(this._allowedTags.join(',')) || isDecoration) {
        if ($node.is('a') && $node.find('img').length > 0) {
          contents.first().unwrap();
        }
        if (!isDecoration) {
          allowedAttributes = this._allowedAttributes[$node[0].tagName.toLowerCase()];
          _ref = $.makeArray($node[0].attributes);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            attr = _ref[_i];
            if (!((allowedAttributes != null) && (_ref1 = attr.name, __indexOf.call(allowedAttributes, _ref1) >= 0))) {
              $node.removeAttr(attr.name);
            }
          }
        }
      } else if ($node[0].nodeType === 1 && !$node.is(':empty')) {
        if ($node.is('div, article, dl, header, footer, tr')) {
          $node.append('<br/>');
          contents.first().unwrap();
        } else if ($node.is('table')) {
          $p = $('<p/>');
          $node.find('tr').each(function(i, tr) {
            return $p.append($(tr).text() + '<br/>');
          });
          $node.replaceWith($p);
          contents = null;
        } else if ($node.is('thead, tfoot')) {
          $node.remove();
          contents = null;
        } else if ($node.is('th')) {
          $td = $('<td/>').append($node.contents());
          $node.replaceWith($td);
        } else {
          contents.first().unwrap();
        }
      } else {
        $node.remove();
        contents = null;
      }
      if (recursive && (contents != null) && !$node.is('pre')) {
        for (_j = 0, _len1 = contents.length; _j < _len1; _j++) {
          n = contents[_j];
          this.cleanNode(n, true);
        }
      }
      return null;
    };

    Formatter.prototype.clearHtml = function(html, lineBreak) {
      var container, result,
        _this = this;
      if (lineBreak == null) {
        lineBreak = true;
      }
      container = $('<div/>').append(html);
      result = '';
      container.contents().each(function(i, node) {
        var $node, contents;
        if (node.nodeType === 3) {
          return result += node.nodeValue;
        } else if (node.nodeType === 1) {
          $node = $(node);
          contents = $node.contents();
          if (contents.length > 0) {
            result += _this.clearHtml(contents);
          }
          if (lineBreak && $node.is('br, p, div, li, tr, pre, address, artticle, aside, dl, figcaption, footer, h1, h2, h3, h4, header')) {
            return result += '\n';
          }
        }
      });
      return result;
    };

    Formatter.prototype.beautify = function($contents) {
      var uselessP,
        _this = this;
      uselessP = function($el) {
        return !!($el.is('p') && !$el.text() && $el.children(':not(br)').length < 1);
      };
      return $contents.each(function(i, el) {
        var $el;
        $el = $(el);
        if ($el.is(':not(img, br):empty')) {
          $el.remove();
        }
        if (uselessP($el)) {
          $el.remove();
        }
        return $el.find(':not(img, br):empty').remove();
      });
    };

    return Formatter;

  })(Plugin);

  InputManager = (function(_super) {
    __extends(InputManager, _super);

    InputManager.className = 'InputManager';

    InputManager.prototype.opts = {
      pasteImage: false
    };

    function InputManager() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      InputManager.__super__.constructor.apply(this, args);
      this.editor = this.widget;
      if (this.opts.pasteImage && typeof this.opts.pasteImage !== 'string') {
        this.opts.pasteImage = 'inline';
      }
    }

    InputManager.prototype._modifierKeys = [16, 17, 18, 91, 93, 224];

    InputManager.prototype._arrowKeys = [37, 38, 39, 40];

    InputManager.prototype._init = function() {
      var _this = this;
      this._pasteArea = $('<div/>').css({
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        position: 'fixed',
        right: '0',
        bottom: '100px'
      }).attr({
        tabIndex: '-1',
        contentEditable: true
      }).addClass('simditor-paste-area').appendTo(this.editor.el);
      this.editor.on('valuechanged', function() {
        return _this.editor.body.find('pre, .simditor-image, .simditor-table').each(function(i, el) {
          var $el;
          $el = $(el);
          if (($el.parent().is('blockquote') || $el.parent()[0] === _this.editor.body[0]) && $el.next().length === 0) {
            return $('<p/>').append(_this.editor.util.phBr).insertAfter($el);
          }
        });
      });
      this.editor.body.on('keydown', $.proxy(this._onKeyDown, this)).on('keypress', $.proxy(this._onKeyPress, this)).on('keyup', $.proxy(this._onKeyUp, this)).on('mouseup', $.proxy(this._onMouseUp, this)).on('focus', $.proxy(this._onFocus, this)).on('blur', $.proxy(this._onBlur, this)).on('paste', $.proxy(this._onPaste, this));
      if (this.editor.util.browser.firefox) {
        this.addShortcut('cmd+37', function(e) {
          e.preventDefault();
          return _this.editor.selection.sel.modify('move', 'backward', 'lineboundary');
        });
        this.addShortcut('cmd+39', function(e) {
          e.preventDefault();
          return _this.editor.selection.sel.modify('move', 'forward', 'lineboundary');
        });
      }
      if (this.editor.textarea.attr('autofocus')) {
        return setTimeout(function() {
          return _this.editor.focus();
        }, 0);
      }
    };

    InputManager.prototype._onFocus = function(e) {
      var _this = this;
      this.editor.el.addClass('focus').removeClass('error');
      this.focused = true;
      this.editor.body.find('.selected').removeClass('selected');
      return setTimeout(function() {
        _this.editor.triggerHandler('focus');
        return _this.editor.trigger('selectionchanged');
      }, 0);
    };

    InputManager.prototype._onBlur = function(e) {
      this.editor.el.removeClass('focus');
      this.editor.sync();
      this.focused = false;
      return this.editor.triggerHandler('blur');
    };

    InputManager.prototype._onMouseUp = function(e) {
      if ($(e.target).is('img, .simditor-image')) {
        return;
      }
      return this.editor.trigger('selectionchanged');
    };

    InputManager.prototype._onKeyDown = function(e) {
      var $blockEl, metaKey, result, shortcutKey, _base, _ref, _ref1,
        _this = this;
      if (this.editor.triggerHandler(e) === false) {
        return false;
      }
      shortcutKey = this.editor.util.getShortcutKey(e);
      if (this._shortcuts[shortcutKey]) {
        this._shortcuts[shortcutKey].call(this, e);
        return false;
      }
      if (e.which in this._keystrokeHandlers) {
        result = typeof (_base = this._keystrokeHandlers[e.which])['*'] === "function" ? _base['*'](e) : void 0;
        if (result) {
          this.editor.trigger('valuechanged');
          this.editor.trigger('selectionchanged');
          return false;
        }
        this.editor.util.traverseUp(function(node) {
          var handler, _ref;
          if (node.nodeType !== 1) {
            return;
          }
          handler = (_ref = _this._keystrokeHandlers[e.which]) != null ? _ref[node.tagName.toLowerCase()] : void 0;
          result = typeof handler === "function" ? handler(e, $(node)) : void 0;
          return !result;
        });
        if (result) {
          this.editor.trigger('valuechanged');
          this.editor.trigger('selectionchanged');
          return false;
        }
      }
      if ((_ref = e.which, __indexOf.call(this._modifierKeys, _ref) >= 0) || (_ref1 = e.which, __indexOf.call(this._arrowKeys, _ref1) >= 0)) {
        return;
      }
      metaKey = this.editor.util.metaKey(e);
      $blockEl = this.editor.util.closestBlockEl();
      if (metaKey && e.which === 86) {
        return;
      }
      if (this._typing) {
        if (this._typing !== true) {
          clearTimeout(this._typing);
        }
        this._typing = setTimeout(function() {
          _this.editor.trigger('valuechanged');
          _this.editor.trigger('selectionchanged');
          return _this._typing = false;
        }, 200);
      } else {
        setTimeout(function() {
          _this.editor.trigger('valuechanged');
          return _this.editor.trigger('selectionchanged');
        }, 10);
        this._typing = true;
      }
      return null;
    };

    InputManager.prototype._onKeyPress = function(e) {
      var cmd, hook, _i, _len, _ref, _results;
      if (this.editor.triggerHandler(e) === false) {
        return false;
      }
      if (e.which === 13) {
        this._hookStack.length = 0;
      }
      if (e.which === 32) {
        cmd = this._hookStack.join('');
        this._hookStack.length = 0;
        _ref = this._inputHooks;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          hook = _ref[_i];
          if ((hook.cmd instanceof RegExp && hook.cmd.test(cmd)) || hook.cmd === cmd) {
            hook.callback(e, hook, cmd);
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      } else if (this._hookKeyMap[e.which]) {
        this._hookStack.push(this._hookKeyMap[e.which]);
        if (this._hookStack.length > 10) {
          return this._hookStack.shift();
        }
      }
    };

    InputManager.prototype._onKeyUp = function(e) {
      var p, _ref;
      if (this.editor.triggerHandler(e) === false) {
        return false;
      }
      if (_ref = e.which, __indexOf.call(this._arrowKeys, _ref) >= 0) {
        this.editor.trigger('selectionchanged');
        return;
      }
      if (e.which === 8 && (this.editor.body.is(':empty') || (this.editor.body.children().length === 1 && this.editor.body.children().is('br')))) {
        this.editor.body.empty();
        p = $('<p/>').append(this.editor.util.phBr).appendTo(this.editor.body);
        this.editor.selection.setRangeAtStartOf(p);
      }
    };

    InputManager.prototype._onPaste = function(e) {
      var $blockEl, codePaste, imageFile, pasteItem, uploadOpt, _ref,
        _this = this;
      if (this.editor.triggerHandler(e) === false) {
        return false;
      }
      if (e.originalEvent.clipboardData && e.originalEvent.clipboardData.items && e.originalEvent.clipboardData.items.length > 0) {
        pasteItem = e.originalEvent.clipboardData.items[0];
        if (/^image\//.test(pasteItem.type)) {
          imageFile = pasteItem.getAsFile();
          if (!((imageFile != null) && this.opts.pasteImage)) {
            return;
          }
          if (!imageFile.name) {
            imageFile.name = "来自剪贴板的图片.png";
          }
          uploadOpt = {};
          uploadOpt[this.opts.pasteImage] = true;
          if ((_ref = this.editor.uploader) != null) {
            _ref.upload(imageFile, uploadOpt);
          }
          return false;
        }
      }
      $blockEl = this.editor.util.closestBlockEl();
      codePaste = $blockEl.is('pre');
      this.editor.selection.deleteRangeContents();
      this.editor.selection.save();
      this._pasteArea.focus();
      return setTimeout(function() {
        var $img, blob, children, insertPosition, node, pasteContent, range, _i, _len, _ref1;
        if (_this._pasteArea.is(':empty')) {
          pasteContent = null;
        } else if (codePaste) {
          pasteContent = _this.editor.formatter.clearHtml(_this._pasteArea.html());
        } else {
          pasteContent = $('<div/>').append(_this._pasteArea.contents());
          _this.editor.formatter.format(pasteContent);
          _this.editor.formatter.decorate(pasteContent);
          _this.editor.formatter.beautify(pasteContent.children());
          pasteContent = pasteContent.contents();
        }
        _this._pasteArea.empty();
        range = _this.editor.selection.restore();
        if (_this.editor.triggerHandler('pasting', [pasteContent]) === false) {
          return;
        }
        if (!pasteContent) {
          return;
        } else if (codePaste) {
          node = document.createTextNode(pasteContent);
          _this.editor.selection.insertNode(node, range);
        } else if (pasteContent.length < 1) {
          return;
        } else if (pasteContent.length === 1) {
          if (pasteContent.is('p')) {
            children = pasteContent.contents();
            for (_i = 0, _len = children.length; _i < _len; _i++) {
              node = children[_i];
              _this.editor.selection.insertNode(node);
            }
          } else if (pasteContent.is('.simditor-image')) {
            $img = pasteContent.find('img');
            if (dataURLtoBlob && $img.is('img[src^="data:image/png;base64"]')) {
              if (!_this.opts.pasteImage) {
                return;
              }
              blob = dataURLtoBlob($img.attr("src"));
              blob.name = "来自剪贴板的图片.png";
              uploadOpt = {};
              uploadOpt[_this.opts.pasteImage] = true;
              if ((_ref1 = _this.editor.uploader) != null) {
                _ref1.upload(blob, uploadOpt);
              }
              return;
            } else if (imgEl.is('img[src^="webkit-fake-url://"]')) {
              return;
            }
          } else if ($blockEl.is('p') && _this.editor.util.isEmptyNode($blockEl)) {
            $blockEl.replaceWith(pasteContent);
            _this.editor.selection.setRangeAtEndOf(pasteContent, range);
          } else if (pasteContent.is('ul, ol') && $blockEl.is('li')) {
            $blockEl.parent().after(pasteContent);
            _this.editor.selection.setRangeAtEndOf(pasteContent, range);
          } else {
            $blockEl.after(pasteContent);
            _this.editor.selection.setRangeAtEndOf(pasteContent, range);
          }
        } else {
          if ($blockEl.is('li')) {
            $blockEl = $blockEl.parent();
          }
          if (_this.editor.selection.rangeAtStartOf($blockEl, range)) {
            insertPosition = 'before';
          } else if (_this.editor.selection.rangeAtEndOf($blockEl, range)) {
            insertPosition = 'after';
          } else {
            _this.editor.selection.breakBlockEl($blockEl, range);
            insertPosition = 'before';
          }
          $blockEl[insertPosition](pasteContent);
          _this.editor.selection.setRangeAtEndOf(pasteContent.last(), range);
        }
        _this.editor.trigger('valuechanged');
        return _this.editor.trigger('selectionchanged');
      }, 10);
    };

    InputManager.prototype._keystrokeHandlers = {};

    InputManager.prototype.addKeystrokeHandler = function(key, node, handler) {
      if (!this._keystrokeHandlers[key]) {
        this._keystrokeHandlers[key] = {};
      }
      return this._keystrokeHandlers[key][node] = handler;
    };

    InputManager.prototype._inputHooks = [];

    InputManager.prototype._hookKeyMap = {};

    InputManager.prototype._hookStack = [];

    InputManager.prototype.addInputHook = function(hookOpt) {
      $.extend(this._hookKeyMap, hookOpt.key);
      return this._inputHooks.push(hookOpt);
    };

    InputManager.prototype._shortcuts = {
      'cmd+13': function(e) {
        return this.editor.el.closest('form').find('button:submit').click();
      }
    };

    InputManager.prototype.addShortcut = function(keys, handler) {
      return this._shortcuts[keys] = $.proxy(handler, this);
    };

    return InputManager;

  })(Plugin);

  Keystroke = (function(_super) {
    __extends(Keystroke, _super);

    Keystroke.className = 'Keystroke';

    function Keystroke() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      Keystroke.__super__.constructor.apply(this, args);
      this.editor = this.widget;
    }

    Keystroke.prototype._init = function() {
      var _this = this;
      if (this.editor.util.browser.safari) {
        this.editor.inputManager.addKeystrokeHandler('13', '*', function(e) {
          var $br;
          if (!e.shiftKey) {
            return;
          }
          $br = $('<br/>');
          if (_this.editor.selection.rangeAtEndOf($blockEl)) {
            _this.editor.selection.insertNode($br);
            _this.editor.selection.insertNode($('<br/>'));
            _this.editor.selection.setRangeBefore($br);
          } else {
            _this.editor.selection.insertNode($br);
          }
          return true;
        });
      }
      this.editor.inputManager.addKeystrokeHandler('8', '*', function(e) {
        var $prevBlockEl, $rootBlock;
        $rootBlock = _this.editor.util.furthestBlockEl();
        $prevBlockEl = $rootBlock.prev();
        if ($prevBlockEl.is('hr') && _this.editor.selection.rangeAtStartOf($rootBlock)) {
          _this.editor.selection.save();
          $prevBlockEl.remove();
          _this.editor.selection.restore();
          return true;
        }
      });
      this.editor.inputManager.addKeystrokeHandler('9', '*', function(e) {
        if (e.shiftKey) {
          _this.editor.util.outdent();
        } else {
          _this.editor.util.indent();
        }
        return true;
      });
      this.editor.inputManager.addKeystrokeHandler('13', 'li', function(e, $node) {
        var listEl, newBlockEl, newListEl, range;
        if (!_this.editor.util.isEmptyNode($node)) {
          return;
        }
        e.preventDefault();
        range = _this.editor.selection.getRange();
        listEl = $node.parent();
        if ($node.next('li').length > 0) {
          if (listEl.parent('li').length > 0) {
            newBlockEl = $('<li/>').append(_this.editor.util.phBr).insertAfter(listEl.parent('li'));
            newListEl = $('<' + listEl[0].tagName + '/>').append($node.nextAll('li'));
            newBlockEl.append(newListEl);
          } else {
            newBlockEl = $('<p/>').append(_this.editor.util.phBr).insertAfter(listEl);
            newListEl = $('<' + listEl[0].tagName + '/>').append($node.nextAll('li'));
            newBlockEl.after(newListEl);
          }
        } else {
          if (listEl.parent('li').length > 0) {
            newBlockEl = $('<li/>').append(_this.editor.util.phBr).insertAfter(listEl.parent('li'));
          } else {
            newBlockEl = $('<p/>').append(_this.editor.util.phBr).insertAfter(listEl);
          }
        }
        if ($node.prev('li').length) {
          $node.remove();
        } else {
          listEl.remove();
        }
        range.setEnd(newBlockEl[0], 0);
        range.collapse(false);
        _this.editor.selection.selectRange(range);
        return true;
      });
      this.editor.inputManager.addKeystrokeHandler('13', 'pre', function(e, $node) {
        var breakNode, range;
        e.preventDefault();
        range = _this.editor.selection.getRange();
        breakNode = null;
        range.deleteContents();
        if (!_this.editor.util.browser.msie && _this.editor.selection.rangeAtEndOf($node)) {
          breakNode = document.createTextNode('\n\n');
          range.insertNode(breakNode);
          range.setEnd(breakNode, 1);
        } else {
          breakNode = document.createTextNode('\n');
          range.insertNode(breakNode);
          range.setStartAfter(breakNode);
        }
        range.collapse(false);
        _this.editor.selection.selectRange(range);
        return true;
      });
      this.editor.inputManager.addKeystrokeHandler('13', 'blockquote', function(e, $node) {
        var $closestBlock;
        $closestBlock = _this.editor.util.closestBlockEl();
        if (!($closestBlock.is('p') && !$closestBlock.next().length && _this.editor.util.isEmptyNode($closestBlock))) {
          return;
        }
        $node.after($closestBlock);
        _this.editor.selection.setRangeAtStartOf($closestBlock);
        return true;
      });
      this.editor.inputManager.addKeystrokeHandler('8', 'li', function(e, $node) {
        var $br, $childList, $newLi, $prevChildList, $prevNode, $textNode, range, text;
        $childList = $node.children('ul, ol');
        $prevNode = $node.prev('li');
        if (!($childList.length > 0 && $prevNode.length > 0)) {
          return;
        }
        text = '';
        $textNode = null;
        $node.contents().each(function(i, n) {
          if (n.nodeType === 3 && n.nodeValue) {
            text += n.nodeValue;
            return $textNode = $(n);
          }
        });
        if ($textNode && text.length === 1 && _this.editor.util.browser.firefox && !$textNode.next('br').length) {
          $br = $(_this.editor.util.phBr).insertAfter($textNode);
          $textNode.remove();
          _this.editor.selection.setRangeBefore($br);
          return true;
        } else if (text.length > 0) {
          return;
        }
        range = document.createRange();
        $prevChildList = $prevNode.children('ul, ol');
        if ($prevChildList.length > 0) {
          $newLi = $('<li/>').append(_this.editor.util.phBr).appendTo($prevChildList);
          $prevChildList.append($childList.children('li'));
          $node.remove();
          _this.editor.selection.setRangeAtEndOf($newLi, range);
        } else {
          _this.editor.selection.setRangeAtEndOf($prevNode, range);
          $prevNode.append($childList);
          $node.remove();
          _this.editor.selection.selectRange(range);
        }
        return true;
      });
      this.editor.inputManager.addKeystrokeHandler('8', 'pre', function(e, $node) {
        var $newNode, codeStr;
        if (!_this.editor.selection.rangeAtStartOf($node)) {
          return;
        }
        codeStr = $node.html().replace('\n', '<br/>');
        $newNode = $('<p/>').append(codeStr || _this.editor.util.phBr).insertAfter($node);
        $node.remove();
        _this.editor.selection.setRangeAtStartOf($newNode);
        return true;
      });
      return this.editor.inputManager.addKeystrokeHandler('8', 'blockquote', function(e, $node) {
        var $firstChild;
        if (!_this.editor.selection.rangeAtStartOf($node)) {
          return;
        }
        $firstChild = $node.children().first().unwrap();
        _this.editor.selection.setRangeAtStartOf($firstChild);
        return true;
      });
    };

    return Keystroke;

  })(Plugin);

  UndoManager = (function(_super) {
    __extends(UndoManager, _super);

    UndoManager.className = 'UndoManager';

    UndoManager.prototype._stack = [];

    UndoManager.prototype._index = -1;

    UndoManager.prototype._capacity = 50;

    UndoManager.prototype._timer = null;

    function UndoManager() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      UndoManager.__super__.constructor.apply(this, args);
      this.editor = this.widget;
    }

    UndoManager.prototype._init = function() {
      var _this = this;
      this.editor.inputManager.addShortcut('cmd+90', function(e) {
        e.preventDefault();
        return _this.undo();
      });
      this.editor.inputManager.addShortcut('shift+cmd+90', function(e) {
        e.preventDefault();
        return _this.redo();
      });
      return this.editor.on('valuechanged', function(e, src) {
        if (src === 'undo') {
          return;
        }
        if (_this._timer) {
          clearTimeout(_this._timer);
          _this._timer = null;
        }
        return _this._timer = setTimeout(function() {
          return _this._pushUndoState();
        }, 200);
      });
    };

    UndoManager.prototype._pushUndoState = function() {
      var currentState, html;
      if (this._stack.length && this._index > -1) {
        currentState = this._stack[this._index];
      }
      html = this.editor.body.html();
      if (currentState && currentState.html === html) {
        return;
      }
      this._index += 1;
      this._stack.length = this._index;
      this._stack.push({
        html: html,
        caret: this.caretPosition()
      });
      if (this._stack.length > this._capacity) {
        this._stack.shift();
        return this._index -= 1;
      }
    };

    UndoManager.prototype.undo = function() {
      var state;
      if (this._index < 1 || this._stack.length < 2) {
        return;
      }
      this.editor.hidePopover();
      this._index -= 1;
      state = this._stack[this._index];
      this.editor.body.html(state.html);
      this.caretPosition(state.caret);
      this.editor.sync();
      this.editor.trigger('valuechanged', ['undo']);
      return this.editor.trigger('selectionchanged', ['undo']);
    };

    UndoManager.prototype.redo = function() {
      var state;
      if (this._index < 0 || this._stack.length < this._index + 2) {
        return;
      }
      this.editor.hidePopover();
      this._index += 1;
      state = this._stack[this._index];
      this.editor.body.html(state.html);
      this.caretPosition(state.caret);
      this.editor.sync();
      this.editor.trigger('valuechanged', ['undo']);
      return this.editor.trigger('selectionchanged', ['undo']);
    };

    UndoManager.prototype._getNodeOffset = function(node, index) {
      var $parent, merging, offset,
        _this = this;
      if (index) {
        $parent = $(node);
      } else {
        $parent = $(node).parent();
      }
      offset = 0;
      merging = false;
      $parent.contents().each(function(i, child) {
        if (index === i || node === child) {
          return false;
        }
        if (child.nodeType === 3) {
          if (!merging) {
            offset += 1;
            merging = true;
          }
        } else {
          offset += 1;
          merging = false;
        }
        return null;
      });
      return offset;
    };

    UndoManager.prototype._getNodePosition = function(node, offset) {
      var position, prevNode,
        _this = this;
      if (node.nodeType === 3) {
        prevNode = node.previousSibling;
        while (prevNode && prevNode.nodeType === 3) {
          node = prevNode;
          offset += this.editor.util.getNodeLength(prevNode);
          prevNode = prevNode.previousSibling;
        }
      } else {
        offset = this._getNodeOffset(node, offset);
      }
      position = [];
      position.unshift(offset);
      this.editor.util.traverseUp(function(n) {
        return position.unshift(_this._getNodeOffset(n));
      }, node);
      return position;
    };

    UndoManager.prototype._getNodeByPosition = function(position) {
      var child, childNodes, i, node, offset, _i, _len, _ref;
      node = this.editor.body[0];
      _ref = position.slice(0, position.length - 1);
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        offset = _ref[i];
        childNodes = node.childNodes;
        if (offset > childNodes.length - 1) {
          if (i === position.length - 2 && $(node).is('pre')) {
            child = document.createTextNode('');
            node.appendChild(child);
            childNodes = node.childNodes;
          } else {
            node = null;
            break;
          }
        }
        node = childNodes[offset];
      }
      return node;
    };

    UndoManager.prototype.caretPosition = function(caret) {
      var endContainer, endOffset, range, startContainer, startOffset;
      if (!caret) {
        range = this.editor.selection.getRange();
        if (!(this.editor.inputManager.focused && (range != null))) {
          return {};
        }
        caret = {
          start: [],
          end: null,
          collapsed: true
        };
        caret.start = this._getNodePosition(range.startContainer, range.startOffset);
        if (!range.collapsed) {
          caret.end = this._getNodePosition(range.endContainer, range.endOffset);
          caret.collapsed = false;
        }
        return caret;
      } else {
        if (!this.editor.inputManager.focused) {
          this.editor.body.focus();
        }
        if (!caret.start) {
          this.editor.body.blur();
          return;
        }
        startContainer = this._getNodeByPosition(caret.start);
        startOffset = caret.start[caret.start.length - 1];
        if (caret.collapsed) {
          endContainer = startContainer;
          endOffset = startOffset;
        } else {
          endContainer = this._getNodeByPosition(caret.end);
          endOffset = caret.start[caret.start.length - 1];
        }
        if (!startContainer || !endContainer) {
          throw new Error('simditor: invalid caret state');
          return;
        }
        range = document.createRange();
        range.setStart(startContainer, startOffset);
        range.setEnd(endContainer, endOffset);
        return this.editor.selection.selectRange(range);
      }
    };

    return UndoManager;

  })(Plugin);

  Util = (function(_super) {
    __extends(Util, _super);

    Util.className = 'Util';

    function Util() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      Util.__super__.constructor.apply(this, args);
      if (this.browser.msie) {
        this.phBr = '';
      }
      this.editor = this.widget;
    }

    Util.prototype._init = function() {};

    Util.prototype.phBr = '<br/>';

    Util.prototype.os = (function() {
      if (/Mac/.test(navigator.appVersion)) {
        return {
          mac: true
        };
      } else if (/Linux/.test(navigator.appVersion)) {
        return {
          linux: true
        };
      } else if (/Win/.test(navigator.appVersion)) {
        return {
          win: true
        };
      } else if (/X11/.test(navigator.appVersion)) {
        return {
          unix: true
        };
      } else {
        return {};
      }
    })();

    Util.prototype.browser = (function() {
      var chrome, firefox, ie, safari, ua;
      ua = navigator.userAgent;
      ie = /(msie|trident)/i.test(ua);
      chrome = /chrome|crios/i.test(ua);
      safari = /safari/i.test(ua) && !chrome;
      firefox = /firefox/i.test(ua);
      if (ie) {
        return {
          msie: true,
          version: ua.match(/(msie |rv:)(\d+(\.\d+)?)/i)[2]
        };
      } else if (chrome) {
        return {
          webkit: true,
          chrome: true,
          version: ua.match(/(?:chrome|crios)\/(\d+(\.\d+)?)/i)[1]
        };
      } else if (safari) {
        return {
          webkit: true,
          safari: true,
          version: ua.match(/version\/(\d+(\.\d+)?)/i)[1]
        };
      } else if (firefox) {
        return {
          mozilla: true,
          firefox: true,
          version: ua.match(/firefox\/(\d+(\.\d+)?)/i)[1]
        };
      } else {
        return {};
      }
    })();

    Util.prototype.metaKey = function(e) {
      var isMac;
      isMac = /Mac/.test(navigator.userAgent);
      if (isMac) {
        return e.metaKey;
      } else {
        return e.ctrlKey;
      }
    };

    Util.prototype.isEmptyNode = function(node) {
      var $node;
      $node = $(node);
      return !$node.text() && !$node.find(':not(br)').length;
    };

    Util.prototype.isBlockNode = function(node) {
      node = $(node)[0];
      if (!node || node.nodeType === 3) {
        return false;
      }
      return /^(div|p|ul|ol|li|blockquote|hr|pre|h1|h2|h3|h4|table)$/.test(node.nodeName.toLowerCase());
    };

    Util.prototype.closestBlockEl = function(node) {
      var $node, blockEl, range,
        _this = this;
      if (node == null) {
        range = this.editor.selection.getRange();
        node = range != null ? range.commonAncestorContainer : void 0;
      }
      $node = $(node);
      if (!$node.length) {
        return null;
      }
      blockEl = $node.parentsUntil(this.editor.body).addBack();
      blockEl = blockEl.filter(function(i) {
        return _this.isBlockNode(blockEl.eq(i));
      });
      if (blockEl.length) {
        return blockEl.last();
      } else {
        return null;
      }
    };

    Util.prototype.furthestNode = function(node, filter) {
      var $node, blockEl, range,
        _this = this;
      if (node == null) {
        range = this.editor.selection.getRange();
        node = range != null ? range.commonAncestorContainer : void 0;
      }
      $node = $(node);
      if (!$node.length) {
        return null;
      }
      blockEl = $node.parentsUntil(this.editor.body).addBack();
      blockEl = blockEl.filter(function(i) {
        var $n;
        $n = blockEl.eq(i);
        if ($.isFunction(filter)) {
          return filter($n);
        } else {
          return $n.is(filter);
        }
      });
      if (blockEl.length) {
        return blockEl.first();
      } else {
        return null;
      }
    };

    Util.prototype.furthestBlockEl = function(node) {
      return this.furthestNode(node, this.isBlockNode);
    };

    Util.prototype.getNodeLength = function(node) {
      switch (node.nodeType) {
        case 7:
        case 10:
          return 0;
        case 3:
        case 8:
          return node.length;
        default:
          return node.childNodes.length;
      }
    };

    Util.prototype.traverseUp = function(callback, node) {
      var n, nodes, range, result, _i, _len, _results;
      if (node == null) {
        range = this.editor.selection.getRange();
        node = range != null ? range.commonAncestorContainer : void 0;
      }
      if ((node == null) || !$.contains(this.editor.body[0], node)) {
        return false;
      }
      nodes = $(node).parentsUntil(this.editor.body).get();
      nodes.unshift(node);
      _results = [];
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        n = nodes[_i];
        result = callback(n);
        if (result === false) {
          break;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Util.prototype.getShortcutKey = function(e) {
      var shortcutName;
      shortcutName = [];
      if (e.shiftKey) {
        shortcutName.push('shift');
      }
      if (e.ctrlKey) {
        shortcutName.push('ctrl');
      }
      if (e.altKey) {
        shortcutName.push('alt');
      }
      if (e.metaKey) {
        shortcutName.push('cmd');
      }
      shortcutName.push(e.which);
      return shortcutName.join('+');
    };

    Util.prototype.indent = function() {
      var $blockEl, $childList, $nextTd, $parentLi, $td, indentLevel, range, spaceNode, tagName, _ref;
      $blockEl = this.editor.util.closestBlockEl();
      if (!($blockEl && $blockEl.length > 0)) {
        return false;
      }
      if ($blockEl.is('pre')) {
        spaceNode = document.createTextNode('\u00A0\u00A0');
        this.editor.selection.insertNode(spaceNode);
      } else if ($blockEl.is('li')) {
        $parentLi = $blockEl.prev('li');
        if ($parentLi.length < 1) {
          return false;
        }
        this.editor.selection.save();
        tagName = $blockEl.parent()[0].tagName;
        $childList = $parentLi.children('ul, ol');
        if ($childList.length > 0) {
          $childList.append($blockEl);
        } else {
          $('<' + tagName + '/>').append($blockEl).appendTo($parentLi);
        }
        this.editor.selection.restore();
      } else if ($blockEl.is('p, h1, h2, h3, h4')) {
        indentLevel = (_ref = $blockEl.attr('data-indent')) != null ? _ref : 0;
        indentLevel = indentLevel * 1 + 1;
        if (indentLevel > 10) {
          indentLevel = 10;
        }
        $blockEl.attr('data-indent', indentLevel);
      } else if ($blockEl.is('table')) {
        range = this.editor.selection.getRange();
        $td = $(range.commonAncestorContainer).closest('td');
        $nextTd = $td.next('td');
        if (!($nextTd.length > 0)) {
          $nextTd = $td.parent('tr').next('tr').find('td:first');
        }
        if (!($td.length > 0 && $nextTd.length > 0)) {
          return false;
        }
        this.editor.selection.setRangeAtEndOf($nextTd);
      } else {
        spaceNode = document.createTextNode('\u00A0\u00A0\u00A0\u00A0');
        this.editor.selection.insertNode(spaceNode);
      }
      this.editor.trigger('valuechanged');
      this.editor.trigger('selectionchanged');
      return true;
    };

    Util.prototype.outdent = function() {
      var $blockEl, $parent, $parentLi, $prevTd, $td, button, indentLevel, range, _ref;
      $blockEl = this.editor.util.closestBlockEl();
      if (!($blockEl && $blockEl.length > 0)) {
        return false;
      }
      if ($blockEl.is('pre')) {
        return false;
      } else if ($blockEl.is('li')) {
        $parent = $blockEl.parent();
        $parentLi = $parent.parent('li');
        if ($parentLi.length < 1) {
          button = this.editor.toolbar.findButton($parent[0].tagName.toLowerCase());
          if (button != null) {
            button.command();
          }
          return false;
        }
        this.editor.selection.save();
        if ($blockEl.next('li').length > 0) {
          $('<' + $parent[0].tagName + '/>').append($blockEl.nextAll('li')).appendTo($blockEl);
        }
        $blockEl.insertAfter($parentLi);
        if ($parent.children('li').length < 1) {
          $parent.remove();
        }
        this.editor.selection.restore();
      } else if ($blockEl.is('p, h1, h2, h3, h4')) {
        indentLevel = (_ref = $blockEl.attr('data-indent')) != null ? _ref : 0;
        indentLevel = indentLevel * 1 - 1;
        if (indentLevel < 0) {
          indentLevel = 0;
        }
        $blockEl.attr('data-indent', indentLevel);
      } else if ($blockEl.is('table')) {
        range = this.editor.selection.getRange();
        $td = $(range.commonAncestorContainer).closest('td');
        $prevTd = $td.prev('td');
        if (!($prevTd.length > 0)) {
          $prevTd = $td.parent('tr').prev('tr').find('td:last');
        }
        if (!($td.length > 0 && $prevTd.length > 0)) {
          return false;
        }
        this.editor.selection.setRangeAtEndOf($prevTd);
      } else {
        return false;
      }
      this.editor.trigger('valuechanged');
      this.editor.trigger('selectionchanged');
      return true;
    };

    return Util;

  })(Plugin);

  Toolbar = (function(_super) {
    __extends(Toolbar, _super);

    Toolbar.className = 'Toolbar';

    Toolbar.prototype.opts = {
      toolbar: true,
      toolbarFloat: true
    };

    Toolbar.prototype._tpl = {
      wrapper: '<div class="simditor-toolbar"><ul></ul></div>',
      separator: '<li><span class="separator"></span></li>'
    };

    function Toolbar() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      Toolbar.__super__.constructor.apply(this, args);
      this.editor = this.widget;
    }

    Toolbar.prototype._init = function() {
      var _this = this;
      if (!this.opts.toolbar) {
        return;
      }
      if (!$.isArray(this.opts.toolbar)) {
        this.opts.toolbar = ['bold', 'italic', 'underline', '|', 'ol', 'ul', 'blockquote', 'code', '|', 'link', 'image', '|', 'indent', 'outdent'];
      }
      this._render();
      this.list.on('click', function(e) {
        return false;
      });
      this.wrapper.on('mousedown', function(e) {
        return _this.list.find('.menu-on').removeClass('.menu-on');
      });
      $(document).on('mousedown.simditor', function(e) {
        return _this.list.find('.menu-on').removeClass('.menu-on');
      });
      if (this.opts.toolbarFloat) {
        $(window).on('scroll.simditor-' + this.editor.id, function(e) {
          var bottomEdge, scrollTop, top, topEdge;
          topEdge = _this.editor.wrapper.offset().top;
          bottomEdge = topEdge + _this.editor.wrapper.outerHeight() - 100;
          scrollTop = $(document).scrollTop();
          top = 0;
          if (scrollTop <= topEdge) {
            top = 0;
            _this.wrapper.removeClass('floating');
          } else if ((bottomEdge > scrollTop && scrollTop > topEdge)) {
            top = scrollTop - topEdge;
            _this.wrapper.addClass('floating');
          } else {
            top = bottomEdge - topEdge;
            _this.wrapper.addClass('floating');
          }
          return _this.wrapper.css('top', top);
        });
      }
      this.editor.on('selectionchanged', function() {
        return _this.toolbarStatus();
      });
      this.editor.on('destroy', function() {
        return _this.buttons.length = 0;
      });
      return $(document).on('mousedown.simditor-' + this.editor.id, function(e) {
        return _this.list.find('li.menu-on').removeClass('menu-on');
      });
    };

    Toolbar.prototype._render = function() {
      var name, _i, _len, _ref, _results;
      this.buttons = [];
      this.wrapper = $(this._tpl.wrapper).prependTo(this.editor.wrapper);
      this.list = this.wrapper.find('ul');
      this.editor.wrapper.addClass('toolbar-enabled');
      _ref = this.opts.toolbar;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        if (name === '|') {
          $(this._tpl.separator).appendTo(this.list);
          continue;
        }
        if (!this.constructor.buttons[name]) {
          throw new Error('simditor: invalid toolbar button "' + name + '"');
          continue;
        }
        _results.push(this.buttons.push(new this.constructor.buttons[name](this.editor)));
      }
      return _results;
    };

    Toolbar.prototype.toolbarStatus = function(name) {
      var buttons,
        _this = this;
      if (!this.editor.inputManager.focused) {
        return;
      }
      buttons = this.buttons.slice(0);
      return this.editor.util.traverseUp(function(node) {
        var button, i, removeButtons, _i, _j, _len, _len1;
        removeButtons = [];
        for (i = _i = 0, _len = buttons.length; _i < _len; i = ++_i) {
          button = buttons[i];
          if ((name != null) && button.name !== name) {
            continue;
          }
          if (!button.status || button.status($(node)) === true) {
            removeButtons.push(button);
          }
        }
        for (_j = 0, _len1 = removeButtons.length; _j < _len1; _j++) {
          button = removeButtons[_j];
          i = $.inArray(button, buttons);
          buttons.splice(i, 1);
        }
        if (buttons.length === 0) {
          return false;
        }
      });
    };

    Toolbar.prototype.findButton = function(name) {
      var button;
      button = this.list.find('.toolbar-item-' + name).data('button');
      return button != null ? button : null;
    };

    Toolbar.addButton = function(btn) {
      return this.buttons[btn.prototype.name] = btn;
    };

    Toolbar.buttons = {};

    return Toolbar;

  })(Plugin);

  Simditor = (function(_super) {
    __extends(Simditor, _super);

    function Simditor() {
      _ref = Simditor.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Simditor.connect(Util);

    Simditor.connect(UndoManager);

    Simditor.connect(InputManager);

    Simditor.connect(Keystroke);

    Simditor.connect(Formatter);

    Simditor.connect(Selection);

    Simditor.connect(Toolbar);

    Simditor.count = 0;

    Simditor.prototype.opts = {
      textarea: null,
      placeholder: false,
      defaultImage: 'images/image.png',
      params: null,
      upload: false
    };

    Simditor.prototype._init = function() {
      var editor, form, uploadOpts, _ref1,
        _this = this;
      this.textarea = $(this.opts.textarea);
      this.opts.placeholder = (_ref1 = this.opts.placeholder) != null ? _ref1 : this.textarea.attr('placeholder');
      if (!this.textarea.length) {
        throw new Error('simditor: param textarea is required.');
        return;
      }
      editor = this.textarea.data('simditor');
      if (editor != null) {
        editor.destroy();
      }
      this.id = ++Simditor.count;
      this._render();
      if (this.opts.upload && Uploader) {
        uploadOpts = typeof this.opts.upload === 'object' ? this.opts.upload : {};
        this.uploader = new Uploader(uploadOpts);
      }
      form = this.textarea.closest('form');
      if (form.length) {
        form.on('submit.simditor-' + this.id, function() {
          return _this.sync();
        });
        form.on('reset.simditor-' + this.id, function() {
          return _this.setValue('');
        });
      }
      return this.on('pluginconnected', function() {
        _this.setValue(_this.textarea.val() || '');
        if (_this.opts.placeholder) {
          _this.on('valuechanged', function() {
            return _this._placeholder();
          });
        }
        return setTimeout(function() {
          return _this.trigger('valuechanged');
        }, 0);
      });
    };

    Simditor.prototype._tpl = "<div class=\"simditor\">\n  <div class=\"simditor-wrapper\">\n    <div class=\"simditor-placeholder\"></div>\n    <div class=\"simditor-body\" contenteditable=\"true\">\n    </div>\n  </div>\n</div>";

    Simditor.prototype._render = function() {
      var key, val, _ref1, _results;
      this.el = $(this._tpl).insertBefore(this.textarea);
      this.wrapper = this.el.find('.simditor-wrapper');
      this.body = this.wrapper.find('.simditor-body');
      this.placeholderEl = this.wrapper.find('.simditor-placeholder').append(this.opts.placeholder);
      this.el.append(this.textarea).data('simditor', this);
      this.textarea.data('simditor', this).hide().blur();
      this.body.attr('tabindex', this.textarea.attr('tabindex'));
      if (this.util.os.mac) {
        this.el.addClass('simditor-mac');
      } else if (this.util.os.linux) {
        this.el.addClass('simditor-linux');
      }
      if (this.opts.params) {
        _ref1 = this.opts.params;
        _results = [];
        for (key in _ref1) {
          val = _ref1[key];
          _results.push($('<input/>', {
            type: 'hidden',
            name: key,
            value: val
          }).insertAfter(this.textarea));
        }
        return _results;
      }
    };

    Simditor.prototype._placeholder = function() {
      var children, _ref1;
      children = this.body.children();
      if (children.length === 0 || (children.length === 1 && this.util.isEmptyNode(children) && ((_ref1 = children.data('indent')) != null ? _ref1 : 0) < 1)) {
        return this.placeholderEl.show();
      } else {
        return this.placeholderEl.hide();
      }
    };

    Simditor.prototype.setValue = function(val) {
      this.textarea.val(val);
      this.body.html(val);
      this.formatter.format();
      return this.formatter.decorate();
    };

    Simditor.prototype.getValue = function() {
      return this.sync();
    };

    Simditor.prototype.sync = function() {
      var cloneBody, emptyP, lastP, val;
      cloneBody = this.body.clone();
      this.formatter.undecorate(cloneBody);
      this.formatter.format(cloneBody);
      this.formatter.autolink(cloneBody);
      lastP = cloneBody.children().last('p');
      while (lastP.is('p') && !lastP.text() && !lastP.find('img').length) {
        emptyP = lastP;
        lastP = lastP.prev('p');
        emptyP.remove();
      }
      val = $.trim(cloneBody.html());
      this.textarea.val(val);
      return val;
    };

    Simditor.prototype.focus = function() {
      var $blockEl, range;
      $blockEl = this.body.find('p, li, pre, h1, h2, h3, h4, td').first();
      range = document.createRange();
      this.selection.setRangeAtStartOf($blockEl, range);
      return this.body.focus();
    };

    Simditor.prototype.blur = function() {
      return this.body.blur();
    };

    Simditor.prototype.hidePopover = function() {
      var _this = this;
      return this.wrapper.find('.simditor-popover').each(function(i, popover) {
        popover = $(popover).data('popover');
        if (popover.active) {
          return popover.hide();
        }
      });
    };

    Simditor.prototype.destroy = function() {
      this.triggerHandler('destroy');
      this.textarea.closest('form').off('.simditor .simditor-' + this.id);
      this.selection.clear();
      this.textarea.insertBefore(this.el).hide().val('').removeData('simditor');
      this.el.remove();
      $(document).off('.simditor-' + this.id);
      $(window).off('.simditor-' + this.id);
      return this.off();
    };

    return Simditor;

  })(Widget);

  window.Simditor = Simditor;

  Button = (function(_super) {
    __extends(Button, _super);

    Button.prototype._tpl = {
      item: '<li><a tabindex="-1" unselectable="on" class="toolbar-item" href="javascript:;"><span></span></a></li>',
      menuWrapper: '<div class="toolbar-menu"></div>',
      menuItem: '<li><a tabindex="-1" unselectable="on" class="menu-item" href="javascript:;"><span></span></a></li>',
      separator: '<li><span class="separator"></span></li>'
    };

    Button.prototype.name = '';

    Button.prototype.icon = '';

    Button.prototype.title = '';

    Button.prototype.text = '';

    Button.prototype.htmlTag = '';

    Button.prototype.disableTag = '';

    Button.prototype.menu = false;

    Button.prototype.active = false;

    Button.prototype.disabled = false;

    Button.prototype.needFocus = true;

    Button.prototype.shortcut = null;

    function Button(editor) {
      var tag, _i, _len, _ref1,
        _this = this;
      this.editor = editor;
      this.render();
      this.el.on('mousedown', function(e) {
        var param;
        e.preventDefault();
        if (_this.menu) {
          _this.wrapper.toggleClass('menu-on').siblings('li').removeClass('menu-on');
          return false;
        }
        if (_this.el.hasClass('disabled') || (_this.needFocus && !_this.editor.inputManager.focused)) {
          return false;
        }
        param = _this.el.data('param');
        _this.command(param);
        return false;
      });
      this.wrapper.on('mousedown', 'a.menu-item', function(e) {
        var btn, param;
        e.preventDefault();
        btn = $(e.currentTarget);
        _this.wrapper.removeClass('menu-on');
        if (btn.hasClass('disabled') || (_this.needFocus && !_this.editor.inputManager.focused)) {
          return false;
        }
        _this.editor.toolbar.wrapper.removeClass('menu-on');
        param = btn.data('param');
        _this.command(param);
        return false;
      });
      this.editor.on('blur', function() {
        _this.setActive(false);
        return _this.setDisabled(false);
      });
      if (this.shortcut != null) {
        this.editor.inputManager.addShortcut(this.shortcut, function(e) {
          return _this.el.mousedown();
        });
      }
      _ref1 = this.htmlTag.split(',');
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        tag = _ref1[_i];
        tag = $.trim(tag);
        if (tag && $.inArray(tag, this.editor.formatter._allowedTags) < 0) {
          this.editor.formatter._allowedTags.push(tag);
        }
      }
    }

    Button.prototype.render = function() {
      this.wrapper = $(this._tpl.item).appendTo(this.editor.toolbar.list);
      this.el = this.wrapper.find('a.toolbar-item');
      this.el.attr('title', this.title).addClass('toolbar-item-' + this.name).data('button', this);
      this.el.find('span').addClass(this.icon ? 'fa fa-' + this.icon : '').text(this.text);
      if (!this.menu) {
        return;
      }
      this.menuWrapper = $(this._tpl.menuWrapper).appendTo(this.wrapper);
      this.menuWrapper.addClass('toolbar-menu-' + this.name);
      return this.renderMenu();
    };

    Button.prototype.renderMenu = function() {
      var $menuBtntnEl, $menuItemEl, menuItem, _i, _len, _ref1, _ref2, _results;
      if (!$.isArray(this.menu)) {
        return;
      }
      this.menuEl = $('<ul/>').appendTo(this.menuWrapper);
      _ref1 = this.menu;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        menuItem = _ref1[_i];
        if (menuItem === '|') {
          $(this._tpl.separator).appendTo(this.menuEl);
          continue;
        }
        $menuItemEl = $(this._tpl.menuItem).appendTo(this.menuEl);
        _results.push($menuBtntnEl = $menuItemEl.find('a.menu-item').attr({
          'title': (_ref2 = menuItem.title) != null ? _ref2 : menuItem.text,
          'data-param': menuItem.param
        }).addClass('menu-item-' + menuItem.name).find('span').text(menuItem.text));
      }
      return _results;
    };

    Button.prototype.setActive = function(active) {
      this.active = active;
      return this.el.toggleClass('active', this.active);
    };

    Button.prototype.setDisabled = function(disabled) {
      this.disabled = disabled;
      return this.el.toggleClass('disabled', this.disabled);
    };

    Button.prototype.status = function($node) {
      if ($node != null) {
        this.setDisabled($node.is(this.disableTag));
      }
      if (this.disabled) {
        return true;
      }
      if ($node != null) {
        this.setActive($node.is(this.htmlTag));
      }
      return this.active;
    };

    Button.prototype.command = function(param) {};

    return Button;

  })(Module);

  window.SimditorButton = Button;

  Popover = (function(_super) {
    __extends(Popover, _super);

    Popover.prototype.offset = {
      top: 4,
      left: 0
    };

    Popover.prototype.target = null;

    Popover.prototype.active = false;

    function Popover(editor) {
      var _this = this;
      this.editor = editor;
      this.el = $('<div class="simditor-popover"></div>').appendTo(this.editor.wrapper).data('popover', this);
      this.render();
      this.editor.on('blur.linkpopover', function() {
        if (_this.active && (_this.target != null)) {
          return _this.target.addClass('selected');
        }
      });
      this.el.on('mouseenter', function(e) {
        return _this.el.addClass('hover');
      });
      this.el.on('mouseleave', function(e) {
        return _this.el.removeClass('hover');
      });
    }

    Popover.prototype.render = function() {};

    Popover.prototype.show = function($target, position) {
      var _this = this;
      if (position == null) {
        position = 'bottom';
      }
      if ($target == null) {
        return;
      }
      this.target = $target;
      this.el.siblings('.simditor-popover').each(function(i, el) {
        var popover;
        popover = $(el).data('popover');
        return popover.hide();
      });
      if (this.active) {
        this.refresh(position);
        return this.trigger('popovershow');
      } else {
        this.active = true;
        this.el.css({
          left: -9999
        }).show();
        return setTimeout(function() {
          _this.refresh(position);
          return _this.trigger('popovershow');
        }, 0);
      }
    };

    Popover.prototype.hide = function() {
      if (!this.active) {
        return;
      }
      if (this.target) {
        this.target.removeClass('selected');
      }
      this.target = null;
      this.active = false;
      this.el.hide();
      return this.trigger('popoverhide');
    };

    Popover.prototype.refresh = function(position) {
      var left, targetH, targetOffset, top, wrapperOffset;
      if (position == null) {
        position = 'bottom';
      }
      wrapperOffset = this.editor.wrapper.offset();
      targetOffset = this.target.offset();
      targetH = this.target.outerHeight();
      if (position === 'bottom') {
        top = targetOffset.top - wrapperOffset.top + targetH;
      } else if (position === 'top') {
        top = targetOffset.top - wrapperOffset.top - this.el.height();
      }
      left = Math.min(targetOffset.left - wrapperOffset.left, this.editor.wrapper.width() - this.el.outerWidth() - 10);
      return this.el.css({
        top: top + this.offset.top,
        left: left + this.offset.left
      });
    };

    Popover.prototype.destroy = function() {
      this.target = null;
      this.active = false;
      this.editor.off('.linkpopover');
      return this.el.remove();
    };

    return Popover;

  })(Module);

  TitleButton = (function(_super) {
    __extends(TitleButton, _super);

    function TitleButton() {
      _ref1 = TitleButton.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    TitleButton.prototype.name = 'title';

    TitleButton.prototype.title = '加粗文字';

    TitleButton.prototype.htmlTag = 'h1, h2, h3, h4';

    TitleButton.prototype.disableTag = 'pre';

    TitleButton.prototype.menu = [
      {
        name: 'normal',
        text: '普通文本',
        param: 'p'
      }, '|', {
        name: 'h1',
        text: '标题 1',
        param: 'h1'
      }, {
        name: 'h2',
        text: '标题 2',
        param: 'h2'
      }, {
        name: 'h3',
        text: '标题 3',
        param: 'h3'
      }
    ];

    TitleButton.prototype.setActive = function(active, param) {
      this.active = active;
      if (active) {
        return this.el.addClass('active active-' + param);
      } else {
        return this.el.removeClass('active active-p active-h1 active-h2 active-h3');
      }
    };

    TitleButton.prototype.status = function($node) {
      var param, _ref2;
      if ($node != null) {
        this.setDisabled($node.is(this.disableTag));
      }
      if (this.disabled) {
        return true;
      }
      if ($node != null) {
        param = (_ref2 = $node[0].tagName) != null ? _ref2.toLowerCase() : void 0;
        this.setActive($node.is(this.htmlTag), param);
      }
      return this.active;
    };

    TitleButton.prototype.command = function(param) {
      var $contents, $endBlock, $startBlock, endNode, node, range, results, startNode, _i, _len, _ref2,
        _this = this;
      range = this.editor.selection.getRange();
      startNode = range.startContainer;
      endNode = range.endContainer;
      $startBlock = this.editor.util.closestBlockEl(startNode);
      $endBlock = this.editor.util.closestBlockEl(endNode);
      this.editor.selection.save();
      range.setStartBefore($startBlock[0]);
      range.setEndAfter($endBlock[0]);
      $contents = $(range.extractContents());
      results = [];
      $contents.children().each(function(i, el) {
        var c, converted, _i, _len, _results;
        converted = _this._convertEl(el, param);
        _results = [];
        for (_i = 0, _len = converted.length; _i < _len; _i++) {
          c = converted[_i];
          _results.push(results.push(c));
        }
        return _results;
      });
      _ref2 = results.reverse();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        node = _ref2[_i];
        range.insertNode(node[0]);
      }
      this.editor.selection.restore();
      this.editor.trigger('valuechanged');
      return this.editor.trigger('selectionchanged');
    };

    TitleButton.prototype._convertEl = function(el, param) {
      var $block, $el, results;
      $el = $(el);
      results = [];
      if ($el.is(param)) {
        results.push($el);
      } else {
        $block = $('<' + param + '/>').append($el.contents());
        results.push($block);
      }
      return results;
    };

    return TitleButton;

  })(Button);

  Simditor.Toolbar.addButton(TitleButton);

  BoldButton = (function(_super) {
    __extends(BoldButton, _super);

    function BoldButton() {
      _ref2 = BoldButton.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    BoldButton.prototype.name = 'bold';

    BoldButton.prototype.icon = 'bold';

    BoldButton.prototype.title = '加粗文字';

    BoldButton.prototype.htmlTag = 'b, strong';

    BoldButton.prototype.disableTag = 'pre';

    BoldButton.prototype.shortcut = 'cmd+66';

    BoldButton.prototype.status = function($node) {
      var active;
      if ($node != null) {
        this.setDisabled($node.is(this.disableTag));
      }
      if (this.disabled) {
        return true;
      }
      active = document.queryCommandState('bold') === true;
      this.setActive(active);
      return active;
    };

    BoldButton.prototype.command = function() {
      document.execCommand('bold');
      this.editor.trigger('valuechanged');
      return this.editor.trigger('selectionchanged');
    };

    return BoldButton;

  })(Button);

  Simditor.Toolbar.addButton(BoldButton);

  ItalicButton = (function(_super) {
    __extends(ItalicButton, _super);

    function ItalicButton() {
      _ref3 = ItalicButton.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    ItalicButton.prototype.name = 'italic';

    ItalicButton.prototype.icon = 'italic';

    ItalicButton.prototype.title = '斜体文字';

    ItalicButton.prototype.htmlTag = 'i';

    ItalicButton.prototype.disableTag = 'pre';

    ItalicButton.prototype.shortcut = 'cmd+73';

    ItalicButton.prototype.status = function($node) {
      var active;
      if ($node != null) {
        this.setDisabled($node.is(this.disableTag));
      }
      if (this.disabled) {
        return this.disabled;
      }
      active = document.queryCommandState('italic') === true;
      this.setActive(active);
      return active;
    };

    ItalicButton.prototype.command = function() {
      document.execCommand('italic');
      this.editor.trigger('valuechanged');
      return this.editor.trigger('selectionchanged');
    };

    return ItalicButton;

  })(Button);

  Simditor.Toolbar.addButton(ItalicButton);

  UnderlineButton = (function(_super) {
    __extends(UnderlineButton, _super);

    function UnderlineButton() {
      _ref4 = UnderlineButton.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    UnderlineButton.prototype.name = 'underline';

    UnderlineButton.prototype.icon = 'underline';

    UnderlineButton.prototype.title = '下划线文字';

    UnderlineButton.prototype.htmlTag = 'u';

    UnderlineButton.prototype.disableTag = 'pre';

    UnderlineButton.prototype.shortcut = 'cmd+85';

    UnderlineButton.prototype.status = function($node) {
      var active;
      if ($node != null) {
        this.setDisabled($node.is(this.disableTag));
      }
      if (this.disabled) {
        return this.disabled;
      }
      active = document.queryCommandState('underline') === true;
      this.setActive(active);
      return active;
    };

    UnderlineButton.prototype.command = function() {
      document.execCommand('underline');
      this.editor.trigger('valuechanged');
      return this.editor.trigger('selectionchanged');
    };

    return UnderlineButton;

  })(Button);

  Simditor.Toolbar.addButton(UnderlineButton);

  ListButton = (function(_super) {
    __extends(ListButton, _super);

    function ListButton() {
      _ref5 = ListButton.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    ListButton.prototype.type = '';

    ListButton.prototype.disableTag = 'pre';

    ListButton.prototype.status = function($node) {
      var anotherType;
      if ($node != null) {
        this.setDisabled($node.is(this.disableTag));
      }
      if (this.disabled) {
        return true;
      }
      if ($node == null) {
        return this.active;
      }
      anotherType = this.type === 'ul' ? 'ol' : 'ul';
      if ($node.is(anotherType)) {
        this.setActive(false);
        return true;
      } else {
        this.setActive($node.is(this.htmlTag));
        return this.active;
      }
    };

    ListButton.prototype.command = function(param) {
      var $contents, $endBlock, $furthestEnd, $furthestStart, $parent, $startBlock, endLevel, endNode, getListLevel, node, range, results, startLevel, startNode, _i, _len, _ref6,
        _this = this;
      range = this.editor.selection.getRange();
      startNode = range.startContainer;
      endNode = range.endContainer;
      $startBlock = this.editor.util.closestBlockEl(startNode);
      $endBlock = this.editor.util.closestBlockEl(endNode);
      this.editor.selection.save();
      range.setStartBefore($startBlock[0]);
      range.setEndAfter($endBlock[0]);
      if ($startBlock.is('li') && $endBlock.is('li')) {
        $furthestStart = this.editor.util.furthestNode($startBlock, 'ul, ol');
        $furthestEnd = this.editor.util.furthestNode($endBlock, 'ul, ol');
        if ($furthestStart.is($furthestEnd)) {
          getListLevel = function($li) {
            var lvl;
            lvl = 1;
            while (!$li.parent().is($furthestStart)) {
              lvl += 1;
              $li = $li.parent();
            }
            return lvl;
          };
          startLevel = getListLevel($startBlock);
          endLevel = getListLevel($endBlock);
          if (startLevel > endLevel) {
            $parent = $endBlock.parent();
          } else {
            $parent = $startBlock.parent();
          }
          range.setStartBefore($parent[0]);
          range.setEndAfter($parent[0]);
        } else {
          range.setStartBefore($furthestStart[0]);
          range.setEndAfter($furthestEnd[0]);
        }
      }
      $contents = $(range.extractContents());
      results = [];
      $contents.children().each(function(i, el) {
        var c, converted, _i, _len, _results;
        converted = _this._convertEl(el);
        _results = [];
        for (_i = 0, _len = converted.length; _i < _len; _i++) {
          c = converted[_i];
          if (results.length && results[results.length - 1].is(_this.type) && c.is(_this.type)) {
            _results.push(results[results.length - 1].append(c.children()));
          } else {
            _results.push(results.push(c));
          }
        }
        return _results;
      });
      _ref6 = results.reverse();
      for (_i = 0, _len = _ref6.length; _i < _len; _i++) {
        node = _ref6[_i];
        range.insertNode(node[0]);
      }
      this.editor.selection.restore();
      this.editor.trigger('valuechanged');
      return this.editor.trigger('selectionchanged');
    };

    ListButton.prototype._convertEl = function(el) {
      var $el, anotherType, block, child, children, results, _i, _len, _ref6,
        _this = this;
      $el = $(el);
      results = [];
      anotherType = this.type === 'ul' ? 'ol' : 'ul';
      if ($el.is(this.type)) {
        $el.children('li').each(function(i, li) {
          var $childList, $li, block;
          $li = $(li);
          $childList = $li.children('ul, ol').remove();
          block = $('<p/>').append($(li).html() || _this.editor.util.phBr);
          results.push(block);
          if ($childList.length > 0) {
            return results.push($childList);
          }
        });
      } else if ($el.is(anotherType)) {
        block = $('<' + this.type + '/>').append($el.html());
        results.push(block);
      } else if ($el.is('blockquote')) {
        _ref6 = $el.children().get();
        for (_i = 0, _len = _ref6.length; _i < _len; _i++) {
          child = _ref6[_i];
          children = this._convertEl(child);
        }
        $.merge(results, children);
      } else if ($el.is('table')) {

      } else {
        block = $('<' + this.type + '><li></li></' + this.type + '>');
        block.find('li').append($el.html() || this.editor.util.phBr);
        results.push(block);
      }
      return results;
    };

    return ListButton;

  })(Button);

  OrderListButton = (function(_super) {
    __extends(OrderListButton, _super);

    function OrderListButton() {
      _ref6 = OrderListButton.__super__.constructor.apply(this, arguments);
      return _ref6;
    }

    OrderListButton.prototype.type = 'ol';

    OrderListButton.prototype.name = 'ol';

    OrderListButton.prototype.title = '有序列表';

    OrderListButton.prototype.icon = 'list-ol';

    OrderListButton.prototype.htmlTag = 'ol';

    return OrderListButton;

  })(ListButton);

  UnorderListButton = (function(_super) {
    __extends(UnorderListButton, _super);

    function UnorderListButton() {
      _ref7 = UnorderListButton.__super__.constructor.apply(this, arguments);
      return _ref7;
    }

    UnorderListButton.prototype.type = 'ul';

    UnorderListButton.prototype.name = 'ul';

    UnorderListButton.prototype.title = '无序列表';

    UnorderListButton.prototype.icon = 'list-ul';

    UnorderListButton.prototype.htmlTag = 'ul';

    return UnorderListButton;

  })(ListButton);

  Simditor.Toolbar.addButton(OrderListButton);

  Simditor.Toolbar.addButton(UnorderListButton);

  BlockquoteButton = (function(_super) {
    __extends(BlockquoteButton, _super);

    function BlockquoteButton() {
      _ref8 = BlockquoteButton.__super__.constructor.apply(this, arguments);
      return _ref8;
    }

    BlockquoteButton.prototype.name = 'blockquote';

    BlockquoteButton.prototype.icon = 'quote-left';

    BlockquoteButton.prototype.title = '引用';

    BlockquoteButton.prototype.htmlTag = 'blockquote';

    BlockquoteButton.prototype.disableTag = 'pre';

    BlockquoteButton.prototype.command = function() {
      var $contents, $endBlock, $startBlock, endNode, node, range, results, startNode, _i, _len, _ref9,
        _this = this;
      range = this.editor.selection.getRange();
      startNode = range.startContainer;
      endNode = range.endContainer;
      $startBlock = this.editor.util.furthestBlockEl(startNode);
      $endBlock = this.editor.util.furthestBlockEl(endNode);
      this.editor.selection.save();
      range.setStartBefore($startBlock[0]);
      range.setEndAfter($endBlock[0]);
      $contents = $(range.extractContents());
      results = [];
      $contents.children().each(function(i, el) {
        var c, converted, _i, _len, _results;
        converted = _this._convertEl(el);
        _results = [];
        for (_i = 0, _len = converted.length; _i < _len; _i++) {
          c = converted[_i];
          if (results.length && results[results.length - 1].is(_this.htmlTag) && c.is(_this.htmlTag)) {
            _results.push(results[results.length - 1].append(c.children()));
          } else {
            _results.push(results.push(c));
          }
        }
        return _results;
      });
      _ref9 = results.reverse();
      for (_i = 0, _len = _ref9.length; _i < _len; _i++) {
        node = _ref9[_i];
        range.insertNode(node[0]);
      }
      this.editor.selection.restore();
      this.editor.trigger('valuechanged');
      return this.editor.trigger('selectionchanged');
    };

    BlockquoteButton.prototype._convertEl = function(el) {
      var $el, block, results,
        _this = this;
      $el = $(el);
      results = [];
      if ($el.is(this.htmlTag)) {
        $el.children().each(function(i, node) {
          return results.push($(node));
        });
      } else {
        block = $('<' + this.htmlTag + '/>').append($el);
        results.push(block);
      }
      return results;
    };

    return BlockquoteButton;

  })(Button);

  Simditor.Toolbar.addButton(BlockquoteButton);

  CodeButton = (function(_super) {
    __extends(CodeButton, _super);

    function CodeButton() {
      _ref9 = CodeButton.__super__.constructor.apply(this, arguments);
      return _ref9;
    }

    CodeButton.prototype.name = 'code';

    CodeButton.prototype.icon = 'code';

    CodeButton.prototype.title = '插入代码';

    CodeButton.prototype.htmlTag = 'pre';

    CodeButton.prototype.disableTag = 'li';

    CodeButton.prototype.render = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      CodeButton.__super__.render.apply(this, args);
      return this.popover = new CodePopover(this.editor);
    };

    CodeButton.prototype.status = function($node) {
      var result;
      result = CodeButton.__super__.status.call(this, $node);
      if (this.active) {
        this.popover.show($node);
      } else if (this.editor.util.isBlockNode($node)) {
        this.popover.hide();
      }
      return result;
    };

    CodeButton.prototype.command = function() {
      var $contents, $endBlock, $startBlock, endNode, node, range, results, startNode, _i, _len, _ref10,
        _this = this;
      range = this.editor.selection.getRange();
      startNode = range.startContainer;
      endNode = range.endContainer;
      $startBlock = this.editor.util.closestBlockEl(startNode);
      $endBlock = this.editor.util.closestBlockEl(endNode);
      range.setStartBefore($startBlock[0]);
      range.setEndAfter($endBlock[0]);
      $contents = $(range.extractContents());
      results = [];
      $contents.children().each(function(i, el) {
        var c, converted, _i, _len, _results;
        converted = _this._convertEl(el);
        _results = [];
        for (_i = 0, _len = converted.length; _i < _len; _i++) {
          c = converted[_i];
          if (results.length && results[results.length - 1].is(_this.htmlTag) && c.is(_this.htmlTag)) {
            _results.push(results[results.length - 1].append(c.contents()));
          } else {
            _results.push(results.push(c));
          }
        }
        return _results;
      });
      _ref10 = results.reverse();
      for (_i = 0, _len = _ref10.length; _i < _len; _i++) {
        node = _ref10[_i];
        range.insertNode(node[0]);
      }
      this.editor.selection.setRangeAtEndOf(results[0]);
      this.editor.trigger('valuechanged');
      return this.editor.trigger('selectionchanged');
    };

    CodeButton.prototype._convertEl = function(el) {
      var $el, block, codeStr, results;
      $el = $(el);
      results = [];
      if ($el.is(this.htmlTag)) {
        block = $('<p/>').append($el.html().replace('\n', '<br/>'));
        results.push(block);
      } else {
        if ($el.children().length === 1 && $el.children().is('br')) {
          codeStr = '';
        } else {
          codeStr = this.editor.formatter.clearHtml($el);
        }
        block = $('<' + this.htmlTag + '/>').append(codeStr);
        results.push(block);
      }
      return results;
    };

    return CodeButton;

  })(Button);

  CodePopover = (function(_super) {
    __extends(CodePopover, _super);

    function CodePopover() {
      _ref10 = CodePopover.__super__.constructor.apply(this, arguments);
      return _ref10;
    }

    CodePopover.prototype._tpl = "<div class=\"code-settings\">\n  <div class=\"settings-field\">\n    <select class=\"select-lang\">\n      <option value=\"-1\">选择程序语言</option>\n      <option value=\"c++\">C++</option>\n      <option value=\"css\">CSS</option>\n      <option value=\"coffeeScript\">CoffeeScript</option>\n      <option value=\"html\">Html,XML</option>\n      <option value=\"json\">JSON</option>\n      <option value=\"java\">Java</option>\n      <option value=\"js\">JavaScript</option>\n      <option value=\"markdown\">Markdown</option>\n      <option value=\"oc\">Objective C</option>\n      <option value=\"php\">PHP</option>\n      <option value=\"perl\">Perl</option>\n      <option value=\"python\">Python</option>\n      <option value=\"ruby\">Ruby</option>\n      <option value=\"sql\">SQL</option>\n    </select>\n  </div>\n</div>";

    CodePopover.prototype.render = function() {
      var _this = this;
      this.el.addClass('code-popover').append(this._tpl);
      this.selectEl = this.el.find('.select-lang');
      return this.selectEl.on('change', function(e) {
        var lang, oldLang;
        lang = _this.selectEl.val();
        oldLang = _this.target.attr('data-lang');
        _this.target.removeClass('lang-' + oldLang).removeAttr('data-lang');
        if (_this.lang !== -1) {
          _this.target.addClass('lang-' + lang);
          return _this.target.attr('data-lang', lang);
        }
      });
    };

    CodePopover.prototype.show = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      CodePopover.__super__.show.apply(this, args);
      this.lang = this.target.attr('data-lang');
      if (this.lang != null) {
        return this.selectEl.val(this.lang);
      }
    };

    return CodePopover;

  })(Popover);

  Simditor.Toolbar.addButton(CodeButton);

  LinkButton = (function(_super) {
    __extends(LinkButton, _super);

    function LinkButton() {
      _ref11 = LinkButton.__super__.constructor.apply(this, arguments);
      return _ref11;
    }

    LinkButton.prototype.name = 'link';

    LinkButton.prototype.icon = 'link';

    LinkButton.prototype.title = '插入链接';

    LinkButton.prototype.htmlTag = 'a';

    LinkButton.prototype.disableTag = 'pre';

    LinkButton.prototype.render = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      LinkButton.__super__.render.apply(this, args);
      return this.popover = new LinkPopover(this.editor);
    };

    LinkButton.prototype.status = function($node) {
      var result;
      result = LinkButton.__super__.status.call(this, $node);
      if (this.active) {
        this.popover.show($node);
      } else if (this.editor.util.isBlockNode($node)) {
        this.popover.hide();
      }
      return result;
    };

    LinkButton.prototype.command = function() {
      var $contents, $endBlock, $link, $newBlock, $startBlock, endNode, linkText, range, startNode, txtNode,
        _this = this;
      range = this.editor.selection.getRange();
      if (this.active) {
        $link = $(range.commonAncestorContainer).closest('a');
        txtNode = document.createTextNode($link.text());
        $link.replaceWith(txtNode);
        range.selectNode(txtNode);
      } else {
        startNode = range.startContainer;
        endNode = range.endContainer;
        $startBlock = this.editor.util.closestBlockEl(startNode);
        $endBlock = this.editor.util.closestBlockEl(endNode);
        $contents = $(range.extractContents());
        linkText = this.editor.formatter.clearHtml($contents.contents(), false);
        $link = $('<a/>', {
          href: 'http://www.example.com',
          target: '_blank',
          text: linkText || '链接文字'
        });
        if ($startBlock[0] === $endBlock[0]) {
          range.insertNode($link[0]);
        } else {
          $newBlock = $('<p/>').append($link);
          range.insertNode($newBlock[0]);
        }
        range.selectNodeContents($link[0]);
      }
      this.editor.selection.selectRange(range);
      this.popover.one('popovershow', function() {
        if (linkText) {
          _this.popover.urlEl.focus();
          return _this.popover.urlEl[0].select();
        } else {
          _this.popover.textEl.focus();
          return _this.popover.textEl[0].select();
        }
      });
      this.editor.trigger('valuechanged');
      return this.editor.trigger('selectionchanged');
    };

    return LinkButton;

  })(Button);

  LinkPopover = (function(_super) {
    __extends(LinkPopover, _super);

    function LinkPopover() {
      _ref12 = LinkPopover.__super__.constructor.apply(this, arguments);
      return _ref12;
    }

    LinkPopover.prototype._tpl = "<div class=\"link-settings\">\n  <div class=\"settings-field\">\n    <label>文本</label>\n    <input class=\"link-text\" type=\"text\"/>\n    <a class=\"btn-unlink\" href=\"javascript:;\" title=\"取消链接\" tabindex=\"-1\"><span class=\"fa fa-unlink\"></span></a>\n  </div>\n  <div class=\"settings-field\">\n    <label>链接</label>\n    <input class=\"link-url\" type=\"text\"/>\n  </div>\n</div>";

    LinkPopover.prototype.render = function() {
      var _this = this;
      this.el.addClass('link-popover').append(this._tpl);
      this.textEl = this.el.find('.link-text');
      this.urlEl = this.el.find('.link-url');
      this.unlinkEl = this.el.find('.btn-unlink');
      this.textEl.on('keyup', function(e) {
        if (e.which === 13) {
          return;
        }
        return _this.target.text(_this.textEl.val());
      });
      this.urlEl.on('keyup', function(e) {
        if (e.which === 13) {
          return;
        }
        return _this.target.attr('href', _this.urlEl.val());
      });
      $([this.urlEl[0], this.textEl[0]]).on('keydown', function(e) {
        if (e.which === 13 || e.which === 27 || (!e.shiftKey && e.which === 9 && $(e.target).hasClass('link-url'))) {
          e.preventDefault();
          return setTimeout(function() {
            var range;
            range = document.createRange();
            _this.editor.selection.setRangeAfter(_this.target, range);
            _this.editor.body.focus();
            _this.hide();
            return _this.editor.trigger('valuechanged');
          }, 0);
        }
      });
      return this.unlinkEl.on('click', function(e) {
        var range, txtNode;
        txtNode = document.createTextNode(_this.target.text());
        _this.target.replaceWith(txtNode);
        _this.hide();
        range = document.createRange();
        _this.editor.selection.setRangeAfter(txtNode, range);
        if (!_this.editor.inputManager.focused) {
          return _this.editor.body.focus();
        }
      });
    };

    LinkPopover.prototype.show = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      LinkPopover.__super__.show.apply(this, args);
      this.textEl.val(this.target.text());
      return this.urlEl.val(this.target.attr('href'));
    };

    return LinkPopover;

  })(Popover);

  Simditor.Toolbar.addButton(LinkButton);

  ImageButton = (function(_super) {
    __extends(ImageButton, _super);

    ImageButton.prototype._wrapperTpl = "<div class=\"simditor-image\" contenteditable=\"false\" tabindex=\"-1\">\n  <div class=\"simditor-image-resize-handle right\"></div>\n  <div class=\"simditor-image-resize-handle bottom\"></div>\n  <div class=\"simditor-image-resize-handle right-bottom\"></div>\n</div>";

    ImageButton.prototype.name = 'image';

    ImageButton.prototype.icon = 'picture-o';

    ImageButton.prototype.title = '插入图片';

    ImageButton.prototype.htmlTag = 'img';

    ImageButton.prototype.disableTag = 'pre, a, b, strong, i, u, table';

    ImageButton.prototype.defaultImage = '';

    ImageButton.prototype.maxWidth = 0;

    ImageButton.prototype.maxHeight = 0;

    function ImageButton() {
      var args,
        _this = this;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      ImageButton.__super__.constructor.apply(this, args);
      this.defaultImage = this.editor.opts.defaultImage;
      this.maxWidth = this.editor.body.width();
      this.maxHeight = $(window).height();
      this.editor.on('decorate', function(e, $el) {
        return $el.find('img').each(function(i, img) {
          return _this.decorate($(img));
        });
      });
      this.editor.on('undecorate', function(e, $el) {
        return $el.find('img').each(function(i, img) {
          return _this.undecorate($(img));
        });
      });
      this.editor.body.on('mousedown', '.simditor-image', function(e) {
        var $imgWrapper;
        $imgWrapper = $(e.currentTarget);
        if ($imgWrapper.hasClass('selected')) {
          _this.popover.srcEl.blur();
          _this.popover.hide();
          $imgWrapper.removeClass('selected');
        } else {
          _this.editor.body.blur();
          _this.editor.body.find('.simditor-image').removeClass('selected');
          $imgWrapper.addClass('selected').focus();
          _this.popover.show($imgWrapper);
        }
        return false;
      });
      this.editor.body.on('click', '.simditor-image', function(e) {
        return false;
      });
      this.editor.on('selectionchanged', function() {
        if (_this.popover.active) {
          return _this.popover.hide();
        }
      });
      this.editor.body.on('keydown', '.simditor-image', function(e) {
        if (e.which !== 8) {
          return;
        }
        _this.popover.hide();
        $(e.currentTarget).remove();
        _this.editor.trigger('valuechanged');
        return false;
      });
    }

    ImageButton.prototype.render = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      ImageButton.__super__.render.apply(this, args);
      return this.popover = new ImagePopover(this);
    };

    ImageButton.prototype.status = function($node) {
      if ($node != null) {
        this.setDisabled($node.is(this.disableTag));
      }
      if (this.disabled) {
        return true;
      }
    };

    ImageButton.prototype.decorate = function($img) {
      var $wrapper;
      $wrapper = $img.parent('.simditor-image');
      if ($wrapper.length > 0) {
        return;
      }
      return $wrapper = $(this._wrapperTpl).insertBefore($img).prepend($img);
    };

    ImageButton.prototype.undecorate = function($img) {
      var $wrapper;
      $wrapper = $img.parent('.simditor-image');
      if ($wrapper.length < 1) {
        return;
      }
      $img.insertAfter($wrapper);
      return $wrapper.remove();
    };

    ImageButton.prototype.loadImage = function($img, src, callback) {
      var $wrapper, img,
        _this = this;
      $wrapper = $img.parent('.simditor-image');
      img = new Image();
      img.onload = function() {
        var height, width;
        width = img.width;
        height = img.height;
        if (width > _this.maxWidth) {
          height = _this.maxWidth * height / width;
          width = _this.maxWidth;
        }
        if (height > _this.maxHeight) {
          width = _this.maxHeight * width / height;
          height = _this.maxHeight;
        }
        $img.attr({
          src: src,
          width: width,
          height: height,
          'data-origin-name': src,
          'data-origin-src': src,
          'data-origin-size': width + ',' + height
        });
        $wrapper.width(width).height(height);
        return callback(true);
      };
      img.onerror = function() {
        return callback(false);
      };
      return img.src = src;
    };

    ImageButton.prototype.createImage = function() {
      var $breakedEl, $endBlock, $img, $startBlock, endNode, range, startNode;
      range = this.editor.selection.getRange();
      startNode = range.startContainer;
      endNode = range.endContainer;
      $startBlock = this.editor.util.closestBlockEl(startNode);
      $endBlock = this.editor.util.closestBlockEl(endNode);
      range.deleteContents();
      if ($startBlock[0] === $endBlock[0] && $startBlock.is('p')) {
        if (this.editor.util.isEmptyNode($startBlock)) {
          range.selectNode($startBlock[0]);
          range.deleteContents();
        } else if (this.editor.selection.rangeAtEndOf($startBlock, range)) {
          range.setEndAfter($startBlock[0]);
          range.collapse(false);
        } else if (this.editor.selection.rangeAtStartOf($startBlock, range)) {
          range.setEndBefore($startBlock[0]);
          range.collapse(false);
        } else {
          $breakedEl = this.editor.selection.breakBlockEl($startBlock, range);
          range.setEndBefore($breakedEl[0]);
          range.collapse(false);
        }
      }
      $img = $('<img/>');
      range.insertNode($img[0]);
      this.decorate($img);
      return $img;
    };

    ImageButton.prototype.command = function() {
      var $img,
        _this = this;
      $img = this.createImage();
      return this.loadImage($img, this.defaultImage, function() {
        _this.editor.trigger('valuechanged');
        $img.mousedown();
        return _this.popover.one('popovershow', function() {
          _this.popover.srcEl.focus();
          return _this.popover.srcEl[0].select();
        });
      });
    };

    return ImageButton;

  })(Button);

  ImagePopover = (function(_super) {
    __extends(ImagePopover, _super);

    ImagePopover.prototype._tpl = "<div class=\"link-settings\">\n  <div class=\"settings-field\">\n    <label>图片地址</label>\n    <input class=\"image-src\" type=\"text\"/>\n    <a class=\"btn-upload\" href=\"javascript:;\" title=\"上传图片\" tabindex=\"-1\">\n      <span class=\"fa fa-upload\"></span>\n      <input type=\"file\" title=\"上传图片\" name=\"upload_file\" accept=\"image/*\">\n    </a>\n  </div>\n</div>";

    ImagePopover.prototype.offset = {
      top: 6,
      left: -4
    };

    function ImagePopover(button) {
      this.button = button;
      ImagePopover.__super__.constructor.call(this, this.button.editor);
    }

    ImagePopover.prototype.render = function() {
      var _this = this;
      this.el.addClass('image-popover').append(this._tpl);
      this.srcEl = this.el.find('.image-src');
      this.srcEl.on('keyup', function(e) {
        if (e.which === 13) {
          return;
        }
        if (_this.timer) {
          clearTimeout(_this.timer);
        }
        return _this.timer = setTimeout(function() {
          var $img, src;
          src = _this.srcEl.val();
          $img = _this.target.find('img');
          _this.button.loadImage($img, src, function(success) {
            if (!success) {
              return;
            }
            _this.refresh();
            return _this.editor.trigger('valuechanged');
          });
          return _this.timer = null;
        }, 200);
      });
      this.srcEl.on('keydown', function(e) {
        if (e.which === 13 || e.which === 27 || e.which === 9) {
          e.preventDefault();
          _this.srcEl.blur();
          _this.target.removeClass('selected');
          return _this.hide();
        }
      });
      return this._initUploader();
    };

    ImagePopover.prototype._initUploader = function() {
      var _this = this;
      if (this.editor.uploader == null) {
        this.el.find('.btn-upload').remove();
        return;
      }
      this.input = this.el.find('input:file');
      this.input.on('click mousedown', function(e) {
        return e.stopPropagation();
      });
      this.input.on('change', function(e) {
        _this.editor.uploader.upload(_this.input, {
          inline: true
        });
        return _this.input.val('');
      });
      this.editor.uploader.on('beforeupload', function(e, file) {
        var $img;
        if (!file.inline) {
          return;
        }
        if (_this.target) {
          $img = _this.target.find("img");
        } else {
          $img = _this.button.createImage();
          $img.mousedown();
        }
        return _this.editor.uploader.readImageFile(file.obj, function(img) {
          var prepare;
          prepare = function() {
            var $bar;
            _this.srcEl.val('正在上传...');
            _this.target.append('<div class="mask"></div>');
            $bar = $('<div class="simditor-image-progress-bar"><div><span></span></div></div>').appendTo(_this.target);
            if (!_this.editor.uploader.html5) {
              return $bar.text('正在上传...').addClass('hint');
            }
          };
          if (img) {
            return _this.button.loadImage($img, img.src, function() {
              _this.refresh();
              return prepare();
            });
          } else {
            return prepare();
          }
        });
      });
      this.editor.uploader.on('uploadprogress', function(e, file, loaded, total) {
        var percent;
        if (!file.inline) {
          return;
        }
        percent = loaded / total;
        if (percent > 0.99) {
          percent = "正在处理...";
          return _this.target.find(".simditor-image-progress-bar").text(percent).addClass('hint');
        } else {
          percent = (percent * 100).toFixed(0) + "%";
          return _this.target.find(".simditor-image-progress-bar span").width(percent);
        }
      });
      this.editor.uploader.on('uploadsuccess', function(e, file, result) {
        var $img;
        if (!file.inline) {
          return;
        }
        $img = _this.target.find("img");
        return _this.button.loadImage($img, result.file_path, function() {
          _this.target.find(".mask, .simditor-image-progress-bar").remove();
          _this.srcEl.val(result.file_path);
          return _this.editor.trigger('valuechanged');
        });
      });
      return this.editor.uploader.on('uploaderror', function(e, file, xhr) {
        var $img, msg, result;
        if (xhr.statusText === 'abort') {
          return;
        }
        $img = _this.target.find("img");
        _this.target.find(".mask, .simditor-image-progress-bar").remove();
        _this.button.loadImage($img, _this.button.defaultImage, function() {
          return _this.editor.trigger('valuechanged');
        });
        if (xhr.responseText) {
          try {
            result = $.parseJSON(xhr.responseText);
            msg = result.msg;
          } catch (_error) {
            e = _error;
            msg = '上传出错了';
          }
          if ((typeof simple !== "undefined" && simple !== null) && (simple.message != null)) {
            return simple.message(msg);
          } else {
            return alert(msg);
          }
        }
      });
    };

    ImagePopover.prototype.show = function() {
      var $img, args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      ImagePopover.__super__.show.apply(this, args);
      $img = this.target.find('img');
      return this.srcEl.val($img.attr('src'));
    };

    return ImagePopover;

  })(Popover);

  Simditor.Toolbar.addButton(ImageButton);

  IndentButton = (function(_super) {
    __extends(IndentButton, _super);

    function IndentButton() {
      _ref13 = IndentButton.__super__.constructor.apply(this, arguments);
      return _ref13;
    }

    IndentButton.prototype.name = 'indent';

    IndentButton.prototype.icon = 'indent';

    IndentButton.prototype.title = '向右缩进（Tab）';

    IndentButton.prototype.status = function($node) {
      return true;
    };

    IndentButton.prototype.command = function() {
      return this.editor.util.indent();
    };

    return IndentButton;

  })(Button);

  Simditor.Toolbar.addButton(IndentButton);

  OutdentButton = (function(_super) {
    __extends(OutdentButton, _super);

    function OutdentButton() {
      _ref14 = OutdentButton.__super__.constructor.apply(this, arguments);
      return _ref14;
    }

    OutdentButton.prototype.name = 'outdent';

    OutdentButton.prototype.icon = 'outdent';

    OutdentButton.prototype.title = '向左缩进（Shift + Tab）';

    OutdentButton.prototype.status = function($node) {
      return true;
    };

    OutdentButton.prototype.command = function() {
      return this.editor.util.outdent();
    };

    return OutdentButton;

  })(Button);

  Simditor.Toolbar.addButton(OutdentButton);

  HrButton = (function(_super) {
    __extends(HrButton, _super);

    function HrButton() {
      _ref15 = HrButton.__super__.constructor.apply(this, arguments);
      return _ref15;
    }

    HrButton.prototype.name = 'hr';

    HrButton.prototype.icon = 'minus';

    HrButton.prototype.title = '分隔线';

    HrButton.prototype.htmlTag = 'hr';

    HrButton.prototype.status = function($node) {
      return true;
    };

    HrButton.prototype.command = function() {
      var $hr, $newBlock, $nextBlock, $rootBlock;
      $rootBlock = this.editor.util.furthestBlockEl();
      $nextBlock = $rootBlock.next();
      if ($nextBlock.length > 0) {
        this.editor.selection.save();
      } else {
        $newBlock = $('<p/>').append(this.editor.util.phBr);
      }
      $hr = $('<hr/>').insertAfter($rootBlock);
      if ($newBlock) {
        $newBlock.insertAfter($hr);
        this.editor.selection.setRangeAtStartOf($newBlock);
      } else {
        this.editor.selection.restore();
      }
      this.editor.trigger('valuechanged');
      return this.editor.trigger('selectionchanged');
    };

    return HrButton;

  })(Button);

  Simditor.Toolbar.addButton(HrButton);

  TableButton = (function(_super) {
    __extends(TableButton, _super);

    TableButton.prototype.name = 'table';

    TableButton.prototype.icon = 'table';

    TableButton.prototype.title = '表格';

    TableButton.prototype.htmlTag = 'table';

    TableButton.prototype.disableTag = 'pre, li, blockquote';

    TableButton.prototype.menu = true;

    function TableButton() {
      var args,
        _this = this;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      TableButton.__super__.constructor.apply(this, args);
      this.editor.formatter._allowedTags.push('tbody');
      this.editor.formatter._allowedTags.push('tr');
      this.editor.formatter._allowedTags.push('td');
      this.editor.formatter._allowedAttributes['td'] = ['rowspan', 'colspan'];
      this.editor.on('decorate', function(e, $el) {
        return $el.find('table').each(function(i, table) {
          return _this.decorate($(table));
        });
      });
      this.editor.on('undecorate', function(e, $el) {
        return $el.find('table').each(function(i, table) {
          return _this.undecorate($(table));
        });
      });
      this.editor.on('selectionchanged.table', function(e) {
        var $container, range;
        _this.editor.body.find('.simditor-table td').removeClass('active');
        range = _this.editor.selection.getRange();
        if (range == null) {
          return;
        }
        $container = $(range.commonAncestorContainer);
        if (range.collapsed && $container.is('.simditor-table')) {
          if (_this.editor.selection.rangeAtStartOf($container)) {
            $container = $container.find('td:first');
          } else if (_this.editor.selection.rangeAtEndOf($container)) {
            $container = $container.find('td:last');
          }
          _this.editor.selection.setRangeAtEndOf($container);
        }
        return $container.closest('td', _this.editor.body).addClass('active');
      });
      this.editor.on('blur.table', function(e) {
        return _this.editor.body.find('.simditor-table td').removeClass('active');
      });
      this.editor.inputManager.addKeystrokeHandler('37', 'td', function(e, $node) {
        _this.editor.util.outdent();
        return true;
      });
      this.editor.inputManager.addKeystrokeHandler('39', 'td', function(e, $node) {
        _this.editor.util.indent();
        return true;
      });
      this.editor.inputManager.addKeystrokeHandler('38', 'td', function(e, $node) {
        var $prevTr, $tr, index;
        $tr = $node.parent('tr');
        $prevTr = $tr.prev('tr');
        if (!($prevTr.length > 0)) {
          return true;
        }
        index = $tr.find('td').index($node);
        _this.editor.selection.setRangeAtEndOf($prevTr.find('td').eq(index));
        return true;
      });
      this.editor.inputManager.addKeystrokeHandler('40', 'td', function(e, $node) {
        var $nextTr, $tr, index;
        $tr = $node.parent('tr');
        $nextTr = $tr.next('tr');
        if (!($nextTr.length > 0)) {
          return true;
        }
        index = $tr.find('td').index($node);
        _this.editor.selection.setRangeAtEndOf($nextTr.find('td').eq(index));
        return true;
      });
    }

    TableButton.prototype.decorate = function($table) {
      if ($table.parent('.simditor-table').length > 0) {
        return;
      }
      $table.wrap('<div class="simditor-table"></div>');
      return $table.parent();
    };

    TableButton.prototype.undecorate = function($table) {
      if (!($table.parent('.simditor-table').length > 0)) {
        return;
      }
      return $table.parent().replaceWith($table);
    };

    TableButton.prototype.renderMenu = function() {
      var _this = this;
      $('<div class="menu-create-table">\n</div>\n<div class="menu-edit-table">\n  <ul>\n    <li><a tabindex="-1" unselectable="on" class="menu-item" href="javascript:;" data-param="deleteRow"><span>删除行</span></a></li>\n    <li><a tabindex="-1" unselectable="on" class="menu-item" href="javascript:;" data-param="insertRowAbove"><span>在上面插入行</span></a></li>\n    <li><a tabindex="-1" unselectable="on" class="menu-item" href="javascript:;" data-param="insertRowBelow"><span>在下面插入行</span></a></li>\n    <li><span class="separator"></span></li>\n    <li><a tabindex="-1" unselectable="on" class="menu-item" href="javascript:;" data-param="deleteCol"><span>删除列</span></a></li>\n    <li><a tabindex="-1" unselectable="on" class="menu-item" href="javascript:;" data-param="insertColLeft"><span>在左边插入列</span></a></li>\n    <li><a tabindex="-1" unselectable="on" class="menu-item" href="javascript:;" data-param="insertColRight"><span>在右边插入列</span></a></li>\n    <li><span class="separator"></span></li>\n    <li><a tabindex="-1" unselectable="on" class="menu-item" href="javascript:;" data-param="deleteTable"><span>删除表格</span></a></li>\n  </ul>\n</div>').appendTo(this.menuWrapper);
      this.createMenu = this.menuWrapper.find('.menu-create-table');
      this.editMenu = this.menuWrapper.find('.menu-edit-table');
      this.createTable(6, 6).appendTo(this.createMenu);
      this.createMenu.on('mouseenter', 'td', function(e) {
        var $td, $tr, num;
        _this.createMenu.find('td').removeClass('selected');
        $td = $(e.currentTarget);
        $tr = $td.parent();
        num = $tr.find('td').index($td) + 1;
        return $tr.prevAll('tr').addBack().find('td:lt(' + num + ')').addClass('selected');
      });
      this.createMenu.on('mouseleave', function(e) {
        return $(e.currentTarget).find('td').removeClass('selected');
      });
      return this.createMenu.on('mousedown', 'td', function(e) {
        var $closestBlock, $table, $td, $tr, colNum, rowNum;
        _this.wrapper.removeClass('menu-on');
        if (!_this.editor.inputManager.focused) {
          return;
        }
        $td = $(e.currentTarget);
        $tr = $td.parent();
        colNum = $tr.find('td').index($td) + 1;
        rowNum = $tr.prevAll('tr').length + 1;
        $table = _this.decorate(_this.createTable(rowNum, colNum, true));
        $closestBlock = _this.editor.util.closestBlockEl();
        if (_this.editor.util.isEmptyNode($closestBlock)) {
          $closestBlock.replaceWith($table);
        } else {
          $closestBlock.after($table);
        }
        _this.editor.selection.setRangeAtStartOf($table.find('td:first'));
        _this.editor.trigger('valuechanged');
        _this.editor.trigger('selectionchanged');
        return false;
      });
    };

    TableButton.prototype.createTable = function(row, col, phBr) {
      var $table, $tbody, $td, $tr, c, r, _i, _j;
      $table = $('<table/>');
      $tbody = $('<tbody/>').appendTo($table);
      for (r = _i = 0; 0 <= row ? _i < row : _i > row; r = 0 <= row ? ++_i : --_i) {
        $tr = $('<tr/>').appendTo($tbody);
        for (c = _j = 0; 0 <= col ? _j < col : _j > col; c = 0 <= col ? ++_j : --_j) {
          $td = $('<td/>').appendTo($tr);
          if (phBr) {
            $td.append(this.editor.util.phBr);
          }
        }
      }
      return $table;
    };

    TableButton.prototype.setActive = function(active) {
      TableButton.__super__.setActive.call(this, active);
      if (active) {
        this.createMenu.hide();
        return this.editMenu.show();
      } else {
        this.createMenu.show();
        return this.editMenu.hide();
      }
    };

    TableButton.prototype.deleteRow = function($td) {
      var $newTr, $tr, index;
      $tr = $td.parent('tr');
      if ($tr.siblings('tr').length < 1) {
        return this.deleteTable($td);
      } else {
        $newTr = $tr.next('tr');
        if (!($newTr.length > 0)) {
          $newTr = $tr.prev('tr');
        }
        index = $tr.find('td').index($td);
        $tr.remove();
        return this.editor.selection.setRangeAtEndOf($newTr.find('td').eq(index));
      }
    };

    TableButton.prototype.insertRow = function($td, direction) {
      var $newTr, $table, $tr, colNum, i, index, _i,
        _this = this;
      if (direction == null) {
        direction = 'after';
      }
      $tr = $td.parent('tr');
      $table = $tr.closest('table');
      colNum = 0;
      $table.find('tr').each(function(i, tr) {
        return colNum = Math.max(colNum, $(tr).find('td').length);
      });
      $newTr = $('<tr/>');
      for (i = _i = 1; 1 <= colNum ? _i <= colNum : _i >= colNum; i = 1 <= colNum ? ++_i : --_i) {
        $('<td/>').append(this.editor.util.phBr).appendTo($newTr);
      }
      $tr[direction]($newTr);
      index = $tr.find('td').index($td);
      return this.editor.selection.setRangeAtStartOf($newTr.find('td').eq(index));
    };

    TableButton.prototype.deleteCol = function($td) {
      var $newTd, $table, $tr, index,
        _this = this;
      $tr = $td.parent('tr');
      if ($tr.siblings('tr').length < 1 && $td.siblings('td').length < 1) {
        return this.deleteTable($td);
      } else {
        index = $tr.find('td').index($td);
        $newTd = $td.next('td');
        if (!($newTd.length > 0)) {
          $newTd = $tr.prev('td');
        }
        $table = $tr.closest('table');
        $table.find('tr').each(function(i, tr) {
          return $(tr).find('td').eq(index).remove();
        });
        return this.editor.selection.setRangeAtEndOf($newTd);
      }
    };

    TableButton.prototype.insertCol = function($td, direction) {
      var $newTd, $table, $tr, index,
        _this = this;
      if (direction == null) {
        direction = 'after';
      }
      $tr = $td.parent('tr');
      index = $tr.find('td').index($td);
      $table = $td.closest('table');
      $table.find('tr').each(function(i, tr) {
        var $newTd;
        $newTd = $('<td/>').append(_this.editor.util.phBr);
        return $(tr).find('td').eq(index)[direction]($newTd);
      });
      $newTd = direction === 'after' ? $td.next('td') : $td.prev('td');
      return this.editor.selection.setRangeAtStartOf($newTd);
    };

    TableButton.prototype.deleteTable = function($td) {
      var $block, $table;
      $table = $td.closest('.simditor-table');
      $block = $table.next('p');
      $table.remove();
      if ($block.length > 0) {
        return this.editor.selection.setRangeAtStartOf($block);
      }
    };

    TableButton.prototype.command = function(param) {
      var $td, range;
      range = this.editor.selection.getRange();
      $td = $(range.commonAncestorContainer).closest('td');
      if (!($td.length > 0)) {
        return;
      }
      if (param === 'deleteRow') {
        this.deleteRow($td);
      } else if (param === 'insertRowAbove') {
        this.insertRow($td, 'before');
      } else if (param === 'insertRowBelow') {
        this.insertRow($td);
      } else if (param === 'deleteCol') {
        this.deleteCol($td);
      } else if (param === 'insertColLeft') {
        this.insertCol($td, 'before');
      } else if (param === 'insertColRight') {
        this.insertCol($td);
      } else if (param === 'deleteTable') {
        this.deleteTable($td);
      } else {
        return;
      }
      this.editor.trigger('valuechanged');
      return this.editor.trigger('selectionchanged');
    };

    return TableButton;

  })(Button);

  Simditor.Toolbar.addButton(TableButton);

}).call(this);