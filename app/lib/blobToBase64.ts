export function blobToBase64(blob: Blob | Blob[]): Promise<string | string[]> {
	if (Array.isArray(blob)) {
		return Promise.all(blob.map(singleBlob => {
			return new Promise<string>((resolve, _) => {
				const reader = new FileReader()
				reader.onloadend = () => resolve(reader.result as string)
				reader.readAsDataURL(singleBlob)
			})
		}))
	} else {
		return new Promise<string>((resolve, _) => {
			const reader = new FileReader()
			reader.onloadend = () => resolve(reader.result as string)
			reader.readAsDataURL(blob)
		})
	}
}
