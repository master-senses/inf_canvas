import { useEditor, useToasts } from 'tldraw'
import { useCallback } from 'react'
import { makeRealImages } from '../lib/makeRealImages'

export function MakeRealButton() {
	const editor = useEditor()
	const { addToast } = useToasts()

	const handleClick = useCallback(async () => {
		try {
			const input = document.getElementById('openai_key_risky_but_cool') as HTMLInputElement
			const apiKey = input?.value ?? ''
			// API key is not strictly required for Replicate, but keeping the pattern
			await makeRealImages(editor, apiKey)
		} catch (e) {
			console.error(e)
			addToast({
				icon: 'info-circle',
				title: 'Something went wrong',
				description: (e as Error).message.slice(0, 100),
			})
		}
	}, [editor, addToast])

	return (
		<button className="makeRealButton" onClick={handleClick}>
			Make Real
		</button>
	)
}
