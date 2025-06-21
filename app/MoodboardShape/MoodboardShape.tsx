import { StateNode, TLPointerEventInfo } from 'tldraw'

// ... existing imports ...

export class MoodboardTool extends StateNode {
  static override id = 'moodboard-shape'
  static override initial = 'idle'
  static override children = () => [Idle, Pointing]

  override onEnter = () => {
    this.editor.setCursor({ type: 'cross' })
  }

  override onExit = () => {
    this.editor.setCursor({ type: 'default' })
  }
}

class Idle extends StateNode {
  static override id = 'idle'

  override onPointerDown = (info: TLPointerEventInfo) => {
    this.parent.transition('pointing', info)
  }
}

class Pointing extends StateNode {
  static override id = 'pointing'
  
  override onPointerUp = () => {
    const { currentPagePoint } = this.editor.inputs
    
    this.editor.createShape({
      type: 'moodboard',  // Match your shape type
      x: currentPagePoint.x - 200,
      y: currentPagePoint.y - 150,
      props: {
        image: '',
        w: 400,
        h: 300,
      },
    })
    
    this.parent.transition('idle')
  }
}