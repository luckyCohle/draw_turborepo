import { SetStateAction } from "react";
import {Plus,Minus} from "lucide-react"


export default function Zoom({zoom,setZoom}:{zoom:number,setZoom:React.Dispatch<SetStateAction<number>>}) {
    const incZoom=()=>{
        setZoom(zoom+10);
    }
    const decZoom=()=>{
        setZoom(zoom-10)
    }
  return (
    <div className="absolute bottom-20 flex rounded-xl p-2 gap-3 left-4 bg-white">
        <button onClick={decZoom} ><Minus/></button>
        <p>{zoom}%</p>
        <button onClick={incZoom}><Plus/></button>
    </div>
  )
}
