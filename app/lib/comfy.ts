import promptOrig from '../api/style-transfer/prompt.json'

/**
 * Return a copy of the Comfy prompt json with the number of LoadImage nodes
 * adjusted to `desired`. If fewer are needed it removes nodes starting from
 * input_8.jpeg downward; if more are needed it appends new nodes starting from
 * input_9.jpeg upward.
 */
export function adjustLoadImages(desired: number, text: string) {
  // Deep-clone original prompt so we don't mutate imported module
  const prompt: Record<string, any> = JSON.parse(JSON.stringify(promptOrig))
  console.log("number of images is: ", desired)

  // Collect all keys that are LoadImage nodes
  const loadImageKeys = Object.keys(prompt).filter(
    (k) => prompt[k].class_type === 'LoadImage'
  )

  const prompt_key = Object.keys(prompt).filter((k) => prompt[k].class_type === "CLIPTextEncode" && prompt[k].inputs.text.includes("detailed"))
  prompt[prompt_key[0]].inputs.text = text
  // Sort by their input file name number, descending
  loadImageKeys.sort((a, b) => {
    const getIdx = (key: string) => {
      const img = prompt[key].inputs.image as string
      const match = img.match(/input_(\d+)\.jpeg/)
      return match ? parseInt(match[1], 10) : 0
    }
    return getIdx(b) - getIdx(a)
  })

  // Determine current number of LoadImage nodes (after cloning original prompt)
  let current = loadImageKeys.length

  // REMOVE extra nodes if current > desired
  while (current > desired) {
    const keyToRemove = loadImageKeys.shift() // highest index first due to sort desc
    if (keyToRemove) {
      delete prompt[keyToRemove]
      current--
    }
  }

  // ADD nodes if current < desired
  if (current < desired) {
    // find max numeric key to create new unique ids
    const maxKeyNum = Math.max(...Object.keys(prompt).map((k) => parseInt(k, 10)))
    // find highest existing input index
    const highestInputIdx = loadImageKeys.reduce((m, k) => {
      const match = (prompt[k].inputs.image as string).match(/input_(\d+)\.jpeg/)
      return match ? Math.max(m, parseInt(match[1], 10)) : m
    }, 0)

    const templateKey = loadImageKeys[0]
    const template = templateKey ? prompt[templateKey] : {
      _meta: { title: 'Load Image' },
      inputs: { upload: 'image', image: '' },
      class_type: 'LoadImage'
    }

    let nextKeyNum = maxKeyNum + 1
    let nextInputIdx = highestInputIdx + 1

    while (current < desired) {
      const newKey = String(nextKeyNum++)
      prompt[newKey] = JSON.parse(JSON.stringify(template))
      prompt[newKey].inputs.image = `input/input_${nextInputIdx++}.jpeg`
      current++
    }
  }

  /* ------------------------------------------------------------------
     Ensure the same number of PrepImageForClipVision nodes as LoadImages.
     These nodes reference the corresponding LoadImage node by id.
  ------------------------------------------------------------------ */

  const prepKeys = Object.keys(prompt).filter(
    (k) => prompt[k].class_type === 'PrepImageForClipVision'
  )

  // Sort loadImageKeys ascending by image index for stable pairing
  loadImageKeys.sort((a, b) => {
    const idxA = (prompt[a].inputs.image as string).match(/input_(\d+)\.jpeg|sketch\.jpeg/)
      ? parseInt(((prompt[a].inputs.image as string).match(/input_(\d+)\.jpeg/) || [,'0'])[1], 10)
      : 0
    const idxB = (prompt[b].inputs.image as string).match(/input_(\d+)\.jpeg|sketch\.jpeg/)
      ? parseInt(((prompt[b].inputs.image as string).match(/input_(\d+)\.jpeg/) || [,'0'])[1], 10)
      : 0
    return idxA - idxB
  })

  // Remove extra Prep nodes if there are more than needed
  while (prepKeys.length > loadImageKeys.length - 1) {
    const key = prepKeys.pop()
    if (key) delete prompt[key]
  }

  // ---------------- ImageBatchMulti trim -----------------
  const batchMultiKeys = Object.keys(prompt).filter((k) => prompt[k].class_type === 'ImageBatchMulti')
  for (const bm of batchMultiKeys) {
    const inp = prompt[bm].inputs as Record<string, any>
    const desiredCount = prepKeys.length
    for (const field of Object.keys(inp)) {
      const match = field.match(/^image_(\d+)/)
      if (match) {
        const idx = parseInt(match[1], 10)
        if (idx > desiredCount) {
          delete inp[field]
        }
      }
    }
    inp.inputcount = desiredCount
  }

  console.log(prompt)
  return prompt
}
