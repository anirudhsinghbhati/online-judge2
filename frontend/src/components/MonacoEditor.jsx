import Editor from '@monaco-editor/react';

function MonacoEditor({ value, onChange, language = 'cpp', height = '420px', className = '' }) {
  return (
    <div className={`h-full overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d11] shadow-glow ${className}`}>
      <Editor
        height={height}
        theme="vs-dark"
        language={language}
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? '')}
        beforeMount={(monaco) => {
          monaco.editor.defineTheme('judgeTheme', {
            base: 'vs-dark',
            inherit: true,
            rules: [
              { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
              { token: 'keyword', foreground: '38bdf8' },
              { token: 'string', foreground: '34d399' },
              { token: 'number', foreground: 'f59e0b' }
            ],
            colors: {
              'editor.background': '#0d0d11',
              'editor.lineHighlightBackground': '#18181d',
              'editorCursor.foreground': '#f8fafc',
              'editorIndentGuide.background1': '#26262e',
              'editorIndentGuide.activeBackground1': '#38bdf8'
            }
          });
        }}
        onMount={(editor, monaco) => {
          monaco.editor.setTheme('judgeTheme');
          editor.updateOptions({
            fontSize: 14,
            lineHeight: 22,
            minimap: { enabled: false },
            smoothScrolling: true,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            fontFamily: 'Consolas, ui-monospace, monospace'
          });
        }}
        options={{
          automaticLayout: true,
          roundedSelection: false,
          padding: { top: 16, bottom: 16 },
          tabSize: 4
        }}
      />
    </div>
  );
}

export default MonacoEditor;
