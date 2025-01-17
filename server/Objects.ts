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

type Vertex = {
    neighbors: VertexNeighbors,
    position: PositionArray,
    labels?: VertexLabels
}

export type GraphData = {[key: string]: Vertex}

export class Graph {
    private vertices: GraphData;
    public center: PositionArray = [250, 200]

    constructor(vertices: GraphData={}) {
        this.vertices = vertices
    }

    setGraph(data: GraphData) {
        for (const key in data) {
            const vertex = data[key]
            this.vertices[key] = vertex;
        }
    }

    clearGraph() {
        this.vertices = {};
    }

    clearEdges() {
        for (const vertex of Object.values(this.vertices)) {
            vertex.neighbors = []
        }
    }

    getVerticesAsList() { return Object.keys(this.vertices) }
    getVerticesAsObject() { return this.vertices }

    addOrUpdateVertex(key: string, vertex: Vertex): void { this.vertices[key] = vertex; }
    getVertex(key: string | null): Vertex | null { return key ? this.vertices[key] || null : null }
    addVertex(vertex: Vertex): string {
        let key = generateRandomId();
        if (!this.getVertex(key)) {
            this.addOrUpdateVertex(key, vertex);
        }
        return key;
    }
    updateVertex(key: string, vertex: Vertex): void {
        if (this.getVertex(key)) {
            this.addOrUpdateVertex(key, vertex);
        }
    }
    deleteVertex(key: string): void {
        const vertex = this.getVertex(key);
        if (!vertex) return;

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


class GraphTransformer extends Graph {
    getTransformByName(gTransName: string): Function {
        const methodName = `${gTransName}Graph`
        if (typeof this[methodName] === 'function') {
            return this[methodName];
        } else {
            throw new Error(`Method "${methodName}" does not exist as a transform of the Graph.`);
        }
    }

    static allTransforms() {
        let transArray: string[] = [];
        for (let transName of Object.keys(this)) {
            if (transName.endsWith('Graph')) {
                transArray.push(transName);
            }
        }
        return transArray;
    }
}


export class GraphClasses extends GraphTransformer {
    private circularArrangement(num: number, distance: number = 100): string[] {
        const keys: string[] = [];

        for (let i = 0; i < num; i++) {
            const angle = (2 * Math.PI * i) / num;
            const position: PositionArray = [
                distance * Math.cos(angle) + this.center[0],
                distance * Math.sin(angle) + this.center[1]
            ]
            const vertexKey = generateRandomId();
            keys.push(vertexKey);
            this.addOrUpdateVertex(vertexKey, { neighbors: [], position });
        }

        return keys;
    }

    completeGraph(num: number, distance=100) {
        const keys = this.circularArrangement(num, distance);
        for (let key1 of keys) {
            for (let key2 of keys) {
                this.addEdge(key1, key2);
            }
        }
    }

    cyclicGraph(num: number, distance:number=100): string[] {
        const keys = this.circularArrangement(num, distance)

        for (let i = 0; i < num; i++) {
            const currentKey = keys[i];
            const nextKey = keys[(i + 1) % num];
            this.addEdge(currentKey, nextKey);
        }

        return keys;
    }

    generalizedPetersenGraph(num1: number, num2: number, outerDistance=200, innerDistance=75) {
        const outerKeys: string[] = this.cyclicGraph(num1, outerDistance)
        const innerKeys: string[] = this.circularArrangement(num1, innerDistance)

        for (let i = 0; i < num1; i++) {
            const currentOuterKey = outerKeys[i];
            const currentInnerKey = innerKeys[i];
            this.addEdge(currentInnerKey, currentOuterKey);
            const nextInnerKey = innerKeys[(i + num2) % num1];
            this.addEdge(currentInnerKey, nextInnerKey);
        }
    }

    wheelGraph(num: number, distance = 100) {
        const outerCycle: string[] = this.cyclicGraph(num, distance);
        const centerVertex = {neighbors: [], position: this.center}
        const centerKey = this.addVertex({ neighbors: [], position: this.center })
        
        for (let i = 0; i < num; i++) {
            const currentKey = outerCycle[i];
            this.addEdge(currentKey, centerKey);
        }
    }

    circulantGraph(num: number, params: number[], distance=100) {
        const keys = this.circularArrangement(num, distance);

        for (let i = 0; i < num; i++) {
            const currentrKey = keys[i];
            for (let param of params) {
                const nextKey = keys[(i + param) % num];
                this.addEdge(currentrKey, nextKey);
            }
        }
    }
}


type EdgeLine = {
    vertex: Vertex,
    prevVertices: [string, string]
}

export class GraphFunctions extends GraphTransformer {
    private findMidsection(pos1: PositionArray, pos2: PositionArray): PositionArray {
        return [(pos1[0] + pos2[0]) / 2, (pos1[1] + pos2[1]) / 2];
    }

    lineGraph() {
        // Unfinished
        const currentGraph = this.getVerticesAsObject();

        let graphSetup: EdgeLine[] = []
        Object.entries(currentGraph).forEach(([vertexId, vertex]) => {
            for (let neighborId of vertex.neighbors) {
                const neighborVertex = this.getVertex(neighborId);
                if (!neighborVertex) {return null}
                let midPoint = this.findMidsection(neighborVertex.position, vertex.position);

                const vertexSetup: EdgeLine = {
                    vertex: {
                        neighbors: [],
                        position: midPoint
                    },
                    prevVertices: [vertexId, neighborId]
                }
                graphSetup.push(vertexSetup);
            }
        })

        this.clearGraph();
        for (let edgeVert of graphSetup) {
            let newVertex = this.addVertex(edgeVert.vertex);
        }
    }

    complementGraph() {
        const currentGraph = this.getVerticesAsObject();
        const currentVertices = this.getVerticesAsList();

        this.clearEdges();
        Object.entries(currentGraph).forEach(([vertexId, vertex]) => {
            const noTouch = [vertexId, ...vertex.neighbors];
            for (const vertex of currentVertices) {
                if (!(vertex in noTouch)) {
                    this.addEdge(vertex, vertexId)
                }
            }
        })
    }
}
