function generateRandomId(length: number = 8): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomId = '';
    for (let i = 0; i < length; i++) {
        randomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomId;
}

type Vertex = {
    neighbors: string[],
    position: [number, number],
    labels: [string|number]
}

type GraphData = {[key: string]: Vertex}

type GraphState = [GraphData, React.Dispatch<React.SetStateAction<GraphData>>];

export class Graph {
    public vertices: GraphData;

    constructor(vertices: GraphData={}) {
        this.vertices = vertices
    }

    setGraph(data: GraphData) {
        for (const key in data) {
            const vertex = data[key]
            this.vertices[key] = vertex;
        }
    }

    addVertex(key: string, vertex: Vertex): void {this.vertices[key] = vertex;}
    getVertex(key: string): Vertex | null {return this.vertices[key] || null}
    deleteVertex(key: string): void {
        const vertex = this.getVertex(key);
        if (!vertex) return;

        // Cascade neighbors
        for (const neighbor of vertex.neighbors) {
            const neighborVertex = this.getVertex(neighbor);
            if (neighborVertex) {
                neighborVertex.neighbors = neighborVertex.neighbors.filter(n => n !== key);
            }
        }

        delete this.vertices[key]
    }

    addEdge(key1: string, key2: string): void {
        const [vertex1, vertex2] = [this.getVertex(key1), this.getVertex(key2)]
        if (!vertex1 || !vertex2) {return};
        vertex1.neighbors.push(key2); vertex2.neighbors.push(key1);
    }
    getEdge(key1: string, key2: string): [Vertex, Vertex] | void {
        const [vertex1, vertex2] = [this.getVertex(key1), this.getVertex(key2)];
        if (vertex1 !== null && vertex2 !== null && vertex1.neighbors.includes(key2)) {
            return [vertex1, vertex2]
        }
    }
    deleteEdge(key1: string, key2: string): void {
        const [vertex1, vertex2] = [this.getVertex(key1), this.getVertex(key2)];
        if (!vertex1 || !vertex2) return;
        vertex1.neighbors = vertex1.neighbors.filter(neighbor => neighbor !== key2);
        vertex2.neighbors = vertex2.neighbors.filter(neighbor => neighbor !== key1);
    }

    drawOnCampus(ctx: CanvasRenderingContext2D, radiusSize=10, scale:[number, number]=[1, 1]) {
        const scalar = ([x, y]: [number, number]) => [x*scale[0], y*scale[1]]

        for (const key in this.vertices) {
            const vertex = this.vertices[key];
            const [x, y] = scalar(vertex.position);
            const color = vertex.labels[0]

            ctx.beginPath();
            ctx.arc(x, y, radiusSize, 0, Math.PI * 2, false);
            ctx.fillStyle = (typeof color === 'string' && color) || 'black';
            ctx.fill();
            ctx.stroke();
        }

        for (const key in this.vertices) {
            const vertex = this.vertices[key];
            const [x1, y1] = scalar(vertex.position);

            for (const neighborKey of vertex.neighbors) {
                const neighbor = this.getVertex(neighborKey);
                if (neighbor) {
                    const [x2, y2] = scalar(neighbor.position);
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.strokeStyle = 'black';
                    ctx.stroke();
                }
            }
        }
    }
}

import { useState, useRef, useEffect } from 'react'

interface GraphDisplayProps {
    graphData: GraphData;
    radius?: number;
    edgeThickness?: number;
}
export const GraphDisplay: React.FC<GraphDisplayProps> = ({ graphData, radius = 10, edgeThickness = 2 }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const graph = new Graph(graphData);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const [canvasWidth, canvasHeight] = [500, 400];
        [canvas.width, canvas.height] = [canvasWidth, canvasHeight]

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scale: [number, number] = [canvas.width/canvasWidth, canvas.height/canvasHeight]

        graph.drawOnCampus(ctx, radius, scale)
    }, [graphData, radius, edgeThickness]);

    return (
        <div className="w-full h-full relative">
            <canvas ref={canvasRef} className="w-full h-full block"/>
        </div>
    );
};


interface CanvasEventProps {
    event: MouseEvent,
    ctx: CanvasRenderingContext2D
}

interface GraphEditorProps {
    dimensions: [number, number],
    graphState: GraphState,
    currentState: string
}
export function GraphEditor({dimensions=[500, 400], graphState, currentState='add_vertex'}: GraphEditorProps) {
    const [width, height] = dimensions;
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [graph, setGraph] = graphState;
    const [selectedVertex, setSelectedVertex] = useState<Vertex | null>(null);
    const [edgeStart, setEdgeStart] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const radius = 10;

    const graphInstance = new Graph(graph);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const mainCtx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        const handleMouseMove = (event: MouseEvent) => onMouseMove(event, mainCtx);
        const handleMouseDown = (event: MouseEvent) => onMouseDown(event, mainCtx);
        const handleMouseUp = () => onMouseUp();

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };
    }, [graph, currentState, selectedVertex, edgeStart, isDragging]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const mainCtx = canvas.getContext('2d');
        graphInstance.drawOnCampus(mainCtx);  // Redraw whenever graph or related state changes
    }, [graph, selectedVertex, edgeStart, isDragging]);

    const onMouseMove = ({event, ctx}: CanvasEventProps) => {
        const mousePos = getMousePos(event);
        if (isDragging && selectedVertex) {
            selectedVertex.position = [mousePos.x, mousePos.y];
            redrawGraph(ctx);
        } else {
            redrawGraph(ctx);
            Object.values(graph).forEach(vertex => {
                const color = vertex.labels[0] || 'black';
                if (isMouseOverVertex(mousePos, vertex)) {
                    drawVertexOnCanvas(ctx, vertex, 'red');
                } else {
                    const outline = vertex === graph[edgeStart] ? 'lightblue' : 'black';
                    drawVertexOnCanvas(ctx, vertex, color, outline);
                }
            });
            if (graph[edgeStart]) {
                Object.values(graph).forEach(vertex => {
                    if (isMouseOverVertex(mousePos, vertex) && vertex === graph[edgeStart]) {
                        drawVertexOnCanvas(ctx, vertex, 'yellow');
                    }
                });
            }
        }
    };

const onMouseDown = ({event}: CanvasEventProps) => {
        const mousePos = getMousePos(event);
        switch (currentState) {
            case 'move_vertex':
                const vertexId = Object.keys(graph).find(id => isMouseOverVertex(mousePos, graph[id]));
                if (vertexId) {
                    setSelectedVertex(graph[vertexId]);
                    setIsDragging(true);
                }
                break;
            case 'add_vertex':
                const id = generateRandomId()
                const vertex: Vertex = {neighbors: [], position: [mousePos.x, mousePos.y], labels: []}
                graphInstance.addVertex(id, vertex);
                break;
            case 'add_edge':
                addEdge(mousePos.x, mousePos.y);
                break;
            case 'delete':
                deleteVertex(mousePos.x, mousePos.y);
                break;
            default:
                break;
        }
    };

    const onMouseUp = () => {
        setSelectedVertex(null);
        setIsDragging(false);
    };

    const getMousePos = (event: MouseEvent) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    };

    const isMouseOverVertex = (mousePos, vertex) => {
        const distance = Math.hypot(mousePos.x - vertex.position[0], mousePos.y - vertex.position[1]);
        return distance <= radius;
    };

  return (
    <canvas ref={canvasRef} className="border-2 border-black rounded-lg" />
  )
}
