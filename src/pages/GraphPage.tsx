import { GraphDisplay } from "../components/GraphCanvas/GraphCanvas";
import { GraphData } from "../components/GraphCanvas/Objects";
import useFetch from "../services/UseFetch";
import { Link } from "react-router-dom";


export type GraphRetrieveResponse = {
    id: number,
    creator: number,
    name: string,
    description: string,
    data: GraphData
}
type GraphsResponse = {
    count: number,
    next: number | null,
    previous: number | null,
    results: GraphRetrieveResponse[]
}

function Graphs() {
    const { data: graphs, loading, error } = useFetch<GraphsResponse>("/graphs");
    
    // Check for loading state
    if (loading) return <div>Loading...</div>;

    // Check for errors
    if (error) return <div>Error: {error}</div>;

    // Check if graphs is an array
    if (!Array.isArray(graphs?.results)) {
        return <div>No graphs found.</div>;
    }
    
  return (
    <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-9">
        {graphs.results.map((graph, index) => (
            <div key={index} className="card bg-base-100 shadow-xl text-center p-5 flex justify-between">
                <div className="p-2">
                    <h2 className="card-title flex align-middle justify-center">{graph.name}</h2>
                    <p>{graph.description}</p>
                </div>
                <figure>
                    <GraphDisplay graphData={graph.data}/>
                </figure>
                <div className="card-actions justify-center">
                    <Link to={`/graphs/${graph.id}/`}><button className="btn btn-tertiary">Learn More</button></Link>
                </div>
            </div>
        ))}
    </div>
  )
}

const SearchBar = () => {
    return (
        <label className="input input-bordered flex items-center gap-2">
            <input type="text" className="grow" placeholder="Search for Graphs..." />
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70 cursor-pointer">
                <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd" 
                className=" border border-solid border-black"/>
            </svg>
        </label>
    )
}

export default function GraphPage() {
  return (
    <div>
        <div className="row mb-4 m-10">
            <SearchBar />
        </div>
        
        <div className="m-10">
            <Graphs />
        </div>

    </div>
  )
}
