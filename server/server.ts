import { Graph, GraphClasses, GraphFunctions } from "./Objects";
import express from 'express';
import { PrismaClient } from "@prisma/client";


const prisma = PrismaClient();

const app = express();
app.use(express.json());