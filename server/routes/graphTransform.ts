import { GraphData, GraphClasses, GraphFunctions } from "../Objects";
import { Router } from "express";

type Params = number[]

type GraphTransform = {
    graphData?: GraphData
    transformName: string
    params: Params
}


const graphTransform = Router();

graphTransform.get('/:transformType', async (req, res) => {
    const { transformType } = req.params;
    const transforms = transformType === 'class'
        ? GraphClasses.allTransforms() 
        : GraphFunctions.allTransforms();
    return res.json(transforms).status(200);
})

graphTransform.post('/:transformType', async (req, res) => {
    const { transformType } = req.params;
    const { graphData, transformName, params }: GraphTransform = req.body;

    let TransformClass = transformType === 'class' ? new GraphClasses() : new GraphFunctions(graphData);
    const transformFunction = TransformClass.getTransformByName(transformName);
    transformFunction(...params);
    
    const newGraphData = TransformClass.getVerticesAsObject();
    return res.json(newGraphData).status(200);
});

export default graphTransform;