'use client'

import dynamic from 'next/dynamic'
import 'tldraw/tldraw.css'
import { MakeRealButton } from './components/MakeRealButton'
import { RiskyButCoolAPIKeyInput } from './components/RiskyButCoolAPIKeyInput'
import { PreviewShapeUtil } from './PreviewShape/PreviewShape'
import {MoodboardTool} from './MoodboardShape/MoodboardShape'
import { uiOverrides } from './MoodboardShape/ui-overrides'

const Tldraw = dynamic(async () => (await import('tldraw')).Tldraw, {
	ssr: false,
})

const components = {
	SharePanel: () => <MakeRealButton />,
}

const shapeUtils = [PreviewShapeUtil]
const tools = [MoodboardTool]

export default function App() {
	return (
		<div className="editor">
			<Tldraw
				persistenceKey="make-real"
				components={components}
				shapeUtils={shapeUtils}
				tools={tools}
				overrides={uiOverrides}
			>
				{/* <RiskyButCoolAPIKeyInput /> */}
			</Tldraw>
		</div>
	)
}
