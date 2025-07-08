import { Editor, createShapeId, TLShapeId } from 'tldraw'
import { blobToBase64 } from './blobToBase64'
import { getTextFromSelectedShapes } from './getSelectionAsText'
import { generateStyleTransfer, generateSingleImage } from './generateImages'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import { ImagesPayload } from './types'

// type ImageFetcher = (
// 	sketchDataUrl: string | string[],
// 	selectionText: string,
// 	strength: number
// ) => Promise<string[]>

export async function makeRealWith(editor: Editor, imageFetcher: (payload: ImagesPayload, text: string, similarity: number) => Promise<string[]>) {
	// 1. Make sure something is selected
	const selectedShapes = editor.getSelectedShapeIds()
	const allShapes = editor.getShapeAndDescendantIds(selectedShapes)
	if (selectedShapes.length === 0) throw Error('First select something to make real.')
	// 2. Grab the bounding box of the selection (used for positioning later)
	// const frameShapes = selectedShapes.filter(shape => shape.type === 'frame')
	const imageShapes = Array.from(allShapes)
  	.map(id => editor.getShape(id as TLShapeId)!)
  	.filter(s => s.type === 'image');
	//   console.log("number of images is ", imageShapes.length)
	if (imageShapes.length === 0) throw Error('No image selected.');
	// console.log(imageShapes);
	const topLevelImage = imageShapes.find(s => editor.getShapeAncestors(s.id).length === 0);
	if (!topLevelImage) throw Error('No sketch found');
	const bounds = editor.getShapePageBounds(topLevelImage.id);
	if (!bounds) throw Error('Could not get bounds of selection.');
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
	const moodboard_images = imageShapes.filter(s => s.id != topLevelImage.id)
	let images_unsorted: string | string[] = []
	if (moodboard_images.length > 0) {
		let blobs: Blob[] = []
		for (const image of moodboard_images) {
			const { blob } = await editor.toImage([image], {
				scale: scale,
				background: true,
				format: 'jpeg',
			})
			blobs.push(blob)
		}
		images_unsorted = await blobToBase64(blobs)
	}
	const {blob: sketch_base64} = await editor.toImage([topLevelImage], {
		scale: scale,
		background: true,
		format: 'jpeg',
	})
	const sketchDataUrl = await blobToBase64(sketch_base64)

	const images: ImagesPayload = { sketch: String(sketchDataUrl), moodboard: images_unsorted} // typecast to avoid error, it will always be a string

	const selectionText = getTextFromSelectedShapes(editor)
	// console.log('Extracted text:', selectionText)

	// 5. Layout parameters (tweak to taste)
	const GAP = 40 // horizontal gap between thumbnails
	const WIDTH = 400
	const HEIGHT = 300
	const newShapeIds = [newShapeId, newShapeId2, newShapeId3]

	try {
		const imageUrls: string[] = await imageFetcher(images, selectionText, 0.4)

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
	// console.error('Error generating images:', error)
}
} 

export async function makeReal(editor: Editor) {
	return makeRealWith(editor, generateSingleImage)
}

export async function StyleTransfer(editor: Editor) {
	return makeRealWith(editor,  generateStyleTransfer)
}