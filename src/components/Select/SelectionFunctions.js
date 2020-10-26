// functions which can be used by other components

export const showSelection = (imageData, selectionMapping) => {
    for (let i = 0; i < selectionMapping.length; i++) {
        for (let j = 0; j < selectionMapping[i].length; j++) {
            if (selectionMapping[i][j])
                imageData.data[(i * image.width + j) * 4 + 3] = 127;
        }
    }
    return imageData;
}