function generateRandomId(length: number = 8): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomId = '';
    for (let i = 0; i < length; i++) {
        randomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomId;
}

type VertexNeighbors = string[]
type VertexLabels = [string | number]

type PositionArray = [number, number]
type PositionObject = {x: number, y: number}

type Vertex = {
    neighbors: VertexNeighbors,
    position: PositionArray,
    labels: VertexLabels
}

type GraphData = {[key: string]: Vertex}

class Graph {
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

    addOrUpdateVertex(key: string, vertex: Vertex): void { this.vertices[key] = vertex; }
    getVertex(key: string | null): Vertex | null { return key ? this.vertices[key] || null : null }
    addVertex(vertex: Vertex): void {
        let key = generateRandomId();
        if (!this.getVertex(key)) {
            this.addOrUpdateVertex(key, vertex);
        }
    }
    updateVertex(key: string, vertex: Vertex): void {
        if (this.getVertex(key)) {
            this.addOrUpdateVertex(key, vertex);
        }
    }
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
}

type SelectedVertex = {
    vertex: Vertex,
    color: string
}
export class GraphCanvas extends Graph {
    private readonly ctx: CanvasRenderingContext2D; 
    private defaultRadiusSize: number = 10;
    private selectedVertices: Map<string, SelectedVertex> = new Map();

    constructor(ctx: CanvasRenderingContext2D|null|undefined, graphData: GraphData) {
        super(graphData);
        if (!ctx) throw new Error("CanvasRenderingContext2D is required");
        this.ctx = ctx;
        this.drawOnCampus();
    }

    private drawVertex(
        position: PositionArray, 
        radiusSize = this.defaultRadiusSize, 
        color: string|number|undefined = 'black', 
        outlineColor: string = 'black',
        outlineWidth: number = 1
    ) {
        const [x, y] = position;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radiusSize, 0, Math.PI * 2, false);
        this.ctx.fillStyle = (typeof color === 'string' && color) || 'black';
        this.ctx.fill();
        this.ctx.strokeStyle = outlineColor;
        this.ctx.lineWidth = outlineWidth;
        this.ctx.stroke();
    }

    private drawEdge(pos1: PositionArray, pos2: PositionArray) {
        this.ctx.beginPath();
        this.ctx.moveTo(...pos1);
        this.ctx.lineTo(...pos2);
        this.ctx.strokeStyle = 'black';
        this.ctx.stroke();
    }

    getMousePos(event: MouseEvent) {
        const rect = this.ctx.canvas.getBoundingClientRect();
        const mousePos: PositionObject = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        return mousePos;
    };

    isMouseOverVertex(mousePos: PositionObject, vertex: Vertex) {
        const distance = Math.hypot(mousePos.x - vertex.position[0], mousePos.y - vertex.position[1]);
        return distance <= this.defaultRadiusSize;
    };

    selectVertex(vertexId: string, color: string) {
        const vertex = this.getVertex(vertexId);
        if (vertex) {
            this.selectedVertices.set(vertexId, { vertex, color });   
        }
    }
    unselectAllVertices() {
        this.selectedVertices.clear();
    }
    isVertexSelected(vertexId: string): boolean {
        return this.selectedVertices.has(vertexId);
    }
    
    drawOnCampus(radiusSize=this.defaultRadiusSize, scale:PositionArray=[1, 1]) {
        const scalar = ([x, y]: PositionArray): PositionArray => [x * scale[0], y * scale[1]]
        
        this.clearCanvas();

        for (const key in this.vertices) {
            const vertex = this.vertices[key];
            const scaledPos1 = scalar(vertex.position);

            for (const neighborKey of vertex.neighbors) {
                const neighbor = this.getVertex(neighborKey);
                if (neighbor) {
                    const scaledPos2 = scalar(neighbor.position);
                    this.drawEdge(scaledPos1, scaledPos2);
                }
            }
        }

        for (const id in this.vertices) {
            const vertex = this.vertices[id];
            const scaledPos = scalar(vertex.position);
            const color = vertex.labels[0]
            let outlineColor, outlineWidth;

            if (this.isVertexSelected(id)) {
                const selVertex = this.selectedVertices.get(id);
                outlineColor = selVertex?.color;
                outlineWidth = 3;
            }

            this.drawVertex(scaledPos, radiusSize, color, outlineColor, outlineWidth);
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}

type EditingState = 'add_vertex' | 'add_edge' | 'move_vertex' | 'edit_vertex' | 'delete';

export type { PositionArray, PositionObject, GraphData, Vertex, EditingState };
