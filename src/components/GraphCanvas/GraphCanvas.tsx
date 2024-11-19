import { useState, useRef, useEffect } from 'react';
import { GraphCanvas, GraphData, PositionArray, Vertex, EditingState } from './Objects';


interface GraphDisplayProps {
    graphData: GraphData;
    radius?: number;
    edgeThickness?: number;
}
export const GraphDisplay: React.FC<GraphDisplayProps> = ({ graphData, radius = 10, edgeThickness = 2 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const graphRef = useRef<GraphCanvas | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                graphRef.current = new GraphCanvas(ctx, graphData);
                graphRef.current.drawOnCampus();
            }

            const [canvasWidth, canvasHeight] = [500, 400];
            [canvas.width, canvas.height] = [canvasWidth, canvasHeight]


            const scale: PositionArray = [canvas.width / canvasWidth, canvas.height / canvasHeight];

            graphRef.current?.drawOnCampus(radius, scale);
        }

    }, [graphData, radius, edgeThickness]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const graphCanvas = new GraphCanvas(ctx, graphData);

        const [canvasWidth, canvasHeight] = [500, 400];
        [canvas.width, canvas.height] = [canvasWidth, canvasHeight]

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scale: PositionArray = [canvas.width/canvasWidth, canvas.height/canvasHeight]

        graphCanvas.drawOnCampus(radius, scale)
    }, [graphData, radius, edgeThickness]);

    return (
        <div className="w-full h-full relative">
            <canvas ref={canvasRef} className="w-full h-full block"/>
        </div>
    );
};

interface GraphEditorProps {
    dimensions: PositionArray,
    graphData: GraphData,
    currentState: EditingState
}
export function GraphEditor({dimensions=[500, 400], graphData, currentState='add_vertex'}: GraphEditorProps) {
    const [width, height] = dimensions;
    const [selectedVertexId, setselectedVertexId] = useState<string | null>(null);
    const [selectedStartEdge, setSelectedStartEdge] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const graphRef = useRef<GraphCanvas | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                graphRef.current = new GraphCanvas(ctx, graphData);
                graphRef.current.drawOnCampus();
            }
        }
    }, [graphData]);

    const makeSelection = (vari: string | null, color: string) => {
        const graphCanvas = graphRef?.current;
        if (vari) {
            graphCanvas?.selectVertex(vari, color);
        } else {
            graphCanvas?.unselectAllVertices();
        }
        graphCanvas?.drawOnCampus();
    }

    useEffect(() => {
        makeSelection(selectedStartEdge, 'yellow')
    }, [selectedStartEdge])

    useEffect(() => {
        makeSelection(selectedVertexId, 'red')
    }, [selectedVertexId])

    const onMouseDown = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const graphCanvas = graphRef.current;
        const mousePos = graphCanvas?.getMousePos(event.nativeEvent);
        if (!mousePos) return;

        const vertexId = Object.keys(graphData).find(id => graphCanvas?.isMouseOverVertex(mousePos, graphData[id]));

        switch (currentState) {
            case 'add_edge':
                if (vertexId) {
                    if (!selectedStartEdge) {
                        setSelectedStartEdge(vertexId);
                    } else {
                        graphCanvas?.addEdge(selectedStartEdge, vertexId)
                        setSelectedStartEdge(null);
                    }
                }
                break;
            case 'move_vertex':
                if (vertexId) {
                    setselectedVertexId(vertexId);
                    setIsDragging(true);
                }
                break;
            case 'add_vertex':
                const vertex: Vertex = { neighbors: [], position: [mousePos.x, mousePos.y], labels: ['black'] };
                graphCanvas?.addVertex(vertex);
                break;
            case 'delete':
                const deleteVertexId = Object.keys(graphData).find(id => graphRef.current?.isMouseOverVertex(mousePos, graphData[id]));
                if (deleteVertexId) {
                    graphCanvas?.deleteVertex(deleteVertexId);
                }
                break;
        }
        graphCanvas?.drawOnCampus();
    };

    const onMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const graphCanvas = graphRef.current;
        const selectedV = graphCanvas?.getVertex(selectedVertexId);
        if (isDragging && selectedV) {
            const mousePos = graphCanvas?.getMousePos(event.nativeEvent);
            if (mousePos) {
                selectedV.position = [mousePos.x, mousePos.y];
                graphCanvas?.drawOnCampus();
            }
        }
    };

    const onMouseUp = () => {
        if (currentState !== 'edit_vertex') {
            setselectedVertexId(null);
        }
        setIsDragging(false);
    };

  return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        className="border-2 border-black rounded-lg"
      />
  )
}
