var drafty2000 = (function () {

  var gui = require('nw.gui');
  var fs = require('fs');
  var menu = new gui.Menu({ type: 'menubar' });
  var filePath;
  var currentWindow;

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
        label: 'Print Cmmd P',
        click: function(){
          window.print();
          }
      }));

      fileSubMenu.append(
        new gui.MenuItem({
          label: 'Open Cmmd S',
          click: function(){
            openFile();
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

    // Extra Menus

    var input = document.getElementById('textInput');
    input.innerHTML = 'Just Type';

  };

  function openFile(){
    openFilePicker('readFile',function(value){

      setFilePath(value);

      // Update this window's title
      currentWindow.title = fileNameFrom(filePath);

      readFile(filePath, function (text){

        if (!text) {return openFile();}

        var html = textToHTML(text);
        var input = document.getElementById('textInput');
        input.innerHTML = html;

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

  // Expose Public Methods
  return{
    init:init
  };


}());
