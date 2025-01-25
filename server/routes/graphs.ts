import { GraphData } from "../Objects";
import { Router } from "express";
import prisma from "../prisma";

type GraphPost = {
    name: string
    description: string
    graphData: GraphData
}

const graphs = Router();

graphs.get('/', async (req, res) => {
    const allGraphs = await prisma.graphs.findMany();
    return res.json(allGraphs).status(200);
})

graphs.get('/:id', async (req, res) => {
    const { id } = req.params;
    const getGraph = await prisma.graphs.findFirst({
        where: {
            id: id
        }
    });
    return res.json(getGraph).status(200);
})

graphs.post('/create', async (req, res) => {
    const { name, description, graphData }: GraphPost = req.body;
    try {
        const createdGraph = await prisma.graphs.create({
            data: {name, description, graphData},
        })
        return res.status(201).json({
            message: "Graph created successfully",
            graph: createdGraph,
        });
    } catch (error) {
        console.error("Error creating graph:", error);
        return res.status(500).json({
            message: "An error occurred while creating the graph",
            error: error.message,
        });
    }
})

export default graphs;