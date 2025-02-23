import { AppDispatch, RootState } from '@/redux/store';
import { canvasColourType, setStrokeColor, strokeColorType, setCanvasColour, setStrokeWidth, strokeWidthType,setFontSize } from '@/redux/toolbarSlice';
import { Minus } from 'lucide-react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function Menu({isText}:{isText:Boolean}) {
  const {fontSize} = useSelector((state:RootState)=>state.toolbar)
  const strokeColourArray: { id: strokeColorType; color: string }[] = [
    { id: "#ffffff", color: "#ffffff" },
    { id: "#e03131", color: "#e03131" },
    { id: "#2f9e44", color: "#2f9e44" },
    { id: "#1971c2", color: "#1971c2" },
    { id: "#f08c00", color: "#f08c00" },
  ];

  const CanvasColour: { id: canvasColourType; color: string }[] = [
    { id: "#000000", color: "#000000" },
    { id: "#121212", color: "#121212" },
    { id: "#1e1e1e", color: "#1e1e1e" },
    { id: "#5C4033", color: "#5C4033" },
    { id: "#6E260E", color: "#6E260E" },
  ];

  const strokeWidthArray: strokeWidthType[] = [1, 2, 3];
  const fontSizes = [{category:"S",size:14},{category:"M",size:18},{category:"L",size:28},{category:"XL",size:48}];
  const dispatch = useDispatch<AppDispatch>();
  const {  strokeColor, canvasColour, strokeWidth } = useSelector((state: RootState) => state.toolbar);

  const handleStrokeColorChange = (color: strokeColorType) => {
    dispatch(setStrokeColor(color));
  };

  const handleCanvasColorChange = (color: canvasColourType) => {
    dispatch(setCanvasColour(color));
  };

  const handleStrokeWidthChange = (width: strokeWidthType) => {
    dispatch(setStrokeWidth(width));
  };
  const handleFontChange = (font:number) => {
    dispatch(setFontSize(font));
  };

  return (
    <div className="p-4 bg-zinc-700 rounded-lg shadow-lg flex flex-col gap-4 absolute top-10 mt-20 left-4 z-50">
      {/* Stroke Color Picker */}
      <div>
        <h3 className="text-white">Stroke Colour</h3>
        <div className="flex mt-2 gap-2">
          {strokeColourArray.map((x) => (
            <div  key={x.id} className={x.id === strokeColor?"border-b-2 border-violet-600":""} style={{"padding":2}}>
              <DisplayColourBox
              backgroundColour={x.id}
              handleClick={(color) => handleStrokeColorChange(color as strokeColorType)}
              classes={x.id === strokeColor ? "border-2 border-white" : "border-2 border-transparent"}
            />  
            </div>
          ))}
        </div>
      </div>

      {/* Stroke Width Picker */}
      {/* <div>
        <h3 className="text-white">Stroke Width</h3>
        <div className="flex gap-2">
          {strokeWidthArray.map((x) => (
            <button
              key={"stroke" + x}
              className={`p-1 rounded-full hover:bg-gray-600 transition-colors ${
                strokeWidth === x ? "bg-gray-500" : "bg-gray-700"
              }`}
              onClick={() => handleStrokeWidthChange(x)}
            >
              <Minus strokeWidth={x} className="text-white" />
            </button>
          ))}
        </div>
      </div> */}
      {/* Font Size Picker */}
      {isText?
      <div>
        <h3 className="text-white">Font Size</h3>
        <div>
          {fontSizes.map(x=>{
            return(
              <button className={`p-2 rounded-lg text-white mr-2 ${x.size == fontSize?"bg-violet-600":" bg-slate-700"} `} key={"font-"+x.category} onClick={()=>handleFontChange(x.size)} >{x.category}</button>
            )
          })}
        </div>
      </div>:<div>
        <h3 className="text-white">Stroke Width</h3>
        <div className="flex gap-2">
          {strokeWidthArray.map((x) => (
            <button
              key={"stroke" + x}
              className={`p-1 rounded-full hover:bg-gray-600 transition-colors ${
                strokeWidth === x ? "bg-gray-500" : "bg-gray-700"
              }`}
              onClick={() => handleStrokeWidthChange(x)}
            >
              <Minus strokeWidth={x} className="text-white" />
            </button>
          ))}
        </div>
      </div>}
      {/* Canvas Background Picker */}
      <div>
        <h3 className="text-white">Canvas Background</h3>
        <div className="flex mt-2 gap-2">
          {CanvasColour.map((x) => (
            <div  key={x.id} className={x.id === canvasColour?"border-b-2 border-violet-600":""} style={{"padding":2}}>
              <DisplayColourBox
              backgroundColour={x.id}
              handleClick={(color) => handleCanvasColorChange(color as canvasColourType)}
              classes={x.id === canvasColour ? "border-2 border-white" : "border-2 border-transparent"}
            />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DisplayColourBox({
  backgroundColour,
  handleClick,
  classes = "",
}: {
  backgroundColour: strokeColorType | canvasColourType;
  handleClick: (colour: strokeColorType | canvasColourType) => void;
  classes?: string;
}) {
  const handleOnClick = () => {
    handleClick(backgroundColour);
  };

  return (
    <div
      className={`h-6 w-6 rounded-full cursor-pointer hover:scale-110 transition-transform border-2 ${classes}`}
      style={{ backgroundColor: backgroundColour }}
      onClick={handleOnClick}
    />
  );
}