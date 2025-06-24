import { Editor, createShapeId, TLShapeId } from 'tldraw'
import { blobToBase64 } from './blobToBase64'
import { getTextFromSelectedShapes } from './getSelectionAsText'
import { generateStyleTransfer, generateSingleImage } from './generateImages'
import { PreviewShape } from '../PreviewShape/PreviewShape'

type ImageFetcher = (
	sketchDataUrl: string,
	selectionText: string,
	strength: number
) => Promise<string[]>

export async function makeRealWith(editor: Editor, imageFetcher: ImageFetcher) {
	// 1. Make sure something is selected
	const selectedShapes = editor.getSelectedShapes()
	if (selectedShapes.length === 0) throw Error('First select something to make real.')

	// 2. Grab the bounding box of the selection (used for positioning later)
	const imageShapes = selectedShapes.filter(shape => shape.type === 'image')
	if (imageShapes.length === 0) throw Error('No image selected.')
	const bounds = editor.getShapePageBounds(imageShapes[0].id)
	if (!bounds) throw Error('Could not get bounds of selection.')
	const { maxX, midY } = bounds
	const newShapeId = createShapeId()
	const newShapeId2 = createShapeId()
	const newShapeId3 = createShapeId()
	editor.createShape<PreviewShape>({
		id: newShapeId,
		type: 'response',
		x: maxX + 60, // to the right of the selection
		y: midY - (540 * 2) / 3 / 2, // half the height of the preview's initial shape
		props: { image: '', w: (500 * 2) / 3, h: (540 * 2) / 3 },
	})
	editor.createShape<PreviewShape>({
		id: newShapeId2,
		type: 'response',
		x: maxX + 60 + 400, // to the right of the selection
		y: midY - (540 * 2) / 3 / 2, // half the height of the preview's initial shape
		props: { image: '', w: (500 * 2) / 3, h: (540 * 2) / 3 },
	})
	editor.createShape<PreviewShape>({
		id: newShapeId3,
		type: 'response',
		x: maxX + 60 + 800, // to the right of the selection
		y: midY - (540 * 2) / 3 / 2, // half the height of the preview's initial shape
		props: { image: '', w: (500 * 2) / 3, h: (540 * 2) / 3 },
	})
	
    const maxSize = 1000
    const scale = Math.min(1, maxSize / bounds.width, maxSize / bounds.height)

	// 3. Find the image shape and get its data directly
	
    const { blob } = await editor.toImage(imageShapes, {
        scale: scale,
        background: true,
        format: 'jpeg',
    })
    const sketchDataUrl = await blobToBase64(blob!)


	// 4. Extract any visible text (annotations, labels, etc.)
	const selectionText = getTextFromSelectedShapes(editor)
	console.log('Extracted text:', selectionText)

	// 5. Layout parameters (tweak to taste)
	const GAP = 40 // horizontal gap between thumbnails
	const WIDTH = 400
	const HEIGHT = 300
	const newShapeIds = [newShapeId, newShapeId2, newShapeId3]

	try {
		const imageUrls: string[] = await imageFetcher(sketchDataUrl, selectionText, 0.4)

		if (!imageUrls || imageUrls.length === 0) {
			throw Error('The image-generation service returned no images.')
		}

	for (let i = 0; i < imageUrls.length; i++) {
		const url = imageUrls[i]
		const id = createShapeId()
		const imageAsset = await editor.getAssetForExternalContent({
			type: 'url',
			url: url,
		})

		if (imageAsset) {
			editor.updateShape<PreviewShape>({
				id: newShapeIds[i],
				type: 'response',
				props: {
					image: url,
				},
			})
		}
	}
} catch (error) {
	console.error('Error generating images:', error)
}
} 

export async function makeReal(editor: Editor) {
	return makeRealWith(editor, generateSingleImage)
}

export async function StyleTransfer(editor: Editor) {
	return makeRealWith(editor,  generateStyleTransfer)
}