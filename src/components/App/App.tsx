import * as React from 'react';
import { GlobalState } from '../../type.js';
import CanvasAndImage from '../CanvasAndImage/CanvasAndImage';
import FeatureButtons from '../FeatureButtons/FeatureButtons';
import FeatureInteractions from '../FeaturesInteractions/FeaturesInterations';
import ImageHelper from '../../utils/ImageHelper/imageHelper'

function App() {

    const [canvasRef, setCanvasRef] = React.useState(React.createRef())
    const [canvasContainerRef, setCanvasContainerRef] = React.useState(React.createRef())
    const [imageHelper, setImageHelper] = React.useState(undefined)
    // const [isImageLoaded, setIsImageLoaded] = React.useState(false)

    const globalState: GlobalState = {
        canvasRef,
        canvasContainerRef,
        imageHelper
    }

    return <div className="d-flex flex-column justify-content-center align-items-stretch vw-100 vh-100">
        <div className="d-flex flex-row border" style={{ flex: 3 }}>
            <div className="border" style={{ flex: 3 }}>
                <CanvasAndImage setImageHelper={setImageHelper} setCanvasRef={setCanvasRef} setCanvasContainerRef={setCanvasContainerRef} />
            </div>

            <div className="border" style={{ flex: 1 }}>
                <FeatureInteractions globalState={globalState} />
            </div>
        </div>
        <div className="border" style={{ flex: 1 }}>
            <FeatureButtons />
        </div>
    </div>
}

export default App;