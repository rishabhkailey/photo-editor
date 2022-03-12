import { RootState } from './store'
// functions to extract state

export const getImageLoaded = (store: RootState): boolean => store.isImageLoaded;

export const getSelectionInformation = (store: RootState): any => store.selectionInfo;

export const showDisableSelectionTooltip = (store: RootState): any => store.showDisableSelectionTooltip