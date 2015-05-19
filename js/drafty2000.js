var drafty2000 = (function () {

  var gui = require('nw.gui');
  var fs = require('fs');
  var menu = new gui.Menu({ type: 'menubar' });
  var filePath;
  var currentWindow;
  var input;

  var init = function(){

    currentWindow = gui.Window.get();

    // Create the standard OSX menu
    if (process.platform === "darwin")
    {
      menu.createMacBuiltin("drafty2000");
    }

    var fileSubMenu = new gui.Menu();
    fileSubMenu.append(
      new gui.MenuItem({
        label: 'Print                      ⌘P',
        click: function(){
          window.print();
          }
      }));

      fileSubMenu.append(
        new gui.MenuItem({
          label: 'Open...           ⌘O',
          click: function(){
            openFile();
            }
        }));

        fileSubMenu.append(
          new gui.MenuItem({
            label: 'Save                      ⌘S',
            click: function(){
              saveFile();
              }
          }));


    // Append MenuItem as a Submenu
    menu.append(
      new gui.MenuItem({
          label: 'File',
          submenu: fileSubMenu
      })
    );

    currentWindow.menu = menu;
    input = document.getElementById('textInput');
    // Extra Menus


    input.innerHTML = 'Just Type';
      // Listen for keyboard shortcuts
    document.onkeydown = keyBoardShortcuts;
    placeCaretAtEnd(input);

  };

  function saveFile(){
    // If we have a filePath, write the data there
    if (filePath) {
      writeFile();
      //alert('will Save art'+ filePath);
      }
    // Otherwise ask the user to pick a location to save the file
    openFilePicker('saveFile', function(value){
      setFilePath(value);
      writeFile();
      //alert('Will Save at' + filePath);
    });
  }


function writeFile(){

  var text = htmlToText(getHTMLof('textInput'));
  fs.writeFile(filePath, text, function(err){
    if (err) {
      setFilePath(false);
      if (err.code === 'ENOENT') {
        alert('Please select a valid location to save this document.');
        }
        if (err.code === 'EACCES') {
          alert('You don\'t have permission to save this document there.');
          }
      } else {
        // Update the window title
        currentWindow.title = fileNameFrom(filePath);
      }
    });
}

  function openFile(){
    openFilePicker('readFile',function(value){

      setFilePath(value);

      // Update this window's title
      currentWindow.title = fileNameFrom(filePath);

      readFile(filePath, function (text){

        if (!text) {return openFile();}

        var html = textToHTML(text);
        //var input = document.getElementById('textInput');
        input.innerHTML = html;
        placeCaretAtEnd(input);

      });

    }
    );
  }


  function openFilePicker(id, callback){
    var picker = document.getElementById(id);
    picker.addEventListener('change', function(e){
      //console.log(this.value);
      return callback(this.value);
    }, false);

    picker.click();
  }


  function readFile (filePath, callback) {

    // No file to read!
    if (!filePath) {return callback(false);}

    fs.readFile(filePath, 'utf8', function(err, data) {

      if (err) {

        setFilePath(false);

        switch (err.code) {
          case 'ENOENT':
            alert('Please select a valid path');
            break;
          case 'EACCES':
            alert('You don\' have permission to open this document.');
            break;
          default:
            alert('The file "' + fileNameFrom(filePath) + '" could not be opened. Please open another file.');
            break;
        }

        return callback(false);
      }

      return callback(data);

    });

  }

  function setFilePath (path){
    filePath = path;
  }

  function fileNameFrom (path) {
    return path.slice(path.lastIndexOf("/") + 1);
  }

  function textToHTML (text) {

    text = '<p>' + text;
    text = text.replace(/[\n]/gi, "</p><p>");
    if (text.slice(-3) === '<p>') {
      text = text.slice(0, -3);
    }
    return text;
  }


  function htmlToText(html){
    html = html.replace(/<p>/gi, "");
    html = html.replace(/<\/p>/gi, "\n");
    html = html.replace(/&nbsp;/gi, " ");
    html = html.replace(/&#xfeff;/gi, " ");
    html = html.replace(/<span>/gi, "");
    html = html.replace(/<\/span>/gi, "");
    return html;
  }


  function keyBoardShortcuts (e) {

    var keyCode = e.which;

    if (e.metaKey) {


      // CMD + O
      if (keyCode === 79) {
        openFile();
      }

      // CMD + P
      if (keyCode == 80) {
        window.print();
      }

      // CMD + S
      if (keyCode === 83) {
        saveFile();
      }


    }
  }

  function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

  function getHTMLof (id) {
    var node = document.getElementById(id);
    return node.innerHTML;
  }

  // UI


  $(document).ready(function() {
    // Main UI
    $('#topUIToolBox').click(function(e) {
      $("#toolBox").toggle();
    });

    $('#topUIHelp').click(function(e) {
      alert('Will Call Help');
    });
    // toolBox
    $('#tPage').click(function(e) {
      alert('Title Page');
    });

    $('#tSlug').click(function(e) {
      alert('Slugline');
    });

    $('#tAction').click(function(e) {
      alert('Action');
    });

    $('#tCharacter').click(function(e) {
      alert('Character');
    });

    $('#tDialog').click(function(e) {
      alert('Dialog');
    });

  });




  // Expose Public Methods
  return{
    init:init
  };


}());


// UI
//document.getElementById('topUILeft')
