import { useEditor, useToasts } from 'tldraw'
import { useCallback } from 'react'
import { makeReal } from '../lib/makeRealImages'

export function MakeRealButton() {
	const editor = useEditor()
	const { addToast } = useToasts()

	const handleClick = useCallback(async () => {
		try {
			await makeReal(editor)
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
