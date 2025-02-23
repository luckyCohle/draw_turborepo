// Toolbar.tsx
import { Square, Circle, Eraser, Hand, Minus,Pencil,Type } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedTool, Tool } from "@/redux/toolbarSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { JSX } from "react";

const ToolBar = () => {
  const tools: { id: Tool; icon: JSX.Element }[] = [
    { id: "drag", icon: <Hand /> },
    { id: "rectangle", icon: <Square /> },
    { id: "circle", icon: <Circle /> },
    { id: "line", icon: <Minus /> },
    { id: "pencil",icon:<Pencil/>},
    {id:"text",icon:<Type/>},
    { id: "eraser", icon: <Eraser /> },
  ];

  const dispatch = useDispatch<AppDispatch>();
  const { selectedTool } = useSelector((state: RootState) => state.toolbar);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white p-2 shadow-md rounded-lg flex gap-2">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => dispatch(setSelectedTool(tool.id))}
          className={`p-2 rounded-md   ${selectedTool === tool.id ? "bg-blue-500 text-white" : "hover:bg-gray-200"
            }`}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
};

export default ToolBar;
