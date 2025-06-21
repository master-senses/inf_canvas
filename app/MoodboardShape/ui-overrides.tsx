import { TLUiOverrides } from 'tldraw'
import type { Editor, TLUiToolsContextType } from 'tldraw'

export const uiOverrides: TLUiOverrides = {
  tools(editor: Editor, tools: TLUiToolsContextType) {
    // Add your custom tool to the toolbar
    tools['moodboard-shape'] = {
      id: 'moodboard-shape',
      icon: 'image', // You can use any built-in icon or create custom ones
      label: 'Moodboard',
      readonlyOk: false,
      onSelect: () => {
        editor.setCurrentTool('moodboard-shape')
      },
    }
    return tools
  },
  // Note: The toolbar order can be customized via the Tldraw UI components in later versions.
}