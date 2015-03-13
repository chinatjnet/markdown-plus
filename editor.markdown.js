var editor;

$(document).ready(function() {

  // 构造上中右三个面板
  $('body').layout({
    resizerDblClickToggle: false,
    resizable: false,
    slidable: false,
    togglerLength_open: '100%',
    togglerLength_closed: '100%',
    north: {
      size: '1px', // 只是占位，真实大小由内容决定
      togglerTip_open: 'Hide Toolbar',
      togglerTip_closed: 'Show Toolbar'
    },
    east: {
      size: '50%',
      togglerTip_open: 'Hide Preview',
      togglerTip_closed: 'Show Preview',
      onresize: function() {
        editor.session.setUseWrapMode(false); // ACE的wrap貌似有问题，这里手动触发一下。
        editor.session.setUseWrapMode(true);
      }
    }
  });

  // 左侧编辑器
  editor = ace.edit("editor");
  editor.$blockScrolling = Infinity;
  editor.renderer.setShowPrintMargin(false);
  editor.session.setMode("ace/mode/markdown");
  editor.session.setUseWrapMode(true);
  editor.setFontSize('14px');
  editor.focus();

  // 设置marked
  var renderer = new marked.Renderer();
  renderer.listitem = function(text) {
    if(!/^\[[ x]\]\s/.test(text)) {
      return marked.Renderer.prototype.listitem(text);
    }
    // 任务列表
    var checkbox = $('<input type="checkbox" class="taskbox" disabled="disabled"/>');
    if(/^\[x\]\s/.test(text)) { // 完成的任务列表
      checkbox.attr('checked', true);
    }
    return $(marked.Renderer.prototype.listitem(text.substring(4))).addClass('none-style').prepend(checkbox)[0].outerHTML;
  }
  marked.setOptions({
    renderer: renderer,
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: true
  });

  // 实时监听用户的编辑
  editor.session.on('change', function(){
    $('.markdown-body').html(marked(editor.session.getValue())); // 实时预览
    $('pre').addClass('prettyprint').addClass('linenums');
    prettyPrint(); // 语法高亮
  });

  // toolbar actions
  $('.heading-icon').click(function(){ // h1 - h6 heading
    editor.navigateLineStart();
    editor.insert('#'.repeat($(this).data('level')) + ' ');
    editor.focus();
  });
  $('.styling-icon').click(function(){ // styling icons
    var range = editor.selection.getRange();
    if(range.isEmpty()) { // 没有选中任何东西
      range = editor.selection.getWordRange(range.start.row, range.start.column) // 当前单词的range
    }
    var selectedText = editor.session.getTextRange(range);
    var modifier = $(this).data('modifier');
    editor.session.replace(range, modifier + selectedText + modifier);
    editor.navigateLeft(modifier.length);
    editor.focus();
  });

});
