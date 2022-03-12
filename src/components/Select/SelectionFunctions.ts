// functions which can be used by other components
type image = {
    data: Array<number>,
    width: number
}
export const showSelection = (image: image, selectionMapping: Array<Array<boolean>>) => {
    for (let i = 0; i < selectionMapping.length; i++) {
        for (let j = 0; j < selectionMapping[i].length; j++) {
            if (selectionMapping[i][j])
                image.data[(i * image.width + j) * 4 + 3] = 127;
        }
    }
    return image;
}