import { GraphData, Graph, GraphClasses, GraphFunctions } from "./Objects";
import express from 'express';
import { PrismaClient } from "@prisma/client";


const prisma = PrismaClient();

const app = express();
app.use(express.json());

type Params = number[]

type GraphTransform = {
    graphData?: GraphData
    transformName: string
    params: Params
}

app.get('/transform/:transformType', (req: Request<{ transformType: string }>, res) => {
    const { transformType } = req.params;
    const transforms = transformType === 'class' 
        ? GraphClasses.allTransforms() 
        : GraphFunctions.allTransforms();
    return res.json(transforms).status(200);
})

app.post('/transform/:transformType', (req, res) => {
    const { transformType } = req.params;
    const { graphData, transformName, params }: GraphTransform = req.body;

    let TransformClass = transformType === 'class' ? new GraphClasses() : new GraphFunctions(graphData);
    const transformFunction = TransformClass.getTransformByName(transformName);
    transformFunction(...params);
    
    const newGraphData = TransformClass.getVerticesAsObject();
    return res.json(newGraphData).status(200);
});