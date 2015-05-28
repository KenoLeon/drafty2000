/**
 * https://github.com/garyharan/jQuery-caret-utilities
 *
 * Licensed under the incredibly permissive MIT License.
 */
 (function($){
  $.fn.insertAtCaret = function(text, opts) {
    var element = $(this).get(0);

    if (document.selection) {
      element.focus();
      var orig = element.value.replace(/\r\n/g, "\n");
      var range = document.selection.createRange();

      if (range.parentElement() != element) {
        return false;
      }

      range.text = text;

      var actual = tmp = element.value.replace(/\r\n/g, "\n");

      for (var diff = 0; diff < orig.length; diff++) {
        if (orig.charAt(diff) != actual.charAt(diff)) break;
      }

      for (var index = 0, start = 0; tmp.match(text) && (tmp = tmp.replace(text, "")) && index <= diff; index = start + text.length ) {
        start = actual.indexOf(text, index);
      }
    } else if (typeof element.selectionStart !== 'undefined') {
      var start = element.selectionStart;
      var end   = element.selectionEnd;

      element.value = element.value.substr(0, start) + text + element.value.substr(end, element.value.length);
    } else if (document.getSelection() && document.getSelection().anchorNode) {
      // Selection of contenteditable elements (divs)
      element.focus();
      anchorNode = document.getSelection().anchorNode;
      focusNode = document.getSelection().focusNode;

      // Ignore selection over multiple nodes (TODO?)
      if (! $(anchorNode).closest(element).length || anchorNode != focusNode) {
        return false;
      }

      origContent = anchorNode.textContent;
      anchorOffset = document.getSelection().anchorOffset || 0;
      focusOffset = document.getSelection().focusOffset || 0;

      if (anchorOffset == focusOffset) {
        // No selection: insert at caret position
        anchorNode.textContent = [origContent.slice(0, anchorOffset), text, origContent.slice(anchorOffset)].join('');
      } else {
        // Selection within the same node: replace selection
        anchorNode.textContent = [origContent.slice(0, anchorOffset), text, origContent.slice(focusOffset)].join('');
      }

      // Don't need to position caret
      return this;
    }

    if (typeof start !== 'undefined') {
      setCaretTo(element, start + text.length);
    } else {
      element.value = text + element.value;
    }

    return this;
  }

  $.fn.setCaretPosition = function(start, end) {
    var element = $(this).get(0);
    element.focus();
    setCaretTo(element, start, end);
    return this;
  }

  $.fn.getCaretPosition = function() {
    var element = $(this).get(0);
    $(element).focus();
    return getCaretPosition(element);
  }

  $.fn.getSelectedText = function() {
    var element = $(this).get(0);

    // workaround for firefox because window.getSelection does not work inside inputs
    if (typeof element.selectionStart !== 'undefined') {
      return $(element).val().substr(element.selectionStart, element.selectionEnd - element.selectionStart);
    } else if (document.getSelection) {
      return document.getSelection();
    } else if (window.getSelection) {
      return window.getSelection();
    }
  }

  // privates
  function setCaretTo(element, start, end) {
    if (typeof element.createTextRange !== 'undefined') {
      var range = element.createTextRange();
      range.moveStart('character', start);
      range.moveEnd('character',   (end || start));
      range.select();
    } else if (typeof element.selectionStart !== 'undefined') {
      element.focus();
      element.setSelectionRange(start, (end || start));
    }
  }

  function getCaretPosition(element) {
    if (typeof element.selectionStart !== 'undefined') {
      return element.selectionStart;
    } else if (document.selection) {
      var range = document.selection.createRange();
      var rangeLength = range.text.length;
      range.moveStart('character', -element.value.length);
      return range.text.length - rangeLength;
    }
  }
})(jQuery);



(function($) {
  $.fn.caret = function(pos) {
    var target = this[0];
	var isContentEditable = target.contentEditable === 'true';
    //get
    if (arguments.length == 0) {
      //HTML5
      if (window.getSelection) {
        //contenteditable
        if (isContentEditable) {
          target.focus();
          var range1 = window.getSelection().getRangeAt(0),
              range2 = range1.cloneRange();
          range2.selectNodeContents(target);
          range2.setEnd(range1.endContainer, range1.endOffset);
          return range2.toString().length;
        }
        //textarea
        return target.selectionStart;
      }
      //IE<9
      if (document.selection) {
        target.focus();
        //contenteditable
        if (isContentEditable) {
            var range1 = document.selection.createRange(),
                range2 = document.body.createTextRange();
            range2.moveToElementText(target);
            range2.setEndPoint('EndToEnd', range1);
            return range2.text.length;
        }
        //textarea
        var pos = 0,
            range = target.createTextRange(),
            range2 = document.selection.createRange().duplicate(),
            bookmark = range2.getBookmark();
        range.moveToBookmark(bookmark);
        while (range.moveStart('character', -1) !== 0) pos++;
        return pos;
      }
      // Addition for jsdom support
      if (target.selectionStart)
        return target.selectionStart;
      //not supported
      return 0;
    }
    //set
    if (pos == -1)
      pos = this[isContentEditable? 'text' : 'val']().length;
    //HTML5
    if (window.getSelection) {
      //contenteditable
      if (isContentEditable) {
        target.focus();
        window.getSelection().collapse(target.firstChild, pos);
      }
      //textarea
      else
        target.setSelectionRange(pos, pos);
    }
    //IE<9
    else if (document.body.createTextRange) {
      if (isContentEditable) {
        var range = document.body.createTextRange();
        range.moveToElementText(target);
        range.moveStart('character', pos);
        range.collapse(true);
        range.select();
      } else {
        var range = target.createTextRange();
        range.move('character', pos);
        range.select();
      }
    }
    if (!isContentEditable)
      target.focus();
    return pos;
  }
})(jQuery);
