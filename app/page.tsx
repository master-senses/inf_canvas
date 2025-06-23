'use client'

import dynamic from 'next/dynamic'
import 'tldraw/tldraw.css'
import { MakeRealButton } from './components/MakeRealButton'
import { PreviewShapeUtil } from './PreviewShape/PreviewShape'
import { uiOverrides } from './MoodboardShape/ui-overrides'

const Tldraw = dynamic(async () => (await import('tldraw')).Tldraw, {
	ssr: false,
})

const components = {
	SharePanel: () => <MakeRealButton />,
}

const shapeUtils = [PreviewShapeUtil]

export default function App() {
	return (
		<div className="editor">
			<Tldraw
				persistenceKey="make-real"
				components={components}
				shapeUtils={shapeUtils}
				overrides={uiOverrides}
			>
				{/* <RiskyButCoolAPIKeyInput /> */}
			</Tldraw>
		</div>
	) 
}

	
