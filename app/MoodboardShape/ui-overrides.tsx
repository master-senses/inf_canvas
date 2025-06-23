import { TLUiOverrides } from "tldraw"

export const uiOverrides: TLUiOverrides = {
	tools(_editor, tools) {
		return {
			...tools,
			frame: {
				...tools.frame,
				label: 'Moodboard',
        id: 'moodboard',
			},
		}
	},
}